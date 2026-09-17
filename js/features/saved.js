/* Owns saved-paper persistence and saved-view state only; must not import grid.js. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
import { computeFiltered, renderActiveFilterChips } from "./filters.js";
function updateSaveButtonUI(btn, paper) {
    var isSaved = saved.has(paper.key);
    btn.classList.toggle("is-saved", isSaved);
    btn.setAttribute("aria-pressed", isSaved ? "true" : "false");
    btn.innerHTML = SVG_SAVE + (isSaved ? "Saved" : "Save");
  }

export function syncSaveButtonsFor(key) {
    var paper = findByKey(key);
    if (!paper) return;
    var gridBtn = dom.paperGrid.querySelector(
      '[data-key="' + cssEscape(key) + '"] [data-action="save"]'
    );
    if (gridBtn) updateSaveButtonUI(gridBtn, paper);
    if (
      dom.detailOverlay.classList.contains("is-open") &&
      currentDetailPaper &&
      currentDetailPaper.key === key
    ) {
      var modalBtn = dom.detailModalScroll.querySelector('[data-action="save"]');
      if (modalBtn) updateSaveButtonUI(modalBtn, paper);
    }
  }
function toggleSave(paper) {
    if (saved.has(paper.key)) saved.delete(paper.key);
    else saved.add(paper.key);
    persistSavedPapers();
    updateSavedCount();
  }

export function updateSavedCount() {
    var n = saved.size;
    Array.prototype.forEach.call(
      document.querySelectorAll(".nav-saved-count"),
      function (el) {
        el.textContent = String(n);
        el.hidden = n === 0;
      }
    );
  }

export function setSavedOnly(on) {
    state.savedOnly = on;
    state.visibleCount = PAGE_SIZE;
    computeFiltered();
    renderActiveFilterChips();
    renderGrid();
    var section = document.getElementById("papers");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }
