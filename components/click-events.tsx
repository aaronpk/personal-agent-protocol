"use client";

import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";
import { SPEC_HREF as SPEC } from "../content/docs";
import { PAGE_HREFS } from "../lib/docs-outline";

// The values a link's `data-cta` attribute may hold, and the places a call to action may sit.
const CTAS = new Set(["see_examples", "docs", "spec", "roadmap", "feedback_issue", "github"]);
const CTA_LOCATIONS = new Set(["hero", "implement"]);

// Sends `cta_click` when a visitor clicks a link marked with `data-cta`, and `spec_section_click`
// when they click a link to a section of the spec. For the spec, `from` is `outline` for the
// spec's own section list, or the path of the page with the link. `specSections` are the ids of the
// spec's sections.
export function ClickEvents({ specSections }: { specSections: string[] }) {
    useEffect(() => {
        const sections = new Set(specSections);
        function onClick(event: MouseEvent) {
            const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
            if (!(link instanceof HTMLAnchorElement)) {
                return;
            }
            const cta = link.dataset.cta;
            if (cta && CTAS.has(cta)) {
                const section = link.closest("section[id]")?.id ?? "";
                const location = link.closest(".site-header")
                    ? "header"
                    : CTA_LOCATIONS.has(section)
                      ? section
                      : "other";
                trackEvent("cta_click", { cta, location });
            }
            const url = new URL(link.href);
            const section = decodeURIComponent(url.hash.slice(1));
            if (
                url.origin !== window.location.origin ||
                url.pathname !== SPEC ||
                !sections.has(section)
            ) {
                return;
            }
            const page = window.location.pathname.replace(/\/$/, "") || "/";
            const from = link.closest("#toc-sections")
                ? "outline"
                : PAGE_HREFS.includes(page)
                  ? page
                  : "other";
            trackEvent("spec_section_click", { section, from });
        }
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, [specSections]);

    return null;
}
