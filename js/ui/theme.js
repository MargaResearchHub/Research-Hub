/* Owns theme restoration and controls only; must not contain unrelated UI wiring. */
import { THEME_STORAGE_KEY } from "../config.js";
import { safeSetLocal } from "../storage.js";
import { dom } from "./dom.js";
function applyTheme(theme, persist) {
    // Change the root theme attribute; CSS then changes the page colors.
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (e) { }
    }
    var isDark = theme === "dark";
    Array.prototype.forEach.call(dom.themeToggles || [], function (btn) {
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      var label = isDark ? "Switch to light mode" : "Switch to dark mode";
      btn.setAttribute("aria-label", label);
      btn.title = label;
    });
  }

export function wireTheme() {
    if (!dom.themeToggles || !dom.themeToggles.length) return;
    Array.prototype.forEach.call(dom.themeToggles, function (btn) {
      btn.addEventListener("click", function () {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        applyTheme(isDark ? "light" : "dark", true);
      });
    });
    // Match the button state to the theme restored at startup.
    var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current, false);
  }

export function getInitialThemePreference() { const stored = localStorage.getItem('margaThemePref'); return stored || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }

