import { getNeighborhoodName } from './nyc-neighborhood-mapping';

// Function to properly capitalize restaurant names (first letter of each word)
export function capitalizeRestaurantName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle special cases like "Mc", "Mac", "O'", etc.
      if (word.startsWith('mc') && word.length > 2) {
        return 'Mc' + word.charAt(2).toUpperCase() + word.slice(3);
      }
      if (word.startsWith('mac') && word.length > 3) {
        return 'Mac' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('o\'') && word.length > 2) {
        return 'O\'' + word.charAt(2).toUpperCase() + word.slice(3);
      }
      if (word.startsWith('d\'') && word.length > 2) {
        return 'D\'' + word.charAt(2).toUpperCase() + word.slice(3);
      }
      if (word.startsWith('l\'') && word.length > 2) {
        return 'L\'' + word.charAt(2).toUpperCase() + word.slice(3);
      }
      if (word.startsWith('de ') && word.length > 3) {
        return 'De ' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('la ') && word.length > 3) {
        return 'La ' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('el ') && word.length > 3) {
        return 'El ' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('del ') && word.length > 4) {
        return 'Del ' + word.charAt(4).toUpperCase() + word.slice(5);
      }
      if (word.startsWith('los ') && word.length > 4) {
        return 'Los ' + word.charAt(4).toUpperCase() + word.slice(5);
      }
      if (word.startsWith('las ') && word.length > 4) {
        return 'Las ' + word.charAt(4).toUpperCase() + word.slice(5);
      }
      if (word.startsWith('van ') && word.length > 4) {
        return 'Van ' + word.charAt(4).toUpperCase() + word.slice(5);
      }
      if (word.startsWith('von ') && word.length > 4) {
        return 'Von ' + word.charAt(4).toUpperCase() + word.slice(5);
      }
      if (word.startsWith('di ') && word.length > 3) {
        return 'Di ' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('da ') && word.length > 3) {
        return 'Da ' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('du ') && word.length > 3) {
        return 'Du ' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('le ') && word.length > 3) {
        return 'Le ' + word.charAt(3).toUpperCase() + word.slice(4);
      }
      if (word.startsWith('les ') && word.length > 4) {
        return 'Les ' + word.charAt(4).toUpperCase() + word.slice(5);
      }
      
      // Handle common abbreviations
      if (word === 'nyc') return 'NYC';
      if (word === 'ny') return 'NY';
      if (word === 'usa') return 'USA';
      if (word === 'inc') return 'Inc';
      if (word === 'llc') return 'LLC';
      if (word === 'corp') return 'Corp';
      if (word === 'co') return 'Co';
      if (word === '&') return '&';
      
      // Default: capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Function to convert NTA codes to user-friendly names throughout the app
export function formatNeighborhoodName(neighborhood: string): string {
  if (!neighborhood) return 'Unknown';
  
  // First, try to convert NTA codes to friendly names
  const friendlyName = getNeighborhoodName(neighborhood);
  
  // Then properly capitalize the result
  return capitalizeRestaurantName(friendlyName);
}

// Function to format restaurant data with proper capitalization and NTA conversion
export function formatRestaurantData(restaurant: any): any {
  return {
    ...restaurant,
    name: capitalizeRestaurantName(restaurant.name || ''),
    neighborhood: formatNeighborhoodName(restaurant.neighborhood || ''),
    description: restaurant.description ? capitalizeRestaurantName(restaurant.description) : ''
  };
}
