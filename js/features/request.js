/* Owns paper-request modal behavior only; must not manage detail or catalogue state. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
function clearRequestErrors() {
    if (dom.reqName) {
      dom.reqName.classList.remove("has-error");
    }
    if (dom.reqEmail) {
      dom.reqEmail.classList.remove("has-error");
    }
    if (dom.reqNameError) dom.reqNameError.textContent = "";
    if (dom.reqEmailError) dom.reqEmailError.textContent = "";
  }

export function openRequestModal(title, authors) {
    if (!dom.reqPaperTitle || !dom.reqPaperAuthors || !dom.requestOverlay) return;
    dom.reqPaperTitle.textContent = title;
    dom.reqPaperAuthors.textContent = authors;
    if (dom.reqName) dom.reqName.value = "";
    if (dom.reqEmail) dom.reqEmail.value = "";
    if (dom.reqNotes) dom.reqNotes.value = "";
    clearRequestErrors();
    dom.requestOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      if (dom.reqName) dom.reqName.focus();
    }, 150);
  }

export function closeRequestModal() {
    if (!dom.requestOverlay) return;
    dom.requestOverlay.classList.remove("is-open");
    document.body.style.overflow = dom.detailOverlay && dom.detailOverlay.classList.contains("is-open") ? "hidden" : "";
  }

export function validateRequestForm() {
    var valid = true;
    clearRequestErrors();
    if (!dom.reqName.value.trim()) {
      dom.reqName.classList.add("has-error");
      dom.reqNameError.textContent = "Please enter your name.";
      valid = false;
    }
    var email = dom.reqEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      dom.reqEmail.classList.add("has-error");
      dom.reqEmailError.textContent = "Please enter a valid email address.";
      valid = false;
    }
    return valid;
  }

export function wireRequestModal() {
    dom.requestClose.addEventListener("click", closeRequestModal);
    dom.requestOverlay.addEventListener("click", function (e) {
      if (e.target === dom.requestOverlay) closeRequestModal();
    });
    dom.reqSend.addEventListener("click", function () {
      if (!validateRequestForm()) return;
      var title = dom.reqPaperTitle.textContent;
      var authors = dom.reqPaperAuthors.textContent;
      var name = dom.reqName.value.trim();
      var email = dom.reqEmail.value.trim();
      var notes = dom.reqNotes.value.trim() || "-";
      var subject = "Paper Access Request – " + title;
      var body =
        "Hello Marga Research Hub team,\n\n" +
        "I would like to request access to the following paper:\n\n" +
        "Paper: " +
        title +
        "\n" +
        "Author(s): " +
        authors +
        "\n\n" +
        "Requested by:\n" +
        "Name: " +
        name +
        "\n" +
        "Email: " +
        email +
        "\n\n" +
        "Notes:\n" +
        notes +
        "\n\n" +
        "Thank you,\n" +
        name;
      showToast("Opening your email app…");
      window.location.href = buildMailto(CONTACT_EMAIL, subject, body);
      closeRequestModal();
    });
  }

  /* Open the accessibility information and its guided tour. */
