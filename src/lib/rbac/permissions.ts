import type { MembershipRole } from "../../types/database";
import { APP_NAV_ITEMS } from "../../components/layout/app-navigation";
import { canAccessRoute } from "../auth/guards";

export function getVisibleNavItems(role: MembershipRole | null) {
  if (!role) {
    return [];
  }

  return APP_NAV_ITEMS.filter((item) => canAccessRoute(role, item.href)).map(
    (item) => item.href,
  );
}

export function canViewNavItem(role: MembershipRole | null, href: string) {
  return getVisibleNavItems(role).some((visibleHref) => visibleHref === href);
}
