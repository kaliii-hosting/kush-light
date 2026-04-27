// Helper functions for wishlist ID handling

// Normalize a product ID for consistent storage and comparison
export const normalizeProductId = (id) => {
  if (!id) return null;
  
  // Convert to string
  let normalizedId = String(id);
  
  // If it's a Shopify Global ID (gid://shopify/Product/...), extract just the numeric part
  const shopifyGidMatch = normalizedId.match(/gid:\/\/shopify\/Product\/(\d+)/);
  if (shopifyGidMatch) {
    return shopifyGidMatch[1];
  }
  
  // If it contains special Firebase-incompatible characters, encode them
  // But for comparison, we'll use the raw ID
  return normalizedId;
};

// Check if two product IDs match (handles different formats)
export const productIdsMatch = (id1, id2) => {
  if (!id1 || !id2) return false;
  
  // Direct match
  if (id1 === id2) return true;
  
  // String comparison
  if (String(id1) === String(id2)) return true;
  
  // Normalize both and compare
  const normalized1 = normalizeProductId(id1);
  const normalized2 = normalizeProductId(id2);
  
  return normalized1 === normalized2;
};

// Get a Firebase-safe key from a product ID
export const getFirebaseSafeId = (id) => {
  const normalized = normalizeProductId(id);
  // Replace Firebase-incompatible characters
  return normalized.replace(/[.#$\/\[\]]/g, '_');
};