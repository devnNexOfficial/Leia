import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Ambient declaration for IDE TypeScript language server
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

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

function buildAdminContactEmailHtml(payload: ContactPayload): string {
  const formattedDate = new Date().toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Customer Message</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #D6336C 0%, #c02560 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 28px 24px; }
    .info-card { background: #fff5f8; border: 1px solid #f5c6d5; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; }
    .info-value { color: #0f172a; font-weight: 700; }
    .message-box { background: #f8fafc; border-left: 4px solid #D6336C; border-radius: 0 12px 12px 0; padding: 18px 20px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; margin-bottom: 24px; }
    .btn { display: inline-block; background: #D6336C; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Customer Message</h1>
      <p>Received on ${formattedDate} (PKT)</p>
    </div>
    
    <div class="content">
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Customer Name:</span>
          <span class="info-value">${payload.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email Address:</span>
          <span class="info-value"><a href="mailto:${payload.email}" style="color: #D6336C; text-decoration: none;">${payload.email}</a></span>
        </div>
      </div>

      <div style="margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
        Message Content:
      </div>
      <div class="message-box">${payload.message}</div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="mailto:${payload.email}?subject=Re: Your LEIA inquiry" class="btn">Reply via Email →</a>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} LEIA Cosmetics Storefront Inquiries. Sent from Supabase Edge Functions.</p>
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
      console.warn("⚠️ [Edge Function notify-contact-message]: RESEND_API_KEY secret is not set in Supabase");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY secret is not set in Supabase" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = (await req.json()) as ContactPayload;

    if (!payload || !payload.name || !payload.email || !payload.message) {
      return new Response(
        JSON.stringify({ error: "Missing required contact payload fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🚀 [Edge Function notify-contact-message]: Dispatching inquiry notification from ${payload.name} (${payload.email})`);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LEIA Support <onboarding@resend.dev>",
        to: [adminEmail],
        reply_to: payload.email,
        subject: `📬 New Customer Message from ${payload.name}`,
        html: buildAdminContactEmailHtml(payload),
      }),
    });

    const resendData = await resendRes.json();

    if (resendRes.ok) {
      console.log(`✅ [Edge Function]: Contact notification delivered to ${adminEmail}`, resendData);
      return new Response(
        JSON.stringify({ success: true, data: resendData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.warn(`⚠️ [Edge Function]: Resend API notice:`, resendData);
      return new Response(
        JSON.stringify({ success: false, error: resendData.message || "Failed to send email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("❌ [Edge Function Exception]:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
