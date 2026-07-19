
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

(function() {
  'use strict';

  function addGlobalStyle(css) {
    var head = document.getElementsByTagName('head')[0]
    var style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = css
    head.appendChild(style)
  }

  addGlobalStyle('.note-scroller .footer { font-size: 200% }');
})();



