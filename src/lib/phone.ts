/**
 * Normalize Bangladesh phone numbers to 11-digit format
 * Strips non-digits, removes leading "88" if present
 * Returns null if invalid (not 11 digits after normalization)
 */
export const normalizeBDPhone = (phone: string | null | undefined): string | null => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Remove leading "88" country code if present
  if (digits.startsWith('88') && digits.length === 13) {
    digits = digits.slice(2);
  }
  
  // Must be exactly 11 digits for BD phone
  if (digits.length !== 11) {
    return null;
  }
  
  // Should start with 01
  if (!digits.startsWith('01')) {
    return null;
  }
  
  return digits;
};
