/* Owns hero spotlight and ticker rendering only; must not wire controls. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
/* Build the newest-paper spotlight used in the hero section. */
export function pickSpotlight() {
    var sorted = state.papers.slice().sort(function (a, b) {
      var ay = a.yearNum || 0,
        by = b.yearNum || 0;
      if (by !== ay) return by - ay;
      return b.citations - a.citations;
    });
    return sorted.slice(0, 3);
  }

export function spotlightCardHTML(p, index) {
    var isMain = index === 0;
    return (
      '<button type="button" class="spot-card' +
      (isMain ? " spot-main" : "") +
      '" data-key="' +
      p.key +
      '">' +
      "<div>" +
      '<span class="rank">0' +
      (index + 1) +
      "</span>" +
      "<h4>" +
      escHtml(p.title) +
      "</h4>" +
      '<p class="meta">' +
      escHtml(shortAuthors(p.authors)) +
      (p.year ? " - " + escHtml(p.year) : "") +
      "</p>" +
      "</div>" +
      (isMain
        ? '<div class="tags"><span class="tag-chip">' +
        iconSvg(p.areaIcon) +
        "<span>" +
        escHtml(p.areaName) +
        "</span></span>" +
        (p.partnerName
          ? '<span class="tag-chip"><span>' + escHtml(p.partnerName) + "</span></span>"
          : "") +
        "</div>"
        : "") +
      "</button>"
    );
  }

export function renderHeroSpotlight() {
    var top3 = pickSpotlight();
    if (!top3.length) {
      renderHeroFallback();
      return;
    }
    var html = '<span class="spotlight-label">Newest Additions</span>';
    top3.forEach(function (p, i) {
      html += spotlightCardHTML(p, i);
    });
    html +=
      '<div class="spot-ticker"><div class="ticker-track" id="tickerTrack"></div></div>';
    dom.spotlightDesktop.innerHTML = html;
    dom.spotlightDesktop.addEventListener("click", function (e) {
      var card = e.target.closest("[data-key]");
      if (card) openDetail(card.dataset.key);
    });

    renderTicker();
    renderRollingMobile(top3);
  }

export function renderTicker() {
    var track = document.getElementById("tickerTrack");
    if (!track) return;
    var items = state.papers.slice(0, TICKER_LIMIT);
    if (!items.length) return;
    var html = items
      .map(function (p) {
        return (
          '<button type="button" class="ticker-item" data-key="' +
          p.key +
          '">' +
          escHtml(p.title) +
          "</button>"
        );
      })
      .join("");
    track.innerHTML = html + html;
    track.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-key]");
      if (btn) openDetail(btn.dataset.key);
    });
  }

export function renderRollingMobile(top3) {
    dom.rollingSlides.innerHTML = top3
      .map(function (p, i) {
        return (
          '<button type="button" class="rolling-slide' +
          (i === 0 ? " is-active" : "") +
          '" data-key="' +
          p.key +
          '">' +
          "<h4>" +
          escHtml(p.title) +
          "</h4>" +
          '<p class="meta">' +
          escHtml(shortAuthors(p.authors)) +
          (p.year ? " - " + escHtml(p.year) : "") +
          "</p>" +
          '<div class="tags"><span class="tag-chip">' +
          iconSvg(p.areaIcon) +
          "<span>" +
          escHtml(p.areaName) +
          "</span></span></div>" +
          "</button>"
        );
      })
      .join("");

    dom.rollingSlides.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-key]");
      if (btn) openDetail(btn.dataset.key);
    });

    var slides = dom.rollingSlides.querySelectorAll(".rolling-slide");
    dom.rollingDots.innerHTML = "";
    var current = 0;
    var rollTimer;
    if (!slides.length) return;

    Array.prototype.forEach.call(slides, function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show spotlight paper " + (i + 1));
      if (i === 0) b.className = "is-active";
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        goToSlide(i);
        resetTimer();
      });
      dom.rollingDots.appendChild(b);
    });

    function goToSlide(i) {
      slides[current].classList.remove("is-active");
      dom.rollingDots.children[current].classList.remove("is-active");
      current = i;
      slides[current].classList.add("is-active");
      dom.rollingDots.children[current].classList.add("is-active");
    }
    function nextSlide() {
      goToSlide((current + 1) % slides.length);
    }
    function resetTimer() {
      clearInterval(rollTimer);
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced && slides.length > 1) rollTimer = setInterval(nextSlide, 4200);
    }
    resetTimer();
  }
