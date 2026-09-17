/* Owns mutable application state only; must not render UI or attach event handlers. */
import { PAGE_SIZE, SAVED_STORAGE_KEY } from "./config.js";
import { safeGetLocal } from "./storage.js";
export const state = { papers: [], filtered: [], visibleCount: PAGE_SIZE, query: "", scope: "keywords", yearMin: null, yearMax: null, institution: "", field: "", litType: "", sort: "newest", savedOnly: false };
function loadSaved() { try { const raw = safeGetLocal(SAVED_STORAGE_KEY); const arr = raw ? JSON.parse(raw) : []; return new Set(Array.isArray(arr) ? arr : []); } catch (e) { return new Set(); } }
export const saved = loadSaved();
export const papersByKey = {};
export const dataBounds = { yearMin: 1980, yearMax: new Date().getFullYear() };
export const recentlyViewed = [];
export let currentDetailPaper = null;
export let lastFocusedBeforeModal = null;
export let tourIndex = 0;
export function setCurrentDetailPaper(paper) { currentDetailPaper = paper; }
export function setLastFocusedBeforeModal(element) { lastFocusedBeforeModal = element; }
export function setTourIndex(index) { tourIndex = index; }
