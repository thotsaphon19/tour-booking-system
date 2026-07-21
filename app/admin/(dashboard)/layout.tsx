import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, MapPinned, CalendarCheck, Users, Newspaper, Star, Settings, LogOut, ExternalLink, PencilLine, Link2, MessageCircle, ShieldCheck, FileText, ShieldAlert, Info, Globe } from "lucide-react";
import { getSession, getCurrentAdmin } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { getSettings } from "@/lib/queries/settings";
import { logoutAction } from "@/lib/actions/auth";
import { ADMIN_THEME_CSS } from "@/lib/theme";
import { countPendingDeletionRequests } from "@/lib/queries/deletionRequests";
import { countPendingReviews } from "@/lib/queries/reviews";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

const navItems = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/tours", label: "จัดการทัวร์", icon: MapPinned },
  { href: "/admin/tour-proposals", label: "ใบเสนอราคาลูกค้า", icon: FileText },
  { href: "/admin/bookings", label: "การจอง", icon: CalendarCheck },
  { href: "/admin/trip-requests", label: "ทัวร์ตามสั่ง", icon: PencilLine },
  { href: "/admin/whatsapp", label: "แชท WhatsApp", icon: MessageCircle },
  { href: "/admin/customers", label: "ลูกค้า", icon: Users },
  { href: "/admin/reviews", label: "รีวิวลูกค้า", icon: Star },
  { href: "/admin/news", label: "บทความ", icon: Newspaper },
  { href: "/admin/partner-embeds", label: "วิดเจ็ตพันธมิตร", icon: Link2 },
  { href: "/admin/about", label: "เกี่ยวกับเรา", icon: Info },
  { href: "/admin/language-page", label: "หน้าเลือกภาษา", icon: Globe },
  { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์", icon: Settings },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // These three don't depend on each other — fetching them one at a time
  // (as before) meant every single click into the admin panel waited for
  // three sequential database round-trips just to render the sidebar,
  // before the actual page content even started loading.
  const [settings, currentAdmin, pendingReviews] = await Promise.all([
    getSettings(),
    getCurrentAdmin(),
    countPendingReviews(),
  ]);
  const superAdmin = isSuperAdmin(currentAdmin);
  const pendingDeletions = superAdmin ? await countPendingDeletionRequests() : 0;
  const navItemsWithBadges = navItems.map((item) =>
    item.href === "/admin/reviews" ? { ...item, badge: pendingReviews } : item
  );
  const visibleNavItems = superAdmin
    ? [
        ...navItemsWithBadges,
        { href: "/admin/deletion-requests", label: "คำขอลบข้อมูล", icon: ShieldAlert, badge: pendingDeletions },
        { href: "/admin/admins", label: "จัดการผู้ดูแลระบบ", icon: ShieldCheck },
      ]
    : navItemsWithBadges;

  return (
    <div className="flex min-h-screen bg-[var(--color-sand)]">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: ADMIN_THEME_CSS }} />
      <aside className="sticky top-0 hidden h-screen w-64 flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-jade-dark)] px-5 py-6 text-white md:flex">
        <p className="font-display text-xl font-semibold">{settings.site_name}</p>
        <p className="text-xs text-[var(--color-sand)]/50">ระบบหลังบ้าน</p>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const badge = "badge" in item ? item.badge : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-sand)]/80 transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={17} /> {item.label}
                {!!badge && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-gold)] px-1.5 text-[10px] font-bold text-[var(--color-jade-dark)]">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--color-sand)]/60 hover:text-white">
          <ExternalLink size={16} /> ดูหน้าเว็บไซต์
        </Link>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="px-3 text-xs text-[var(--color-sand)]/50">เข้าสู่ระบบในนาม</p>
          <p className="px-3 text-sm font-medium">{session.name || session.email}</p>
          <form action={logoutAction}>
            <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--color-sand)]/70 hover:bg-white/10 hover:text-white">
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <AdminMobileNav userLabel={session.name || session.email} superAdmin={superAdmin} pendingDeletions={pendingDeletions} pendingReviews={pendingReviews} />
            <p className="font-display text-base font-semibold text-[var(--color-jade-dark)]">{settings.site_name}</p>
          </div>
          <form action={logoutAction}>
            <button className="text-sm text-[var(--color-clay)]">ออกจากระบบ</button>
          </form>
        </header>
        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
