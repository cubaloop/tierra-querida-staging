import { supabase, isSupabaseConfigured } from "./supabase";

const LOYALTY_KEY = "tierra_querida_loyalty";

// ─── Local helpers ──────────────────────────────────────────────
const readLocal = () => {
  try {
    const data = localStorage.getItem(LOYALTY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const writeLocal = (cards) => {
  try {
    localStorage.setItem(LOYALTY_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn("localStorage write error (loyalty):", e);
  }
};

// ─── Map Supabase row → app object ──────────────────────────────
const mapRow = (row) => ({
  id: row.id,
  phone: row.phone,
  customerName: row.customer_name || "",
  stamps: Number(row.stamps ?? 0),
  cyclesCompleted: Number(row.cycles_completed ?? 0),
  rewardReady: !!row.reward_ready,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ─── Get card by phone ──────────────────────────────────────────
export const getLoyaltyCard = async (phone) => {
  const cleanPhone = phone.replace(/\s/g, "").trim();
  if (!cleanPhone) return null;

  // Try Supabase first
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("loyalty_cards")
        .select("*")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (!error && data) {
        // Sync to local cache
        const card = mapRow(data);
        const local = readLocal();
        const idx = local.findIndex((c) => c.phone === cleanPhone);
        if (idx !== -1) local[idx] = card;
        else local.push(card);
        writeLocal(local);
        return card;
      }
    } catch (e) {
      console.warn("Supabase getLoyaltyCard error:", e);
    }
  }

  // Fallback: localStorage
  const local = readLocal();
  return local.find((c) => c.phone === cleanPhone) || null;
};

// ─── Get ALL cards (for admin panel) ───────────────────────────
export const getAllLoyaltyCards = async () => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("loyalty_cards")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!error && data) {
        const cards = data.map(mapRow);
        writeLocal(cards);
        return cards;
      }
    } catch (e) {
      console.warn("Supabase getAllLoyaltyCards error:", e);
    }
  }
  return readLocal();
};

// ─── Add a stamp (called when order completes) ──────────────────
// Returns the updated card object
export const addLoyaltyStamp = async (phone, customerName = "") => {
  const cleanPhone = phone.replace(/\s/g, "").trim();
  if (!cleanPhone) return null;

  // Load existing card (or create new)
  let card = await getLoyaltyCard(cleanPhone);
  if (!card) {
    card = {
      phone: cleanPhone,
      customerName: customerName || "",
      stamps: 0,
      cyclesCompleted: 0,
      rewardReady: false,
    };
  }

  // If reward is pending redemption, don't add stamp until next cycle
  let newStamps = card.stamps + 1;
  let newCycles = card.cyclesCompleted;
  let newRewardReady = card.rewardReady;

  if (newStamps >= 10) {
    newStamps = 0; // reset
    newCycles += 1;
    newRewardReady = true; // prize unlocked!
  }

  const updated = {
    ...card,
    customerName: customerName || card.customerName,
    stamps: newStamps,
    cyclesCompleted: newCycles,
    rewardReady: newRewardReady,
  };

  await upsertLoyaltyCard(updated);
  return updated;
};

// ─── Redeem reward (called when discount is applied at checkout) ─
export const redeemLoyaltyReward = async (phone) => {
  const cleanPhone = phone.replace(/\s/g, "").trim();
  if (!cleanPhone) return null;

  const card = await getLoyaltyCard(cleanPhone);
  if (!card || !card.rewardReady) return card;

  const updated = {
    ...card,
    rewardReady: false,
    stamps: 0, // already reset when reward_ready was set, but be safe
  };

  await upsertLoyaltyCard(updated);
  return updated;
};

// ─── Upsert (create or update) a card ──────────────────────────
export const upsertLoyaltyCard = async (card) => {
  // Local first
  const local = readLocal();
  const idx = local.findIndex((c) => c.phone === card.phone);
  const localCard = {
    ...card,
    updatedAt: new Date().toISOString(),
  };
  if (idx !== -1) local[idx] = localCard;
  else local.push(localCard);
  writeLocal(local);

  // Supabase sync
  if (isSupabaseConfigured) {
    try {
      const dbCard = {
        phone: card.phone,
        customer_name: card.customerName || "",
        stamps: Number(card.stamps ?? 0),
        cycles_completed: Number(card.cyclesCompleted ?? 0),
        reward_ready: !!card.rewardReady,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("loyalty_cards")
        .upsert(dbCard, { onConflict: "phone" });

      if (error) console.error("Supabase upsertLoyaltyCard error:", error);
    } catch (e) {
      console.error("Supabase upsertLoyaltyCard exception:", e);
    }
  }

  return localCard;
};

// ─── Admin: manually adjust stamps ─────────────────────────────
export const adminUpdateLoyaltyCard = async (phone, stamps, cyclesCompleted, rewardReady) => {
  const cleanPhone = phone.replace(/\s/g, "").trim();
  const card = (await getLoyaltyCard(cleanPhone)) || { phone: cleanPhone, customerName: "", stamps: 0, cyclesCompleted: 0, rewardReady: false };

  const updated = {
    ...card,
    stamps: Math.max(0, Math.min(9, Number(stamps))),
    cyclesCompleted: Math.max(0, Number(cyclesCompleted)),
    rewardReady: !!rewardReady,
  };

  await upsertLoyaltyCard(updated);
  return updated;
};

// ─── Stamp visual helper ─────────────────────────────────────────
export const buildStampDisplay = (stamps, rewardReady) => {
  const total = 10;
  const filled = Math.min(stamps, total);
  const display = Array.from({ length: total }, (_, i) => i < filled ? "●" : "○").join("");
  return `${display} ${filled}/10${rewardReady ? " 🎁 ¡PREMIO LISTO!" : ""}`;
};
