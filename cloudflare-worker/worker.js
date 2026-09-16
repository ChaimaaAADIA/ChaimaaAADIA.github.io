const ALLOWED_ORIGIN = "https://chaimaaaadia.github.io";
const NOTIFY_EMAIL = "aadia.chaimaa20@gmail.com";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST" || origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    let data = {};
    try {
      data = await request.json();
    } catch (e) {}

    const cf = request.cf || {};

    const html = `
      <h2>Nouvelle visite sur ton portfolio</h2>
      <ul>
        <li><b>Page :</b> ${data.page || "?"}</li>
        <li><b>Referent :</b> ${data.referrer || "direct"}</li>
        <li><b>Navigateur :</b> ${data.userAgent || "?"}</li>
        <li><b>Langue :</b> ${data.language || "?"}</li>
        <li><b>Date :</b> ${data.timestamp || new Date().toISOString()}</li>
        <li><b>Ville / pays :</b> ${cf.city || "?"} / ${cf.country || "?"}</li>
      </ul>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: "Nouvelle visite sur ton portfolio",
        html,
      }),
    });

    const resendBody = await resendRes.text();

    return new Response(JSON.stringify({ ok: resendRes.ok, resendStatus: resendRes.status, resendBody }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
