export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "uddoktapay" | "bkash" | "nagad";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export interface Category {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  description?: string;
  description_bn?: string;
  image_url?: string;
  is_active: boolean;
  sort_order?: number;
  parent_id?: string;
}

export interface ColorVariant {
  name: string;
  code: string;
  image?: string;
}

export interface ProductVariant {
  color: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
}

export interface SizeChart {
  headers: string[];
  rows: string[][];
}

export interface Product {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  short_description?: string;
  description?: string;
  description_bn?: string;
  gender?: string;
  product_type?: string;
  features?: string[];
  fabric?: string;
  fabric_composition?: string;
  gsm?: string;
  care_instructions?: string[];
  size_chart?: SizeChart;
  frequently_bought_ids?: string[];
  related_product_ids?: string[];
  base_price: number;
  sale_price?: number;
  wholesale_price?: number;
  min_wholesale_qty?: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  sku?: string;
  weight_grams?: number;
  category_id?: string;
  brand?: string;
  is_featured: boolean;
  is_active: boolean;
  pre_order?: boolean;
  estimated_delivery?: string;
  returnable?: boolean;
  return_period?: string;
  exchangeable?: boolean;
  images: string[];
  featured_image?: string | null;
  video_url?: string;
  selected_sizes?: string[];
  colors?: ColorVariant[];
  variants?: ProductVariant[];
  tags?: string[];
  wash_instructions?: string[];
  subcategory_id?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: any;
  updated_at?: any;
}

export interface DeliveryZone {
  id: string;
  name: string;
  name_bn: string;
  charge: number;
  estimated_days?: number;
  is_active: boolean;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_name?: string;
}


export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_area?: string;
  delivery_zone_id?: string;
  delivery_charge: number;
  subtotal: number;
  total_amount: number;
  partial_payment_amount?: number | null;
  paid_amount?: number;
  transaction_id?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at?: any;
}

export interface BuyXGetY {
  buy_qty: number;
  get_qty: number;
  buy_category_ids?: string[];
  buy_product_ids?: string[];
  get_category_ids?: string[];
  get_product_ids?: string[];
  get_discount_percent: number; // 100 = free
}

export interface Coupon {
  id: string;
  name: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping' | 'percentage_free_shipping' | 'buy_x_get_y';
  discount_value: number;
  max_discount?: number | null;
  min_order_amount: number;
  max_order_amount?: number | null;
  min_order_quantity?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  usage_limit?: number | null;
  usage_limit_per_customer?: number | null;
  usage_count: number;
  applicable_to: 'all' | 'categories' | 'products';
  applicable_category_ids?: string[];
  applicable_product_ids?: string[];
  excluded_category_ids?: string[];
  excluded_product_ids?: string[];
  apply_to_sale_items: boolean;
  customer_target: 'all' | 'new' | 'old' | 'specific';
  specific_customer_ids?: string[];
  is_public: boolean;
  is_stackable: boolean;
  is_active: boolean;
  buy_x_get_y?: BuyXGetY;
  created_at?: any;
  updated_at?: any;
}
