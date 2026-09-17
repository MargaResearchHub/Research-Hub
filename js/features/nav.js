/* Owns navigation activation and route actions only; must not render paper cards. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
function setActiveNav(name) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-nav]"), function (el) {
      el.classList.toggle("active", el.dataset.nav === name);
    });
  }

export function wireNav() {
    function on(selector, handler) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
        el.addEventListener("click", handler);
      });
    }
    on('[data-nav="home"]', function () {
      setActiveNav("home");
      closeMobileMenu();
    });
    on('[data-nav="papers"]', function () {
      setActiveNav("papers");
      closeMobileMenu();
    });
    on('[data-nav="contact"]', function (e) {
      e.preventDefault();
      closeMobileMenu();
      window.location.href = buildMailto(
        CONTACT_EMAIL,
        "Question via Research Hub website",
        "Hello Marga Research Hub team,\n\n"
      );
    });
    on('[data-nav="saved"]', function (e) {
      e.preventDefault();
      setActiveNav("saved");
      closeMobileMenu();
      setSavedOnly(true);
    });
    on('[data-nav="a11y"]', function (e) {
      e.preventDefault();
      closeMobileMenu();
      openA11yModal();
    });
  }

  /* Validate the newsletter form and prepare an email request. */
