import type { CartItem } from "@/components/cart-context";
import { supabase } from "@/lib/supabase";
import { sendOrderNotifications } from "@/lib/order-emails";
import { normalizePakistaniPhone } from "@/lib/utils";

export type StorefrontOrder = { order_id: string; order_number: string; total: number; shipping_fee: number };

export async function submitStorefrontOrder(input: {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  items: CartItem[];
}): Promise<StorefrontOrder> {
  if (!supabase) throw new Error("Checkout is currently unavailable (Database connection not configured).");

  const standardPhone = normalizePakistaniPhone(input.phone);
  const paymentMethod = input.paymentMethod === "Cash on Delivery" ? "COD" : input.paymentMethod;
  let finalOrder: StorefrontOrder | null = null;

  // 1. Try atomic place_storefront_order RPC
  try {
    const { data, error } = await supabase.rpc("place_storefront_order", {
      p_customer_name: input.customerName.trim(),
      p_customer_email: input.email.trim() || null,
      p_customer_phone: standardPhone || null,
      p_shipping_address: input.address.trim(),
      p_city: input.city.trim(),
      p_payment_method: paymentMethod,
      p_items: input.items.map((item) => ({
        product_id: item.productId,
        variant_id: item.shade?.id ?? null,
        quantity: item.quantity,
      })),
    });

    if (!error && data) {
      const orderRecord = Array.isArray(data) ? data[0] : data;
      if (orderRecord && orderRecord.order_number) {
        finalOrder = orderRecord as StorefrontOrder;
      }
    }

    if (error && error.code !== "PGRST202" && !error.message.includes("Could not find the function")) {
      throw new Error(error.message);
    }
  } catch (rpcErr) {
    const errMessage = rpcErr instanceof Error ? rpcErr.message : "";
    if (errMessage && !errMessage.includes("Could not find the function") && !errMessage.includes("PGRST202")) {
      throw rpcErr;
    }
  }

  // 2. Fallback: Direct table insertion if RPC is not yet registered in database
  if (!finalOrder) {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderNumber = `LEIA-${datePrefix}-${randomSuffix}`;
    const subtotal = input.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 5000 ? 0 : 250;
    const total = subtotal + shippingFee;

    const { data: orderRow, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: input.customerName.trim(),
        customer_email: input.email.trim() || null,
        customer_phone: standardPhone || null,
        shipping_address: input.address.trim(),
        city: input.city.trim(),
        total,
        payment_method: paymentMethod,
        status: "Pending",
      })
      .select()
      .single();

    if (orderInsertError) {
      throw new Error(orderInsertError.message || "Failed to create order record.");
    }

    // Insert order items
    const itemRows = input.items.map((item) => ({
      order_id: orderRow.id,
      product_id: item.productId,
      variant_id: item.shade?.id ?? null,
      product_name: item.name,
      variant_name: item.shade?.name ?? null,
      image_url: item.image,
      unit_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
    if (itemsError) {
      console.warn("Order items insertion warning:", itemsError);
    }

    finalOrder = {
      order_id: orderRow.id,
      order_number: orderRow.order_number,
      total: Number(orderRow.total),
      shipping_fee: shippingFee,
    };
  }

  // 3. Trigger Email Notifications in background
  if (finalOrder) {
    const subtotal = input.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    sendOrderNotifications({
      orderNumber: finalOrder.order_number,
      customerName: input.customerName,
      customerEmail: input.email,
      customerPhone: input.phone,
      shippingAddress: input.address,
      city: input.city,
      paymentMethod: "Cash on Delivery",
      subtotal,
      shippingFee: Number(finalOrder.shipping_fee),
      total: Number(finalOrder.total),
      items: input.items.map((item) => ({
        name: item.name,
        variantName: item.shade?.name ?? null,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.image,
      })),
    }).catch((err) => console.warn("Email dispatch error:", err));
  }

  return finalOrder;
}
