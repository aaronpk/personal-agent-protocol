"use client";

import { useSyncExternalStore } from "react";
import { Download, MessageSquare } from "lucide-react";
import { Button } from "./button";

// Buttons on the Path to 1.0 page that act on the comments in the corner of every page: whether the
// comment bar shows at all, and downloading the review kit with any comments the reader has left.

// Sent with whether site commenting should be enabled.
export const SET_COMMENTING_EVENT = "pap-comments:set";
export const DOWNLOAD_KIT_EVENT = "pap-comments:download-kit";
const CHANGED_EVENT = "pap-comments:changed";

// Whether the comment bar shows, as reported by the comments in the corner.
let commentingEnabled = false;

export function reportCommentingEnabled(enabled: boolean) {
    commentingEnabled = enabled;
    window.dispatchEvent(new Event(CHANGED_EVENT));
}

function subscribe(onChange: () => void) {
    window.addEventListener(CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CHANGED_EVENT, onChange);
}

export function CommentingButton() {
    const enabled = useSyncExternalStore(
        subscribe,
        () => commentingEnabled,
        () => false,
    );
    return (
        <Button
            size="sm"
            onClick={() =>
                window.dispatchEvent(new CustomEvent(SET_COMMENTING_EVENT, { detail: !enabled }))
            }
        >
            <MessageSquare size={14} />
            {enabled ? "Disable site commenting" : "Enable site commenting"}
        </Button>
    );
}

export function DownloadKitButton() {
    return (
        <Button size="sm" onClick={() => window.dispatchEvent(new Event(DOWNLOAD_KIT_EVENT))}>
            <Download size={14} />
            Download review kit
        </Button>
    );
}
