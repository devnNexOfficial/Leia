import { supabase } from "@/lib/supabase";

export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: {
    name: string;
    variantName?: string | null;
    quantity: number;
    price: number;
    imageUrl?: string | null;
  }[];
}

/**
 * Dispatches automated order confirmation & admin alert via secure Supabase Edge Function.
 * NOTE: No API keys are stored or called from frontend client code.
 */
export async function sendOrderNotifications(
  order: OrderEmailPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: "Supabase client not initialized" };
    }

    // Invoke server-side Supabase Edge Function 'notify-new-order'
    const { data, error } = await supabase.functions.invoke("notify-new-order", {
      body: order,
    });

    if (error) {
      console.warn("⚠️ [Edge Function notify-new-order Warning]:", error);
      return { success: false, error: error.message };
    }

    console.info("✅ [Order Email Dispatcher]: Server Edge Function invoked successfully", data);
    return { success: true };
  } catch (err) {
    console.warn("⚠️ [Order Email Dispatcher Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Notification dispatch failed",
    };
  }
}

/**
 * Dispatches automated welcome email for newsletter subscribers via secure Supabase Edge Function.
 */
export async function sendNewsletterWelcomeEmail(
  subscriberEmail: string,
  discountCode: string = "LEIA15"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Supabase client not initialized" };

    const { data, error } = await supabase.functions.invoke("send-welcome-email", {
      body: { email: subscriberEmail, discountCode },
    });

    if (error) {
      console.info("ℹ️ [Newsletter Email Note]: Server function returned:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Email failed" };
  }
}

export interface ContactNotificationPayload {
  name: string;
  email: string;
  message: string;
}

/**
 * Dispatches automated admin email notification when a customer submits the Contact form.
 */
export async function sendContactNotification(
  payload: ContactNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: "Supabase client not initialized" };

    const { data, error } = await supabase.functions.invoke("notify-contact-message", {
      body: payload,
    });

    if (error) {
      console.warn("⚠️ [Contact Email Notification Warning]:", error.message);
      return { success: false, error: error.message };
    }

    console.info("✅ [Contact Email Dispatcher]: Admin notification dispatched", data);
    return { success: true };
  } catch (err) {
    console.warn("⚠️ [Contact Email Dispatcher Exception]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Contact notification dispatch failed",
    };
  }
}

