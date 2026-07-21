"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  LogOut,
  ExternalLink,
  LayoutDashboard,
  MapPinned,
  CalendarCheck,
  PencilLine,
  Users,
  Star,
  Newspaper,
  Link2,
  Settings,
  MessageCircle,
  ShieldCheck,
  FileText,
  ShieldAlert,
  Info,
  Globe,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

// Defined locally (rather than passed as a prop) because icon *component
// references* can't cross the Server → Client Component boundary — only
// plain serializable data can. Keep this in sync with the desktop sidebar
// list in app/admin/(dashboard)/layout.tsx.
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

export default function AdminMobileNav({
  userLabel,
  superAdmin = false,
  pendingDeletions = 0,
  pendingReviews = 0,
}: {
  userLabel: string;
  superAdmin?: boolean;
  pendingDeletions?: number;
  pendingReviews?: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navItemsWithBadges = navItems.map((item) =>
    item.href === "/admin/reviews" ? { ...item, badge: pendingReviews } : item
  );
  const items = superAdmin
    ? [
        ...navItemsWithBadges,
        { href: "/admin/deletion-requests", label: "คำขอลบข้อมูล", icon: ShieldAlert, badge: pendingDeletions },
        { href: "/admin/admins", label: "จัดการผู้ดูแลระบบ", icon: ShieldCheck },
      ]
    : navItemsWithBadges;

  // Close the menu automatically whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade-dark)]"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-[var(--color-jade-dark)] px-5 py-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold">เมนู</p>
              <button onClick={() => setOpen(false)} aria-label="ปิดเมนู" className="rounded-lg p-1 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
              {items.map((item) => {
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

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--color-sand)]/60 hover:text-white"
            >
              <ExternalLink size={16} /> ดูหน้าเว็บไซต์
            </Link>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="px-3 text-xs text-[var(--color-sand)]/50">เข้าสู่ระบบในนาม</p>
              <p className="px-3 text-sm font-medium">{userLabel}</p>
              <form action={logoutAction}>
                <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--color-sand)]/70 hover:bg-white/10 hover:text-white">
                  <LogOut size={16} /> ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
