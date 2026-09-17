/* Owns chat panel, replies, and free-text search only; must not own catalogue rendering. */
import { PAGE_SIZE, ABSTRACT_TRUNCATE, PARTNER_LABELS, LITTYPE_LABELS, TOUR_STEPS, CONTACT_EMAIL, STOREHOUSE_URL, TICKER_LIMIT, VISITOR_API_BASE, VISITOR_NAMESPACE, VISITOR_KEY, VISITOR_SESSION_KEY, VISITOR_CACHE_KEY, TOUR_STORAGE_KEY } from "../config.js";
import { state, saved, papersByKey, dataBounds, recentlyViewed, currentDetailPaper, lastFocusedBeforeModal, tourIndex, setCurrentDetailPaper, setLastFocusedBeforeModal, setTourIndex } from "../state.js";
import { safeGetLocal, safeSetLocal, safeGetSession, safeSetSession } from "../storage.js";
import { escHtml, stripCiteArtifacts, capitalize, uniqueNonEmpty, splitAuthors, shortAuthors, fullAuthors, citationLabel, copyText, buildMailto, cssEscape } from "../utils.js";
import { AREA_ICON_PATHS, AREA_ICON_FALLBACK, iconSvg, SVG_SAVE, SVG_SHARE, SVG_REQUEST, SVG_EXTERNAL, SVG_TOAST_OK, SVG_TOAST_ERR, SVG_EMPTY_SEARCH, SVG_EMPTY_SAVE, SVG_ERROR } from "../icons.js";
import { dom } from "../ui/dom.js";
import { showToast } from "../ui/toast.js";
function addChatMessage(text, from, isHtml) {
    var msg = document.createElement("div");
    msg.className = "chat-msg " + (from === "user" ? "chat-msg-user" : "chat-msg-bot");
    var p = document.createElement("p");
    if (isHtml) p.innerHTML = text;
    else p.textContent = text;
    msg.appendChild(p);
    dom.chatBody.appendChild(msg);
    dom.chatBody.scrollTop = dom.chatBody.scrollHeight;
    return msg;
  }

export function addChatResults(intro, results) {
    var msg = addChatMessage(intro, "bot");
    var list = document.createElement("div");
    list.className = "chat-results";
    results.forEach(function (p) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-result-btn";
      btn.dataset.key = p.key;
      btn.innerHTML =
        escHtml(p.title) +
        "<span>" +
        escHtml(shortAuthors(p.authors)) +
        (p.year ? " - " + escHtml(p.year) : "") +
        "</span>";
      btn.addEventListener("click", function () {
        openDetail(p.key);
        setChatOpen(false);
      });
      list.appendChild(btn);
    });
    msg.appendChild(list);
    dom.chatBody.scrollTop = dom.chatBody.scrollHeight;
  }

export function showChatTyping() {
    var el = document.createElement("div");
    el.className = "chat-typing";
    el.id = "chatTypingIndicator";
    el.innerHTML = "<span></span><span></span><span></span>";
    dom.chatBody.appendChild(el);
    dom.chatBody.scrollTop = dom.chatBody.scrollHeight;
  }
export function hideChatTyping() {
    var el = document.getElementById("chatTypingIndicator");
    if (el) el.remove();
  }

export function searchPapersFreeText(query, limit) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    var out = [];
    for (var i = 0; i < state.papers.length && out.length < (limit || 3); i++) {
      var p = state.papers[i];
      var hay = p.titleLower + " " + p.authorsLower + " " + p.areaName.toLowerCase();
      if (hay.indexOf(q) !== -1) out.push(p);
    }
    return out;
  }

export function setChatOpen(open) {
    dom.chatPanel.classList.toggle("is-open", open);
    dom.chatFabBtn.setAttribute("aria-expanded", open);
    if (open) {
      setTimeout(function () {
        dom.chatInput.focus();
      }, 150);
    }
  }

export function wireChat() {
    dom.chatFabBtn.addEventListener("click", function () {
      setChatOpen(!dom.chatPanel.classList.contains("is-open"));
    });
    dom.chatCloseBtn.addEventListener("click", function () {
      setChatOpen(false);
    });

    Array.prototype.forEach.call(
      dom.chatQuickReplies.querySelectorAll(".chip"),
      function (chip) {
        chip.addEventListener("click", function () {
          addChatMessage(chip.textContent, "user");
          var reply = chip.dataset.reply;
          showChatTyping();
          setTimeout(function () {
            hideChatTyping();
            if (reply === "browse") {
              addChatMessage("Here's our newest research - taking you there now.", "bot");
              setChatOpen(false);
              var section = document.getElementById("papers");
              if (section) section.scrollIntoView({ behavior: "smooth" });
            } else if (reply === "request") {
              addChatMessage("Sure - opening a request form for you.", "bot");
              setChatOpen(false);
              openRequestModal("Requested paper title", "Requested paper author(s)");
            } else if (reply === "contact") {
              var mailto = buildMailto(
                CONTACT_EMAIL,
                "Question via Research Hub chat",
                "Hello Marga Research Hub team,\n\n"
              );
              addChatMessage(
                'You can reach the team directly at <a href="' +
                mailto +
                '">' +
                CONTACT_EMAIL +
                "</a>, or use Contact Us in the menu.",
                "bot",
                true
              );
            }
          }, 450);
        });
      }
    );

    dom.chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = dom.chatInput.value.trim();
      if (!text) return;
      addChatMessage(text, "user");
      dom.chatInput.value = "";
      showChatTyping();
      setTimeout(function () {
        hideChatTyping();
        var results = searchPapersFreeText(text, 3);
        if (results.length) {
          addChatResults("Here's what I found - tap one to view it:", results);
        } else {
          addChatMessage(
            "I couldn't find a paper matching that. Try a topic or author name, or email " +
            CONTACT_EMAIL +
            " and the team will help directly.",
            "bot"
          );
        }
      }, 550);
    });
  }

  /* Let Escape close whichever overlay or panel is currently open. */
