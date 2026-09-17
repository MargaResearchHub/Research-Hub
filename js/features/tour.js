/* Owns guided-tour state and interactions only; must not manage catalogue data. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
function isTourSeen() {
    try {
      return !!localStorage.getItem(TOUR_STORAGE_KEY);
    } catch (e) {
      try {
        return !!sessionStorage.getItem(TOUR_STORAGE_KEY);
      } catch (ignore) {
        return false;
      }
    }
  }

export function markTourSeen() {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch (e) {
      try {
        sessionStorage.setItem(TOUR_STORAGE_KEY, "1");
      } catch (ignore) {
        // Ignore storage failures.
      }
    }
  }

export function renderTourStep() {
    // Update the text and button labels whenever the visitor moves through the tour.
    if (!dom.tourStepText) return;
    var step = TOUR_STEPS[tourIndex] || TOUR_STEPS[0];
    dom.tourStepText.innerHTML =
      '<h4>' + escHtml(step.title) + '</h4>' +
      '<p>' + escHtml(step.description) + '</p>';
    dom.tourPrevBtn.disabled = tourIndex === 0;
    dom.tourNextBtn.textContent =
      tourIndex === TOUR_STEPS.length - 1 ? "Got it" : "Next";
    dom.tourProgress.textContent =
      "Step " + (tourIndex + 1) + " of " + TOUR_STEPS.length;
  }

export function openTour() {
    if (!dom.tourOverlay) return;
    dom.tourOverlay.hidden = false;
    dom.tourOverlay.classList.add("is-open");
    dom.tourOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    dom.tourCloseBtn.focus();
  }

export function closeTour() {
    if (!dom.tourOverlay) return;
    dom.tourOverlay.classList.remove("is-open");
    dom.tourOverlay.hidden = true;
    dom.tourOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    markTourSeen();
  }

export function startTour() {
    tourIndex = 0;
    renderTourStep();
    openTour();
  }

export function wireTour() {
    if (!dom.tourOverlay) return;
    dom.tourCloseBtn.addEventListener("click", closeTour);
    dom.tourPrevBtn.addEventListener("click", function () {
      if (tourIndex > 0) {
        tourIndex -= 1;
        renderTourStep();
      }
    });
    dom.tourNextBtn.addEventListener("click", function () {
      if (tourIndex < TOUR_STEPS.length - 1) {
        tourIndex += 1;
        renderTourStep();
      } else {
        closeTour();
      }
    });
    dom.tourOverlay.addEventListener("click", function (e) {
      if (e.target === dom.tourOverlay) closeTour();
    });
  }

  /* Open and close the search panel and mobile navigation. */
