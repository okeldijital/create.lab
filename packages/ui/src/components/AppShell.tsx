import type { ReactNode } from "react";

export function AppShell({brand,workspace="Workspace",nav,account,eyebrow,title,actions,children}:{brand:string;workspace?:string;nav:ReactNode;account:ReactNode;eyebrow:string;title:string;actions?:ReactNode;children:ReactNode;}) {
  return (
    <div className="cl-shell">
      <aside className="cl-sidebar">
        <div className="cl-sidebar__header">
          <span className="cl-brand-mark" aria-hidden="true">C</span>
          <div><strong className="cl-brand">{brand}</strong><span className="cl-workspace-name">{workspace}</span></div>
        </div>
        <nav className="cl-nav cl-nav--desktop" aria-label="Primary navigation">{nav}</nav>
        <div className="cl-account cl-account--desktop">{account}</div>
        <details className="cl-mobile-menu">
          <summary>Menu</summary>
          <div className="cl-mobile-menu__panel">
            <nav className="cl-nav" aria-label="Primary navigation">{nav}</nav>
            <div className="cl-account">{account}</div>
          </div>
        </details>
      </aside>
      <div className="cl-content">
        <header className="cl-topbar">
          <button className="cl-search" type="button" aria-label="Search workspace"><span aria-hidden="true">⌕</span><span>Search</span><kbd>⌘ K</kbd></button>
          <div className="cl-topbar__actions">{actions}</div>
        </header>
        <main className="cl-main">
          <div className="cl-page-header"><div><p className="cl-kicker">{eyebrow}</p><h1>{title}</h1></div></div>
          {children}
        </main>
      </div>
    </div>
  );
}
export function PageHeader({eyebrow,title,description,actions}:{eyebrow?:string;title:string;description?:string;actions?:ReactNode}){return <header className="cl-page-header cl-page-header--standalone"><div>{eyebrow?<p className="cl-kicker">{eyebrow}</p>:null}<h1>{title}</h1>{description?<p className="cl-page-description">{description}</p>:null}</div>{actions?<div className="cl-page-actions">{actions}</div>:null}</header>;}
export function Card({title,children}:{title?:string;children:ReactNode}){return <article className="cl-card">{title?<h2>{title}</h2>:null}{children}</article>;}
export function TextField({label,name,type="text",required=false}:{label:string;name:string;type?:string;required?:boolean}){return <label className="cl-field"><span>{label}</span><input name={name} type={type} required={required}/></label>;}
export function Button({children,disabled=false,variant="primary"}:{children:ReactNode;disabled?:boolean;variant?:"primary"|"secondary"|"ghost"}){return <button className={`cl-button cl-button--${variant}`} type="submit" disabled={disabled}>{children}</button>;}
