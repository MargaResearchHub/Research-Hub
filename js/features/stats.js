/* Owns catalogue statistics and visitor count rendering only; must not render cards. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
/* Update the visitor counter and the published figures in the hero. */
export function renderVisitorCount(count) {
    if (!dom.visitorCount) return;
    if (typeof count !== "number" || !isFinite(count) || count <= 0) return;
    dom.visitorCount.textContent = String(Math.round(count)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    try {
      window.localStorage.setItem(VISITOR_CACHE_KEY, String(Math.round(count)));
    } catch (e) {
      /* The counter can still be displayed without local storage. */
    }
  }

export function updateVisitorCount() {
    // Use "hit" once per browser tab; later loads only read the current total.
    if (!dom.visitorCount) return;

    var alreadyCountedThisSession = false;
    try {
      alreadyCountedThisSession = window.sessionStorage.getItem(VISITOR_SESSION_KEY) === "1";
    } catch (e) {
      /* Count this visit again if session storage is unavailable. */
    }

    // Count a tab once, then read the existing total on later page loads.
    var action = alreadyCountedThisSession ? "get" : "hit";
    var url = VISITOR_API_BASE + "/" + action + "/" + VISITOR_NAMESPACE + "/" + VISITOR_KEY;

    fetch(url, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!alreadyCountedThisSession) {
          try {
            window.sessionStorage.setItem(VISITOR_SESSION_KEY, "1");
          } catch (e) {
            /* The count still displays if session storage is unavailable. */
          }
        }
        renderVisitorCount(data && data.value);
      })
      .catch(function () {
        // Use the last known value if the counter service is unavailable.
        var cached = null;
        try {
          cached = Number(window.localStorage.getItem(VISITOR_CACHE_KEY));
        } catch (e) {
          cached = null;
        }
        if (cached && !Number.isNaN(cached) && cached > 0) renderVisitorCount(cached);
      });
  }

export function renderStats() {
    // These are the published figures displayed in the hero section.
    dom.statPapers.textContent = "1200";
    dom.statInstitutions.textContent = "25";
    dom.statAreas.textContent = "18";
    dom.statSince.textContent = "1972";
    updateVisitorCount();
  }
