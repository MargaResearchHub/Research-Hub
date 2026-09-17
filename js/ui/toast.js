/* Owns transient toast rendering only; must not contain application state. */
import { dom } from "./dom.js";
import { SVG_TOAST_OK, SVG_TOAST_ERR } from "../icons.js";
/* Show short status messages without interrupting the visitor. */
export function showToast(message, type) {
    if (!dom.toastRegion) return;
    var el = document.createElement("div");
    el.className = "toast" + (type === "error" ? " toast-error" : "");
    el.setAttribute("role", "status");
    el.innerHTML =
      (type === "error" ? SVG_TOAST_ERR : SVG_TOAST_OK) +
      "<span>" +
      escHtml(message) +
      "</span>";
    dom.toastRegion.appendChild(el);
    requestAnimationFrame(function () {
      el.classList.add("is-visible");
    });
    setTimeout(function () {
      el.classList.remove("is-visible");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 250);
    }, 3200);
  }
