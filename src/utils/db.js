import { INITIAL_DISHES, INITIAL_PROMOTIONS, RESTAURANT_INFO } from "../data/initialData";
import { supabase, isSupabaseConfigured } from "./supabase";

const DISHES_KEY = "tierra_querida_dishes";
const USERS_KEY = "tierra_querida_users";
const ORDERS_KEY = "tierra_querida_orders";
const SESSION_KEY = "tierra_querida_session";
const PROMOTIONS_KEY = "tierra_querida_promos";
const LOCKED_KEY = "tierra_querida_locked";
const INFO_KEY = "tierra_querida_info";

export const isSiteLocked = () => {
  return localStorage.getItem(LOCKED_KEY) === "true";
};

export const setSiteLocked = (locked) => {
  localStorage.setItem(LOCKED_KEY, locked ? "true" : "false");
};

// Helpers to read/write from localStorage
const read = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize DB
export const initDB = () => {
  if (!localStorage.getItem(DISHES_KEY)) {
    write(DISHES_KEY, INITIAL_DISHES);
  } else {
    // Migration: Inject new dishes added to INITIAL_DISHES that don't exist in localStorage
    try {
      const dishes = read(DISHES_KEY, []);
      let updated = false;
      
      // Inject new dishes added to INITIAL_DISHES that don't exist in localStorage
      INITIAL_DISHES.forEach(initialDish => {
        const exists = dishes.some(d => d.id === initialDish.id);
        if (!exists) {
          dishes.push(initialDish);
          updated = true;
        }
      });
      
      if (updated) {
        write(DISHES_KEY, dishes);
      }
    } catch (e) {
      console.error("Error migrating dishes in localStorage:", e);
    }
  }
  
  // Set up default users
  const defaultUsers = [
    {
      email: "admin",
      password: "123",
      name: "Administrador Tierra Querida",
      role: "admin",
      phone: "+971568460179",
      address: "Business Bay, Dubai"
    },
    {
      email: "cliente@test.com",
      password: "cliente123",
      name: "Carlos Gómez",
      role: "customer",
      phone: "+971501234567",
      address: "Downtown Dubai, Tower B, Apt 902"
    }
  ];

  if (!localStorage.getItem(USERS_KEY)) {
    write(USERS_KEY, defaultUsers);
  } else {
    // Migration: ensure admin credentials are forced to "admin" and "123"
    try {
      const users = read(USERS_KEY, []);
      let updatedUsers = false;
      const adminIdx = users.findIndex(u => u.role === "admin");
      if (adminIdx !== -1) {
        if (users[adminIdx].email !== "admin" || users[adminIdx].password !== "123") {
          users[adminIdx].email = "admin";
          users[adminIdx].password = "123";
          users[adminIdx].name = "Administrador Tierra Querida";
          updatedUsers = true;
        }
      } else {
        users.push({
          email: "admin",
          password: "123",
          name: "Administrador Tierra Querida",
          role: "admin",
          phone: "+971568460179",
          address: "Business Bay, Dubai"
        });
        updatedUsers = true;
      }

      // Also clean up any other users that might have old admin email to avoid conflicts
      const cleanedUsers = users.filter((u, idx) => u.role !== "admin" || idx === users.findIndex(x => x.role === "admin"));

      if (updatedUsers || cleanedUsers.length !== users.length) {
        write(USERS_KEY, cleanedUsers);
      }
    } catch (e) {
      console.error("Error migrating admin user credentials:", e);
    }
  }

  if (!localStorage.getItem(PROMOTIONS_KEY)) {
    write(PROMOTIONS_KEY, INITIAL_PROMOTIONS);
  }

  if (!localStorage.getItem(INFO_KEY)) {
    write(INFO_KEY, RESTAURANT_INFO);
  }
};

// Image compression helper to prevent large payload issues
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file || file.size < 50000 || file.type === "image/svg+xml") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

// Database Sync & Seed Helpers
export const uploadRestaurantImage = async (file) => {
  let imageToUpload = file;
  try {
    imageToUpload = await compressImage(file, 800, 800, 0.75);
  } catch (e) {
    console.warn("Compression fallback error, using original file:", e);
  }

  if (isSupabaseConfigured) {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.jpg`;
      const filePath = `dishes/${fileName}`;

      const { data, error } = await supabase.storage
        .from("restaurant-images")
        .upload(filePath, imageToUpload, {
          cacheControl: "3600",
          upsert: true
        });

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from("restaurant-images")
          .getPublicUrl(filePath);

        return publicUrl;
      } else {
        console.warn("Supabase Storage error (bucket missing or private), falling back to Base64:", error);
      }
    } catch (err) {
      console.warn("Supabase Storage exception, falling back to Base64:", err);
    }
  }

  // Fallback: Convert compressed file to lightweight Base64 Data URL if Supabase Storage is not ready
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(imageToUpload);
  });
};

export const seedSupabaseIfEmpty = async () => {
  if (!isSupabaseConfigured) return;
  try {
    const { count, error } = await supabase
      .from("dishes")
      .select("*", { count: "exact", head: true });

    if (!error && count === 0) {
      console.log("Seeding Supabase database...");

      // 1. Seed dishes
      const dishesToInsert = INITIAL_DISHES.map(d => ({
        id: d.id,
        name: d.name,
        price: Number(d.price),
        category: d.category,
        description: d.description || "",
        image: d.image || "",
        tags: Array.isArray(d.tags) ? d.tags.join(",") : (d.tags || ""),
        options_title: d.optionsTitle || "",
        options_choices: d.optionsChoices || ""
      }));
      await supabase.from("dishes").insert(dishesToInsert);

      // 2. Seed promotions
      const promosToInsert = INITIAL_PROMOTIONS.map(p => ({
        id: p.id,
        text: p.text,
        image: p.image || ""
      }));
      await supabase.from("promotions").insert(promosToInsert);

      // 3. Seed restaurant info
      const infoToInsert = {
        id: "default",
        name: RESTAURANT_INFO.name,
        phone: RESTAURANT_INFO.phone,
        whatsapp_link: RESTAURANT_INFO.whatsappLink,
        address: RESTAURANT_INFO.address,
        email: RESTAURANT_INFO.email || "info@tierraqueridadubai.com",
        instagram: RESTAURANT_INFO.instagram,
        tiktok: RESTAURANT_INFO.tiktok,
        facebook: RESTAURANT_INFO.facebook
      };
      await supabase.from("restaurant_info").upsert(infoToInsert);
      console.log("Seeding complete!");
    }
  } catch (e) {
    console.error("Error during Supabase seeding:", e);
  }
};

export const syncFromSupabase = async () => {
  if (!isSupabaseConfigured) return false;
  try {
    await seedSupabaseIfEmpty();

    // 1. Fetch Dishes
    const { data: dishes, error: dishesError } = await supabase
      .from("dishes")
      .select("*")
      .order("created_at", { ascending: true });

    if (!dishesError && dishes) {
      const mappedDishes = dishes.map(d => ({
        id: d.id,
        name: d.name,
        price: Number(d.price),
        category: d.category,
        description: d.description || "",
        image: d.image || "",
        tags: d.tags ? d.tags.split(",").map(t => t.trim()) : [],
        optionsTitle: d.options_title || "",
        optionsChoices: d.options_choices || ""
      }));
      write(DISHES_KEY, mappedDishes);
    }

    // 2. Fetch Promotions
    const { data: promotions, error: promosError } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: true });

    if (!promosError && promotions) {
      write(PROMOTIONS_KEY, promotions);
    }

    // 3. Fetch Restaurant Info
    const { data: info, error: infoError } = await supabase
      .from("restaurant_info")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (!infoError && info) {
      const mappedInfo = {
        name: info.name,
        phone: info.phone,
        whatsappLink: info.whatsapp_link,
        address: info.address,
        email: info.email || "info@tierraqueridadubai.com",
        instagram: info.instagram,
        tiktok: info.tiktok,
        facebook: info.facebook,
        storyTitle: info.story_title || "",
        storyText: info.story_text || "",
        storyPoint1Title: info.story_point1_title || "",
        storyPoint1Desc: info.story_point1_desc || "",
        storyPoint2Title: info.story_point2_title || "",
        storyPoint2Desc: info.story_point2_desc || "",
        storyPoint3Title: info.story_point3_title || "",
        storyPoint3Desc: info.story_point3_desc || "",
        storyPoint4Title: info.story_point4_title || "",
        storyPoint4Desc: info.story_point4_desc || "",
        gridImage1: info.grid_image1 || "",
        gridImage2: info.grid_image2 || "",
        gridImage3: info.grid_image3 || "",
        gridImage4: info.grid_image4 || "",
        heroBadge: info.hero_badge || "",
        heroTitle: info.hero_title || "",
        heroSubtitle: info.hero_subtitle || "",
        schedule: info.schedule || "",
        allergenNotice: info.allergen_notice || "",
        deliveryFee: info.delivery_fee != null ? Number(info.delivery_fee) : 20
      };
      write(INFO_KEY, mappedInfo);
    }

    // 4. Fetch Orders
    const { data: dbOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordersError && dbOrders) {
      const mappedOrders = dbOrders.map(o => ({
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerAddress: o.customer_address,
        paymentMethod: o.payment_method,
        total: Number(o.total),
        items: o.items || [],
        date: o.created_at
      }));
      write(ORDERS_KEY, mappedOrders);
    }

    return true;
  } catch (e) {
    console.error("Error during Supabase synchronization:", e);
    return false;
  }
};

// Dishes (CRUD)
export const getDishes = () => {
  initDB();
  return read(DISHES_KEY, []);
};

export const saveDish = async (dish) => {
  const dishes = getDishes();
  if (dish.id) {
    const index = dishes.findIndex(d => d.id === dish.id);
    if (index !== -1) {
      dishes[index] = dish;
    }
  } else {
    dish.id = "custom-" + Date.now();
    dishes.push(dish);
  }
  write(DISHES_KEY, dishes);

  if (isSupabaseConfigured) {
    const dbDish = {
      id: dish.id,
      name: dish.name,
      price: Number(dish.price),
      category: dish.category,
      description: dish.description || "",
      image: dish.image || "",
      tags: Array.isArray(dish.tags) ? dish.tags.join(",") : (dish.tags || ""),
      options_title: dish.optionsTitle || "",
      options_choices: dish.optionsChoices || ""
    };
    const { error } = await supabase.from("dishes").upsert(dbDish);
    if (error) console.error("Error upserting dish to Supabase:", error);
  }
  return dish;
};

export const deleteDish = async (id) => {
  const idStr = String(id);
  const dishes = getDishes();
  const filtered = dishes.filter(d => String(d.id) !== idStr);
  write(DISHES_KEY, filtered);

  if (isSupabaseConfigured) {
    const { error } = await supabase.from("dishes").delete().eq("id", idStr);
    if (error) console.error("Error deleting dish from Supabase:", error);
  }
};

export const resetDishes = () => {
  write(DISHES_KEY, INITIAL_DISHES);
  if (isSupabaseConfigured) {
    supabase.from("dishes").delete().neq("id", "none").then(() => {
      seedSupabaseIfEmpty();
    });
  }
};

// Users (Auth)
export const getUsers = () => {
  initDB();
  return read(USERS_KEY, []);
};

export const registerUser = (email, password, name, phone = "", address = "") => {
  const users = getUsers();
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error("El correo electrónico ya está registrado.");
  }
  const newUser = {
    email: email.toLowerCase(),
    password,
    name,
    role: "customer",
    phone,
    address
  };
  users.push(newUser);
  write(USERS_KEY, users);
  return newUser;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
  );
  if (!user) {
    throw new Error("Usuario/correo o contraseña incorrectos.");
  }
  write(SESSION_KEY, user);
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentSession = () => {
  return read(SESSION_KEY, null);
};

export const updateCurrentSessionAddress = (address, phone) => {
  const session = getCurrentSession();
  if (session) {
    session.address = address;
    session.phone = phone;
    write(SESSION_KEY, session);
    
    const users = getUsers();
    const index = users.findIndex(u => u.email === session.email);
    if (index !== -1) {
      users[index].address = address;
      users[index].phone = phone;
      write(USERS_KEY, users);
    }
  }
};

// Orders
export const getOrders = () => {
  return read(ORDERS_KEY, []);
};

export const saveOrder = (order) => {
  const orders = getOrders();
  const newOrder = {
    ...order,
    id: "pedido-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString()
  };
  orders.push(newOrder);
  write(ORDERS_KEY, orders);

  if (isSupabaseConfigured) {
    const dbOrder = {
      id: newOrder.id,
      customer_name: newOrder.customerName || newOrder.name || "",
      customer_phone: newOrder.customerPhone || newOrder.phone || "",
      customer_address: newOrder.customerAddress || newOrder.address || "",
      payment_method: newOrder.paymentMethod || "cod",
      total: Number(newOrder.total),
      items: newOrder.items || []
    };
    supabase.from("orders").insert(dbOrder).then(({ error }) => {
      if (error) console.error("Error saving order to Supabase:", error);
    });
  }
  return newOrder;
};

// Promotions CRUD
export const getPromotions = () => {
  initDB();
  return read(PROMOTIONS_KEY, []);
};

export const savePromotion = async (promo) => {
  const promotions = getPromotions();
  const promoIdStr = promo.id ? String(promo.id) : ("promo-" + Date.now());
  const promoToSave = {
    ...promo,
    id: promoIdStr
  };

  const index = promotions.findIndex(p => String(p.id) === promoIdStr);
  if (index !== -1) {
    promotions[index] = promoToSave;
  } else {
    promotions.push(promoToSave);
  }
  write(PROMOTIONS_KEY, promotions);

  if (isSupabaseConfigured) {
    const dbPromo = {
      id: promoIdStr,
      text: promoToSave.text,
      image: promoToSave.image || ""
    };
    const { error } = await supabase.from("promotions").upsert(dbPromo);
    if (error) console.error("Error inserting promo to Supabase:", error);
  }
  return promoToSave;
};

export const deletePromotion = async (id) => {
  const idStr = String(id);
  const promotions = getPromotions();
  const filtered = promotions.filter(p => String(p.id) !== idStr);
  write(PROMOTIONS_KEY, filtered);

  if (isSupabaseConfigured) {
    const { error } = await supabase.from("promotions").delete().eq("id", idStr);
    if (error) console.error("Error deleting promo from Supabase:", error);
  }
};

export const resetPromotions = () => {
  write(PROMOTIONS_KEY, INITIAL_PROMOTIONS);
  if (isSupabaseConfigured) {
    supabase.from("promotions").delete().neq("id", "none").then(() => {
      seedSupabaseIfEmpty();
    });
  }
};

// Contact Info / Restaurant Info
export const getRestaurantInfo = () => {
  initDB();
  const info = read(INFO_KEY, RESTAURANT_INFO);
  if (!info.email) {
    info.email = "info@tierraqueridadubai.com";
    write(INFO_KEY, info);
  }
  return info;
};

export const saveRestaurantInfo = async (info) => {
  if (info.phone) {
    const cleanPhone = info.phone.replace(/[^0-9]/g, "");
    info.whatsappLink = `https://wa.me/${cleanPhone}`;
  }
  write(INFO_KEY, info);

  if (isSupabaseConfigured) {
    const dbInfo = {
      id: "default",
      name: info.name,
      phone: info.phone,
      whatsapp_link: info.whatsappLink,
      address: info.address,
      email: info.email || "",
      instagram: info.instagram || "",
      tiktok: info.tiktok || "",
      facebook: info.facebook || "",
      story_title: info.storyTitle || "",
      story_text: info.storyText || "",
      story_point1_title: info.storyPoint1Title || "",
      story_point1_desc: info.storyPoint1Desc || "",
      story_point2_title: info.storyPoint2Title || "",
      story_point2_desc: info.storyPoint2Desc || "",
      story_point3_title: info.storyPoint3Title || "",
      story_point3_desc: info.storyPoint3Desc || "",
      story_point4_title: info.storyPoint4Title || "",
      story_point4_desc: info.storyPoint4Desc || "",
      grid_image1: info.gridImage1 || "",
      grid_image2: info.gridImage2 || "",
      grid_image3: info.gridImage3 || "",
      grid_image4: info.gridImage4 || "",
      hero_badge: info.heroBadge || "",
      hero_title: info.heroTitle || "",
      hero_subtitle: info.heroSubtitle || "",
      schedule: info.schedule || "",
      allergen_notice: info.allergenNotice || "",
      delivery_fee: Number(info.deliveryFee ?? 20)
    };
    const { error } = await supabase.from("restaurant_info").upsert(dbInfo);
    if (error) {
      console.warn("Supabase info update notice:", error.message);
    }
  }
  return info;
};

export const resetRestaurantInfo = () => {
  write(INFO_KEY, RESTAURANT_INFO);
  if (isSupabaseConfigured) {
    const dbInfo = {
      id: "default",
      name: RESTAURANT_INFO.name,
      phone: RESTAURANT_INFO.phone,
      whatsapp_link: RESTAURANT_INFO.whatsappLink,
      address: RESTAURANT_INFO.address,
      email: RESTAURANT_INFO.email || "info@tierraqueridadubai.com",
      instagram: RESTAURANT_INFO.instagram,
      tiktok: RESTAURANT_INFO.tiktok,
      facebook: RESTAURANT_INFO.facebook,
      story_title: RESTAURANT_INFO.storyTitle || "",
      story_text: RESTAURANT_INFO.storyText || "",
      story_point1_title: RESTAURANT_INFO.storyPoint1Title || "",
      story_point1_desc: RESTAURANT_INFO.storyPoint1Desc || "",
      story_point2_title: RESTAURANT_INFO.storyPoint2Title || "",
      story_point2_desc: RESTAURANT_INFO.storyPoint2Desc || "",
      story_point3_title: RESTAURANT_INFO.storyPoint3Title || "",
      story_point3_desc: RESTAURANT_INFO.storyPoint3Desc || "",
      story_point4_title: RESTAURANT_INFO.storyPoint4Title || "",
      story_point4_desc: RESTAURANT_INFO.storyPoint4Desc || "",
      grid_image1: RESTAURANT_INFO.gridImage1 || "",
      grid_image2: RESTAURANT_INFO.gridImage2 || "",
      grid_image3: RESTAURANT_INFO.gridImage3 || "",
      grid_image4: RESTAURANT_INFO.gridImage4 || ""
    };
    supabase.from("restaurant_info").upsert(dbInfo).then(({ error }) => {
      if (error) console.error("Error resetting info in Supabase:", error);
    });
  }
  return RESTAURANT_INFO;
};
