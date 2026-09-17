/* Owns newsletter form validation and mailto behavior only; must not manage catalogue state. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
function wireNewsletter() {
    dom.newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = dom.newsletterEmail.value.trim();
      dom.newsletterEmail.classList.remove("has-error");
      dom.newsletterError.textContent = "";
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        dom.newsletterEmail.classList.add("has-error");
        dom.newsletterError.textContent = "Please enter a valid email address.";
        return;
      }
      var subject = "Newsletter Subscription Request";
      var body =
        "Hello Marga Research Hub team,\n\n" +
        "Please add the following email address to the research newsletter list:\n\n" +
        email +
        "\n\nThank you.";
      showToast("Opening your email app…");
      window.location.href = buildMailto(CONTACT_EMAIL, subject, body);
      dom.newsletterEmail.value = "";
    });
  }

  /* Show the back-to-top button after the visitor scrolls down. */
