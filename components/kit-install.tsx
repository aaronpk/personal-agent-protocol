"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

// Tabs for the ways to install the kit, one per kind of agent. Arrow keys move between tabs, as in
// the ARIA tabs pattern.

export type InstallTab = { id: string; label: string; content: ReactNode };

export function KitInstall({ tabs }: { tabs: InstallTab[] }) {
    const [current, setCurrent] = useState(tabs[0].id);
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);

    function onKeyDown(event: KeyboardEvent, index: number) {
        const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!step) {
            return;
        }
        event.preventDefault();
        const next = (index + step + tabs.length) % tabs.length;
        setCurrent(tabs[next].id);
        buttons.current[next]?.focus();
    }

    return (
        <div className="kit-install">
            <div className="kit-tabs" role="tablist" aria-label="Your agent">
                {tabs.map((tab, i) => (
                    <button
                        key={tab.id}
                        ref={(el) => {
                            buttons.current[i] = el;
                        }}
                        type="button"
                        role="tab"
                        id={`kit-tab-${tab.id}`}
                        aria-selected={tab.id === current}
                        aria-controls={`kit-panel-${tab.id}`}
                        tabIndex={tab.id === current ? 0 : -1}
                        className={tab.id === current ? "active" : undefined}
                        onClick={() => setCurrent(tab.id)}
                        onKeyDown={(e) => onKeyDown(e, i)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`kit-panel-${tab.id}`}
                    aria-labelledby={`kit-tab-${tab.id}`}
                    hidden={tab.id !== current}
                    className="kit-panel"
                >
                    {tab.content}
                </div>
            ))}
        </div>
    );
}
