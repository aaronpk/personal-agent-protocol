"use client";

import { usePathname } from "next/navigation";
import { docsTabsFor, tabFor, type DocsVersion } from "../content/docs";
import { useDocsVersion } from "./docs-version";
import type { OutlinePage } from "../lib/docs-outline";
import { REPO_URL } from "../lib/site";
import { ButtonLink } from "./button";
import { VersionMenu } from "./version-menu";

type Tab = { title: string; href: string; versioned?: boolean };

const LICENSE_TABS: Tab[] = [
    { title: "License", href: "/license" },
    { title: "Contributions", href: "/license/contributions" },
];

// The tab row for the current page, if it has one: the docs tabs on docs pages and the license
// tabs on license pages. `version` is the docs version the page shows.
function tabsFor(
    pathname: string,
    version: DocsVersion,
): { label: string; tabs: Tab[]; current: Tab } | undefined {
    const docsTab = tabFor(pathname);
    if (docsTab) {
        return { label: "Documentation", tabs: docsTabsFor(version), current: docsTab };
    }
    const path = pathname.replace(/\/$/, "") || "/";
    const licenseTab = LICENSE_TABS.find((tab) => tab.href === path);
    if (licenseTab) {
        return { label: "License", tabs: LICENSE_TABS, current: licenseTab };
    }
    return undefined;
}

// Runs of tabs that are all versioned or all not, in order.
function groups(tabs: Tab[]): { versioned: boolean; tabs: Tab[] }[] {
    const runs: { versioned: boolean; tabs: Tab[] }[] = [];
    for (const tab of tabs) {
        const versioned = Boolean(tab.versioned);
        const last = runs.at(-1);
        if (last?.versioned === versioned) {
            last.tabs.push(tab);
        } else {
            runs.push({ versioned, tabs: [tab] });
        }
    }
    return runs;
}

function TabLink({ tab, current }: { tab: Tab; current: Tab }) {
    return (
        <a
            href={tab.href}
            className={tab === current ? "active" : undefined}
            aria-current={tab === current ? "page" : undefined}
        >
            {tab.title}
        </a>
    );
}

// The GitHub mark, which lucide-react doesn't include.
function GitHubIcon({ size }: { size: number }) {
    return (
        <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
    );
}

// Pages with tabs show them under the header instead of the home page's section links. Docs pages
// also show the version menu next to the site name and a link to the repository. On phones, the
// docs tabs and the version menu are in the outline menu instead. `outline` is the outline of every docs page. The kit pages, laid
// out like docs pages without tabs, show a link to the docs and the repository link.
export function SiteHeader({ outline }: { outline: OutlinePage[] }) {
    const pathname = usePathname() ?? "/";
    const currentTab = tabFor(pathname);
    const tabRow = tabsFor(pathname, useDocsVersion(pathname));
    // The section links only make sense on the home page, so other pages without tabs, such as the
    // 404 page, show just the site name.
    const home = pathname.replace(/\/$/, "") === "";
    const kit = pathname.startsWith("/kit/");
    return (
        <header className="site-header">
            {/* On docs pages, skip the section outline too. */}
            <a className="skip-link" href={currentTab || kit ? "#article" : "#main"}>
                Skip to content
            </a>
            <div className="wrap">
                <div className="brand">
                    <a className="brand-name brand-logo" href="/">
                        <img src="/logo.png" alt="" width={40} height={40} />
                        Personal Agent Protocol
                    </a>
                    {currentTab ? <VersionMenu current={pathname} outline={outline} /> : null}
                </div>
                {tabRow ? null : home ? (
                    <>
                        <nav className="nav" aria-label="Main navigation">
                            <a href="/#why">Why it exists</a>
                            <a href="/#parties">Who it's for</a>
                            <a href="/#features">Features</a>
                            <a href="/#examples">Examples</a>
                        </nav>
                        <ButtonLink
                            variant="primary"
                            size="sm"
                            href="/docs/introduction"
                            data-cta="docs"
                        >
                            Read the docs
                        </ButtonLink>
                    </>
                ) : null}
                {currentTab || kit ? (
                    <ButtonLink
                        variant="ghost"
                        iconOnly
                        className="github-link"
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Personal Agent Protocol on GitHub"
                        data-cta="github"
                    >
                        <GitHubIcon size={20} />
                    </ButtonLink>
                ) : null}
                {kit ? (
                    <ButtonLink
                        variant="primary"
                        size="sm"
                        className="header-docs"
                        href="/docs/introduction"
                        data-cta="docs"
                    >
                        Read the docs
                    </ButtonLink>
                ) : null}
            </div>
            {tabRow ? (
                <nav
                    className={`docs-tabs${currentTab ? " docs-tabs-docs" : ""}`}
                    aria-label={tabRow.label}
                >
                    <div className="wrap">
                        {groups(tabRow.tabs).map((group) =>
                            group.versioned ? (
                                <div className="docs-tabs-versioned" key={group.tabs[0].href}>
                                    {group.tabs.map((tab) => (
                                        <TabLink
                                            key={tab.href}
                                            tab={tab}
                                            current={tabRow.current}
                                        />
                                    ))}
                                </div>
                            ) : (
                                group.tabs.map((tab) => (
                                    <TabLink key={tab.href} tab={tab} current={tabRow.current} />
                                ))
                            ),
                        )}
                    </div>
                </nav>
            ) : null}
        </header>
    );
}

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="wrap">
                <span>
                    Licensed under the <a href="/license">Apache License 2.0</a>. Companies in the
                    examples are fictional.
                </span>
                <a
                    className="footer-github"
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cta="github"
                >
                    <GitHubIcon size={14} />
                    GitHub
                </a>
            </div>
        </footer>
    );
}
