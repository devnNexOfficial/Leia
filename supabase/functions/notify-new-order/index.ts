// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs in Supabase Edge Runtime (Deno)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Ambient declaration for IDE TypeScript language server (when Deno LSP is not active)
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderItem {
  name: string;
  variantName?: string | null;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

interface OrderPayload {
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
  items: OrderItem[];
}

function buildAdminEmailHtml(order: OrderPayload): string {
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong>
        ${item.variantName ? `<br><small style="color: #666;">Shade: ${item.variantName}</small>` : ""}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Order Alert</title></head>
<body style="margin:0; padding:20px; background-color:#f8fafc; font-family:sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
    <div style="background:#0f172a; padding:24px; text-align:center; color:#ffffff;">
      <h1 style="margin:0; font-size:20px; letter-spacing:1px;">🛍️ NEW ORDER RECEIVED</h1>
      <p style="margin:6px 0 0; color:#94a3b8; font-size:14px;">Order #${order.orderNumber}</p>
    </div>
    <div style="padding:24px;">
      <div style="background:#f1f5f9; border-radius:8px; padding:16px; margin-bottom:20px;">
        <h3 style="margin:0 0 10px; font-size:14px; text-transform:uppercase; color:#475569;">Customer & Delivery Details</h3>
        <p style="margin:0; font-size:13px; line-height:1.6; color:#1e293b;">
          <strong>Name:</strong> ${order.customerName}<br>
          <strong>Phone:</strong> <a href="tel:${order.customerPhone}">${order.customerPhone}</a><br>
          <strong>Email:</strong> ${order.customerEmail || "N/A"}<br>
          <strong>Address:</strong> ${order.shippingAddress}, ${order.city}<br>
          <strong>Payment:</strong> Cash on Delivery (COD)
        </p>
      </div>

      <h3 style="margin:0 0 10px; font-size:14px; text-transform:uppercase; color:#475569;">Ordered Items</h3>
      <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:20px;">
        <thead>
          <tr style="background:#f8fafc; text-align:left;">
            <th style="padding:8px 10px;">Item</th>
            <th style="padding:8px 10px; text-align:center;">Qty</th>
            <th style="padding:8px 10px; text-align:right;">Price</th>
            <th style="padding:8px 10px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="background:#fff0f5; border-radius:8px; padding:16px; border:1px solid #f5c6d5;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;">
          <span>Subtotal:</span>
          <strong>Rs. ${order.subtotal.toLocaleString()}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:13px;">
          <span>Shipping:</span>
          <strong>Rs. ${order.shippingFee.toLocaleString()}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:bold; color:#d6336c; border-top:1px solid #f5c6d5; padding-top:8px; margin-top:8px;">
          <span>Grand Total (Collect on Delivery):</span>
          <span>Rs. ${order.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
    <div style="background:#f8fafc; padding:12px; text-align:center; font-size:11px; color:#94a3b8; border-top:1px solid #e2e8f0;">
      LEIA Pakistan Automated Admin Alert System
    </div>
  </div>
</body>
</html>
  `;
}

function buildCustomerEmailHtml(order: OrderPayload): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0e6eb;">
        <strong style="color: #1a0a10; font-size: 14px;">${item.name}</strong>
        ${item.variantName ? `<br><span style="color: #888; font-size: 12px;">Shade: ${item.variantName}</span>` : ""}
        <br><span style="color: #666; font-size: 12px;">Qty: ${item.quantity} × Rs. ${item.price.toLocaleString()}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0e6eb; text-align: right; font-weight: bold; color: #d6336c; font-size: 14px;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmed</title></head>
<body style="margin:0; padding:20px; background-color:#faf5f7; font-family:sans-serif;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #f5c6d5;">
    <div style="background:#d6336c; padding:30px 24px; text-align:center;">
      <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:900; letter-spacing:2px;">LÉÏA</h1>
      <p style="margin:6px 0 0; color:#ffdbe8; font-size:13px;">Pakistani Luxury Cosmetics</p>
    </div>
    <div style="padding:28px 24px;">
      <div style="text-align:center; margin-bottom:24px;">
        <h2 style="margin:0 0 4px; color:#1a0a10; font-size:20px;">Thank you for your order, ${order.customerName}!</h2>
        <p style="margin:0; color:#666; font-size:13px;">Your order <strong style="color:#d6336c;">#${order.orderNumber}</strong> is confirmed and being prepared for dispatch.</p>
      </div>
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <thead>
          <tr style="border-bottom:2px solid #d6336c;">
            <th style="text-align:left; padding-bottom:8px; font-size:12px; text-transform:uppercase;">Item</th>
            <th style="text-align:right; padding-bottom:8px; font-size:12px; text-transform:uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="background:#fff5f8; border-radius:12px; padding:16px; margin:20px 0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
          <span>Subtotal:</span><strong>Rs. ${order.subtotal.toLocaleString()}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
          <span>Shipping:</span><strong>Rs. ${order.shippingFee.toLocaleString()}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:1px solid #f5c6d5; padding-top:8px; font-size:16px; font-weight:bold; color:#d6336c;">
          <span>Grand Total (COD):</span><span>Rs. ${order.total.toLocaleString()}</span>
        </div>
      </div>
      <div style="background:#fafafa; border-radius:12px; padding:16px; margin:20px 0; border:1px solid #eee;">
        <h3 style="margin:0 0 6px; font-size:12px; text-transform:uppercase; color:#888;">Delivery Details</h3>
        <p style="margin:0; font-size:13px; color:#222; line-height:1.5;">
          ${order.customerName}<br>${order.shippingAddress}, ${order.city}<br>📞 ${order.customerPhone}
        </p>
      </div>
    </div>
    <div style="background:#fdf9fa; padding:16px; text-align:center; font-size:11px; color:#888; border-top:1px solid #f0e6eb;">
      © 2026 LEIA Pakistan. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "shop.nigah@gmail.com";

    if (!resendApiKey) {
      console.error("❌ [Edge Function]: RESEND_API_KEY secret is missing in Supabase Edge environment");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY secret is not set in Supabase" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = (await req.json()) as OrderPayload;

    if (!payload || !payload.orderNumber) {
      return new Response(
        JSON.stringify({ error: "Missing orderNumber or payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🚀 [Edge Function notify-new-order]: Processing order #${payload.orderNumber} for ${payload.customerName}`);

    const results = {
      adminEmail: false,
      customerEmail: false,
      adminError: null as string | null,
      customerError: null as string | null,
    };

    // 1. Send Admin Alert Email (Always sent to verified owner email)
    try {
      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LEIA Orders <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `🛍️ New Order #${payload.orderNumber} - Rs. ${payload.total.toLocaleString()} from ${payload.customerName}`,
          html: buildAdminEmailHtml(payload),
        }),
      });

      const adminData = await adminRes.json();
      if (adminRes.ok) {
        console.log(`✅ [Edge Function]: Admin alert successfully delivered to ${adminEmail}`, adminData);
        results.adminEmail = true;
      } else {
        console.warn(`⚠️ [Edge Function]: Admin email failed:`, adminData);
        results.adminError = adminData.message || "Failed to send admin email";
      }
    } catch (adminErr) {
      console.error(`❌ [Edge Function]: Error sending admin email:`, adminErr);
      results.adminError = String(adminErr);
    }

    // 2. Attempt Customer Confirmation Email (Only delivers if customer email matches test account or custom domain is verified)
    if (payload.customerEmail && payload.customerEmail.includes("@")) {
      try {
        const custRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "LEIA Cosmetics <onboarding@resend.dev>",
            to: [payload.customerEmail],
            subject: `✨ Your LÉÏA Order #${payload.orderNumber} is Confirmed!`,
            html: buildCustomerEmailHtml(payload),
          }),
        });

        const custData = await custRes.json();
        if (custRes.ok) {
          console.log(`✅ [Edge Function]: Customer confirmation delivered to ${payload.customerEmail}`);
          results.customerEmail = true;
        } else {
          // Expected in Resend test mode for unverified domains
          console.log(`ℹ️ [Edge Function]: Customer email notice (testing mode): ${custData.message}`);
          results.customerError = custData.message;
        }
      } catch (custErr) {
        console.warn(`⚠️ [Edge Function]: Customer email network error:`, custErr);
        results.customerError = String(custErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderNumber: payload.orderNumber,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ [Edge Function Global Exception]:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
