import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Constructs a full image URL from a relative image path stored in the database.
 * Strips the /api suffix from VITE_API_URL to get the server root, then appends the path.
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const baseUrl = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL;
  
  // Encode filename only, not the slashes
  const parts = imagePath.split('/');
  const encodedPath = parts.map(part => encodeURIComponent(part)).join('/');
  
  return `${baseUrl}${encodedPath}`;
}
