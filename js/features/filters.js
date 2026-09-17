/* Owns search, filter, sort, and filter-chip behavior only; must not render paper markup. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
/* Apply the current filters and sort order before rendering the results. */
export function computeFiltered() {
    // Filtering happens in memory so the results update without another request.
    var q = state.query.trim().toLowerCase();
    var list = state.papers.filter(function (p) {
      if (state.savedOnly && !saved.has(p.key)) return false;
      if (q) {
        var hay;
        if (state.scope === "author") hay = p.authorsLower;
        else if (state.scope === "id") hay = p.id.toLowerCase();
        else hay = p.titleLower + " " + p.abstractLower;
        if (hay.indexOf(q) === -1) return false;
      }
      if (state.yearMin != null && state.yearMax != null && p.yearNum != null) {
        if (p.yearNum < state.yearMin || p.yearNum > state.yearMax) return false;
      }
      if (state.institution && p.partnerName !== state.institution) return false;
      if (state.field && p.areaName !== state.field) return false;
      if (state.litType && p.litType !== state.litType) return false;
      return true;
    });
    state.filtered = sortPapers(list, state.sort);
  }

export function sortPapers(list, sort) {
    var arr = list.slice();
    if (sort === "oldest") {
      arr.sort(function (a, b) {
        return (a.yearNum || 9999) - (b.yearNum || 9999);
      });
    } else if (sort === "cited") {
      arr.sort(function (a, b) {
        return b.citations - a.citations;
      });
    } else if (sort === "title") {
      arr.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
    } else {
      arr.sort(function (a, b) {
        return (b.yearNum || 0) - (a.yearNum || 0);
      });
    }
    return arr;
  }
function applySearchFromRow() {
    // Save the search controls in state, then rebuild the visible paper list.
    state.query = dom.searchInput.value;
    state.scope = dom.scopeSelect.value || "keywords";
    state.visibleCount = PAGE_SIZE;
    setSearchOpen(false);
    refreshAndScrollToPapers();
  }

export function applyAdvancedFilters() {
    // Copy the advanced controls into state before filtering the catalogue.
    state.yearMin = parseInt(dom.rangeMin.value, 10);
    state.yearMax = parseInt(dom.rangeMax.value, 10);
    state.institution = dom.institutionSelect.value;
    state.field = dom.fieldSelect.value;
    state.litType = dom.litTypeSelect.value;
    state.visibleCount = PAGE_SIZE;
    setSearchOpen(false);
    refreshAndScrollToPapers();
  }

export function refreshAndScrollToPapers() {
    // All filter changes use this same path so the count, chips, and cards stay consistent.
    computeFiltered();
    renderActiveFilterChips();
    renderGrid();
    var section = document.getElementById("papers");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }

  /* Set up the two handles used to filter papers by publication year. */
export function setupYearSlider() {
    // Use the earliest and latest valid years in paper.json as the slider limits.
    var years = state.papers
      .map(function (p) {
        return p.yearNum;
      })
      .filter(function (y) {
        return !!y;
      });
    var minY = years.length ? Math.min.apply(null, years) : dataBounds.yearMin;
    var maxY = years.length
      ? Math.max.apply(null, years)
      : new Date().getFullYear();
    dataBounds.yearMin = minY;
    dataBounds.yearMax = maxY;

    dom.rangeMin.min = minY;
    dom.rangeMin.max = maxY;
    dom.rangeMax.min = minY;
    dom.rangeMax.max = maxY;
    dom.rangeMin.value = minY;
    dom.rangeMax.value = maxY;
    state.yearMin = minY;
    state.yearMax = maxY;

    updateRangeVisual();

    dom.rangeMin.addEventListener("input", function () {
      clampRange("min");
    });
    dom.rangeMax.addEventListener("input", function () {
      clampRange("max");
    });
    // Whichever thumb the person is actively dragging gets priority,
    // so overlapping thumbs near the same value stay easy to grab.
    dom.rangeMin.addEventListener("pointerdown", function () {
      dom.rangeMin.style.zIndex = 3;
      dom.rangeMax.style.zIndex = 2;
    });
    dom.rangeMax.addEventListener("pointerdown", function () {
      dom.rangeMax.style.zIndex = 3;
      dom.rangeMin.style.zIndex = 2;
    });
  }

export function clampRange(source) {
    // Prevent the lower year from moving above the upper year, and vice versa.
    var min = parseInt(dom.rangeMin.value, 10);
    var max = parseInt(dom.rangeMax.value, 10);
    if (min > max) {
      if (source === "min") {
        dom.rangeMin.value = max;
      } else {
        dom.rangeMax.value = min;
      }
    }
    updateRangeVisual();
  }

export function updateRangeVisual() {
    var min = parseInt(dom.rangeMin.value, 10);
    var max = parseInt(dom.rangeMax.value, 10);
    var lo = parseInt(dom.rangeMin.min, 10);
    var hi = parseInt(dom.rangeMin.max, 10);
    var span = hi - lo || 1;
    var pctMin = ((min - lo) / span) * 100;
    var pctMax = ((max - lo) / span) * 100;
    dom.rangeFill.style.left = pctMin + "%";
    dom.rangeFill.style.width = Math.max(0, pctMax - pctMin) + "%";
    dom.rangeMinVal.textContent = min;
    dom.rangeMaxVal.textContent = max;
  }

  /* Fill the filter menus from the values found in paper.json. */
export function fillSelect(select, values, placeholderLabel, labelFn) {
    var html = '<option value="">' + escHtml(placeholderLabel) + "</option>";
    values.forEach(function (v) {
      var label = labelFn ? labelFn(v) : v;
      html += '<option value="' + escHtml(v) + '">' + escHtml(label) + "</option>";
    });
    select.innerHTML = html;
  }

export function populateFilterSelects() {
    // The available filter choices come from the loaded paper records.
    var institutions = uniqueNonEmpty(
      state.papers.map(function (p) {
        return p.partnerName;
      })
    ).sort();
    var areas = uniqueNonEmpty(
      state.papers.map(function (p) {
        return p.areaName;
      })
    ).sort();
    var types = uniqueNonEmpty(
      state.papers.map(function (p) {
        return p.litType;
      })
    ).sort();

    fillSelect(dom.institutionSelect, institutions, "Any partner organization");
    fillSelect(dom.fieldSelect, areas, "Any field of study");
    fillSelect(dom.litTypeSelect, types, "Any publication type", function (v) {
      return LITTYPE_LABELS[v] || capitalize(v);
    });
  }

export function renderActiveFilterChips() {
    var chips = [];
    if (state.query) {
      var scopeLabel =
        state.scope === "author"
          ? "Author"
          : state.scope === "id"
            ? "Paper ID"
            : "Keywords";
      chips.push({
        label: scopeLabel + ': "' + state.query + '"',
        clear: function () {
          state.query = "";
          dom.searchInput.value = "";
        }
      });
    }
    if (
      state.yearMin != null &&
      state.yearMax != null &&
      (state.yearMin !== dataBounds.yearMin || state.yearMax !== dataBounds.yearMax)
    ) {
      chips.push({
        label: "Years " + state.yearMin + "–" + state.yearMax,
        clear: function () {
          state.yearMin = dataBounds.yearMin;
          state.yearMax = dataBounds.yearMax;
          dom.rangeMin.value = dataBounds.yearMin;
          dom.rangeMax.value = dataBounds.yearMax;
          updateRangeVisual();
        }
      });
    }
    if (state.institution) {
      chips.push({
        label: "Partner: " + state.institution,
        clear: function () {
          state.institution = "";
          dom.institutionSelect.value = "";
        }
      });
    }
    if (state.field) {
      chips.push({
        label: "Field: " + state.field,
        clear: function () {
          state.field = "";
          dom.fieldSelect.value = "";
        }
      });
    }
    if (state.litType) {
      chips.push({
        label: "Type: " + (LITTYPE_LABELS[state.litType] || capitalize(state.litType)),
        clear: function () {
          state.litType = "";
          dom.litTypeSelect.value = "";
        }
      });
    }
    if (state.savedOnly) {
      chips.push({
        label: "Saved papers only",
        clear: function () {
          setSavedOnly(false);
        }
      });
    }

    var wrap = dom.activeFilters;
    if (!chips.length) {
      wrap.innerHTML = "";
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    wrap.innerHTML =
      chips
        .map(function (c, i) {
          return (
            '<span class="filter-chip">' +
            escHtml(c.label) +
            '<button type="button" data-chip-index="' +
            i +
            '" aria-label="Remove this filter">&times;</button></span>'
          );
        })
        .join("") +
      '<button type="button" class="filter-chip-clear" id="clearAllFilters">Clear all</button>';

    Array.prototype.forEach.call(
      wrap.querySelectorAll("[data-chip-index]"),
      function (btn) {
        btn.addEventListener("click", function () {
          var i = parseInt(btn.dataset.chipIndex, 10);
          chips[i].clear();
          state.visibleCount = PAGE_SIZE;
          computeFiltered();
          renderActiveFilterChips();
          renderGrid();
        });
      }
    );
    var clearAllBtn = document.getElementById("clearAllFilters");
    if (clearAllBtn) clearAllBtn.addEventListener("click", clearAllFilters);
  }

export function clearAllFilters() {
    state.query = "";
    dom.searchInput.value = "";
    state.institution = "";
    dom.institutionSelect.value = "";
    state.field = "";
    dom.fieldSelect.value = "";
    state.litType = "";
    dom.litTypeSelect.value = "";
    state.yearMin = dataBounds.yearMin;
    state.yearMax = dataBounds.yearMax;
    dom.rangeMin.value = dataBounds.yearMin;
    dom.rangeMax.value = dataBounds.yearMax;
    updateRangeVisual();
    state.savedOnly = false;
    state.visibleCount = PAGE_SIZE;
    computeFiltered();
    renderActiveFilterChips();
    renderGrid();
  }

  /* Connect the sort menu and the button that loads more results. */
export function wireToolbar() {
    dom.sortSelect.addEventListener("change", function () {
      state.sort = dom.sortSelect.value;
      state.visibleCount = PAGE_SIZE;
      computeFiltered();
      renderGrid();
    });
    dom.loadMoreBtn.addEventListener("click", function () {
      state.visibleCount += PAGE_SIZE;
      renderGrid();
    });
  }

  /* Create the loading cards, empty states, and paper cards in the results grid. */
