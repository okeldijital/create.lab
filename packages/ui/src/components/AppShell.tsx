import type { ReactNode } from "react";

export function AppShell({
  brand,
  nav,
  account,
  eyebrow,
  title,
  children,
}: {
  brand: string;
  nav: ReactNode;
  account: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="cl-shell">
      <aside className="cl-side">
        <div className="cl-side-head">
          <strong className="cl-brand">{brand}</strong>
          <div className="cl-account">{account}</div>
        </div>
        <nav className="cl-nav">{nav}</nav>
      </aside>
      <main className="cl-main">
        <p className="cl-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <article className="cl-card">
      {title ? <h2>{title}</h2> : null}
      {children}
    </article>
  );
}

export function TextField({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="cl-field">
      {label}
      <input name={name} type={type} required={required} />
    </label>
  );
}

export function Button({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button className="cl-button" type="submit" disabled={disabled}>
      {children}
    </button>
  );
}
