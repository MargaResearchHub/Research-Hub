/* Owns pure formatting, encoding, and clipboard helpers only; must not access application state. */
(function () {
  var portfolioUrl = atob("aHR0cHM6Ly9hbWlrYS1hbGFua2FyYS1wb3J0Zm9saW8udmVyY2VsLmFwcC8=");
  console.info(
    "%cDesigned and coded by Amika Alankara%c\n%s",
    "color:#b28a4a;font-weight:700;font-size:14px",
    "color:inherit;font-weight:400;font-size:12px",
    portfolioUrl
  );
})();

function escHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (ch) {
      if (ch === "&") return "&amp;";
      if (ch === "<") return "&lt;";
      if (ch === ">") return "&gt;";
      if (ch === '"') return "&quot;";
      return "&#39;";
    });
  }

export function stripCiteArtifacts(text) {
    // Source abstracts occasionally carry leftover extraction markers
    // like "[cite: 3]" or "[cite: 4, 5]" - strip these for readers.
    return (text || "")
      .replace(/\s*\[cite:[^\]]*\]/gi, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

export function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

export function uniqueNonEmpty(arr) {
    var seen = {};
    var out = [];
    arr.forEach(function (v) {
      v = (v || "").trim();
      if (v && !Object.prototype.hasOwnProperty.call(seen, v)) {
        seen[v] = true;
        out.push(v);
      }
    });
    return out;
  }

export function splitAuthors(str) {
    // Splits on commas that are NOT inside parentheses, since author
    // entries embed roles like "(Professor of Crop Science, ...)".
    var parts = [];
    var depth = 0;
    var current = "";
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i);
      if (ch === "(") depth++;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (ch === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts.filter(Boolean);
  }

export function shortAuthors(str) {
    if (!str) return "Author not specified";
    var parts = splitAuthors(str);
    if (!parts.length) return "Author not specified";
    var first = parts[0].replace(/\([^)]*\)/g, "").trim();
    return parts.length > 1 ? first + ", et al." : first;
  }

export function fullAuthors(p) {
    return p.authors ? p.authors : "Author not specified";
  }

export function citationLabel(n) {
    if (n === 0) return "No citations yet";
    return n + (n === 1 ? " citation" : " citations");
  }

export function copyText(text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard
        .writeText(text)
        .then(function () {
          return true;
        })
        .catch(function () {
          return fallback();
        });
    }
    return Promise.resolve(fallback());
  }

export function buildMailto(to, subject, body) {
    return (
      "mailto:" +
      to +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body)
    );
  }
