/* Owns skeletons, paper-card markup, empty states, and delegated grid events only; must not own saved storage. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
import { toggleSave, updateSaveButtonUI, syncSaveButtonsFor, setSavedOnly, updateSavedCount } from "./saved.js";
import { computeFiltered, renderActiveFilterChips, clearAllFilters } from "./filters.js";
import { openDetail } from "./detail.js";
import { citePaper, sharePaper } from "./share.js";
import { openRequestModal } from "./request.js";
function renderSkeletons(count) {
    var html = "";
    for (var i = 0; i < count; i++) {
      html +=
        '<div class="skeleton-card"><div class="sk sk-title"></div><div class="sk sk-line"></div>' +
        '<div style="display:flex;gap:8px;"><div class="sk sk-pill"></div><div class="sk sk-pill"></div><div class="sk sk-pill"></div></div>' +
        '<div class="sk sk-body"></div><div class="sk sk-body"></div><div class="sk sk-body"></div></div>';
    }
    dom.paperGrid.innerHTML = html;
    dom.resultsCount.textContent = "Loading papers…";
    dom.loadMoreWrap.hidden = true;
  }

export function renderHeroSkeletons() {
    if (!dom.statPapers || !dom.statInstitutions || !dom.statAreas || !dom.statSince) return;

    dom.statPapers.innerHTML = '<span class="sk hero-stat-skeleton"></span>';
    dom.statInstitutions.innerHTML = '<span class="sk hero-stat-skeleton"></span>';
    dom.statAreas.innerHTML = '<span class="sk hero-stat-skeleton"></span>';
    dom.statSince.innerHTML = '<span class="sk hero-stat-skeleton"></span>';

    dom.spotlightDesktop.innerHTML =
      '<span class="spotlight-label">Newest Additions</span>' +
      '<div class="spot-card spot-main hero-spot-skeleton-card">' +
      '<div class="sk sk-title"></div><div class="sk sk-line"></div>' +
      '<div class="spot-skeleton-tags"><span class="sk sk-pill"></span><span class="sk sk-pill"></span></div></div>' +
      '<div class="spot-card hero-spot-skeleton-card">' +
      '<div class="sk sk-title"></div><div class="sk sk-line"></div><div class="sk sk-pill"></div></div>' +
      '<div class="spot-card hero-spot-skeleton-card">' +
      '<div class="sk sk-title"></div><div class="sk sk-line"></div><div class="sk sk-pill"></div></div>' +
      '<div class="spot-ticker"><div class="ticker-track"><span class="sk sk-line hero-ticker-skeleton"></span></div></div>';

    if (dom.rollingSlides) {
      dom.rollingSlides.innerHTML =
        '<div class="rolling-slide is-active hero-rolling-skeleton">' +
        '<div class="sk sk-title"></div><div class="sk sk-line"></div>' +
        '<div class="spot-skeleton-tags"><span class="sk sk-pill"></span></div></div>';
    }
    if (dom.rollingDots) {
      dom.rollingDots.innerHTML =
        '<span class="sk hero-dot-skeleton"></span><span class="sk hero-dot-skeleton"></span><span class="sk hero-dot-skeleton"></span>';
    }
  }

export function renderHeroFallback() {
    if (dom.statPapers) dom.statPapers.textContent = "-";
    if (dom.statInstitutions) dom.statInstitutions.textContent = "-";
    if (dom.statAreas) dom.statAreas.textContent = "-";
    if (dom.statSince) dom.statSince.textContent = "-";

    if (dom.spotlightDesktop) {
      dom.spotlightDesktop.innerHTML =
        '<span class="spotlight-label">Newest Additions</span><p class="hero-fallback-text">Papers will appear here once the catalogue loads.</p>';
    }
    if (dom.rollingSlides) {
      dom.rollingSlides.innerHTML =
        '<p class="hero-fallback-text hero-fallback-mobile">Papers will appear here once the catalogue loads.</p>';
    }
    if (dom.rollingDots) dom.rollingDots.innerHTML = "";
  }

export function abstractHTML(text) {
    var safeText = text || "No abstract available for this record.";
    if (safeText.length <= ABSTRACT_TRUNCATE) {
      return '<p class="paper-desc">' + escHtml(safeText) + "</p>";
    }
    var cut = safeText.slice(0, ABSTRACT_TRUNCATE);
    var lastSpace = cut.lastIndexOf(" ");
    if (lastSpace > 40) cut = cut.slice(0, lastSpace);
    var truncated = cut + "…";
    return (
      '<p class="paper-desc" data-truncated="' +
      escHtml(truncated) +
      '" data-full="' +
      escHtml(safeText) +
      '">' +
      escHtml(truncated) +
      "</p>" +
      '<button type="button" class="read-more" data-action="read-more" data-expanded="false">Read more</button>'
    );
  }

export function toggleReadMore(btn) {
    var desc = btn.previousElementSibling;
    if (!desc) return;
    var expanded = btn.dataset.expanded === "true";
    if (expanded) {
      desc.textContent = desc.dataset.truncated;
      btn.textContent = "Read more";
      btn.dataset.expanded = "false";
    } else {
      desc.textContent = desc.dataset.full;
      btn.textContent = "Show less";
      btn.dataset.expanded = "true";
    }
  }

export function cardHTML(p) {
    var isMarga = p.isMarga;
    var isSaved = saved.has(p.key);
    return (
      '<article class="paper-card' +
      (isMarga ? " has-badge" : "") +
      '" data-key="' +
      p.key +
      '">' +
      (isMarga
        ? '<span class="marga-badge" title="Published via Marga Institute"></span>'
        : "") +
      '<h3><button type="button" data-action="view">' +
      escHtml(p.title) +
      "</button></h3>" +
      '<p class="paper-authors" title="' +
      escHtml(fullAuthors(p)) +
      '">' +
      escHtml(fullAuthors(p)) +
      "</p>" +
      '<div class="pill-row">' +
      (p.year
        ? '<span class="pill">' + escHtml(p.year) + "</span>"
        : '<span class="pill">Year unspecified</span>') +
      '<span class="pill">' +
      citationLabel(p.citations) +
      "</span>" +
      (p.litType
        ? '<span class="pill pill-status" data-status="' +
        p.litType +
        '">' +
        escHtml(LITTYPE_LABELS[p.litType] || capitalize(p.litType)) +
        "</span>"
        : "") +
      '<span class="pill">' +
      iconSvg(p.areaIcon) +
      escHtml(p.areaName) +
      "</span>" +
      "</div>" +
      abstractHTML(p.abstract) +
      '<div class="card-actions">' +
      '<button class="btn btn-ghost btn-sm" type="button" data-action="view">View paper</button>' +
      '<button class="btn btn-ghost btn-sm save-btn' +
      (isSaved ? " is-saved" : "") +
      '" type="button" data-action="save" aria-pressed="' +
      (isSaved ? "true" : "false") +
      '">' +
      SVG_SAVE +
      (isSaved ? "Saved" : "Save") +
      "</button>" +
      '<button class="btn btn-ghost btn-sm" type="button" data-action="cite">Cite</button>' +
      '<span class="spacer"></span>' +
      '<button class="icon-btn" type="button" data-action="share" title="Share" aria-label="Share this paper">' +
      SVG_SHARE +
      "</button>" +
      '<button class="request-btn" type="button" data-action="request" title="Request this paper" aria-label="Request this paper">' +
      SVG_REQUEST +
      "</button>" +
      "</div>" +
      "</article>"
    );
  }

export function emptyStateHTML() {
    if (state.savedOnly) {
      return (
        '<div class="empty-state">' +
        SVG_EMPTY_SAVE +
        "<h3>No saved papers yet</h3>" +
        "<p>Tap Save on any paper to bookmark it here for quick access later.</p>" +
        '<button class="btn btn-ghost btn-sm" type="button" data-action="browse-all">Browse all papers</button>' +
        "</div>"
      );
    }
    return (
      '<div class="empty-state">' +
      SVG_EMPTY_SEARCH +
      "<h3>No papers match your filters</h3>" +
      "<p>Try widening the year range, clearing a filter, or searching a different keyword.</p>" +
      '<button class="btn btn-ghost btn-sm" type="button" data-action="clear-filters">Clear all filters</button>' +
      "</div>"
    );
  }

export function renderGrid() {
    // Show only the current page of results and update the result count.
    var total = state.filtered.length;
    var toShow = state.filtered.slice(0, state.visibleCount);

    dom.resultsCount.innerHTML = total
      ? "Showing <strong>" +
      toShow.length +
      "</strong> of <strong>" +
      total +
      "</strong> paper" +
      (total === 1 ? "" : "s")
      : "No papers found";

    if (!total) {
      dom.paperGrid.innerHTML = emptyStateHTML();
      dom.loadMoreWrap.hidden = true;
      return;
    }

    dom.paperGrid.innerHTML = toShow.map(cardHTML).join("");

    var remaining = total - toShow.length;
    dom.loadMoreWrap.hidden = remaining <= 0;
    if (remaining > 0) {
      dom.loadMoreBtn.textContent =
        "Load more papers (" + remaining + " remaining)";
    }
  }
function wireGridDelegation() {
    dom.paperGrid.addEventListener("click", function (e) {
      var actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;
      var action = actionEl.dataset.action;

      if (action === "browse-all") {
        setSavedOnly(false);
        return;
      }
      if (action === "clear-filters") {
        clearAllFilters();
        return;
      }
      if (action === "read-more") {
        toggleReadMore(actionEl);
        return;
      }

      var card = actionEl.closest("[data-key]");
      if (!card) return;
      var paper = findByKey(card.dataset.key);
      if (!paper) return;

      if (action === "view") {
        openDetail(paper.key);
      } else if (action === "save") {
        toggleSave(paper);
        syncSaveButtonsFor(paper.key);
        if (state.savedOnly && !saved.has(paper.key)) {
          computeFiltered();
          renderGrid();
        }
      } else if (action === "cite") {
        citePaper(paper);
      } else if (action === "share") {
        sharePaper(paper);
      } else if (action === "request") {
        openRequestModal(paper.title, fullAuthors(paper));
      }
    });
  }
