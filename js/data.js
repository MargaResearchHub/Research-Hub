/* Owns paper loading, normalization, and lookup only; must not render or wire controls. */
import { DATA_URL } from "./config.js";
import { stripCiteArtifacts } from "./utils.js";
import { papersByKey } from "./state.js";
/* Load the JSON file and convert every record into one consistent shape. */
export function parseFlag(v) {
    // Accepts a real JSON boolean, or common string spellings someone
    // hand-editing paper.json might type ("true", "yes", "1", blank, etc.)
    if (v === true) return true;
    if (typeof v === "string") return /^(true|yes|y|1)$/i.test(v.trim());
    return false;
  }

export function normalize(raw, index) {
    // Create safe, consistent values for the interface without changing the source record.
    var key = index + "::" + (raw.id || "noid");
    var yearStr = (raw.year || "").toString().trim();
    var yearNum = /^\d{4}$/.test(yearStr) ? parseInt(yearStr, 10) : null;
    var citationsNum =
      typeof raw.citations === "number"
        ? raw.citations
        : parseInt(raw.citations, 10) || 0;
    var title = (raw.title || "Untitled record").toString().trim();
    var authors = (raw.authors || "").toString().trim();
    var abstract = stripCiteArtifacts((raw.abstract || "").toString());

    var p = {
      key: key,
      id: (raw.id || "-").toString().trim() || "-",
      title: title,
      titleLower: title.toLowerCase(),
      authors: authors,
      authorsLower: authors.toLowerCase(),
      year: yearStr,
      yearNum: yearNum,
      partner: (raw.partner || "").toString().trim(),
      partnerName: (raw.partnerName || "").toString().trim(),
      isMarga: parseFlag(raw.isMarga),
      area: (raw.area || "").toString().trim(),
      areaName: (raw.areaName || "General").toString().trim(),
      areaIcon: (raw.areaIcon || "").toString().trim(),
      abstract: abstract,
      abstractLower: abstract.toLowerCase(),
      pdfUrl: (raw.pdfUrl || "").toString().trim(),
      citations: citationsNum,
      litType: (raw.litType || "").toString().trim().toLowerCase()
    };
    papersByKey[key] = p;
    return p;
  }

export function loadPapers() {
    return fetch(DATA_URL, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

export function findByKey(key) {
    return papersByKey[key] || null;
  }
