// ─── Restaurant location (Al Faris Mall, Dubai) ─────────────────
export const RESTAURANT_COORDS = {
  lat: 25.1214,
  lng: 55.3851,
};

// ─── Default delivery rate tiers ────────────────────────────────
export const DEFAULT_DELIVERY_RATES = [
  { minKm: 0,  maxKm: 3,  fee: 10 },
  { minKm: 3,  maxKm: 7,  fee: 15 },
  { minKm: 7,  maxKm: 12, fee: 20 },
  { minKm: 12, maxKm: 20, fee: 25 },
];

export const DEFAULT_MAX_DELIVERY_KM = 20;
export const DEFAULT_FREE_DELIVERY_MIN = 0; // AED minimum for free delivery (0 = disabled)

// ─── Haversine distance formula (km) ────────────────────────────
// Pure math — no external API needed
export const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ─── Get delivery fee from distance & rates ──────────────────────
// Returns: { fee: number, outOfRange: boolean, distanceKm: number }
export const getDeliveryFeeForDistance = (distanceKm, rates = DEFAULT_DELIVERY_RATES, maxKm = DEFAULT_MAX_DELIVERY_KM, freeMin = DEFAULT_FREE_DELIVERY_MIN, subtotal = 0) => {
  if (distanceKm > maxKm) {
    return { fee: 0, outOfRange: true, distanceKm };
  }

  // Free delivery threshold
  if (freeMin > 0 && subtotal >= freeMin) {
    return { fee: 0, outOfRange: false, distanceKm, freeDelivery: true };
  }

  // Find matching tier
  const tier = [...rates]
    .sort((a, b) => a.minKm - b.minKm)
    .find((t) => distanceKm >= t.minKm && distanceKm < t.maxKm);

  if (tier) {
    return { fee: tier.fee, outOfRange: false, distanceKm };
  }

  // If beyond last tier but within maxKm, use last tier fee
  const lastTier = [...rates].sort((a, b) => b.maxKm - a.maxKm)[0];
  return { fee: lastTier ? lastTier.fee : 25, outOfRange: false, distanceKm };
};

// ─── Get user GPS coordinates via browser ───────────────────────
// Returns a Promise<{lat, lng} | null>
export const getUserGPSCoords = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("GPS error:", err.message);
        resolve(null);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
};

// ─── Full distance + fee calculation from user GPS ───────────────
export const calculateDeliveryFromGPS = async (rates, maxKm, freeMin, subtotal) => {
  const coords = await getUserGPSCoords();
  if (!coords) return null;

  const distanceKm = haversineDistanceKm(
    RESTAURANT_COORDS.lat,
    RESTAURANT_COORDS.lng,
    coords.lat,
    coords.lng
  );

  const result = getDeliveryFeeForDistance(distanceKm, rates, maxKm, freeMin, subtotal);
  return { ...result, coords };
};

// ─── Format distance for display ────────────────────────────────
export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};
