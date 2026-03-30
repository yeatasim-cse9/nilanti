// Facebook Pixel Tracking
// Pixel ID: 910751078293429

const FB_PIXEL_ID = '910751078293429';

// Debug mode - set to false in production
const DEBUG = true;

const log = (event: string, data?: any) => {
  if (DEBUG) {
    console.log(`[FB Pixel] ${event}`, data || '');
  }
};

// SHA-256 hash function for customer data
const sha256Hash = async (value: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Normalize phone number to E.164 format for Bangladesh
const normalizePhone = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+88')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('88')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return `880${cleaned}`;
};

// ==========================================
// EVENT 1: PageView (handled by index.html)
// ==========================================
export const trackPageView = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
    log('PageView tracked');
  }
};

// ==========================================
// EVENT 2: ViewContent (Product View)
// ==========================================
export const trackViewContent = (data: {
  content_name: string;
  content_ids: string[];
  content_type?: string;
  value: number;
  currency?: string;
}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const eventData = {
      content_name: data.content_name,
      content_ids: data.content_ids,
      content_type: data.content_type || 'product',
      value: data.value,
      currency: data.currency || 'BDT',
    };
    (window as any).fbq('track', 'ViewContent', eventData);
    log('ViewContent', eventData);
  }
};

// ==========================================
// EVENT 3: AddToCart
// ==========================================
export const trackAddToCart = (data: {
  content_name: string;
  content_ids: string[];
  content_type?: string;
  value: number;
  currency?: string;
}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const eventData = {
      content_name: data.content_name,
      content_ids: data.content_ids,
      content_type: data.content_type || 'product',
      value: data.value,
      currency: data.currency || 'BDT',
    };
    (window as any).fbq('track', 'AddToCart', eventData);
    log('AddToCart', eventData);
  }
};

// ==========================================
// EVENT 4: Purchase (with hashed customer data)
// ==========================================
export interface PurchaseData {
  content_ids: string[];
  contents: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items: number;
  value: number;
  currency?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_city?: string;
  order_id?: string;
}

export const trackPurchase = async (data: PurchaseData) => {
  if (typeof window === 'undefined' || !(window as any).fbq) return;

  const eventData: any = {
    content_ids: data.content_ids,
    contents: data.contents,
    content_type: 'product',
    num_items: data.num_items,
    value: data.value,
    currency: data.currency || 'BDT',
  };

  if (data.order_id) {
    eventData.order_id = data.order_id;
  }

  // Prepare user data for Advanced Matching (hashed)
  const userData: any = {};

  try {
    if (data.customer_phone) {
      const normalizedPhone = normalizePhone(data.customer_phone);
      userData.ph = await sha256Hash(normalizedPhone);
    }

    if (data.customer_email) {
      userData.em = await sha256Hash(data.customer_email);
    }

    if (data.customer_name) {
      const nameParts = data.customer_name.trim().split(' ');
      if (nameParts.length > 0) {
        userData.fn = await sha256Hash(nameParts[0]);
      }
      if (nameParts.length > 1) {
        userData.ln = await sha256Hash(nameParts.slice(1).join(' '));
      }
    }

    if (data.customer_city) {
      userData.ct = await sha256Hash(data.customer_city);
    }

    userData.country = await sha256Hash('bd');
  } catch (error) {
    console.error('[FB Pixel] Error hashing user data:', error);
  }

  // Set user data for Advanced Matching if available
  if (Object.keys(userData).length > 0) {
    (window as any).fbq('init', FB_PIXEL_ID, userData);
  }

  // Track the Purchase event
  (window as any).fbq('track', 'Purchase', eventData);
  log('Purchase', { eventData, userData: Object.keys(userData) });
};
