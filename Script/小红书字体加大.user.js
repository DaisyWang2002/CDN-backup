
// ==UserScript==
// @name         小红书字体加大
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  小红书各个页面字体加大
// @author       Leslie
// @match        https://www.xiaohongshu.com/*
// @match        https://xhslink.com/*
// @grant        none
// @run-at       document-idle
// @license MIT


// ==/UserScript==

(() => {
  "use strict";

  const STYLE_ID = "tm-tweakers-fontsize-140";
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    /* Scale the site typographic base */
    html { font-size: 140% !important; }
  `;

  // Prefer <head>, but fall back if it isn't available yet.
  (document.head || document.documentElement).appendChild(style);
})();






