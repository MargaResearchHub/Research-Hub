/* Owns accessibility modal behavior only; must not own the guided-tour implementation. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
function openA11yModal() {
    dom.a11yOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
export function closeA11yModal() {
    dom.a11yOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }
export function wireA11yModal() {
    dom.a11yClose.addEventListener("click", closeA11yModal);
    dom.a11yOverlay.addEventListener("click", function (e) {
      if (e.target === dom.a11yOverlay) closeA11yModal();
    });
    if (dom.a11yTourBtn) {
      dom.a11yTourBtn.addEventListener("click", function () {
        closeA11yModal();
        startTour();
      });
    }
  }

  /* Connect the navigation buttons to the relevant page actions. */
