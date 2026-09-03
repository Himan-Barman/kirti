// Geolocation & Distance Utilities for KIRTI
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Default Kolkata Central Coordinates (Esplanade / Park Street)
export const DEFAULT_KOLKATA_CENTER: GeoCoordinates = {
  latitude: 22.5697,
  longitude: 88.3697
};

/**
 * Calculates distance between two coordinates using the Haversine formula (in kilometers)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;

  const R = 6371; // Radius of Earth in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(2));
}

/**
 * Formats distance into a human-readable string (e.g. '350 m away' or '1.4 km away')
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm >= 9990) return 'Distance unavailable';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Estimates walking time in minutes based on 4.5 km/h average walking speed
 */
export function estimateWalkingTime(distanceKm: number): string {
  if (distanceKm >= 9990) return '';
  const minutes = Math.round((distanceKm / 4.5) * 60);
  if (minutes < 60) return `~${Math.max(1, minutes)} min walk`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `~${hours}h ${remMinutes}m walk`;
}
