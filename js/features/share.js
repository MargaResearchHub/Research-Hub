/* Owns citation and sharing actions only; must not mutate catalogue rendering state. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
/* Build a simple citation and shareable link for each paper. */
export function buildCitation(p) {
    var authorPart = p.authors
      ? p.authors.replace(/\s*\([^)]*\)/g, "")
      : "Unknown author";
    var yearPart = p.year || "n.d.";
    var pub = p.partnerName || "Marga Institute";
    return authorPart + " (" + yearPart + "). " + p.title + ". " + pub + ".";
  }

export function citePaper(paper) {
    var citation = buildCitation(paper);
    copyText(citation).then(function (ok) {
      showToast(
        ok ? "Citation copied to clipboard" : citation,
        ok ? "success" : "info"
      );
    });
  }

export function buildDeepLink(key) {
    return window.location.href.split("#")[0] + "#paper=" + encodeURIComponent(key);
  }

export function sharePaper(paper) {
    var url = buildDeepLink(paper.key);
    var text = paper.title + (paper.authors ? " - " + shortAuthors(paper.authors) : "");
    if (navigator.share) {
      navigator.share({ title: paper.title, text: text, url: url }).catch(function () { });
    } else {
      copyText(url).then(function (ok) {
        showToast(
          ok ? "Link copied to clipboard" : "Could not copy the link",
          ok ? "success" : "error"
        );
      });
    }
  }
