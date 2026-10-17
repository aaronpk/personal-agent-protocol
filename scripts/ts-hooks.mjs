// Lets Node run the site's TypeScript directly, for scripts such as `pnpm kit`. Node strips the
// types itself; this adds the extensionless imports the site's code uses, which Next resolves
// but Node doesn't.
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

registerHooks({
    resolve(specifier, context, nextResolve) {
        if ((specifier.startsWith(".") || specifier.startsWith("/")) && context.parentURL) {
            const base = new URL(specifier, context.parentURL);
            for (const suffix of ["", ".ts", ".tsx", "/index.ts"]) {
                const candidate = new URL(base.href + suffix);
                if (/\.tsx?$/.test(candidate.pathname) && existsSync(fileURLToPath(candidate))) {
                    return nextResolve(candidate.href, context);
                }
            }
        }
        return nextResolve(specifier, context);
    },
});
