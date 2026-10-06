"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const commands = [
  { label: "Overview", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Schedule", href: "/schedule" },
  { label: "Production", href: "/production" },
  { label: "Reviews", href: "/reviews" },
  { label: "Deliveries", href: "/deliveries" },
  { label: "Clients", href: "/clients" },
  { label: "Services", href: "/services" },
  { label: "Quotes", href: "/quotes" },
  { label: "Organization", href: "/organization" },
];

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? commands.filter((item) => item.label.toLowerCase().includes(value)) : commands;
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function navigate(href: string) {
    window.location.assign(href);
  }

  return (
    <>
      <button className="cl-search" type="button" aria-label="Open workspace search" onClick={() => setOpen(true)}>
        <span className="cl-search__icon" aria-hidden="true">⌕</span>
        <span className="cl-search__label">Search workspace</span>
        <kbd>⌘ K</kbd>
      </button>
      {open ? (
        <div className="cl-command-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="cl-command" role="dialog" aria-modal="true" aria-label="Workspace command" onMouseDown={(event) => event.stopPropagation()}>
            <div className="cl-command__input">
              <span aria-hidden="true">⌕</span>
              <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workspace" aria-label="Search workspace" />
              <kbd>ESC</kbd>
            </div>
            <div className="cl-command__body">
              <p className="cl-command__label">Go to</p>
              {filtered.length ? filtered.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}<span>↵</span></a>
              )) : <p className="cl-command__empty">No matching workspace destination.</p>}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
