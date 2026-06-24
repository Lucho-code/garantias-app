import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const today = new Date();
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
  const in7  = new Date(today); in7.setDate(in7.getDate() + 7);

  const { data: warranties } = await supabase
    .from("warranties")
    .select("*, user_id")
    .gte("expiry_date", today.toISOString().split("T")[0])
    .lte("expiry_date", in30.toISOString().split("T")[0]);

  if (!warranties || warranties.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const { data: { users } } = await supabase.auth.admin.listUsers();
  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

  const grouped: Record<string, typeof warranties> = {};
  for (const w of warranties) {
    if (!grouped[w.user_id]) grouped[w.user_id] = [];
    grouped[w.user_id].push(w);
  }

  let sent = 0;
  for (const [userId, items] of Object.entries(grouped)) {
    const email = emailMap[userId];
    if (!email) continue;

    const urgent = items.filter((w) => new Date(w.expiry_date) <= in7);
    const normal = items.filter((w) => new Date(w.expiry_date) > in7);

    const rows = (list: typeof items) =>
      list.map((w) => {
        const days = Math.ceil((new Date(w.expiry_date).getTime() - today.getTime()) / 86400000);
        return `<tr style="border-bottom:1px solid #f0f0f0">
          <td style="padding:12px 8px;font-weight:600;color:#1a1a2e">${w.name}</td>
          <td style="padding:12px 8px;color:#6b7280">${w.brand ?? ""}</td>
          <td style="padding:12px 8px;color:${days <= 7 ? "#dc2626" : "#d97706"};font-weight:600">${days} días</td>
          <td style="padding:12px 8px;color:#6b7280">${w.expiry_date}</td>
        </tr>`;
      }).join("");

    const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f9fafb;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#4f46e5;padding:24px 28px">
    <h1 style="color:white;margin:0;font-size:20px">🛡️ GarantíasApp</h1>
    <p style="color:#c7d2fe;margin:4px 0 0;font-size:14px">Resumen de garantías próximas a vencer</p>
  </div>
  <div style="padding:24px 28px">
    ${urgent.length > 0 ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:20px">
      <p style="color:#dc2626;font-weight:700;margin:0 0 4px">⚠️ Vencen en menos de 7 días</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead><tr style="background:#fee2e2">
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">PRODUCTO</th>
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">MARCA</th>
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">DÍAS</th>
          <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">VENCE</th>
        </tr></thead>
        <tbody>${rows(urgent)}</tbody>
      </table>
    </div>` : ""}
    ${normal.length > 0 ? `
    <p style="font-weight:700;color:#1a1a2e;margin:0 0 12px">Vencen en los próximos 30 días</p>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:#f9fafb">
        <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">PRODUCTO</th>
        <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">MARCA</th>
        <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">DÍAS</th>
        <th style="text-align:left;padding:8px;font-size:12px;color:#6b7280">VENCE</th>
      </tr></thead>
      <tbody>${rows(normal)}</tbody>
    </table>` : ""}
    <div style="margin-top:24px;text-align:center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://garantias-app.vercel.app"}/garantias"
        style="background:#4f46e5;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">
        Ver mis garantías →
      </a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center">
      Recibís este email porque tenés garantías próximas a vencer en GarantíasApp.
    </p>
  </div>
</div>
</body></html>`;

    await resend.emails.send({
      from: "GarantíasApp <notificaciones@tudominio.com>",
      to: email,
      subject: `🛡️ Tenés ${items.length} garantía${items.length !== 1 ? "s" : ""} por vencer`,
      html,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
