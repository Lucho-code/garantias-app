import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Cliente admin — bypasa RLS y permite auth.admin.listUsers()
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const todayStr  = fmt(today);
  const plus10Str = fmt(addDays(today, 10));
  const plus30Str = fmt(addDays(today, 30));

  // Garantías entre 11 y 30 días restantes, aún no avisadas a 30 días
  const { data: batch30 } = await supabaseAdmin
    .from("warranties")
    .select("id, user_id, name, brand, expiry_date")
    .gt("expiry_date", plus10Str)
    .lte("expiry_date", plus30Str)
    .eq("notified_30", false);

  // Garantías entre 0 y 10 días restantes, aún no avisadas a 10 días
  const { data: batch10 } = await supabaseAdmin
    .from("warranties")
    .select("id, user_id, name, brand, expiry_date")
    .gte("expiry_date", todayStr)
    .lte("expiry_date", plus10Str)
    .eq("notified_10", false);

  const all = [...(batch30 ?? []), ...(batch10 ?? [])];
  if (all.length === 0) return NextResponse.json({ sent: 0, message: "Sin garantías por notificar" });

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? ""]));

  type W = { id: string; user_id: string; name: string; brand: string | null; expiry_date: string };
  const byUser: Record<string, { w30: W[]; w10: W[] }> = {};

  for (const w of (batch30 ?? []) as W[]) {
    if (!byUser[w.user_id]) byUser[w.user_id] = { w30: [], w10: [] };
    byUser[w.user_id].w30.push(w);
  }
  for (const w of (batch10 ?? []) as W[]) {
    if (!byUser[w.user_id]) byUser[w.user_id] = { w30: [], w10: [] };
    byUser[w.user_id].w10.push(w);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://garantias-app-gold.vercel.app";
  let sent = 0;

  for (const [userId, { w30, w10 }] of Object.entries(byUser)) {
    const email = emailMap[userId];
    if (!email) continue;

    const daysLeft = (dateStr: string) =>
      Math.ceil((new Date(dateStr).getTime() - today.getTime()) / 86400000);

    const tableRow = (w: W, urgent: boolean) => {
      const days = daysLeft(w.expiry_date);
      const color = urgent ? "#dc2626" : "#d97706";
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">
          <span style="font-weight:600;color:#111827">${w.name}</span>
          ${w.brand ? `<br><span style="font-size:12px;color:#9ca3af">${w.brand}</span>` : ""}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:700;color:${color};white-space:nowrap">
          ${days} día${days !== 1 ? "s" : ""}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;white-space:nowrap">
          ${w.expiry_date}
        </td>
      </tr>`;
    };

    const total = w30.length + w10.length;
    const subject = w10.length > 0
      ? `⚠️ ${w10.length} garantía${w10.length > 1 ? "s" : ""} vence${w10.length === 1 ? "" : "n"} en menos de 10 días`
      : `🛡️ ${total} garantía${total > 1 ? "s" : ""} por vencer en 30 días`;

    const html = `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;max-width:100%">
  <tr><td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:28px 32px">
    <p style="margin:0;font-size:22px;font-weight:800;color:white">🛡️ GarantíasApp</p>
    <p style="margin:6px 0 0;font-size:14px;color:#c7d2fe">Garantías próximas a vencer</p>
  </td></tr>
  <tr><td style="padding:28px 32px">
    ${w10.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;overflow:hidden;margin-bottom:24px">
      <tr><td style="padding:14px 16px;background:#fee2e2;border-bottom:1px solid #fecaca">
        <span style="font-weight:700;color:#b91c1c;font-size:14px">⚠️ Vencen en menos de 10 días</span>
      </td></tr>
      <tr><td><table width="100%" cellpadding="0" cellspacing="0">
        <thead><tr style="background:#fef2f2">
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:#9ca3af;font-weight:600">PRODUCTO</th>
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:#9ca3af;font-weight:600">DÍAS</th>
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:#9ca3af;font-weight:600">VENCE</th>
        </tr></thead>
        <tbody>${w10.map(w => tableRow(w, true)).join("")}</tbody>
      </table></td></tr>
    </table>` : ""}
    ${w30.length > 0 ? `
    <p style="margin:0 0 12px;font-weight:700;color:#111827;font-size:14px">📅 Vencen en los próximos 30 días</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px">
      <thead><tr style="background:#f9fafb">
        <th style="text-align:left;padding:8px 12px;font-size:11px;color:#9ca3af;font-weight:600">PRODUCTO</th>
        <th style="text-align:left;padding:8px 12px;font-size:11px;color:#9ca3af;font-weight:600">DÍAS</th>
        <th style="text-align:left;padding:8px 12px;font-size:11px;color:#9ca3af;font-weight:600">VENCE</th>
      </tr></thead>
      <tbody>${w30.map(w => tableRow(w, false)).join("")}</tbody>
    </table>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0">
      <a href="${appUrl}/garantias" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:white;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:14px">
        Ver mis garantías →
      </a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center">
    <p style="margin:0;color:#9ca3af;font-size:12px">
      Recibís este email porque tenés garantías por vencer · <a href="${appUrl}" style="color:#6366f1">GarantíasApp</a>
    </p>
  </td></tr>
</table></td></tr></table></body></html>`;

    const { error: sendError } = await resend.emails.send({
      from: "GarantíasApp <notificaciones@resend.dev>",
      to: email,
      subject,
      html,
    });

    if (!sendError) {
      if (w30.length > 0)
        await supabaseAdmin.from("warranties").update({ notified_30: true }).in("id", w30.map(w => w.id));
      if (w10.length > 0)
        await supabaseAdmin.from("warranties").update({ notified_10: true }).in("id", w10.map(w => w.id));
      sent++;
    }
  }

  return NextResponse.json({ sent, processed: all.length });
}
