import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Comments } from "../components/comments";
import { SiteFooter, SiteHeader } from "../components/site-chrome";
import { ClickEvents } from "../components/click-events";
import { SPEC_HREF } from "../content/docs";
import { docsOutline } from "../lib/docs-content";
import { sectionIds } from "../lib/docs-outline";
import { BASE_OPEN_GRAPH, BASE_TWITTER, SITE_NAME, SITE_URL } from "../lib/site";
import "./globals.css";

const sans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono",
});

const description =
    "One standard for every company and every personal agent. Personal agents discover participating companies, sign users in, and get things done through APIs, web pages, and company agents.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: SITE_NAME,
    description,
    openGraph: {
        ...BASE_OPEN_GRAPH,
        title: SITE_NAME,
        description,
    },
    twitter: {
        ...BASE_TWITTER,
        title: SITE_NAME,
        description,
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    const outline = docsOutline();
    return (
        <html lang="en" className={`${sans.variable} ${mono.variable}`}>
            <body>
                <SiteHeader outline={outline} />
                <main id="main">{children}</main>
                <SiteFooter />
                <Comments outline={outline} />
                <Analytics />
                <ClickEvents specSections={sectionIds(outline, SPEC_HREF)} />
            </body>
        </html>
    );
}
