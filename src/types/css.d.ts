/**
 * Next ships a declaration for `*.module.css` but not for a plain `*.css`
 * side-effect import, so `import "./globals.css"` has nothing to resolve to and
 * editors running with `noUncheckedSideEffectImports` report ts(2882).
 *
 * The build never cared; this exists so the editor does not show a false error.
 * `*.module.css` is the more specific pattern and still wins, so CSS Modules
 * keep their typed exports.
 */
declare module "*.css";
