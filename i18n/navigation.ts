import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

// Drop-in replacements for next/link, next/navigation that automatically
// handle the current locale prefix. Import these instead of the next/*
// equivalents anywhere under app/[locale]/**.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
