/**
 * Utility functions for formatting and standardizing restaurant addresses
 */

/**
 * Removes zip code from an address string
 * @param address - The full address string
 * @returns Address without zip code
 */
export function removeZipCode(address: string): string {
  if (!address) return '';
  
  // Remove zip code patterns (5 digits, 5-4 digits, or 5-4-4 digits)
  // Also remove state abbreviations that might be followed by zip
  return address
    .replace(/\s+\d{5}(-\d{4})?(\s*$)/, '') // Remove ZIP+4 at end
    .replace(/\s+[A-Z]{2}\s+\d{5}(-\d{4})?(\s*$)/, '') // Remove state + ZIP
    .replace(/\s+\d{5}(-\d{4})?(\s*$)/, '') // Final cleanup
    .trim();
}

/**
 * Standardizes address format for display
 * @param address - The raw address string
 * @param neighborhood - Optional neighborhood
 * @param city - Optional city
 * @returns Formatted address string
 */
export function formatAddressForDisplay(
  address: string, 
  neighborhood?: string, 
  city?: string
): string {
  if (!address) return 'Address not available';
  
  // Remove zip code first
  let cleanAddress = removeZipCode(address);
  
  // If we have neighborhood and city, format as: "Street Address, Neighborhood, City"
  if (neighborhood && city) {
    // Don't duplicate if address already contains neighborhood or city
    const hasNeighborhood = cleanAddress.toLowerCase().includes(neighborhood.toLowerCase());
    const hasCity = cleanAddress.toLowerCase().includes(city.toLowerCase());
    
    if (!hasNeighborhood && !hasCity) {
      cleanAddress = `${cleanAddress}, ${neighborhood}, ${city}`;
    } else if (!hasNeighborhood) {
      cleanAddress = `${cleanAddress}, ${neighborhood}`;
    } else if (!hasCity) {
      cleanAddress = `${cleanAddress}, ${city}`;
    }
  } else if (neighborhood && !city) {
    // Just neighborhood
    if (!cleanAddress.toLowerCase().includes(neighborhood.toLowerCase())) {
      cleanAddress = `${cleanAddress}, ${neighborhood}`;
    }
  } else if (city && !neighborhood) {
    // Just city
    if (!cleanAddress.toLowerCase().includes(city.toLowerCase())) {
      cleanAddress = `${cleanAddress}, ${city}`;
    }
  }
  
  return cleanAddress;
}

/**
 * Creates a short address format (Street, Neighborhood)
 * @param address - The full address
 * @param neighborhood - The neighborhood
 * @returns Short formatted address
 */
export function formatShortAddress(address: string, neighborhood?: string): string {
  if (!address) return 'Location not available';
  
  const cleanAddress = removeZipCode(address);
  
  if (neighborhood && !cleanAddress.toLowerCase().includes(neighborhood.toLowerCase())) {
    return `${cleanAddress}, ${neighborhood}`;
  }
  
  return cleanAddress;
}

/**
 * Extracts street address without city/state/zip
 * @param address - The full address string
 * @returns Just the street address
 */
export function extractStreetAddress(address: string): string {
  if (!address) return '';
  
  // Remove common city/state/zip patterns
  return address
    .replace(/,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}(-\d{4})?(\s*$)/, '') // Remove ", City, State ZIP"
    .replace(/,\s*[A-Z]{2}\s*\d{5}(-\d{4})?(\s*$)/, '') // Remove ", State ZIP"
    .replace(/\s+\d{5}(-\d{4})?(\s*$)/, '') // Remove ZIP at end
    .trim();
}
