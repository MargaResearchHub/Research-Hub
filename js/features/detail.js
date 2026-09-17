/* Owns paper-detail modal rendering, history, deep links, and close behavior only. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
import { findByKey } from "../data.js";
import { updateSaveButtonUI } from "./saved.js";
import { buildCitation, citePaper, sharePaper } from "./share.js";
import { openRequestModal } from "./request.js";
/* Track recently opened papers and fill the paper details modal. */
export function pushRecentlyViewed(key) {
    var idx = recentlyViewed.indexOf(key);
    if (idx !== -1) recentlyViewed.splice(idx, 1);
    recentlyViewed.unshift(key);
    if (recentlyViewed.length > 8) recentlyViewed.length = 8;
  }

export function renderDetailModal(paper) {
    currentDetailPaper = paper;
    var isSaved = saved.has(paper.key);
    var partnerLabel = PARTNER_LABELS[paper.partner] || "";
    var pdfUnavailable = !paper.pdfUrl || paper.pdfUrl === "#";
    var pdfBtn = pdfUnavailable
      ? '<button class="btn btn-gold btn-sm" type="button" data-action="pdf-unavailable" title="PDF unavailable">Open PDF ' +
      SVG_EXTERNAL +
      "</button>"
      : '<a class="btn btn-gold btn-sm" href="' +
      escHtml(paper.pdfUrl) +
      '" target="_blank" rel="nofollow noopener">Open PDF ' +
      SVG_EXTERNAL +
      "</a>";

    var recents = recentlyViewed
      .filter(function (k) {
        return k !== paper.key;
      })
      .slice(0, 5);
    var recentHTML = recents.length
      ? recents
        .map(function (k) {
          var rp = findByKey(k);
          if (!rp) return "";
          return (
            '<button type="button" class="recent-item" data-recent-key="' +
            rp.key +
            '">' +
            escHtml(rp.title) +
            '<span>' +
            escHtml(shortAuthors(rp.authors)) +
            (rp.year ? " - " + escHtml(rp.year) : "") +
            "</span></button>"
          );
        })
        .join("")
      : '<p class="sidebar-empty">Papers you view will show up here for quick access.</p>';

    dom.detailModalScroll.innerHTML =
      '<div class="detail-layout">' +
      '<div class="detail-main">' +
      '<div class="detail-head">' +
      (paper.isMarga
        ? '<span class="marga-badge" title="Published via Marga Institute" style="position:static;flex:none;"></span>'
        : "") +
      "<div><h3>" +
      escHtml(paper.title) +
      '</h3><p class="detail-authors">' +
      escHtml(fullAuthors(paper)) +
      '</p><p class="detail-ref">Reference ' +
      escHtml(paper.id) +
      "</p></div>" +
      "</div>" +
      '<div class="pill-row" style="margin-top:16px;">' +
      (paper.year
        ? '<span class="pill">' + escHtml(paper.year) + "</span>"
        : '<span class="pill">Year unspecified</span>') +
      '<span class="pill">' +
      citationLabel(paper.citations) +
      "</span>" +
      (paper.litType
        ? '<span class="pill pill-status" data-status="' +
        paper.litType +
        '">' +
        escHtml(LITTYPE_LABELS[paper.litType] || capitalize(paper.litType)) +
        "</span>"
        : "") +
      '<span class="pill">' +
      iconSvg(paper.areaIcon) +
      escHtml(paper.areaName) +
      "</span>" +
      "</div>" +
      '<div class="detail-body">' +
      "<h4>Abstract</h4><p>" +
      escHtml(paper.abstract || "No abstract available for this record.") +
      "</p>" +
      (paper.partnerName
        ? "<h4>Partner</h4><p>" +
        escHtml(paper.partnerName) +
        (partnerLabel ? " · " + escHtml(partnerLabel) : "") +
        "</p>"
        : "") +
      "</div>" +
      '<div class="detail-actions">' +
      pdfBtn +
      '<button type="button" class="btn btn-ghost btn-sm save-btn' +
      (isSaved ? " is-saved" : "") +
      '" data-action="save" aria-pressed="' +
      (isSaved ? "true" : "false") +
      '">' +
      SVG_SAVE +
      (isSaved ? "Saved" : "Save") +
      "</button>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="cite">Cite this paper</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="share">Share</button>' +
      '<button type="button" class="btn btn-maroon btn-sm" data-action="request">Request access</button>' +
      "</div>" +
      "</div>" +
      '<aside class="detail-sidebar"><h4>Recently Viewed</h4>' +
      recentHTML +
      "</aside>" +
      "</div>";
  }

export function openDetail(key) {
    var paper = findByKey(key);
    if (!paper) return;
    pushRecentlyViewed(key);
    renderDetailModal(paper);
    dom.detailOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lastFocusedBeforeModal = document.activeElement;
    setTimeout(function () {
      dom.detailCloseBtn.focus();
    }, 150);
    history.replaceState(null, "", "#paper=" + encodeURIComponent(key));
  }

export function closeDetail() {
    dom.detailOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    if (location.hash.indexOf("#paper=") === 0) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
    }
  }

export function wireDetailModal() {
    dom.detailCloseBtn.addEventListener("click", closeDetail);
    dom.detailOverlay.addEventListener("click", function (e) {
      if (e.target === dom.detailOverlay) closeDetail();
    });
    dom.detailModalScroll.addEventListener("click", function (e) {
      var recentBtn = e.target.closest("[data-recent-key]");
      if (recentBtn) {
        openDetail(recentBtn.dataset.recentKey);
        return;
      }
      var el = e.target.closest("[data-action]");
      if (!el || !currentDetailPaper) return;
      var paper = currentDetailPaper;
      var action = el.dataset.action;
      if (action === "save") {
        toggleSave(paper);
        updateSaveButtonUI(el, paper);
        syncSaveButtonsFor(paper.key);
      } else if (action === "cite") {
        citePaper(paper);
      } else if (action === "share") {
        sharePaper(paper);
      } else if (action === "request") {
        openRequestModal(paper.title, fullAuthors(paper));
      } else if (action === "pdf-unavailable") {
        showToast(
          "PDF unavailable. Please request access using the Request Access button.",
          "error"
        );
      }
    });

    window.addEventListener("hashchange", function () {
      if (!state.papers.length) return;
      var m = location.hash.match(/^#paper=(.+)$/);
      if (m) {
        var key = decodeURIComponent(m[1]);
        if (findByKey(key)) openDetail(key);
      } else if (dom.detailOverlay.classList.contains("is-open")) {
        closeDetail();
      }
    });
  }

export function handleInitialHash() {
    var m = location.hash.match(/^#paper=(.+)$/);
    if (m) {
      var key = decodeURIComponent(m[1]);
      if (findByKey(key)) openDetail(key);
    }
  }
