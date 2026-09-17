/* Owns preloader animation lifecycle only; must not load data or wire catalogue controls. */
import { dom } from "./dom.js";
function startPreloaderAnimation() {
    if (!dom.preloader || !window.gsap) return;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    var logo = dom.preloader.querySelector(".preloader-logo");
    var word = dom.preloader.querySelector(".preloader-word");
    var bar = dom.preloader.querySelector(".preloader-bar");
    var fill = dom.preloader.querySelector(".preloader-bar-fill");
    var inner = dom.preloader.querySelector(".preloader-inner");

    window.gsap.set([logo, word, bar], { opacity: 0 });
    window.gsap.set(logo, { scale: 0.82, rotation: -6 });
    window.gsap.set(word, { y: 12 });
    window.gsap.set(bar, { y: 8 });
    window.gsap.set(fill, { xPercent: -120 });

    var intro = window.gsap.timeline();
    intro
      .to(logo, { opacity: 1, scale: 1, rotation: 0, duration: 0.75, ease: "back.out(1.7)" })
      .to(word, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.35")
      .to(bar, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");

    var pulse = window.gsap.to(logo, {
      scale: 1.06,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    var progress = window.gsap.to(fill, {
      xPercent: 220,
      duration: 1.35,
      repeat: -1,
      ease: "power1.inOut"
    });

    preloaderMotion = { intro: intro, pulse: pulse, progress: progress, inner: inner };
  }

export function hidePreloader() {
    if (preloaderHidden) return;
    var remaining = PRELOADER_MIN_DURATION - (Date.now() - preloaderStartedAt);
    if (remaining > 0) {
      setTimeout(hidePreloader, remaining);
