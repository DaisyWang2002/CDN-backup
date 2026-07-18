// ==UserScript==
// @name         Responsive Dumb Browser Viewport
// @namespace    https://greasyfork.org/users/your-name
// @version      1.2
// @description  Responsive max-500px grayscale viewport with scale, fake slow links, page delay, and video delay.
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/584207/Responsive%20Dumb%20Browser%20Viewport.user.js
// @updateURL https://update.greasyfork.org/scripts/584207/Responsive%20Dumb%20Browser%20Viewport.meta.js
// ==/UserScript==

(function () {
  "use strict";

  /*
    Main settings
  */
  const MAX_BOX_WIDTH = "1200px";
  const MAX_BOX_HEIGHT = "3200px";

  /*
    Mobile fit settings

    Width and height are capped at 500px, but shrink on small screens.
    Lower these if the box still feels too large on mobile.
  */
  const MOBILE_BOX_WIDTH = "92vw";
  const MOBILE_BOX_HEIGHT = "78vh";

  /*
    Scale setting

    1.0 = normal size
    0.9 = slightly smaller
    0.8 = much smaller
    1.1 = larger, not recommended on mobile
  */
  const PAGE_SCALE = 1.25;

  /*
    Delay settings

    PAGE_REVEAL_DELAY_MS hides the page after load, like slow loading.
    LINK_CLICK_DELAY_MS delays link navigation, like slow internet.
    VIDEO_START_DELAY_MS delays video playback after pressing play.
  */
  const PAGE_REVEAL_DELAY_MS = 700;
  const LINK_CLICK_DELAY_MS = 1200;
  const VIDEO_START_DELAY_MS = 1800;

  /*
    Visual degradation
  */
  const ENABLE_GRAYSCALE = true;
  const ENABLE_MONOSPACE_FONT = false;
  const ENABLE_NO_ROUNDED_CORNERS = false;
  const ENABLE_NO_ANIMATIONS = false;

  /*
    Internal state
  */
  let dumbBrowserAllowNavigation = false;

  function injectStyle() {
    if (document.getElementById("dumb-browser-viewport-style")) return;

    const grayscaleFilter = ENABLE_GRAYSCALE
      ? "grayscale(100%)"
      : "none";

    const monospaceRule = ENABLE_MONOSPACE_FONT
      ? "font-family: monospace !important;"
      : "";

    const noRoundedCornersRule = ENABLE_NO_ROUNDED_CORNERS
      ? "border-radius: 0 !important;"
      : "";

    const noAnimationsRule = ENABLE_NO_ANIMATIONS
      ? `
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      `
      : "";

    const style = document.createElement("style");
    style.id = "dumb-browser-viewport-style";

    style.textContent = `
      :root {
        --dumb-box-width: min(${MAX_BOX_WIDTH}, ${MOBILE_BOX_WIDTH});
        --dumb-box-height: min(${MAX_BOX_HEIGHT}, ${MOBILE_BOX_HEIGHT});
        --dumb-page-scale: ${PAGE_SCALE};
      }

      html {
        width: 100vw !important;
        height: 100vh !important;
        min-width: 100vw !important;
        min-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: #111 !important;
        filter: ${grayscaleFilter} !important;
      }

      body {
        width: var(--dumb-box-width) !important;
        height: var(--dumb-box-height) !important;
        max-width: var(--dumb-box-width) !important;
        max-height: var(--dumb-box-height) !important;

        position: fixed !important;
        left: 50% !important;
        top: 50% !important;

        transform:
          translate(-50%, -50%)
          scale(var(--dumb-page-scale)) !important;

        transform-origin: center center !important;

        margin: 0 !important;
        padding: 0 !important;

        overflow-x: auto !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;

        background: #fff !important;
        color: #000 !important;

        box-sizing: border-box !important;
        box-shadow: 0 0 0 9999px #111 !important;

        filter: ${grayscaleFilter} !important;
        opacity: 0 !important;

        ${monospaceRule}
      }

      body.dumb-browser-visible {
        opacity: 1 !important;
      }

      body,
      body * {
        box-sizing: border-box !important;
        filter: ${grayscaleFilter} !important;
        ${noRoundedCornersRule}
        ${noAnimationsRule}
      }

      img,
      video,
      canvas,
      iframe,
      svg,
      picture {
        filter: ${grayscaleFilter} !important;
      }
    `;

    document.documentElement.appendChild(style);
  }

  function revealPageAfterDelay() {
    const reveal = () => {
      if (!document.body) return;

      setTimeout(() => {
        document.body.classList.add("dumb-browser-visible");
      }, PAGE_REVEAL_DELAY_MS);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", reveal, { once: true });
    } else {
      reveal();
    }
  }

  function addSlowLinkClicks() {
    document.addEventListener(
      "click",
      function (event) {
        const link = event.target.closest && event.target.closest("a[href]");

        if (!link) return;
        if (dumbBrowserAllowNavigation) return;

        const href = link.href;

        if (!href) return;
        if (href.startsWith("javascript:")) return;
        if (href.startsWith("#")) return;

        event.preventDefault();
        event.stopPropagation();

        setTimeout(() => {
          dumbBrowserAllowNavigation = true;
          window.location.href = href;
        }, LINK_CLICK_DELAY_MS);
      },
      true
    );
  }

  function addVideoStartDelay() {
    const delayedVideos = new WeakSet();

    function patchVideo(video) {
      if (!video || delayedVideos.has(video)) return;

      video.addEventListener(
        "play",
        function () {
          if (video.dataset.dumbBrowserVideoAllowed === "true") {
            video.dataset.dumbBrowserVideoAllowed = "false";
            return;
          }

          video.pause();

          setTimeout(() => {
            video.dataset.dumbBrowserVideoAllowed = "true";
            video.play().catch(() => {
              /*
                Some browsers block programmatic play.
                If that happens, the user has to press play again.
              */
            });
          }, VIDEO_START_DELAY_MS);
        },
        true
      );

      delayedVideos.add(video);
    }

    function patchAllVideos() {
      document.querySelectorAll("video").forEach(patchVideo);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", patchAllVideos);
    } else {
      patchAllVideos();
    }

    const observer = new MutationObserver(() => {
      patchAllVideos();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  injectStyle();
  revealPageAfterDelay();
  addSlowLinkClicks();
  addVideoStartDelay();
})();
