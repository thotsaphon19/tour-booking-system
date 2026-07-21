"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, Languages, Tag, Building2, Type as TypeIcon, Palette, Images, CreditCard, DollarSign, MessageCircle, Bell, Phone, Mail, MapPin as MapPinIcon, Link2 as LinkIcon, Key, ShieldCheck, Webhook, TrendingUp, Star, ExternalLink } from "lucide-react";
import { updateSettingsAction, type SettingsFormState } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/queries/settings";
import { suggestTranslations } from "@/lib/actions/translate";
import RefreshRatesButton from "@/components/admin/RefreshRatesButton";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import { AdminSection } from "@/components/admin/AdminFormKit";

const initialState: SettingsFormState = { ok: false };

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const whatsappApiConfigured = Boolean(settings.whatsapp_api_phone_number_id && settings.whatsapp_api_access_token);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

  return (
    <form ref={formRef} action={formAction} className="max-w-2xl space-y-6">
      {state.message && (
        <p className="rounded-lg bg-[var(--color-jade)]/10 px-3 py-2 text-sm text-[var(--color-jade)]">{state.message}</p>
      )}

      <AdminSection title="ชื่อเว็บไซต์ & แบรนด์" icon={Building2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อเว็บไซต์ (แสดงในเมนูบน/หลังบ้าน)" icon={Tag}>
            <input name="site_name" defaultValue={settings.site_name} className="input" />
          </Field>
          <Field label="ชื่อบริษัทเต็ม (แสดงในฟุตเตอร์/ชื่อหน้าเว็บ)" icon={Building2}>
            <input name="company_name" defaultValue={settings.company_name} className="input" />
          </Field>
          <ImageUploadField name="logo_url" label="โลโก้ (ปล่อยว่างเพื่อใช้ไอคอนเริ่มต้น)" icon={Images} defaultValue={settings.logo_url} full />
        </div>
      </AdminSection>

      <AdminSection title="รูปแบบเอกสาร PDF" icon={TypeIcon}>
        <Field label="ฟอนต์ในเอกสาร PDF (ทัวร์ / ใบเสนอราคา)" icon={TypeIcon}>
          <select name="pdf_font_style" defaultValue={settings.pdf_font_style || "sans"} className="input">
            <option value="sans">Sans-serif (อ่านง่าย — ค่าเริ่มต้น)</option>
            <option value="serif">Serif (คลาสสิก, ใช้ Times-Roman)</option>
          </select>
        </Field>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          หมายเหตุ: ฟอนต์ Serif จะมีผลเฉพาะ PDF ภาษาอังกฤษ/ฝรั่งเศส/เยอรมัน/สเปน — เอกสารภาษาไทยและญี่ปุ่นจะยังใช้ฟอนต์ Sans-serif เสมอ เพราะเป็นฟอนต์เดียวที่รองรับตัวอักษรเหล่านี้
        </p>
      </AdminSection>

      <AdminSection title="โทนสีเว็บไซต์" icon={Palette}>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField label="สีพื้นหลังเว็บ" icon={Palette} name="color_bg" defaultValue={settings.color_bg} />
          <ColorField label="สีพื้นหลังการ์ด/กล่อง" icon={Palette} name="color_surface" defaultValue={settings.color_surface} />
          <ColorField label="สีตัวอักษรหลัก" icon={Palette} name="color_ink" defaultValue={settings.color_ink} />
          <ColorField label="สีหลัก (ปุ่ม, หัวข้อ)" icon={Palette} name="color_primary" defaultValue={settings.color_primary} />
          <ColorField label="สีหลัก (เข้ม, ใช้ในฟุตเตอร์/แถบบน)" icon={Palette} name="color_primary_dark" defaultValue={settings.color_primary_dark} />
          <ColorField label="สีเน้น (ทอง/accent)" icon={Palette} name="color_accent" defaultValue={settings.color_accent} />
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">การเปลี่ยนสีจะมีผลกับทั้งเว็บไซต์และหลังบ้านทันทีหลังบันทึก</p>
      </AdminSection>

      <AdminSection title="รูปภาพหน้าแรก (Hero)" icon={Images}>
        <MultiImageUploadField name="hero_images" label="รูปภาพสไลด์หน้าแรก (สลับอัตโนมัติ)" icon={Images} defaultValue={settings.hero_images} />
      </AdminSection>

      <AdminSection title="ช่องทางการชำระเงิน" icon={CreditCard}>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          อัปโหลดโลโก้ช่องทางการชำระเงินที่รับจริง เช่น PayPal, Wise, บัตรเครดิต, หรือตรา Amazing Thailand — จะแสดงเป็นแถวโลโก้ในฟุตเตอร์ของเว็บไซต์
          (ถ้าไม่อัปโหลด จะไม่แสดงส่วนนี้)
        </p>
        <MultiImageUploadField name="payment_logos" label="โลโก้ช่องทางการชำระเงิน" icon={CreditCard} defaultValue={settings.payment_logos} />
      </AdminSection>

      <AdminSection title="อัตราแลกเปลี่ยนสกุลเงิน" icon={DollarSign}>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          ราคาทัวร์ทั้งหมดกรอกเป็นเงินบาท (THB) ระบบจะแปลงเป็นสกุลเงินอื่นให้ลูกค้าดูตามอัตราด้านล่าง
          (ใส่จำนวนสกุลเงินนั้นๆ ที่เท่ากับ 1 บาท)
        </p>
        <div className="mb-3">
          <RefreshRatesButton />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="1 บาท = ? USD" icon={DollarSign}>
            <input name="rate_usd" type="number" step="0.0001" defaultValue={settings.rate_usd} className="input font-mono-data" />
          </Field>
          <Field label="1 บาท = ? EUR" icon={DollarSign}>
            <input name="rate_eur" type="number" step="0.0001" defaultValue={settings.rate_eur} className="input font-mono-data" />
          </Field>
          <Field label="1 บาท = ? GBP" icon={DollarSign}>
            <input name="rate_gbp" type="number" step="0.0001" defaultValue={settings.rate_gbp} className="input font-mono-data" />
          </Field>
          <Field label="1 บาท = ? JPY" icon={DollarSign}>
            <input name="rate_jpy" type="number" step="0.0001" defaultValue={settings.rate_jpy} className="input font-mono-data" />
          </Field>
          <Field label="1 บาท = ? AUD" icon={DollarSign}>
            <input name="rate_aud" type="number" step="0.0001" defaultValue={settings.rate_aud} className="input font-mono-data" />
          </Field>
          <Field label="1 บาท = ? CAD" icon={DollarSign}>
            <input name="rate_cad" type="number" step="0.0001" defaultValue={settings.rate_cad} className="input font-mono-data" />
          </Field>
        </div>
      </AdminSection>

      <AdminSection title="ป๊อปอัพที่ปรึกษา (มุมขวาล่างของเว็บ)" icon={MessageCircle}>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          รูปนี้จะแสดงเป็นไอคอนลอยมุมขวาล่างของทุกหน้า และจะมีข้อความทักทายเด้งขึ้นมาอัตโนมัติ
          หลังจากลูกค้าเปิดเว็บไปสักครู่ (แสดงครั้งเดียวต่อการเข้าเว็บหนึ่งครั้ง)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อที่ปรึกษา" icon={Tag}>
            <input name="consultant_name" defaultValue={settings.consultant_name} className="input" />
          </Field>
          <Field label="ตำแหน่ง" icon={Building2}>
            <input name="consultant_role" defaultValue={settings.consultant_role} className="input" />
          </Field>
          <ImageUploadField name="consultant_photo_url" label="รูปโปรไฟล์" icon={Images} defaultValue={settings.consultant_photo_url} full />
          <Field label="ข้อความทักทาย" icon={MessageCircle} full>
            <input name="consultant_greeting" defaultValue={settings.consultant_greeting} className="input" />
          </Field>
        </div>
        <ConsultantTranslations settings={settings} formRef={formRef} />
      </AdminSection>

      <AdminSection title="การแจ้งเตือนทางอีเมล" icon={Bell}>
        <p className="mb-3 text-xs text-[var(--color-muted)]">
          เมื่อมีคำขอจอง/ใบเสนอราคา, ข้อความติดต่อ, หรือคำขอทัวร์ตามสั่งใหม่เข้ามา ระบบจะส่งอีเมลแจ้งเตือนไปยังทุกอีเมลด้านล่างนี้โดยอัตโนมัติ
        </p>
        <Field label="อีเมลรับการแจ้งเตือน (บรรทัดละ 1 อีเมล เพิ่มได้หลายอีเมล)" icon={Mail}>
          <textarea
            name="notification_emails"
            rows={4}
            defaultValue={settings.notification_emails}
            className="input resize-none font-mono-data"
            placeholder={"เช่น\nowner@example.com\nsales@example.com"}
          />
        </Field>
      </AdminSection>

      <AdminSection title="ช่องทางติดต่อ" icon={Phone}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="เบอร์ WhatsApp (รวมรหัสประเทศ ไม่มีเครื่องหมาย +)" icon={Phone}>
            <input name="whatsapp_number" defaultValue={settings.whatsapp_number} className="input" placeholder="66812345678" />
          </Field>
          <Field label="อีเมลติดต่อ" icon={Mail}>
            <input name="contact_email" defaultValue={settings.contact_email} className="input" />
          </Field>
          <Field label="เบอร์โทรศัพท์" icon={Phone}>
            <input name="contact_phone" defaultValue={settings.contact_phone} className="input" />
          </Field>
          <Field label="ที่อยู่ (แสดงในหน้าติดต่อ)" icon={MapPinIcon} full>
            <input name="contact_address" defaultValue={settings.contact_address} className="input" />
          </Field>
        </div>
      </AdminSection>

      <AdminSection title="เชื่อมต่อ WhatsApp Business API (แชทจริงในเว็บ)" icon={MessageCircle}>
        <p className="mb-4 text-xs text-[var(--color-muted)]">
          {whatsappApiConfigured ? (
            <span className="font-semibold text-[var(--color-jade)]">✓ เชื่อมต่อแล้ว — ทีมงานตอบกลับผ่านหน้าแอดมิน &quot;แชท WhatsApp&quot; ได้จริง</span>
          ) : (
            <span>
              ยังไม่ได้เชื่อมต่อ — ปุ่ม &quot;แชทกับเรา&quot; หน้าเว็บจะยังใช้ได้ (เปิด WhatsApp ให้ลูกค้าส่งข้อความแรกเอง) แต่ทีมงานจะ
              <strong>ตอบกลับจากหน้าแอดมินไม่ได้</strong> จนกว่าจะกรอกข้อมูลด้านล่างให้ครบ
            </span>
          )}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone Number ID" icon={Phone}>
            <input
              name="whatsapp_api_phone_number_id"
              defaultValue={settings.whatsapp_api_phone_number_id}
              className="input font-mono-data"
              placeholder="เช่น 109876543212345"
            />
          </Field>
          <Field label="Access Token" icon={Key}>
            <input
              name="whatsapp_api_access_token"
              defaultValue={settings.whatsapp_api_access_token}
              type="password"
              className="input font-mono-data"
              placeholder="EAAG..."
            />
          </Field>
          <Field label="Business Account ID (ไม่บังคับ)" icon={ShieldCheck}>
            <input
              name="whatsapp_api_business_account_id"
              defaultValue={settings.whatsapp_api_business_account_id}
              className="input font-mono-data"
            />
          </Field>
          <Field label="Webhook Verify Token (ตั้งเองได้ เช่น สร้างรหัสสุ่ม)" icon={Webhook}>
            <input
              name="whatsapp_api_webhook_verify_token"
              defaultValue={settings.whatsapp_api_webhook_verify_token}
              className="input font-mono-data"
              placeholder="เช่น mySecretToken123"
            />
          </Field>
        </div>
        <div className="mt-4 rounded-xl bg-[var(--color-surface)] p-4 text-xs text-[var(--color-ink-soft)]">
          <p className="mb-1 font-semibold">วิธีตั้งค่าที่ Meta for Developers:</p>
          <ol className="ml-4 list-decimal space-y-1">
            <li>สร้างแอป WhatsApp Business ที่ developers.facebook.com แล้วคัดลอก Phone Number ID และ Access Token มาใส่ด้านบน</li>
            <li>
              ในหน้า Webhook ของแอป ใส่ Callback URL เป็น{" "}
              <code className="rounded bg-white px-1.5 py-0.5">{`${siteUrl}/api/whatsapp/webhook`}</code>
            </li>
            <li>ใส่ Verify Token ให้ตรงกับที่กรอกไว้ในช่อง &quot;Webhook Verify Token&quot; ด้านบน แล้วกดยืนยัน (Verify and Save)</li>
            <li>เลือก subscribe ฟิลด์ &quot;messages&quot; เพื่อให้ข้อความตอบกลับจากลูกค้าส่งเข้าระบบ</li>
          </ol>
        </div>
      </AdminSection>

      <AdminSection title="สถิติบริษัท (แสดงในฟุตเตอร์)" icon={TrendingUp}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ปีที่ก่อตั้ง/ประสบการณ์ (ปี)" icon={TrendingUp}>
            <input name="years_experience" defaultValue={settings.years_experience} className="input" />
          </Field>
          <Field label="จำนวนนักท่องเที่ยวสะสม" icon={TrendingUp}>
            <input name="stat_travelers" defaultValue={settings.stat_travelers} className="input" />
          </Field>
          <Field label="นักท่องเที่ยวต่างชาติสะสม" icon={TrendingUp}>
            <input name="stat_english_travelers" defaultValue={settings.stat_english_travelers} className="input" />
          </Field>
          <Field label="จำนวนพนักงาน" icon={TrendingUp}>
            <input name="stat_employees" defaultValue={settings.stat_employees} className="input" />
          </Field>
          <Field label="จำนวนไกด์/คนขับ" icon={TrendingUp}>
            <input name="stat_guides" defaultValue={settings.stat_guides} className="input" />
          </Field>
          <Field label="% ลูกค้าพึงพอใจ" icon={Star}>
            <input name="stat_happy_percent" defaultValue={settings.stat_happy_percent} className="input" />
          </Field>
          <Field label="% ลูกค้าจากการบอกต่อ" icon={Star}>
            <input name="stat_recommendation_percent" defaultValue={settings.stat_recommendation_percent} className="input" />
          </Field>
        </div>
      </AdminSection>

      <AdminSection title="ลิงก์รีวิวภายนอก (ถ้ามี)" icon={Star}>
        <p className="mb-4 text-xs text-[var(--color-muted)]">
          ลิงก์ไหนกรอกไว้ จะขึ้นเป็นแบดจ์ให้ลูกค้ากดไปดูรีวิวจริงได้ ทั้งในหน้าแรกและท้ายเว็บทุกหน้า —
          อัปโหลดโลโก้ (ไม่บังคับ) เพื่อใช้แทนไอคอนเริ่มต้นของแต่ละแพลตฟอร์ม
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
            <Field label="ลิงก์ TripAdvisor" icon={LinkIcon}>
              <input name="tripadvisor_url" defaultValue={settings.tripadvisor_url} className="input" placeholder="https://www.tripadvisor.com/..." />
            </Field>
            <ImageUploadField name="tripadvisor_logo_url" label="โลโก้ (ไม่บังคับ)" icon={Images} defaultValue={settings.tripadvisor_logo_url} />
          </div>
          <div className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
            <Field label="ลิงก์ Google Reviews" icon={LinkIcon}>
              <input name="google_reviews_url" defaultValue={settings.google_reviews_url} className="input" placeholder="https://g.page/r/..." />
            </Field>
            <ImageUploadField name="google_reviews_logo_url" label="โลโก้ (ไม่บังคับ)" icon={Images} defaultValue={settings.google_reviews_logo_url} />
          </div>
          <div className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
            <Field label="ลิงก์ GetYourGuide" icon={LinkIcon}>
              <input name="getyourguide_url" defaultValue={settings.getyourguide_url} className="input" placeholder="https://www.getyourguide.com/..." />
            </Field>
            <ImageUploadField name="getyourguide_logo_url" label="โลโก้ (ไม่บังคับ)" icon={Images} defaultValue={settings.getyourguide_logo_url} />
          </div>
          <div className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
            <Field label="ลิงก์ KKday" icon={LinkIcon}>
              <input name="kkday_url" defaultValue={settings.kkday_url} className="input" placeholder="https://www.kkday.com/..." />
            </Field>
            <ImageUploadField name="kkday_logo_url" label="โลโก้ (ไม่บังคับ)" icon={Images} defaultValue={settings.kkday_logo_url} />
          </div>
          <div className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
            <Field label="ลิงก์ Viator" icon={LinkIcon}>
              <input name="viator_url" defaultValue={settings.viator_url} className="input" placeholder="https://www.viator.com/..." />
            </Field>
            <ImageUploadField name="viator_logo_url" label="โลโก้ (ไม่บังคับ)" icon={Images} defaultValue={settings.viator_logo_url} />
          </div>
          <div className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
            <Field label="ลิงก์ Facebook" icon={LinkIcon}>
              <input name="facebook_url" defaultValue={settings.facebook_url} className="input" />
            </Field>
            <ImageUploadField name="facebook_logo_url" label="โลโก้ (ไม่บังคับ)" icon={Images} defaultValue={settings.facebook_logo_url} />
          </div>
          <div className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
            <Field label="ลิงก์ Instagram" icon={LinkIcon}>
              <input name="instagram_url" defaultValue={settings.instagram_url} className="input" />
            </Field>
            <ImageUploadField name="instagram_logo_url" label="โลโก้ (ไม่บังคับ)" icon={Images} defaultValue={settings.instagram_logo_url} />
          </div>
        </div>

        <p className="mb-2 mt-6 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Star size={13} /> แพลตฟอร์มอื่นๆ เพิ่มเติม (ว่างไว้ก่อนได้ ใส่ทีหลังก็ได้ เช่น Tiktok)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2 rounded-xl border border-[var(--color-border)] p-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label={`ชื่อแพลตฟอร์ม #${n}`} icon={Tag}>
                  <input
                    name={`custom_review_${n}_label`}
                    defaultValue={settings[`custom_review_${n}_label` as keyof typeof settings] as string}
                    className="input"
                    placeholder="เช่น Tiktok"
                  />
                </Field>
                <Field label="ลิงก์" icon={ExternalLink}>
                  <input
                    name={`custom_review_${n}_url`}
                    defaultValue={settings[`custom_review_${n}_url` as keyof typeof settings] as string}
                    className="input"
                    placeholder="https://..."
                  />
                </Field>
              </div>
              <ImageUploadField
                name={`custom_review_${n}_logo_url`}
                label="โลโก้ (ไม่บังคับ)"
                icon={Images}
                defaultValue={settings[`custom_review_${n}_logo_url` as keyof typeof settings] as string}
              />
            </div>
          ))}
        </div>
      </AdminSection>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: 2px solid var(--color-jade);
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function ConsultantTranslations({
  settings,
  formRef,
}: {
  settings: SiteSettings;
  formRef: React.RefObject<HTMLFormElement | null>;
}) {
  const LOCALES = [
    { code: "th", label: "ไทย" },
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "ja", label: "日本語" },
  ] as const;
  type Code = (typeof LOCALES)[number]["code"];

  const [values, setValues] = useState<Record<Code, { role: string; greeting: string }>>({
    th: { role: settings.consultant_role_th || "", greeting: settings.consultant_greeting_th || "" },
    en: { role: settings.consultant_role_en || "", greeting: settings.consultant_greeting_en || "" },
    fr: { role: settings.consultant_role_fr || "", greeting: settings.consultant_greeting_fr || "" },
    de: { role: settings.consultant_role_de || "", greeting: settings.consultant_greeting_de || "" },
    ja: { role: settings.consultant_role_ja || "", greeting: settings.consultant_greeting_ja || "" },
  });
  const [active, setActive] = useState<Code>("en");
  const [loading, setLoading] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    try {
      const form = formRef.current;
      const fd = form ? new FormData(form) : null;
      const role = ((fd?.get("consultant_role") as string) || "").trim();
      const greeting = ((fd?.get("consultant_greeting") as string) || "").trim();
      const result = await suggestTranslations({ targetLocale: active, fields: { role, greeting } });
      setValues((prev) => ({
        ...prev,
        [active]: { role: result.role || prev[active].role, greeting: result.greeting || prev[active].greeting },
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-[var(--color-border)] p-4">
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Languages size={13} /> คำแปลตำแหน่ง/ข้อความทักทาย (ไม่บังคับ)</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setActive(l.code)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active === l.code ? "bg-[var(--color-jade)] text-white" : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={handleSuggest}
        className="mb-3 flex items-center gap-2 rounded-full border border-[var(--color-jade)] px-4 py-2 text-xs font-semibold text-[var(--color-jade)] transition hover:bg-[var(--color-jade)] hover:text-white disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
        {loading ? "กำลังแปล..." : `แปลร่างอัตโนมัติ (ฟรี) เป็น ${LOCALES.find((l) => l.code === active)?.label}`}
      </button>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="ตำแหน่ง" icon={Building2}>
          <input
            value={values[active].role}
            onChange={(e) => setValues((prev) => ({ ...prev, [active]: { ...prev[active], role: e.target.value } }))}
            className="input"
          />
        </Field>
        <Field label="ข้อความทักทาย">
          <input
            value={values[active].greeting}
            onChange={(e) => setValues((prev) => ({ ...prev, [active]: { ...prev[active], greeting: e.target.value } }))}
            className="input"
          />
        </Field>
      </div>
      {LOCALES.map((l) => (
        <span key={l.code}>
          <input type="hidden" name={`consultant_role_${l.code}`} value={values[l.code].role} readOnly />
          <input type="hidden" name={`consultant_greeting_${l.code}`} value={values[l.code].greeting} readOnly />
        </span>
      ))}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  full,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
        {Icon && <Icon size={13} className="flex-shrink-0" />} {label}
      </span>
      {children}
    </label>
  );
}

function ColorField({
  label,
  icon: Icon,
  name,
  defaultValue,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
        {Icon && <Icon size={13} className="flex-shrink-0" />} {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-11 flex-shrink-0 cursor-pointer rounded-lg border border-[var(--color-border)] bg-transparent p-0.5"
        />
        <input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input font-mono-data"
          placeholder="#000000"
        />
      </div>
    </label>
  );
}
