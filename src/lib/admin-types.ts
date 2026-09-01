export type AdminCategory = { id: string; name: string; image_url: string | null; description?: string | null; display_order?: number | null; created_at: string };
export type ProductVariant = { id: string; product_id: string; name: string; sku: string | null; stock_count: number; price_override: number | null; image_url?: string | null };
export type AdminProduct = {
  id: string; name: string; description: string | null; price: number; image_url: string | null; image_urls?: string[]; compare_at_price?: number | null; stock_count?: number; ingredients?: string | null; directions?: string | null; status?: "Active" | "Draft" | "Out of Stock"; is_featured?: boolean; is_new_arrival?: boolean; new_arrival_order?: number | null;
  category_id: string | null; created_at: string; categories?: Pick<AdminCategory, "name"> | null;
  product_variants?: ProductVariant[];
};
export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
export type AdminOrder = {
  id: string; order_number: string; customer_id: string | null; customer_name: string; customer_email: string | null;
  customer_phone: string | null; shipping_address: string | null; city: string | null; total: number;
  payment_method: "COD" | "JazzCash" | "Easypaisa"; status: OrderStatus; created_at: string;
  order_items?: AdminOrderItem[]; customers?: AdminCustomer | null;
};
export type AdminOrderItem = { id: string; order_id: string; product_name: string; variant_name: string | null; unit_price: number; quantity: number; image_url: string | null };
export type AdminCustomer = { id: string; name: string; email: string | null; phone: string | null; created_at: string };
