import { createNavigation } from "next-intl/navigation";
import {
  locales,
  defaultLocale,
  localePrefix,
  // localeDetection,
  pathnames,
  type Locale,
} from "./i18n-config";

// Type for canonical pathnames based on the keys of the pathnames object
export type AppPathname = keyof typeof pathnames;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    localePrefix,
    pathnames,
  });