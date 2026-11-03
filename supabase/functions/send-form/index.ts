// Modtager formularen, gemmer beskeden og (hvis RESEND_API_KEY er sat) sender mail til sidens ejer.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: { slug?: string; email?: string; message?: string; website?: string };
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "bad json" }, 400);
  if (body.website) return json({ ok: true }); // honeypot mod spam

  const slug = String(body.slug ?? "");
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(slug)) return json({ error: "slug" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return json({ error: "email" }, 400);
  if (message.length < 1 || message.length > 5000) return json({ error: "message" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: page } = await db.from("pages").select("id,title,published").eq("slug", slug).maybeSingle();
  if (!page || !page.published) return json({ error: "ukendt side" }, 404);

  const { error: saveError } = await db.from("submissions").insert({ page_id: page.id, email, message });
  if (saveError) return json({ error: "Kunne ikke gemme beskeden" }, 500);

  const { data: st } = await db.from("page_settings").select("form_to_email").eq("page_id", page.id).maybeSingle();
  const key = Deno.env.get("RESEND_API_KEY");
  if (key && st?.form_to_email) {
    try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("MAIL_FROM") ?? "onboarding@resend.dev",
        to: st.form_to_email,
        reply_to: email,
        subject: `Ny besked fra ${page.title || slug}`,
        text: `Fra: ${email}\n\n${message}`,
      }),
    });
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 500);
      console.error("Resend afviste mailen", r.status, detail);
      return json({ ok: true, mailed: false, mail_status: r.status, mail_error: detail });
    }
    return json({ ok: true, mailed: true });
    } catch (e) {
      console.error("Resend kunne ikke kaldes", String(e));
      // Beskeden er allerede gemt. Undgå at bede brugeren sende den igen.
      return json({ ok: true, mailed: false });
    }
  }
  console.warn("Ingen mail sendt: mangler RESEND_API_KEY eller form_to_email", { key: !!key, to: !!st?.form_to_email });
  return json({ ok: true, mailed: false, mail_error: !key ? "RESEND_API_KEY mangler" : "form_to_email mangler" });
});
