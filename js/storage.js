/* Owns guarded browser-storage access only; must not contain application state or UI behavior. */
export function safeGetLocal(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
export function safeSetLocal(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { } }
export function safeGetSession(key) { try { return window.sessionStorage.getItem(key); } catch (e) { return null; } }
export function safeSetSession(key, value) { try { window.sessionStorage.setItem(key, value); } catch (e) { } }
