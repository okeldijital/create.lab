"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [
  ["/", "Overview"],
  ["/projects", "Projects"],
  ["/schedule", "Schedule"],
  ["/production", "Production"],
  ["/reviews", "Reviews"],
  ["/deliveries", "Deliveries"],
] as const;

const operations = [
  ["/clients", "Clients"],
  ["/services", "Services"],
  ["/quotes", "Quotes"],
] as const;

function NavGroup({ label, items, pathname }: { label?: string; items: readonly (readonly [string, string])[]; pathname: string }) {
  return (
    <div className="cl-nav-group">
      {label ? <p className="cl-nav-group__label">{label}</p> : null}
      <div className="cl-nav-group__items">
        {items.map(([href, label]) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
          return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
        })}
      </div>
    </div>
  );
}

export function WorkspaceNav() {
  const pathname = usePathname();
  return (
    <>
      <NavGroup items={primary} pathname={pathname} />
      <NavGroup label="Operations" items={operations} pathname={pathname} />
      <NavGroup label="Workspace" items={[["/organization", "Organization"]]} pathname={pathname} />
    </>
  );
}
