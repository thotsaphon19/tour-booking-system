import { Resend } from "resend";
import type { Booking, Tour } from "@/lib/types";

const FROM_EMAIL = process.env.EMAIL_FROM || "Tours <onboarding@resend.dev>";
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;

/** Resolves which admin inbox(es) should receive a notification: the
 *  Settings page's configured list takes priority; falls back to the
 *  ADMIN_NOTIFY_EMAIL env var (single address) if none are configured yet. */
function resolveAdminEmails(adminEmails?: string[]): string[] {
  if (adminEmails && adminEmails.length > 0) return adminEmails;
  return ADMIN_NOTIFY_EMAIL ? [ADMIN_NOTIFY_EMAIL] : [];
}

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function currency(amount: number, code: string) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(amount);
}

/**
 * Sends a booking-received confirmation to the customer and a notification
 * to the admin inbox. If RESEND_API_KEY is not configured, this silently
 * logs to the console instead of throwing — bookings still save to the
 * database either way, so the site keeps working in local/demo mode.
 */
export async function sendBookingEmails(params: {
  booking: Booking;
  tour: Tour;
  customerName: string;
  customerEmail: string;
  adminEmails?: string[];
}) {
  const { booking, tour, customerName, customerEmail } = params;
  const notifyEmails = resolveAdminEmails(params.adminEmails);
  const client = getClient();
  const isQuote = booking.request_type === "quote";

  const subjectCustomer = isQuote
    ? `ได้รับคำขอใบเสนอราคา: ${tour.title}`
    : `ยืนยันการรับคำขอจองทัวร์: ${tour.title}`;
  const bodyCustomer = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto;">
      <h2 style="color:#0F4C42;">${isQuote ? "ได้รับคำขอใบเสนอราคาแล้ว" : "ขอบคุณที่จองทัวร์กับเรา"} ${customerName}</h2>
      <p>${
        isQuote
          ? "ทีมงานกำลังจัดทำใบเสนอราคาที่ปรับให้เหมาะกับความต้องการของคุณ จะส่งให้ทางอีเมลภายใน 24 ชั่วโมง"
          : "เราได้รับคำขอจองทัวร์ของคุณแล้ว ทีมงานจะติดต่อกลับเพื่อยืนยันภายใน 24 ชั่วโมง"
      }</p>
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <tr><td style="padding:8px 0; color:#7A8578;">ทัวร์</td><td style="padding:8px 0; font-weight:bold;">${tour.title}</td></tr>
        <tr><td style="padding:8px 0; color:#7A8578;">วันเดินทาง</td><td style="padding:8px 0;">${booking.travel_date}</td></tr>
        <tr><td style="padding:8px 0; color:#7A8578;">จำนวนผู้เดินทาง</td><td style="padding:8px 0;">${booking.num_travelers} ท่าน</td></tr>
        <tr><td style="padding:8px 0; color:#7A8578;">${isQuote ? "ราคาโดยประมาณ" : "ยอดรวม"}</td><td style="padding:8px 0; font-weight:bold;">${currency(booking.total_price, tour.currency)}</td></tr>
        <tr><td style="padding:8px 0; color:#7A8578;">สถานะ</td><td style="padding:8px 0;">${isQuote ? "รอใบเสนอราคา" : "รอการยืนยัน"}</td></tr>
      </table>
      <p style="margin-top:24px; color:#7A8578; font-size:13px;">หมายเลข #${booking.id}</p>
    </div>
  `;

  const subjectAdmin = isQuote
    ? `💬 คำขอใบเสนอราคาใหม่ #${booking.id}: ${tour.title}`
    : `📩 คำขอจองใหม่ #${booking.id}: ${tour.title}`;
  const bodyAdmin = `
    <div style="font-family: Arial, sans-serif;">
      <h3>${isQuote ? "มีคำขอใบเสนอราคาใหม่" : "มีคำขอจองใหม่เข้ามา"}</h3>
      <ul>
        <li>ทัวร์: ${tour.title}</li>
        <li>ลูกค้า: ${customerName} (${customerEmail})</li>
        <li>วันเดินทาง: ${booking.travel_date}</li>
        <li>จำนวนคน: ${booking.num_travelers}</li>
        <li>ยอดโดยประมาณ: ${currency(booking.total_price, tour.currency)}</li>
      </ul>
    </div>
  `;

  if (!client) {
    console.log("[email:disabled] RESEND_API_KEY not set — skipping real send.\n", {
      to: customerEmail,
      subject: subjectCustomer,
    });
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  try {
    await client.emails.send({ from: FROM_EMAIL, to: customerEmail, subject: subjectCustomer, html: bodyCustomer });
    if (notifyEmails.length > 0) {
      await client.emails.send({ from: FROM_EMAIL, to: notifyEmails, subject: subjectAdmin, html: bodyAdmin });
    }
    return { sent: true };
  } catch (err) {
    console.error("[email:error] Failed to send booking email", err);
    return { sent: false, reason: "send_failed" };
  }
}

export async function sendContactAck(params: { name: string; email: string; adminEmails?: string[] }) {
  const client = getClient();
  const notifyEmails = resolveAdminEmails(params.adminEmails);
  if (!client) {
    console.log("[email:disabled] Skipping contact ack email to", params.email);
    return;
  }
  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: "ได้รับข้อความของคุณแล้ว",
      html: `<p>สวัสดีคุณ ${params.name},</p><p>ขอบคุณสำหรับข้อความ ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>`,
    });
    if (notifyEmails.length > 0) {
      await client.emails.send({
        from: FROM_EMAIL,
        to: notifyEmails,
        subject: `ข้อความใหม่จาก ${params.name}`,
        html: `<p>${params.email} ส่งข้อความใหม่เข้ามา กรุณาตรวจสอบในระบบหลังบ้าน</p>`,
      });
    }
  } catch (err) {
    console.error("[email:error] Failed to send contact ack", err);
  }
}

export async function sendPersonalizeRequestEmails(params: {
  requestId: number;
  name: string;
  email: string;
  travelWhen: string;
  travelerSummary: string;
  guideSummary: string;
  hotelLevel: string;
  budget?: string;
  placesOfInterest?: string;
  adminEmails?: string[];
}) {
  const client = getClient();
  const notifyEmails = resolveAdminEmails(params.adminEmails);
  const bodyCustomer = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto;">
      <h2 style="color:#0F4C42;">ได้รับคำขอทัวร์ตามสั่งของคุณแล้ว ${params.name}</h2>
      <p>ทีมงานจะออกแบบโปรแกรมทริปที่เหมาะกับคุณและส่งใบเสนอราคาให้ภายใน 24 ชั่วโมง</p>
      <ul>
        <li>ช่วงเวลาเดินทาง: ${params.travelWhen}</li>
        <li>จำนวนผู้เดินทาง: ${params.travelerSummary}</li>
        <li>ไกด์/รถ: ${params.guideSummary}</li>
        <li>ระดับที่พัก: ${params.hotelLevel}</li>
        ${params.budget ? `<li>งบประมาณโดยประมาณ: ${params.budget}</li>` : ""}
        ${params.placesOfInterest ? `<li>สถานที่/กิจกรรมที่สนใจ: ${params.placesOfInterest}</li>` : ""}
      </ul>
      <p style="margin-top:24px; color:#7A8578; font-size:13px;">หมายเลขคำขอ #${params.requestId}</p>
    </div>
  `;
  const bodyAdmin = `
    <div style="font-family: Arial, sans-serif;">
      <h3>มีคำขอทัวร์ตามสั่งใหม่ #${params.requestId}</h3>
      <ul>
        <li>ชื่อ: ${params.name} (${params.email})</li>
        <li>ช่วงเวลาเดินทาง: ${params.travelWhen}</li>
        <li>จำนวนผู้เดินทาง: ${params.travelerSummary}</li>
        <li>ไกด์/รถ: ${params.guideSummary}</li>
        <li>ระดับที่พัก: ${params.hotelLevel}</li>
        ${params.budget ? `<li>งบประมาณ: ${params.budget}</li>` : ""}
        ${params.placesOfInterest ? `<li>สถานที่/กิจกรรมที่สนใจ: ${params.placesOfInterest}</li>` : ""}
      </ul>
    </div>
  `;

  if (!client) {
    console.log("[email:disabled] Skipping personalize-request emails for", params.email);
    return;
  }
  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: "ได้รับคำขอทัวร์ตามสั่งของคุณแล้ว",
      html: bodyCustomer,
    });
    if (notifyEmails.length > 0) {
      await client.emails.send({
        from: FROM_EMAIL,
        to: notifyEmails,
        subject: `🧭 คำขอทัวร์ตามสั่งใหม่ #${params.requestId}`,
        html: bodyAdmin,
      });
    }
  } catch (err) {
    console.error("[email:error] Failed to send personalize-request email", err);
  }
}
