/* Owns offline navigation and service-worker registration only; must not contain catalogue behavior. */

/** Redirects a navigation to the offline recovery page when explicitly requested. */
export function openOfflinePage() {
  if (window.location.pathname.endsWith("/offline.html")) return;
  window.location.replace("offline/offline.html");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // Root sw.js is retained because plain static hosts cannot guarantee a
    // Service-Worker-Allowed header for a worker served from /offline/.
    navigator.serviceWorker.register("sw.js").catch(function (error) {
      console.warn("Offline fallback could not be registered:", error);
    });
  });
}
