/* Owns inline SVG icon constants and rendering only; must not contain UI state or event wiring. */
export const AREA_ICON_PATHS = {
    "fa-wheat-awn": '<path d="M12 21V4"/><circle cx="12" cy="5.5" r="1.15" fill="currentColor" stroke="none"/><circle cx="9.2" cy="8.6" r="1" fill="currentColor" stroke="none"/><circle cx="14.8" cy="8.6" r="1" fill="currentColor" stroke="none"/><circle cx="9.2" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="14.8" cy="12" r="1" fill="currentColor" stroke="none"/>',
    "fa-heartbeat": '<path d="M2.3 12.3h4l1.8-5 3 10.6 2-8 1.7 2.4h6.5"/>',
    "fa-gavel": '<rect x="11.6" y="2.6" width="4" height="7.2" rx="1" transform="rotate(45 13.6 6.2)"/><path d="M9.3 9.1L3.6 14.8M4.2 20.6h7.4"/>',
    "fa-handshake": '<circle cx="9" cy="12" r="4.1"/><circle cx="15" cy="12" r="4.1"/>',
    "fa-graduation-cap": '<path d="M12 5 2 9.5 12 14l10-4.5L12 5Z" stroke-linejoin="round"/><path d="M6 11.6V17c0 1 2.5 2.4 6 2.4s6-1.4 6-2.4v-5.4"/><path d="M21 9.5v5"/>',
    "fa-briefcase": '<rect x="3" y="8" width="18" height="11" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    "fa-scale-balanced": '<path d="M12 3v18M7 21h10"/><path d="M4 7h7M13 7h7"/><path d="M4 7l-2.5 5a2.5 2.5 0 0 0 5 0L4 7Z" stroke-linejoin="round"/><path d="M20 7l-2.5 5a2.5 2.5 0 0 0 5 0L20 7Z" stroke-linejoin="round"/>',
    "fa-child-reaching": '<circle cx="12" cy="5" r="2"/><path d="M12 7.1v6.8M12 9.2l4-4M12 9.2l-3 3M9 21l3-7M15 21l-3-7"/>',
    "fa-map-marked-alt": '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" stroke-linejoin="round"/><circle cx="12" cy="9.3" r="2.2"/>',
    "fa-landmark": '<path d="M3 21h18M4 21v-7M20 21v-7M2 10l10-6 10 6M7 10v7M12 10v7M17 10v7"/>',
    "fa-bus": '<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M3 11h18M6 8h4M14 8h4"/><circle cx="7.5" cy="18.4" r="1.5" fill="currentColor" stroke="none"/><circle cx="16.5" cy="18.4" r="1.5" fill="currentColor" stroke="none"/>',
    "fa-road": '<path d="M9 3 4 21M15 3l5 18"/><path d="M12 3.5v3M12 9.5v3M12 15.5v3"/>',
    "fa-building": '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M10 21v-4h4v4"/>',
    "fa-leaf": '<path d="M4 20c8 0 14-5 15-15C10 6 5 11 4 20Z" stroke-linejoin="round"/><path d="M6.5 17.5C10 13 14 10 18 6"/>',
    "fa-laptop": '<rect x="4" y="4.5" width="16" height="10.5" rx="1.2"/><path d="M2 18.5h20l-2-3H4l-2 3Z" stroke-linejoin="round"/>'
    };
export const AREA_ICON_FALLBACK = '<path d="M6 3h9l3 3v15H6z" stroke-linejoin="round"/><path d="M9 10h6M9 13.5h6M9 17h4"/>';
export function iconSvg(key) {
    var body = AREA_ICON_PATHS[key] || AREA_ICON_FALLBACK;
    return (
        '<span class="area-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        body +
        "</svg></span>"
    );
}
export const SVG_SAVE =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
export const SVG_SHARE =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="6" r="2.4" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="18" r="2.4" stroke="currentColor" stroke-width="1.8"/><path d="M8.1 10.8l7.8-4.2M8.1 13.2l7.8 4.2" stroke="currentColor" stroke-width="1.8"/></svg>';
export const SVG_REQUEST =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const SVG_EXTERNAL =
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const SVG_TOAST_OK =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5 10 17 19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const SVG_TOAST_ERR =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v6M12 16.5h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
export const SVG_EMPTY_SEARCH =
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-4.3-4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
export const SVG_EMPTY_SAVE =
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
export const SVG_ERROR = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

