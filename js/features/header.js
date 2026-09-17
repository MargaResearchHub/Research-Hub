/* Owns search-panel and mobile-header wiring only; must not own navigation state. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
function setSearchOpen(open) {
    // Keep the desktop and mobile search buttons in the same state.
    dom.searchPanel.classList.toggle("is-open", open);
    [dom.searchToggle, dom.mobileSearchBtn].forEach(function (btn) {
      if (btn) btn.setAttribute("aria-expanded", open);
    });
    if (open) closeMobileMenu();
  }
export function closeMobileMenu() {
    dom.mobileMenuPanel.classList.remove("is-open");
    dom.mobileMenuBtn.setAttribute("aria-expanded", "false");
  }
function wireHeader() {
    [dom.searchToggle, dom.mobileSearchBtn].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener("click", function () {
        setSearchOpen(!dom.searchPanel.classList.contains("is-open"));
      });
    });
    document.addEventListener("click", function (e) {
      var isTrigger =
        (dom.searchToggle && dom.searchToggle.contains(e.target)) ||
        (dom.mobileSearchBtn && dom.mobileSearchBtn.contains(e.target));
      if (!dom.searchPanel.contains(e.target) && !isTrigger) setSearchOpen(false);
    });

    dom.mobileMenuBtn.addEventListener("click", function () {
      var open = dom.mobileMenuPanel.classList.toggle("is-open");
      dom.mobileMenuBtn.setAttribute("aria-expanded", open);
      if (open) setSearchOpen(false);
    });

    dom.advToggle.addEventListener("click", function () {
      var open = dom.advPanel.classList.toggle("is-open");
      dom.advToggle.setAttribute("aria-expanded", open);
    });

    dom.btnSearch.addEventListener("click", applySearchFromRow);
    dom.searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") applySearchFromRow();
    });

    dom.btnApplyAdvanced.addEventListener("click", applyAdvancedFilters);
    dom.btnResetAdvanced.addEventListener("click", function () {
      clearAllFilters();
      showToast("Filters reset");
    });
  }
