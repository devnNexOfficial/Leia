import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips all non-digit characters from a phone number string.
 */
export const phoneDigits = (value: string): string => value.replace(/\D/g, "");

/**
 * Validates a Pakistani mobile phone number (11 digits e.g. 03001234567, or with +92).
 */
export const isValidPakistaniPhone = (value: string): boolean => {
  const digits = phoneDigits(value);
  // Matches 03XXXXXXXXX (11 digits) or 923XXXXXXXXX (12 digits) or 3XXXXXXXXX (10 digits)
  if (/^03[0-4][0-9]{8}$/.test(digits)) return true;
  if (/^923[0-4][0-9]{8}$/.test(digits)) return true;
  if (/^3[0-4][0-9]{8}$/.test(digits)) return true;
  return false;
};

/**
 * Formats a Pakistani phone number into standard 11-digit format: 03XXXXXXXXX
 */
export const normalizePakistaniPhone = (value: string): string => {
  const digits = phoneDigits(value);
  if (digits.startsWith("92") && digits.length === 12) {
    return "0" + digits.slice(2);
  }
  if (digits.startsWith("3") && digits.length === 10) {
    return "0" + digits;
  }
  return digits;
};

/**
 * Validates standard phone digits length for general cases.
 */
export const isValidPhone = (value: string): boolean => isValidPakistaniPhone(value);

/**
 * Validates strict email format (e.g. user@domain.com).
 */
export const isValidEmail = (value: string): boolean => {
  if (!value || typeof value !== "string") return false;
  const clean = value.trim();
  if (clean.length < 5 || clean.length > 254) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(clean);
};

/**
 * Validates person name (letters only, min 2 characters, max 50).
 */
export const isValidName = (value: string): boolean => {
  if (!value || typeof value !== "string") return false;
  const clean = value.trim();
  if (clean.length < 2 || clean.length > 50) return false;
  return /^[a-zA-Z\s'.]{2,50}$/.test(clean);
};

/**
 * Deterministically generates an internal Supabase Auth email from a normalized phone number.
 */
export const authEmailForPhone = (value: string): string =>
  `phone-${normalizePakistaniPhone(value)}@leiacosmetics.com`;

/**
 * Formats a numeric price into Pakistani Rupee string (e.g. "PKR 2,500").
 */
export const formatPKR = (value: number): string =>
  `PKR ${Number(value || 0).toLocaleString("en-PK")}`;

/**
 * Formats a numeric price into short Rupee string (e.g. "Rs. 2,500").
 */
export const formatRupees = (value: number): string =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

