/**
 * Runs before first paint (inline in <head>): reads the persisted preference and sets
 * data-theme on <html> so there is never a flash of the wrong theme. Keep in sync with
 * the `bc-preferences` store shape.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t="dark";var raw=localStorage.getItem("bc-preferences");if(raw){var s=JSON.parse(raw).state;if(s&&s.theme)t=s.theme;}if(t==="system")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;
