import type { Metadata } from "next";
import { ButtonLink } from "../components/button";
import { SPEC_HREF } from "../content/docs";

export const metadata: Metadata = {
    title: "Page not found | Personal Agent Protocol",
};

export default function NotFound() {
    return (
        <section className="hero">
            <div className="wrap">
                <div>
                    <p className="eyebrow">404</p>
                    <h1>Page not found.</h1>
                    <p className="lede">The page you're looking for doesn't exist or has moved.</p>
                    <div className="hero-ctas">
                        <ButtonLink variant="primary" href="/">
                            Go to the home page
                        </ButtonLink>
                        <ButtonLink variant="secondary" href={SPEC_HREF}>
                            Read the specification
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </section>
    );
}
