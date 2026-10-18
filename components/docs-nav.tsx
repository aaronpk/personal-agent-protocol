"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { docsTabsFor, tabFor } from "../content/docs";
import type { OutlinePage, OutlineSection } from "../lib/docs-outline";
import { useDocsVersion } from "./docs-version";

function flatten(sections: OutlineSection[]): OutlineSection[] {
    return sections.flatMap((section) => [section, ...flatten(section.subsections ?? [])]);
}

// Lists the sections of the current tab's pages. Sections on the current page are in-page links
// and highlight as the reader scrolls, or when clicked; sections on the tab's other pages link
// across. A tab with one page shows only its sections, since the tab already names the page.
// On narrow screens the outline folds into a menu button that stays under the header and names
// the current section. On phones, which have no docs tabs, the bar is a breadcrumb: the current
// tab, which opens a menu of the version and the tabs, then the current section, which opens the
// outline.
// `pages` is the outline of the tab's pages. `version` is the version menu for the tabs menu.
export function DocsNav({
    current,
    pages: tabPages,
    version,
}: {
    current: string;
    pages: OutlinePage[];
    version?: ReactNode;
}) {
    const page = tabPages.find((p) => p.href === current);
    const tabs = docsTabsFor(useDocsVersion(current));
    const tab = tabFor(current);
    // On phones, the menu of the version and the tabs. At most one menu is open.
    const [tabsOpen, setTabsOpen] = useState(false);
    const tabsToggleRef = useRef<HTMLButtonElement>(null);
    const [active, setActive] = useState(page?.sections[0]?.id ?? "");
    const [open, setOpen] = useState(false);
    const asideRef = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    // The section the reader clicked or linked to. It stays highlighted while any of it is on
    // screen, even when scrolling alone would pick another, such as a short section at the end.
    const pinned = useRef<string | null>(null);

    useEffect(() => {
        const sections = flatten(page?.sections ?? []);
        const linked = decodeURIComponent(window.location.hash.slice(1));
        pinned.current = sections.some((s) => s.id === linked) ? linked : null;
        // Whether any of a section, from its heading to the next section's, is below the header.
        function onScreen(id: string): boolean {
            const at = sections.findIndex((s) => s.id === id);
            const top = document.getElementById(id)?.getBoundingClientRect().top;
            if (top === undefined) {
                return false;
            }
            const next = sections[at + 1] && document.getElementById(sections[at + 1].id);
            const bottom = next
                ? next.getBoundingClientRect().top
                : (document.querySelector("article.doc")?.getBoundingClientRect().bottom ?? top);
            return top < window.innerHeight && bottom > 160;
        }
        function update() {
            if (pinned.current && onScreen(pinned.current)) {
                setActive(pinned.current);
                return;
            }
            pinned.current = null;
            let id = sections[0]?.id ?? "";
            for (const section of sections) {
                const target = document.getElementById(section.id);
                if (target && target.getBoundingClientRect().top < 160) {
                    id = section.id;
                }
            }
            setActive(id);
        }
        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, [page]);

    // Close the menus on Escape or a click outside them.
    useEffect(() => {
        if (!open && !tabsOpen) {
            return;
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                (open ? toggleRef : tabsToggleRef).current?.focus();
                setOpen(false);
                setTabsOpen(false);
            }
        }
        function onDown(e: MouseEvent) {
            if (!asideRef.current?.contains(e.target as Node)) {
                setOpen(false);
                setTabsOpen(false);
            }
        }
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
        };
    }, [open, tabsOpen]);

    // When the menu opens, scroll it to the current section.
    useEffect(() => {
        if (open) {
            asideRef.current
                ?.querySelector<HTMLElement>("nav a.active")
                ?.scrollIntoView({ block: "nearest" });
        }
    }, [open]);

    // The outline scrolls separately from the page, so keep the highlighted section in view.
    useEffect(() => {
        const aside = asideRef.current;
        const link = aside?.querySelector<HTMLElement>("a.active");
        if (!aside || !link) {
            return;
        }
        const box = aside.getBoundingClientRect();
        const item = link.getBoundingClientRect();
        if (item.top < box.top + 48) {
            aside.scrollTop -= box.top + 48 - item.top;
        } else if (item.bottom > box.bottom - 32) {
            aside.scrollTop += item.bottom - (box.bottom - 32);
        }
    }, [active]);

    function renderSections(href: string, sections: OutlineSection[], className?: string) {
        const here = href === current;
        return (
            <ol className={className}>
                {sections.map((section) => {
                    const isActive = here && active === section.id;
                    return (
                        <li key={section.id}>
                            <a
                                href={here ? `#${section.id}` : `${href}#${section.id}`}
                                className={isActive ? "active" : undefined}
                                aria-current={isActive ? "location" : undefined}
                                onClick={() => {
                                    // After the jump: hiding the link first cancels it.
                                    setTimeout(() => setOpen(false));
                                    if (here) {
                                        pinned.current = section.id;
                                        setActive(section.id);
                                    }
                                }}
                            >
                                {section.label}
                            </a>
                            {section.subsections?.length
                                ? renderSections(href, section.subsections, "toc-sub")
                                : null}
                        </li>
                    );
                })}
            </ol>
        );
    }

    // With nothing to list, keep the outline's column so the article sits where it does on the
    // other docs pages, but drop the outline and its menu button.
    if (tabPages.every((p) => p.sections.length === 0)) {
        return <div className="toc-spacer" aria-hidden="true" />;
    }

    const activeLabel = flatten(page?.sections ?? []).find((s) => s.id === active)?.label;
    return (
        <aside
            className={`toc${open ? " toc-open" : ""}${tabsOpen ? " toc-tabs-open" : ""}`}
            ref={asideRef}
        >
            <div className="toc-bar">
                {tab ? (
                    <>
                        <button
                            type="button"
                            className="toc-crumb"
                            ref={tabsToggleRef}
                            aria-expanded={tabsOpen}
                            aria-controls="toc-tabs"
                            onClick={() => {
                                setTabsOpen(!tabsOpen);
                                setOpen(false);
                            }}
                        >
                            <span className="sr-only">Docs pages, </span>
                            <span className="toc-crumb-label">{tab.title}</span>
                            <ChevronDown size={14} aria-hidden="true" />
                        </button>
                        <ChevronRight className="toc-crumb-sep" size={14} aria-hidden="true" />
                    </>
                ) : null}
                <button
                    type="button"
                    className="toc-toggle"
                    ref={toggleRef}
                    aria-expanded={open}
                    aria-controls="toc-sections"
                    onClick={() => {
                        setOpen(!open);
                        setTabsOpen(false);
                    }}
                >
                    {open ? (
                        <X className="toc-toggle-icon" size={18} aria-hidden="true" />
                    ) : (
                        <Menu className="toc-toggle-icon" size={18} aria-hidden="true" />
                    )}
                    <span className="sr-only">Sections, </span>
                    <span className="toc-toggle-label">{activeLabel ?? "On this page"}</span>
                    <ChevronDown className="toc-crumb-chevron" size={14} aria-hidden="true" />
                </button>
            </div>
            <div className="toc-tabs-menu" id="toc-tabs">
                {version ? <div className="toc-version">{version}</div> : null}
                <nav aria-label="Documentation">
                    {tabs.map((t) => (
                        <a
                            key={t.href}
                            href={t.href}
                            className={`${t.versioned ? "versioned" : ""}${t === tab ? " current" : ""}`}
                            aria-current={t === tab ? "page" : undefined}
                        >
                            {t.title}
                        </a>
                    ))}
                </nav>
            </div>
            <nav aria-label="Sections" id="toc-sections">
                {tabPages.map((p) => (
                    <div key={p.href}>
                        {tabPages.length > 1 ? (
                            <a
                                className={`toc-title${p.href === current ? " current" : ""}`}
                                href={p.href}
                                aria-current={p.href === current ? "page" : undefined}
                            >
                                {p.title}
                            </a>
                        ) : null}
                        {renderSections(p.href, p.sections)}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
