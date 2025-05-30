// ==UserScript==
// @name         dashboard unfucker
// @version      6.2.2
// @description  No more shitty twitter ui for pc
// @author       ClangPan
// @author       dragongirlsnout
// @match        https://www.tumblr.com/*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tumblr.com
// @downloadURL  https://raw.githubusercontent.com/ClangPan/dashboard-unfucker/main/unfucker.user.js
// @updateURL    https://raw.githubusercontent.com/ClangPan/dashboard-unfucker/main/unfucker.user.js
// @require      https://code.jquery.com/jquery-3.6.4.min.js
// @run-at       document-start
// ==/UserScript==

'use strict';
const $ = window.jQuery;

const main = async function (nonce) {
  const version = '6.2.2';

  //Supported pages
  const match = [
    '',
    'dashboard',
    'settings',
    'blog',
    'domains',
    'search',
    'likes',
    'following',
    'inbox',
    'tagged',
    'explore',
    'reblog',
    'communities',
  ];

  //State of the window
  let state = window.___INITIAL_STATE___;

  //Every value available for the config
  let configPreferences = {
    lastVersion: version,
    hideDashboardTabs: { advanced: false, type: 'checkbox', value: '' },
    collapseCaughtUp: { advanced: false, type: 'checkbox', value: '' },
    hideRecommendedBlogs: { advanced: false, type: 'checkbox', value: '' },
    hideRecommendedTags: { advanced: false, type: 'checkbox', value: '' },
    originalHeaders: { advanced: false, type: 'checkbox', value: 'checked'},
    hideTumblrRadar: { advanced: false, type: 'checkbox', value: '' },
    hideExplore: { advanced: false, type: 'checkbox', value: '' },
    hideTumblrShop: { advanced: false, type: 'checkbox', value: 'checked' },
    hidePremium: { advanced: false, type: 'checkbox', value: 'checked' },
    hideBadges: { advanced: false, type: 'checkbox', value: '' },
    highlightLikelyBots: { advanced: false, type: 'checkbox', value: '' },
    showFollowingLabel: { advanced: false, type: 'checkbox', value: '' },
    contentPositioning: { advanced: false, type: 'range', value: 0 },
    contentWidth: { advanced: false, type: 'range', value: 990 },
    messagingScale: { advanced: false, type: 'range', value: 1 },
    revertActivityFeedRedesign: { advanced: false, type: 'checkbox', value: 'checked' },
    revertMessagingRedesign: {
      advanced: false,
      type: 'checkbox',
      value: 'checked',
      style: '1',
      messageColor: 'f0f0f0',
      backgroundColor: 'ffffff',
      textColor: '121212'
    },
    disableTagNag: { advanced: false, type: 'checkbox', value: 'checked' },
    displayVoteCounts: { advanced: false, type: 'checkbox', value: '' },
    votelessResults : { advanced: false, type: 'checkbox', value: ''},
    disableScrollingAvatars: { advanced: false, type: 'checkbox', value: '' },
    originalEditorHeaders: { advanced: false, type: 'checkbox', value: '' },
    noBadgeBorder: { advanced: false, type: 'checkbox', value: '' },

    //Advanced features
    enableCustomTabs: { advanced: true, type: 'checkbox', value: '' },
    enableReblogPolls: { advanced: true, type: 'checkbox', value: '' },
    showNsfwPosts: { advanced: true, type: 'checkbox', value: '' },
  };

  let pathname = window.location.pathname.split('/')[1];
  const $a = selector => document.querySelectorAll(selector);
  const $ = selector => document.querySelector(selector);
  const $str = str => {
    let elem = document.createElement('div');
    elem.innerHTML = str;
    elem = elem.firstElementChild;
    return elem;
  };

  //Show/Hide an HTML node
  const hide = function (elem) {
    if (elem.length) elem.forEach(function (item) { item.style.display = 'none'; });
    else elem.style.display = 'none';
  };
  const show = function (elem) {
    if (elem.length) elem.forEach(function (item) { item.style.display = null; });
    else elem.style.display = null;
  };

  //Toggles an HTML component
  const toggle = (elem, toggle = 'ignore') => {
    if (elem && elem.length !== 0) {
      if (toggle === 'ignore') {
        elem.style.display === 'none'
          ? show(elem)
          : hide(elem);
      } else {
        toggle === true
          ? show(elem)
          : hide(elem);
      }
    }
  };

  //Represents a CSS entry
  const css = (elem, properties = {}) => {
    for (const property in properties) {
      elem.style[property] = properties[property];
    }
  };

  //Finds an HTML node inside another
  const find = (nodeList, selector) => {
    let elem;
    nodeList.forEach(currentValue => {
      if (currentValue.querySelector(`:scope ${selector}`)) {
        elem = currentValue;
      }
    });
    return elem;
  };

  //Remove one or multiple HMTL node(s)
  const remove = (nodeList) => {
    nodeList.forEach(currentValue => { currentValue.remove(); });
  };

  const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
  const matchPathname = () => match.includes(pathname);
  const isDashboard = () => ['dashboard', ''].includes(pathname);
  const storageAvailable = type => { // thanks mdn web docs!
    let storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException && (
          e.code === 22 ||
          e.code === 1014 ||
          e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        ) &&
          storage &&
          storage.length !== 0
      );
    }
  };

  //Wait for element to be available
  const waitFor = (selector, scope = document, retried = 0) => new Promise((resolve) => {
    if (scope.querySelector(selector)) { resolve(); } else if (retried < 50) { window.requestAnimationFrame(() => waitFor(selector, scope, retried + 1).then(resolve)); }
  });

  //Updates the configs
  const updatePreferences = () => {
    window.localStorage.setItem('configPreferences', JSON.stringify(configPreferences));
  };

  //Get and process the CSS map
  const getUtilities = async function () {
    let retries = 0;
    while (retries++ < 1000 && (typeof window.tumblr === 'undefined' || typeof window.tumblr.getCssMap === 'undefined')) {
      await new Promise((resolve) => setTimeout(resolve));
    }
    const cssMap = await window.tumblr.getCssMap();
    const keyToClasses = (...keys) => keys.flatMap(key => cssMap[key]).filter(Boolean);
    const keyToCss = (...keys) => `:is(${keyToClasses(...keys).map(className => `.${className}`).join(', ')})`;
    const tr = string => `${window.tumblr.languageData.translations[string] || string}`;
    return { keyToClasses, keyToCss, tr };
  };

  //CSS for nonce
  const style = $str(`
    <style nonce="${nonce}">
      #base-container > div[class]:not(#adBanner) > div:first-child {
        z-index: 100;
        border-bottom: 1px solid rgba(var(--white-on-dark),.13) !important;
        position: -webkit-sticky !important;
        position: sticky !important;
        top: 0 !important;
        min-height: unset !important;
        background-color: rgb(var(--navy));
      }
    </style>
  `);

  let localAddedPostFlag = true;
  const addedPosts = [
  ];

  //Utilities for fetch
  const timelineSelector = /\/api\/v2\/timeline/;
  const peeprSelector = new RegExp(`/\/api\/v2\/blog\/${pathname}\/posts/`);
  const isPostFetch = input => {
    if (timelineSelector.test(input) || peeprSelector.test(input)) return true;
    else return false;
  };

  //Fetches the new posts in the timeline, and display the NSFW ones
  const oldFetch = window.fetch;
  window.fetch = async (input, options) => {
    const response = await oldFetch(input, options);
    let content = await response.text();
    if (isPostFetch(input) && configPreferences.showNsfwPosts.value) {
      console.info(`Modified data fetched from ${input}`);
      content = JSON.parse(content);
      const elements = content.response.timeline.elements;
      elements.forEach(function (post) { post.isNsfw = false; });
      if (timelineSelector.test(input) && localAddedPostFlag && typeof window.tumblr.apiFetch !== 'undefined') {
        for (const id of addedPosts) {
          let addedPost;
          await window.tumblr.apiFetch(`/v2/blog/clangpan/posts/${id}?fields[blogs]=name,avatar,title,url,blog_view_url,is_adult,description_npf,uuid,can_be_followed,?followed`).then(response => {
            if (response && response?.meta.status === 200) {
              const data = response.response;
              addedPost = data;
            }
          });
          if (typeof addedPost !== 'undefined') elements.push(addedPost);
        }
        localAddedPostFlag = false;
        updatePreferences();
      }
      content = JSON.stringify(content);
    }
    return new Response(content, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  };

  //Reads or create a new config in "localStorage" is it's available
  if (storageAvailable('localStorage')) {
    if (!window.localStorage.getItem('configPreferences') || Array.isArray(JSON.parse(window.localStorage.getItem('configPreferences')))) {
      updatePreferences();
      console.log('Initialized preferences');
    } else {
      const currentPreferences = JSON.parse(window.localStorage.getItem('configPreferences'));
      const currentKeys = Object.keys(currentPreferences);
      for (const key in configPreferences) {
        if (currentKeys.includes(key)) {
          if (typeof configPreferences[key] === 'object') {
            Object.keys(configPreferences[key]).forEach(function (val) {
              if (!(val in currentPreferences[key])) {
                currentPreferences[key][val] = configPreferences[key][val];
              }
            });
          }
          configPreferences[key] = currentPreferences[key];
        }
      }
      configPreferences.disableTagNag.advanced = false;
      updatePreferences();
    }
  }

  //Display the hidden NSFW posts
  const modifyInitialTimeline = (obj, context) => {
    if (!obj || !configPreferences.showNsfwPosts.value) return obj;
    else if (context === 'dashboard') {
      obj.dashboardTimeline.response.timeline.elements.forEach(function (post) { post.isNsfw = false; });
    } else if (context === 'peepr') {
      obj.initialTimeline.objects.forEach(function (post) { post.isNsfw = false; });
    }
    console.log(obj);
    return obj;
  };

  //Modify the features to inject our special config
  const modifyObfuscatedFeatures = (obfuscatedFeatures, featureSet) => {
    const obf = JSON.parse(atob(obfuscatedFeatures));
    for (const x of featureSet) {
      obf[x.name] = x.value;
    }
    return btoa(JSON.stringify(obf));
  };

  //The features to enable/disable (the options included in the "Advanced configuration" part)
  const featureSet = [
    { name: 'redpopDesktopVerticalNav', value: false }, //Reverts the Twitter UI redesign
    { name: 'configurableTabbedDash', value: !!configPreferences.enableCustomTabs.value }, //Doesn't seem to do anything anymore? Keeping it in case it does for some people
    { name: 'allowAddingPollsToReblogs', value: !!configPreferences.enableReblogPolls.value }, //Allows adding polls to reblogs
    { name: 'crowdsignalPollsNpf', value: true },
    { name: 'crowdsignalPollsCreate', value: true },
    { name: 'adFreeCtaBanner', value: false },
  ];

  //Initial state of the window
  Object.defineProperty(window, '___INITIAL_STATE___', { // thanks twilight-sparkle-irl!
    set (x) {
      state = x;
    },
    get () {
      try {
        return {
          ...state,
          Dashboard: modifyInitialTimeline(state.Dashboard, 'dashboard'),
          PeeprRoute: modifyInitialTimeline(state.PeeprRoute, 'peepr'),
          obfuscatedFeatures: modifyObfuscatedFeatures(state.obfuscatedFeatures, featureSet)
        };
      } catch (e) {
        console.error('Failed to modify features', e);
      }
      return state;
    },
    enumerable: true,
    configurable: true
  });

  //Appends the "nonce" style to the head
  document.head.appendChild(style);

  //Injecting the initial state before the page loads fully
  //I am not satisfied with this solution for some reason, but het it works
  //Thanks to twilight-sparkle-irl for angling me in the correct direction
  document.onreadystatechange = function () {
      if (document.readyState === "interactive") {
          state = JSON.parse(document.scripts.___INITIAL_STATE___.innerHTML);
          state = window.___INITIAL_STATE___;
          document.scripts.___INITIAL_STATE___.innerHTML = JSON.stringify(state);
      }
  };

  //Fires when the page is loaded
  document.addEventListener('DOMContentLoaded', () => {
    getUtilities().then(({ keyToCss, keyToClasses, tr }) => {
      let windowWidth = window.innerWidth;
      let safeOffset = (windowWidth - 1000) / 2;
      if (Math.abs(configPreferences.contentPositioning.value) > safeOffset) configPreferences.contentPositioning.value = 0;
      if (configPreferences.contentWidth.value < 990 || configPreferences.contentWidth.value > windowWidth) configPreferences.contentWidth.value = 990;
      if (configPreferences.messagingScale.value < 1 || configPreferences.messagingScale.value > 2) configPreferences.messagingScale = 1;

      const postSelector = '[tabindex="-1"][data-id] article';
      const postHeaderTargetSelector = `${keyToCss('main')} > :not(${keyToCss('blogTimeline')}) ${keyToCss('timeline')}:not([data-timeline*='posts/'],${keyToCss('masonry')}) [tabindex='-1'][data-id] article:not(.__avatarFixed)`;
      const noteSelector = `[aria-label="${tr('Notification')}"],[aria-label="${tr('Unread Notification')}"]`;
      const answerSelector = '[data-testid="poll-answer"]:not(.__pollDetailed)';
      const pollBlockSelector = '[data-attribution="poll-block"]';
      const voteSelector = `button${keyToCss('vote')}:not(.__pollResultsShown)`;
      const conversationSelector = '[data-skip-glass-focus-trap]';
      const carouselCellSelector = `[data-cell-id] ${keyToCss('tagCard')}, [data-cell-id] ${keyToCss('blogRecommendation')}, [data-cell-id] ${keyToCss('tagChicletLink')}`;
      const masonryNotesSelector = `[data-timeline]${keyToCss('masonry')} article ${keyToCss('formattedNoteCount')}`;
      const containerSelector = `${keyToCss('bluespaceLayout')} > ${keyToCss('container')}:not(${keyToCss('mainContentIs4ColumnMasonry')})`;

      const tsKey = 'lastSeenNoTagPromptTsKey';

      const newNodes = [];
      const target = document.getElementById('root');

      //Styles the existing elements
      const styleElement = $str(`
        <style id='__s'>
          /* Config window */
          #__m {
            margin-bottom: 20px;
            position: relative;
          }
          #__m button {
            position: relative;
          }
          #__in {
            padding: 8px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          #__in h1 {
            color: rgb(var(--white-on-dark));
            font-size: 1.2em;
            display: inline;
          }
          #__m ul {
            max-height: 360px;
            margin: 0 4px 8px;
            padding: 0;
            background: RGB(var(--white));
            border-radius: 0 0 3px 3px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(var(--black),.4)rgba(var(--white),.1);
          }
          #__m ul.submenu {
            margin: 0;
            padding: 0 16px;
            display: none;
            border-bottom: 1px solid rgba(var(--black),.07);
          }
          #__m li[active="true"] + ul.submenu { display: block; }
          #__m li {
            list-style-type: none;
            padding: 8px 12px;
            border-bottom: 1px solid rgba(var(--black),.07);
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: rgb(var(--black));
          }
          #__m li:last-of-type, #__m li[active="true"] { border: none; }
          #__m li span:not(.infoHeader > span) { max-width: 240px; }
          .__n {
            position: absolute;
          }
          #__in > .__n {
            color: var(--accent);
            top: -6px;
            left: 220px;
          }
          button .__n {
            content: "";
            border-radius: 50%;
            border: solid 4px var(--accent);
            top: 0px;
            right: -6px;
          }
          .infoHeader {
            color: rgb(var(--navy)) !important;
            background: var(--accent);
            padding: 12px 12px;
            font-weight: bold;
            margin: 0 4px;
            border-radius: 3px 3px 0 0;
          }
          .configInput[type="checkbox"],
          .subConfigInput[type="radio"] {
            height: 0;
            width: 0;
            visibility: hidden;
            margin: 0;
          }
          .configInput[type="checkbox"] + label {
            cursor: pointer;
            text-indent: -9999px;
            width: 36px;
            height: 18px;
            background: rgb(var(--secondary-accent));
            transition: 0.3s;
            display: block;
            border-radius: 18px;
            position: relative;
          }
          .configInput[type="checkbox"] + label:after {
            content: "";
            position: absolute;
            top: 2px;
            left: 2px;
            width: 14px;
            height: 14px;
            background: rgb(var(--white));
            border-radius: 7px;
            transition: 0.3s;
          }
          .configInput:checked + label { background: var(--accent); }
          .configInput:checked + label:after {
            left: calc(100% - 2px);
            transform: translateX(-100%);
            background: rgb(var(--white-on-dark));
          }
          .configInput[type="checkbox"] + label:active:after { width: 20px; }
          .subConfigInput[type="radio"] + label {
            cursor: pointer;
            text-indent: -9999px;
            position: relative;
            height: 12px;
            width: 12px;
            border: 2px solid var(--accent);
            border-radius: 50%;
          }
          .subConfigInput[type="radio"] + label:after {
            content: "";
            position: absolute;
            top: 2px;
            left: 2px;
            height: 8px;
            width: 8px;
            border-radius: 50%;
          }
          .subConfigInput[type="radio"]:checked + label:after {  background: var(--accent); }
          .subConfigInput[type="radio"]:not(:checked) + label:hover:after {  background: rgba(var(--accent),.3); }
          .textInput {
            border: 2px solid var(--accent);
            border-radius: 3px;
            width: 48px;
          }
          .textInput + span:after {
            padding-left: 5px;
            font-weight: bold;
          }
          .textInput:invalid + span:after {
            content: "✖";
            color: rgb(var(--red));
          }
          .textInput:valid + span::after {
            content: "✓";
            color: rgb(var(--green));
          }
          .rangeInput {
            width: 160px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .configInput[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
          }
          .configInput[type="range"]:focus { outline: none; }
          .configInput[type="range"]::-webkit-slider-runnable-track,
          .configInput[type="range"]::-moz-range-track {
            background: var(--accent);
            border-radius: 1rem;
            height: 0.5rem;
          }
          .configInput[type="range"]::-webkit-slider-thumb,
          .configInput[type="range"]::-moz-range-track::-moz-range-thumb {
            -webkit-appearance: none;
            appearance: none;
            border: none;
            margin-top: -4px;
            background-color: rgb(var(--white-on-dark));
            border-radius: 50%;
            height: 1rem;
            width: 1rem;
          }
          .rangeInput datalist {
            display: flex;
            justify-content: space-between;
          }
          #__cio {
            display: flex;
            flex-flow: row nowrap;
            justify-content: space-between;
            margin: 4px 4px 8px;
          }
          .iOButton {
            color: rgb(var(--navy));
            width: 49%;
            background: var(--accent);
            border-radius: var(--border-radius-small);
            font-size: 20px;
            padding: 4px;
          }
          #__im {
            position: absolute;
            top: 80px;
            left: 0;
            font-size: 20px;
            color: rgb(var(--black));
            transition: opacity .6s ease-in;
            background: var(--accent);
            padding: 8px;
            text-align: center;
            border-radius: var(--border-radius-small);
            opacity: 0;
          }

          /* Avatar in header */
          article.__headerFixed header ${keyToCss('communityLabel')} { display: none !important; }
          .__reblogIcon {
            height: 14px;
            display: inline-block;
            transform: translateY(3px);
            margin: 0 5px;
          }
          .__userAvatarWrapper {
            top: 0;
            position: absolute;
            left: -84px;
          }
          .__userAvatarWrapper > ${keyToCss('avatar')} {
            position: absolute !important;
            top: 0 !important;
          }

          /* Sticky avatar next to posts */
          .__stickyContainer {
            color: RGB(var(--white-on-dark));
            height: 100%;
            position: absolute;
            left: -84px;
            padding: 0;
          }
          .__stickyContainer > ${keyToCss('avatar')} {
            position: sticky;
            top: 69px;
            transition: top .25s;
          }
          .__stickyContainer ${keyToCss('blogLink')} > ${keyToCss('avatar')},
            .__stickyContainer ${keyToCss('blogLink')} > ${keyToCss('avatar')} ${keyToCss('image')},
            .__stickyContainer ${keyToCss('anonymous')} {
            width: 64px !important;
            height: 64px !important;
          }
          .__stickyContainer ${keyToCss('blogLink')} > ${keyToCss('subavatar')},
            .__stickyContainer ${keyToCss('blogLink')} > ${keyToCss('subavatar')} ${keyToCss('image')} {
            width: 32px !important;
            height: 32px !important;
          }
          .__stickyContainer ${keyToCss('badge')} { display: none; }
          .__avatarWrapper { position: relative; }
          .__blogLink {
            cursor: pointer;
            word-break: break-word;
            text-decoration: none;
          }

          .__targetWrapper {
            width: inherit;
            vertical-align: top;
            display: inline-block;
          }
          .__avatarInner { position: relative; }
          .__avatarWrapperInner {
            border-radius: var(--border-radius-small);
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          .__placeholder {
            width: 100%;
            line-height: 0;
            position: relative;
          }
          .__avatarImage {
            position: absolute;
            top: 0;
            left: 0;
            object-fit: cover;
            visibility: visible;
          }

          /* Labels inside the activity feed */
          .customLabelContainer {
            white-space: nowrap;
            border-radius: 4px;
            padding: 0 4px;
            font-size: .78125rem;
            font-weight: 700;
            line-height: 1.52;
            display: inline-block;
          }
          .customLabelContainer[label="Follows You"] {
            color: rgb(var(--blue));
            background-color: rgba(var(--blue),.2);
          }
          .customLabelContainer[label="Possible Bot"] {
            color: rgb(var(--red));
            background-color: rgba(var(--red),.2);
          }
          .customLabelContainer[label="Possible Bot"]::after {
            content: "about";
            border-bottom: 1px solid rgb(var(--red));
            font-size: 12px;
            margin-left: 5px;
          }
          .customLabelIcon {
            vertical-align: middle;
            margin-left: 4px;
            position: relative;
            bottom: 1px;
          }
          .customLabelInfo {
            visibility: hidden;
            opacity: 0;
            width: 240px;
            background-color: rgb(var(--white));
            box-shadow: 2px 2px rgba(var(--black),.07);
            color: inherit;
            text-align: center;
            padding: 2px;
            border-radius: var(--border-radius-small);
            position: absolute;
            z-index: 2;
            top: 24px;
            left: 0;
            transition: opacity 0.5s;
            white-space: initial;
          }
          .customLabelContainer:hover .customLabelInfo {
            visibility: visible;
            opacity: 1;
          }

          /* Numerical value of votes in polls */
          .answerVoteCount {
            position: absolute;
            bottom: -2px;
            right: 16px;
            font-size: 12px;
          }

          /* Percentage of votes in polls */
          .__percentage {
            position: absolute;
            content: "";
            height: 100%;
            top: 0;
            left: 0;
            background: rgba(var(--blue),.2);
            border-radius: 18px;
          }

          #tumblr { --dashboard-tabs-header-height: 0px !important; }
          ${keyToCss('navItem')}:has(use[href="#managed-icon__sparkle"]) { display: none !important; }
          ${keyToCss('bluespaceLayout')} > ${keyToCss('container')} { position: relative; }
          [data-blog-container], [data-blog-container] ${keyToCss('layout')}, [data-blog-container] ${keyToCss('sidebar')},
          [data-blog-container] ${keyToCss('sidebarTopContainer')} { width: fit-content !important; }
          ${keyToCss('main')} {
            position: relative;
            flex: 1;
            min-width: 0;
            max-width: none !important;
          }

          ${keyToCss('main')}:not(${keyToCss('body')} > ${keyToCss('main')}) {
            top: -100px;
            padding-top: 100px;
          }

          ${keyToCss('body')} > header,
          ${keyToCss('body')} > ${keyToCss('toolbar')} {
            z-index: 1;
          }

          ${keyToCss('tabsHeader')} {
            top: 0;
            position: relative;
          }

          ${keyToCss('postColumn')} { max-width: calc(100% - 85px); }
          ${keyToCss('post')}, ${keyToCss('post')} > * { max-width: 100%; }
          ${keyToCss('cell')},
          ${keyToCss('link')},
          ${keyToCss('reblog')},
          ${keyToCss('videoBlock')},
          ${keyToCss('videoBlock')} iframe,
          ${keyToCss('audioBlock')} { max-width: none !important; }
          ${keyToCss('queueSettings')} {
            width: calc(100% - 85px);
            box-sizing: border-box;
          }

          ${keyToCss('postColumn')} > ${keyToCss('bar')},
            ${keyToCss('activityPopover')} ${keyToCss('selectorPopover')},
            ${keyToCss('tabManagement')}, ${keyToCss('selectorPopover')}:has(${keyToCss('blogsList')}),
            [data-timeline] article,
            [data-timeline] article ${keyToCss('footerWrapper')} { border-radius: 3px !important; }
          [data-timeline] article header { border-radius: 3px 3px 0 0 !important; }

          ${keyToCss('toastHolder')} { display: none; }

          /* Hides the side search bar, redundant */
          ${keyToCss('searchSidebarItem')} { display: none; }

          aside > button${keyToCss('expandOnHover')} { display: none !important; }

          /* Hide the Tumblr domain entry in setting, for now no settings for it, but if I can add it if asked for it */
          li > a[href='/settings/domains']  { display: none !important; }

          button${keyToCss('pollAnswer')} { overflow: clip; }

          figure${keyToCss('anonymous')} { background-image: url(https://assets.tumblr.com/pop/src/assets/images/avatar/anonymous_avatar_96-223fabe0.png) !important; }

          ${keyToCss('attribution')} > ${keyToCss('badgeContainer')} { margin-left: 5px; }
        </style>
      `);

      //Retrieve the UserName
      const userName = state.queries.queries[0].state.data.user.name;

      //Several color utilities
      const hexToRgb = (hex = '') => {
        hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => {
          return r + r + g + g + b + b;
        });
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            }
          : null;
      };

      const luminance = ({ r, g, b }) => {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      };

      const ratio = (lum1, lum2) => lum1 > lum2 ? ((lum2 + 0.05) / (lum1 + 0.05)) : ((lum1 + 0.05) / (lum2 + 0.05));
      const contrast = (hex1, hex2) => {
        const lum1 = luminance(hexToRgb(hex1));
        const lum2 = luminance(hexToRgb(hex2));
        return ratio(lum1, lum2);
      };

      //Returns black or white, depending on which is more readable on the color provided
      const contrastBW = hex => {
        const lum = luminance(hexToRgb(hex));
        const lumBlk = luminance({ r: 12, g: 12, b: 12 });
        const lumWht = luminance({ r: 255, g: 255, b: 255 });
        const ratioBlk = ratio(lum, lumBlk);
        const ratioWht = ratio(lum, lumWht);
        if (ratioBlk < ratioWht) return '12,12,12';
        else return '255,255,255';
      };

      const rgbToString = ({ r, g, b }) => `${r},${g},${b}`;

      const fetchNpf = obj => {
        const fiberKey = Object.keys(obj).find(key => key.startsWith('__reactFiber'));
        let fiber = obj[fiberKey];

        while (fiber !== null) {
          const { timelineObject } = fiber.memoizedProps || {};
          if (timelineObject !== undefined) {
            return timelineObject;
          } else {
            fiber = fiber.return;
          }
        }
      };

      //HTML for the reblog icon
      const reblogIcon = () => $str(`
        <span class="__reblogIcon">
          <svg xmlns="http://www.w3.org/2000/svg" height="15" width="15" role="presentation" style="--icon-color-primary: rgba(var(--black), 0.65);">
            <use href="#managed-icon__reblog-compact"></use>
          </svg>
        </span>
      `);

      //Reverts the headers avatars to the old style
      const fixHeaderAvatar = posts => {
        for (const post of posts) {
          try {
            const stickyContainer = $str(`<div class="__stickyContainer"></div>`);
            const avatar = post.querySelector(`header > ${keyToCss('avatar')}`);

            post.prepend(stickyContainer);
            stickyContainer.append(avatar);
            avatar.querySelector(`${keyToCss('targetWrapper')} img`).sizes = "64px";
            avatar.querySelectorAll(`${keyToCss('subAvatarTargetWrapper')} img`).forEach(img => {img.sizes = "32px"});
            post.classList.add('__avatarFixed');
          } catch (e) {
            console.error('An error occurred processing a post avatar:', e);
            console.error(post);
            console.error(fetchNpf(post));
          }
        }
      };

      //Reverts the headers to the old style
      const fixHeader = posts => {
        for (const post of posts) {
          if (window.location.pathname.split('/').some(x => ['inbox', 'messages'].includes(x))) return;
          try {
            const { id, parentPostUrl } = fetchNpf(post);
            post.id = `post${id}`;

            const header = post.querySelector('header');
            const attribution = header.querySelector(keyToCss('attribution'));
            let rebloggedFrom = attribution.querySelector(keyToCss('rebloggedFromName'));
            let addingNewRebloggedFrom = false;
            let rebloggedFromName;

            if (parentPostUrl) rebloggedFromName = parentPostUrl.split('/')[3];
            if (!rebloggedFrom && rebloggedFromName) {
              const labels = post.querySelectorAll(`:scope ${keyToCss('username')} ${keyToCss('label')}`);
              if (labels.length !== 0) {
                addingNewRebloggedFrom = true;
                rebloggedFrom = [...labels].find(node => node.querySelector(keyToCss('attribution')).innerText === rebloggedFromName).cloneNode(true);
                const classes = keyToClasses('rebloggedFromName');
                rebloggedFrom.classList.add(...classes);
                css(rebloggedFrom.querySelector(keyToCss('attribution')), { color: 'rgba(var(--black),.65)' });
                const follow = rebloggedFrom.querySelector(keyToCss('followButton'));
                if (follow) hide(follow);
              }
            }

            [...attribution.childNodes].filter(node => node.nodeName === '#text').forEach(function (node) {node.textContent = ''});
            if (addingNewRebloggedFrom) attribution.append(rebloggedFrom);
            if (rebloggedFrom && !header.querySelector('.__reblogIcon')) {
              rebloggedFrom.before(reblogIcon());
            }

            post.classList.add('__headerFixed');
          } catch (e) {
            console.error('An error occurred processing a post header:', e);
            console.error(post);
            console.error(fetchNpf(post));
          }
        }
      };

      //HTML for the avatar beside posts
      const userAvatar = name => $str(`
        <div class="__avatarOuter">
          <div class="__avatarWrapper" role="figure" aria-label="${tr("avatar")}">
            <span class="__targetWrapper">
              <a href="https://${name}.tumblr.com/" title="${name}" rel="noopener" role="link" class="__blogLink" tabindex="0">
                <div class="__avatarInner" style="width: 64px; height: 64px;">
                  <div class="__avatarWrapperInner">
                    <div class="__placeholder" style="padding-bottom: 100%;">
                      <img
                      class="__avatarImage"
                      srcset="https://api.tumblr.com/v2/blog/${name}/avatar/64 64w,
                              https://api.tumblr.com/v2/blog/${name}/avatar/96 96w,
                              https://api.tumblr.com/v2/blog/${name}/avatar/128 128w,
                              https://api.tumblr.com/v2/blog/${name}/avatar/512 512w"
                      sizes="64px"
                      alt="${tr("Avatar")}"
                      style="width: 64px; height: 64px;"
                      loading="eager">
                    </div>
                  </div>
                </div>
              </a>
            </span>
          </div>
        </div>
      `);

      //Creates a link into the avatar on the side of posts
      const blogViewLink = avatar => {
        const links = avatar.querySelectorAll('a');
        links.forEach(link => {
          const name = link.getAttribute('title');
          link.addEventListener('click', event => {
            event.preventDefault();
            window.tumblr.navigate(`/${name}`);
          });
        });
      };

      //Adds the user's avatar beside the header
      const addUserPortrait = () => {
        const bar = $(`${keyToCss('postColumn')} > ${keyToCss('bar')}`);
        if (bar) {
          const userAvatarWrapper = $str('<div class="__userAvatarWrapper"></div>');
          bar.prepend(userAvatarWrapper);
          if (pathname === 'blog') userAvatarWrapper.append(userAvatar(location.pathname.split('/')[2]));
          else userAvatarWrapper.append(userAvatar(userName));
          blogViewLink(userAvatarWrapper);
        }
      };

      //Fetches a specific note
      const fetchNote = obj => {
        const fiberKey = Object.keys(obj).find(key => key.startsWith('__reactFiber'));
        let fiber = obj[fiberKey];

        while (fiber !== null) {
          const { notification } = fiber.memoizedProps || {};
          if (notification !== undefined) {
            return notification;
          } else {
            fiber = fiber.return;
          }
        }
      };

      //HTML for the labels in the notes
      const labelContainer = (label, icon, desc) => $str(`
        <div class="customLabelContainer" label="${label}">
          ${label}
          <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" class="customLabelIcon" role="presentation" style="--icon-color-primary: rgb(var(--${label === 'Follows You' ? 'blue' : 'red'}))">
            <use href="#managed-icon__${icon}"></use>
          </svg>
          <span class="customLabelInfo ${icon}">${desc}</span>
        </div>
      `);

      //"Untitled" in multiple language to test for bots
      const untitledStrings = [
        'Untitled', // en
        'Sans titre', // fr
        'Intitulado', // es
        'Ohne titel', // de
        'Senza titolo', // it
        '無題', // jp
        'Başlıksız', // tr
        'Без названия', // ru
        'Bez tytułu', // pl
        'Sem título', // pt
        'Ongetiteld', // nl
        '무제', // ko
        '无标题', // zh
        'Tanpa judul', // id
        'शीर्षकहीन' // hi
      ];

      //Scan notes and add the "Follows You" or "Possible Bot" labels
      const scanNotes = notes => {
        for (const note of notes) {
          try {
            const { followingYou, mutuals, type, fromTumblelogUuid } = fetchNote(note);
            if (configPreferences.highlightLikelyBots.value && type === 'follower') {
              window.tumblr.apiFetch(`/v2/blog/${fromTumblelogUuid}/info`).then(response => {
                const { title, name, posts, likes } = response.response.blog;
                if (untitledStrings.includes(title)
                && ([0,1].includes(posts) || likes === 0)
                || (name === title && posts === 1)) {
                  hide(note.querySelector('.customLabelContainer'));
                  css(note, { backgroundColor: 'rgba(255,37,47,.15)' });
                  note.querySelector(keyToCss('tumblelogName')).append(labelContainer('Possible Bot', 'warning-circle', 'This blog may be a bot; block at your own discretion. This feature is a component of dashboard unfucker.'));
                }
              });
            }
            if (configPreferences.showFollowingLabel.value && followingYou && !mutuals && !note.querySelector('.customLabelContainer')) {
              note.querySelector(keyToCss('tumblelogName')).append(labelContainer('Follows You', 'profile-checkmark', 'This blog follows you. This feature is a component of dashboard unfucker.'));
            }
          } catch (e) {
            console.error('an error occurred processing a notification:', e);
            console.error(note);
            console.error(fetchNote(note));
          }
        }
      };

      //Gives the numerical count of votes of a single choice in polls
      const fetchPercentage = obj => {
        const fiberKey = Object.keys(obj).find(key => key.startsWith('__reactFiber'));
        let fiber = obj[fiberKey];

        while (fiber !== null) {
          const { percentage } = fiber.memoizedProps || {};
          if (percentage !== undefined) {
            return percentage;
          } else {
            fiber = fiber.return;
          }
        }
      };

      //Gives the numerical count of votes in polls
      const detailPolls = answers => {
        for (const answer of answers) {
          if (answer.classList.contains('__pollDetailed')) continue;
          const pollBlock = answer.closest(pollBlockSelector);
          const answers = Array.from(pollBlock.querySelectorAll(':scope [data-testid="poll-answer"]'));
          const voteCount = Number(pollBlock.querySelector(keyToCss('pollSummary')).innerText.replace(/,/, '').match(/\d+/)[0]);
          answers.forEach(element => {
            const percentage = fetchPercentage(element);
            element.append($str(`<span class="answerVoteCount">(${Math.round(voteCount * percentage / 100)})</span>`));
            element.classList.add('__pollDetailed');
          });
        }
      };

      //Fetches the results of a poll
      const fetchPollResults = obj => {
        const fiberKey = Object.keys(obj).find(key => key.startsWith('__reactFiber'));
        let fiber = obj[fiberKey];

        while (fiber !== null) {
          const { percentage, answer } = fiber.memoizedProps || {};
          if (percentage !== undefined && answer !== undefined) {
            return `${percentage}%`;
          } else {
            fiber = fiber.return;
          }
        }
      }

      //Modifies the poll buttons to include percentage
      const pollResults = buttons => {
        for (const button of buttons) {
          const percentage = $str('<div class="__percentage"></div>');

          button.prepend(percentage);
          percentage.style.width = fetchPollResults(button);

          button.classList.add('__pollResultsShown');
        }
      }

      //Fetches the other person's blog in a conversation
      const fetchOtherBlog = async function (obj) {
        const fiberKey = Object.keys(obj).find(key => key.startsWith('__reactFiber'));
        let fiber = obj[fiberKey];
        let conversationWindowObject;
        let headerImageFocused;
        let backgroundColor;
        let titleColor;
        let linkColor;

        while (fiber !== null) {
          ({ conversationWindowObject } = fiber.memoizedProps || {});
          if (conversationWindowObject !== undefined) {
            break;
          } else {
            fiber = fiber.return;
          }
        }

        const { otherParticipantName, selectedBlogName } = conversationWindowObject;

        //Retrieve the other's blog info
        try {
          await window.tumblr.apiFetch(`/v2/blog/${otherParticipantName}/info?fields[blogs]=theme`).then(response => {
            ({ headerImageFocused, backgroundColor, titleColor, linkColor } = response.response.blog.theme);
          });
        } catch (e) {
          console.error(`Failed to fetch the theme for blog ${otherParticipantName}`);
        }

        return ({ headerImageFocused, backgroundColor, titleColor, linkColor, otherParticipantName, selectedBlogName });
      };

      //Css for the conversation popup
      const styleMessaging = conversations => {
        for (const conversation of conversations) {
          fetchOtherBlog(conversation).then(({ headerImageFocused, backgroundColor, titleColor, linkColor, otherParticipantName, selectedBlogName }) => {
            conversation.id = `messaging-${otherParticipantName}`;
            const colorStyle = configPreferences.revertMessagingRedesign.style;
            let msgBackground;
            let tsColor;
            let headerBackground;
            //Use blog colors
            if (colorStyle === '1') {
              headerBackground = `no-repeat top/100% url(${headerImageFocused})`;
              msgBackground = contrastBW(titleColor);
              tsColor = contrastBW(backgroundColor);
              if (contrast(linkColor, backgroundColor) > 0.33) {
                linkColor = tsColor;
              } else linkColor = rgbToString(hexToRgb(linkColor));
              titleColor = rgbToString(hexToRgb(titleColor));
            //Use theme colors
            } else if (colorStyle === '2') {
              headerBackground = 'rgb(var(--white))';
              backgroundColor = headerBackground;
              msgBackground = 'var(--secondary-accent)';
              titleColor = 'var(--black)';
              linkColor = titleColor;
              tsColor = titleColor;
            //Use custom colors
            } else if (colorStyle === '3') {
              headerBackground = 'rgb(var(--white))';
              backgroundColor = `#${configPreferences.revertMessagingRedesign.backgroundColor}`;
              msgBackground = rgbToString(hexToRgb(configPreferences.revertMessagingRedesign.messageColor));
              titleColor = rgbToString(hexToRgb(configPreferences.revertMessagingRedesign.textColor));
              linkColor = titleColor;
              tsColor = titleColor;
            } else console.error('Invalid style index');

            const style = document.createElement('style');
            style.classList.add('customMessagingStyle');
            conversation.append(style);
            style.innerText = `
              #messaging-${otherParticipantName} { background: ${backgroundColor}; }
              #messaging-${otherParticipantName} ${keyToCss('headerWrapper')} { background: ${headerBackground} }
              #messaging-${otherParticipantName} ${keyToCss('messageText')}${keyToCss('ownMessage')} ${keyToCss('messageHeader')}::before { content: "${selectedBlogName}"; }
              #messaging-${otherParticipantName} ${keyToCss('messageText')}:not(${keyToCss('ownMessage')}) ${keyToCss('messageHeader')}::before { content: "${otherParticipantName}"; }
              #messaging-${otherParticipantName} ${keyToCss('statusWithCaption')} { color: ${linkColor} !important; }
              #messaging-${otherParticipantName} ${keyToCss('timestamp')} { color: rgba(${tsColor},.6) }
              #messaging-${otherParticipantName} ${keyToCss('name')}, #messaging-${otherParticipantName} ${keyToCss('description')},
              #messaging-${otherParticipantName} ${keyToCss('descriptionContainer')} { color: rgb(${tsColor}) !important; }
              #messaging-${otherParticipantName} ${keyToCss('messageText')}, #messaging-${otherParticipantName} ${keyToCss('messagePost')} ${keyToCss('header')},
              #messaging-${otherParticipantName} ${keyToCss('headerPreview')} ${keyToCss('action')} {
                background: rgb(${msgBackground}) !important;
                color: rgb(${titleColor}) !important;
              }
              #messaging-${otherParticipantName} ${keyToCss('headerPreview')} ${keyToCss('summary')} { color: rgba(${titleColor}, .6) !important; }
            `;
          });
        }
      };

      //Puts attributes on cells
      const labelCells = cells => {
        for (let cell of cells) {
          cell = cell.closest('[data-cell-id]');
          const prevCell = cell.previousSibling;

          if (cell.getAttribute('data-cell-id').includes('timelineObject:carousel')) {
            if (cell.querySelector(keyToCss('blogRecommendation'))) {
              cell.setAttribute('data-blog-carousel-cell', '');
              prevCell.setAttribute('data-blog-carousel-cell', '');
            } else if (cell.querySelector(keyToCss('tagCard'))) {
              cell.setAttribute('data-tag-carousel-cell', '');
              prevCell.setAttribute('data-tag-carousel-cell', '');
            }
          } else if (cell.getAttribute('data-cell-id').includes('watermark_carousel')) {
            cell.setAttribute('data-watermark-carousel-cell', '');
            prevCell.setAttribute('data-watermark-carousel-title-cell', '');
          }
        }
      };

      const mutationManager = Object.freeze({
        listeners: new Map(),
        start (func, selector) {
          if (this.listeners.has(func)) this.stop(func);
          this.listeners.set(func, selector);
          func(Array.from($a(selector)));
        },
        stop (func) { this.listeners.delete(func); },
        toggle (func, selector) {
          if (this.listeners.has(func)) this.stop(func);
          else this.start(func, selector);
        }
      });


      const sortNodes = () => {
        const nodes = newNodes.splice(0);
        if (nodes.length === 0) return;
        for (const [func, selector] of mutationManager.listeners) {
          const matchingElements = [
            ...nodes.filter(node => node.matches(selector)),
            ...nodes.flatMap(node => [...node.querySelectorAll(selector)])
          ].filter((value, index, array) => index === array.indexOf(value));
          if (matchingElements.length) func(matchingElements);
        }
      };

      //Observer to catch mutation events
      const observer = new MutationObserver(mutations => {
        const nodes = mutations
          .flatMap(({ addedNodes }) => [...addedNodes])
          .filter(node => node instanceof Element)
          .filter(node => node.isConnected);
        newNodes.push(...nodes);
        sortNodes();
      });

      //Utilities to modify the page's objects
      const featureStyles = Object.freeze({
        styles: new Map(),
        build (name, on, off, state) {
          const style = document.createElement('style');
          style.id = name;
          style.nonce = nonce;
          document.head.append(style);
          this.styles.set(name, { on, off });
          this.toggle(name, state);
        },
        buildScalable (name, on, off, state, num) {
          const style = document.createElement('style');
          style.id = name;
          style.nonce = nonce;
          document.head.append(style);
          this.styles.set(name, { on, off });
          this.toggleScalable(name, state, num);
        },
        toggle (name, state) {
          const style = document.getElementById(name);
          style.innerText = state ? this.styles.get(name).on : this.styles.get(name).off;
        },
        toggleScalable (name, state, num) {
          const style = document.getElementById(name);
          style.innerText = state ? this.styles.get(name).on.replaceAll('$NUM', num) : this.styles.get(name).off.replaceAll('$NUM', num);
        }
      });

      //Handles the events of the checkboxes in the config menu
      const checkboxEvent = (id, value) => {
        switch (id) {
          case '__hideDashboardTabs':
            toggle($(keyToCss('timelineHeader')), !value);
            break;
          case '__collapseCaughtUp':
            featureStyles.toggle('__cc', value);

            if (!configPreferences.hideRecommendedTags.value && !configPreferences.hideRecommendedBlogs.value) {
              if (value) mutationManager.start(labelCells, carouselCellSelector);
              else mutationManager.stop(labelCells);
            }
            break;
          case '__hideRecommendedBlogs':
            featureStyles.toggle('__rb', value);
            toggle(find($a(keyToCss('sidebarItem')), keyToCss('recommendedBlogs')), !value);
            toggle(find($a(keyToCss('desktopContainer')), keyToCss('recommendedBlogs')), !value);

            if (!configPreferences.hideRecommendedTags.value && !configPreferences.collapseCaughtUp.value) {
              if (value) mutationManager.start(labelCells, carouselCellSelector);
              else mutationManager.stop(labelCells);
            }
            break;
          case '__hideRecommendedTags':
            featureStyles.toggle('__rt', value);

            if (!configPreferences.hideRecommendedBlogs.value && !configPreferences.collapseCaughtUp.value) {
              if (value) mutationManager.start(labelCells, carouselCellSelector);
              else mutationManager.stop(labelCells);
            }
            break;
          case '__originalHeaders':
            if (value) {
              addUserPortrait();
              mutationManager.start(fixHeader, postSelector);
              mutationManager.start(fixHeaderAvatar, postHeaderTargetSelector);
            }
            else {
              $a(`.__stickyContainer > ${keyToCss('avatar')} ${keyToCss('targetWrapper')} img`).forEach(img => {img.sizes = "32px"});
              $a(`.__stickyContainer > ${keyToCss('avatar')} ${keyToCss('subAvatarTargetWrapper')} img`).forEach(img => {img.sizes = "16px"});
              $a(`.__stickyContainer > ${keyToCss('avatar')}`).forEach(avatar => avatar.closest('article').querySelector('header').prepend(avatar));
              remove($a('.__stickyContainer, .__userAvatarWrapper'));
              $a('.__headerFixed').forEach(elem => elem.classList.remove('__headerFixed'));
              $a('.__avatarFixed').forEach(elem => elem.classList.remove('__avatarFixed'));
              mutationManager.stop(fixHeader);
              mutationManager.stop(fixHeaderAvatar);
            }
            break;
          case '__hideTumblrRadar':
            toggle(find($a(keyToCss('sidebarItem')), keyToCss('radar')), !value);
            break;
          case '__hideExplore':
            toggle(find($a(keyToCss('menuContainer')), 'use[href="#managed-icon__explore"]'), !value);
            break;
          case '__hideTumblrShop':
            toggle(find($a(keyToCss('menuContainer')), 'use[href="#managed-icon__shop"]'), !value);
            break;
          case '__hidePremium':
            toggle(find($a(keyToCss('sidebarItem')), 'div[class="Qihwb"]'), !value);
            break;
          case '__hideBadges':
            featureStyles.toggle('__bs', value);
            break;
          case '__highlightLikelyBots':
            if (value && !configPreferences.showFollowingLabel.value) {
              mutationManager.start(scanNotes, noteSelector);
            } else {
              remove($a("[label='Possible Bot']"));
              if (!configPreferences.showFollowingLabel.value) mutationManager.stop(scanNotes);
            }
            break;
          case '__showFollowingLabel':
            if (value && !configPreferences.highlightLikelyBots.value) mutationManager.start(scanNotes, noteSelector);
            else {
              remove($a("[label='Follows You']"));
              if (!configPreferences.highlightLikelyBots.value) mutationManager.stop(scanNotes);
            }
            break;
          case '__displayVoteCounts':
            featureStyles.toggle('__ps', value);
            featureStyles.toggle('__ps', value);
            mutationManager.toggle(detailPolls, answerSelector);

            if (!value) {
              remove($a('.answerVoteCount'));
              $a('.__pollDetailed').forEach(elem => elem.classList.remove('__pollDetailed'));
            }
            break;
          case '__votelessResults':
            mutationManager.toggle(pollResults, voteSelector);

            if (!value) {
              remove($a('.__percentage'));
              $a('.__pollResultsShown').forEach(elem => elem.classList.remove('__pollResultsShown'));
            }
            break;
          case '__disableScrollingAvatars':
            featureStyles.toggle('__as', value);
            break;
          case '__revertMessagingRedesign':
            mutationManager.toggle(detailPolls, answerSelector);

            if (!value) {
              remove($a('.customMessagingStyle'));
            }
            featureStyles.toggleScalable('__ms', value, configPreferences.messagingScale.value);
            break;
          case '__messaging1':
          case '__messaging2':
          case '__messaging3':
            if (configPreferences.revertMessagingRedesign.value) mutationManager.start(styleMessaging, conversationSelector);
            break;
          case '__revertActivityFeedRedesign':
            featureStyles.toggle('__acs', configPreferences.revertActivityFeedRedesign.value);
            break;
          case '__originalEditorHeaders':
            featureStyles.toggle('__oe', configPreferences.originalEditorHeaders.value)
            break;
          case '__noBadgeBorder':
            featureStyles.toggle('__bd', configPreferences.noBadgeBorder.value)
            break;
          case '__disableTagNag':
            if (configPreferences.disableTagNag.value) window.localStorage.setItem(tsKey, Number.MAX_SAFE_INTEGER);
            else window.localStorage.setItem(tsKey, 0);
        }
      };

      //Handles the events of the sliders in the config menu
      const rangeEvent = (id, value) => {
        if (matchPathname()) {
          const posOffset = $('#__contentPositioning').valueAsNumber;
          const widthOffset = ($('#__contentWidth').valueAsNumber - 990) / 2;
          let safeMax = Math.max(safeOffset - widthOffset, 0);
          if (Math.abs(posOffset) > safeMax) {
            safeMax = posOffset > 0 ? safeMax : -safeMax;
            $('#__contentPositioning').value = safeMax.toString();
            featureStyles.toggleScalable('__cp', true, safeMax);
            configPreferences.contentPositioning.value = safeMax;
            if (id === '__contentWidth') featureStyles.toggleScalable('__cw', true, value);
          } else {
            switch (id) {
              case '__contentPositioning':
                featureStyles.toggleScalable('__cp', true, value);
                break;
              case '__contentWidth':
                featureStyles.toggleScalable('__cw', true, value);
                break;
              case '__messagingScale':
                featureStyles.toggleScalable('__ms', configPreferences.revertMessagingRedesign.value, value);
                break;
            }
          }
          if (pathname === 'likes') {
            const gridWidth = $(keyToCss('gridded')).clientWidth;
            const gridItemWidth = Math.fround(100 / Math.round(gridWidth / 178));
            featureStyles.toggleScalable('__gs', true, gridItemWidth);
          }
        }
      };

      // Initial status checks to determine whether to inject or not
      const initialChecks = () => {
        if ($a('#__m').length) {
          console.log('No need to unfuck');
          return false;
        } else {
          console.log('Unfucking dashboard...');
          return true;
        }
      };

      //Goes to the "following" tab by default
      const followingAsDefault = async function () {
        waitFor(keyToCss('timeline')).then(() => {
          if (isDashboard() &&
            $(keyToCss('timeline')).attributes.getNamedItem('data-timeline').value.includes('/v2/tabs/for_you')) {
            window.tumblr.navigate('/dashboard/following');
            console.log('Navigating to following');
          }
        });
      };

      //Config menu header and icons
      const configMenu = (version, obj = {}) => {
        const menuShell = $str(`
          <div id="__m">
          <div id="__in">
            <h1>Dashboard Unfucker v${version}</h1>
            <button id="__ab">
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" role="presentation" style="--icon-color-primary: rgba(var(--white-on-dark), 0.65);">
                <use href="#managed-icon__ellipsis"></use>
              </svg>
            </button>
            <button id="__cb">
              <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" role="presentation" style="--icon-color-primary: rgba(var(--white-on-dark), 0.65);">
                <use href="#managed-icon__settings"></use>
              </svg>
            </button>
          </div>
          <div id="__a" style="display: none;">
            <div class="infoHeader">
              <span>About</span>
            </div>
            <ul id="__am">
            </ul>
          </div>
          <div id="__c" style="display: none;">
            <div id="__cio">
              <button id="__co" class="iOButton">Export</button>
              <button id="__ci" class="iOButton">Import</button>
            </div>
            <div class="infoHeader">
              <span>General configuration</span>
            </div>
            <ul id="__ct"></ul>
            <li class="infoHeader" style="flex-flow: column wrap">
              <span style="width: 100%;">Advanced configuration</span>
              <span style="width: 100%; font-size: .8em;">Requires a page reload</span>
            </li>
            <ul id="__cta"></ul>
          </div>
        </div>
        `);

        //Links and labels in the meatball menu
        const info = [
          { url: 'https://github.com/ClangPan/dashboard-unfucker', text: 'Source' },
          { url: 'https://github.com/ClangPan/dashboard-unfucker/blob/main/CHANGELOG.md', text: 'Changelog' },
          { url: 'https://github.com/ClangPan/dashboard-unfucker/issues/', text: 'Report a bug' },
          { url: 'https://raw.githubusercontent.com/ClangPan/dashboard-unfucker/main/unfucker.user.js', text: 'Update' },
          { url: 'https://tumblr.com/dragongirlsnout', text: "Original author's Tumblr!" },
          { url: 'https://tumblr.com/clangpan', text: "My!! Tumblr!" },
          { url: 'https://www.paypal.com/paypalme/dragongirled', text: 'Support the original author!' }
        ];

        const infoList = menuShell.querySelector('#__am');
        const infoEntry = (obj = {}) => $str(`
          <li>
            <a target="_blank" href="${obj.url}">${obj.text}</a>
          </li>
        `);

        //Labels of the different options
        const configs = {
          hideDashboardTabs: 'Hide dashboard tabs',
          collapseCaughtUp: "Hide the 'changes', 'Staff picks', etc. carousel",
          hideRecommendedBlogs: 'Hide recommended blogs',
          hideRecommendedTags: 'Hide recommended tags',
          originalHeaders: 'Revert the post header design and re-add user avatars beside posts',
          hideTumblrRadar: 'Hide tumblr radar',
          hideExplore: 'Hide Explore',
          hideTumblrShop: 'Hide Tumblr Shop',
          hidePremium: 'Hide the Tumblr Premium nag in the the sidebar',
          hideBadges: 'Hide badges',
          highlightLikelyBots: 'Highlight likely bots in activity feed',
          showFollowingLabel: 'Show who follows you in the activity feed',
          displayVoteCounts: 'Display exact vote counts on poll answers',
          votelessResults: 'Display poll results without voting',
          disableScrollingAvatars: 'Disable avatars scrolling with posts',
          revertActivityFeedRedesign: 'Revert activity feed redesign',
          revertMessagingRedesign: 'Revert messaging redesign',
          contentPositioning: 'Content positioning',
          contentWidth: 'Content width',
          messagingScale: 'Messaging window scale',
          disableTagNag: 'Disable the "post without tags" nag',
          originalEditorHeaders: 'Revert the post editor header design',
          noBadgeBorder: 'Removes the border around icon badges (for compatibility with the Palettes extension)',

          enableCustomTabs: 'Enable customizable dashboard tabs',
          enableReblogPolls: 'Enable adding polls to reblogs',
          showNsfwPosts: 'Show hidden NSFW posts in the timeline',
        };

        //HTML for the config panel
        const configEntry = (obj = {}) => {
          const entry = [];

          if (obj.type === 'checkbox') {
            if (obj.name === 'revertMessagingRedesign') {
              entry.push($str(`
                <li active="${!!obj.value}">
                  <span>${configs[obj.name]}</span>
                  <input class="configInput" type="checkbox" id="__${obj.name}" name="${obj.name}" ${obj.value}>
                  <label for="__${obj.name}">Toggle</label>
                </li>
              `));
              entry.push($str(`
                <ul class="submenu">
                  <li>
                    <span>use blog colors</span>
                    <input
                      class="subConfigInput"
                      type="radio"
                      id="__messaging1"
                      name="revertMessagingRedesign"
                      index="1"
                      ${obj.style === '1' ? 'checked' : ''}
                    >
                    <label for="__messaging1">Toggle</label>
                  </li>
                  <li>
                    <span>use theme colors</span>
                    <input
                      class="subConfigInput"
                      type="radio"
                      id="__messaging2"
                      name="revertMessagingRedesign"
                      index="2"
                      ${obj.style === '2' ? 'checked' : ''}
                    >
                    <label for="__messaging2">Toggle</label>
                  </li>
                  <li active="${obj.style === '3'}">
                    <span>use custom colors</span>
                    <input
                      class="subConfigInput"
                      type="radio"
                      id="__messaging3"
                      name="revertMessagingRedesign"
                      index="3"
                      ${obj.style === '3' ? 'checked' : ''}
                    >
                    <label for="__messaging3">Toggle</label>
                  </li>
                  <ul class="submenu">
                    <li>
                      <span style="flex-basis: 100%;">message color</span>
                      <input
                        class="textInput msgHexSelect"
                        type="text"
                        placeholder="${obj.messageColor || 'f0f0f0'}"
                        pattern="[a-f\\d]{6}"
                        maxlength="6"
                        name="messageColor"
                      >
                      <span></span>
                    </li>
                    <li>
                      <span style="flex-basis: 100%;">background color</span>
                      <input
                        class="textInput msgHexSelect"
                        type="text"
                        placeholder="${obj.backgroundColor || 'ffffff'}"
                        pattern="[a-f\\d]{6}"
                        maxlength="6"
                        name="backgroundColor"
                      >
                      <span></span>
                    </li>
                    <li>
                      <span style="flex-basis: 100%;">text color</span>
                      <input
                        class="textInput msgHexSelect"
                        type="text"
                        placeholder="${obj.textColor || '121212'}"
                        pattern="[a-f\\d]{6}"
                        maxlength="6"
                        name="textColor"
                      >
                      <span></span>
                    </li>
                  </ul>
                </ul>
              `));
            } else {
              entry.push($str(`
                <li>
                  <span>${configs[obj.name]}</span>
                  <input class="configInput" type="checkbox" id="__${obj.name}" name="${obj.name}" ${obj.value}>
                  <label for="__${obj.name}">Toggle</label>
                </li>
              `));
            }
          } else if (obj.type === 'range') {
            if (obj.name === 'contentPositioning') {
              entry.push($str(`
                <li>
                  <span>${configs[obj.name]}</span>
                  <div class="rangeInput">
                    <input class="configInput" type="range" id="__${obj.name}" name="${obj.name}" list="__cp" min="-${safeOffset}" max="${safeOffset}" step="1" value="${obj.value}">
                    <datalist id="__cps">
                      <option value="-${safeOffset}" label="left"></option>
                      <option value="0" label="default"></option>
                      <option value="${safeOffset}" label="right"></option>
                    </datalist>
                  </div>
                </li>
              `));
            } else if (obj.name === 'contentWidth') {
              entry.push($str(`
                <li>
                  <span>${configs[obj.name]}</span>
                  <div class="rangeInput">
                  <input class="configInput" type="range" id="__contentWidth" name="contentWidth" list="__cw" min="990" max="${windowWidth}" step="0.5" value="${configPreferences.contentWidth.value}">
                    <datalist id="__cws">
                    <option value="990" label="default"></option>
                    <option value="${windowWidth}" label="full width"></option>
                    </datalist>
                  </div>
                </li>
              `));
            } else if (obj.name === 'messagingScale') {
              entry.push($str(`
                <li>
                  <span>${configs[obj.name]}</span>
                  <div class="rangeInput">
                  <input class="configInput" type="range" id="__messagingScale" name="messagingScale" list="__mss" min="1" max ="2" step="0.05" value="${configPreferences.messagingScale.value}">
                    <datalist id="__mss">
                      <option value="1" label="1x"></option>
                      <option value="1.5" label="1.5x"></option>
                      <option value="2" label="2x"></option>
                    </datalist>
                  </div>
                </li>
              `));
            }
          }

          return entry;
        };
        const generalList = menuShell.querySelector('#__ct');
        const advancedList = menuShell.querySelector('#__cta');

        info.forEach(infoItem => infoList.append(infoEntry(infoItem)));
        Object.keys(obj).forEach(key => {
          const configItem = obj[key];
          configItem.name = key;
          if (typeof configItem === 'object') {
            if (configItem.advanced) {
              advancedList.append(...configEntry(configItem));
            } else {
              generalList.append(...configEntry(configItem));
            }
          }
        });

        return menuShell;
      };

      //Re-add buttons that got removed in the user popup
      var navItemsObserver = new MutationObserver(function(mutations) {
          const navItems = document.querySelector(keyToCss('navItems'));
          if (navItems && navItems.children.length < 3) {
              //Settings
              const settingsItem = navItems.children[0].cloneNode(true);
              settingsItem.querySelector('use').setAttribute("href", "#managed-icon__settings");
              settingsItem.querySelector(keyToCss('navLink')).setAttribute("href", "/settings/account");
              settingsItem.querySelector(keyToCss('childWrapper')).innerText = "Settings";
              settingsItem.querySelector(keyToCss('endChildWrapper')).remove();
              navItems.appendChild(settingsItem);

              //What's new
              const newsItem = settingsItem.cloneNode(true);
              newsItem.querySelector('use').setAttribute("href", "#managed-icon__lightning");
              newsItem.querySelector(keyToCss('navLink')).setAttribute("href", "/changes");
              newsItem.querySelector(keyToCss('childWrapper')).innerText = "What's new";
              navItems.appendChild(newsItem);

              //Help
              const helpItem = settingsItem.cloneNode(true);
              helpItem.querySelector('use').setAttribute("href", "#managed-icon__ds-help-filled-24");
              helpItem.querySelector(keyToCss('navLink')).setAttribute("href", "/help");
              helpItem.querySelector(keyToCss('childWrapper')).innerText = "Help";
              navItems.appendChild(helpItem);

              //Change Palette
              const paletteItem = settingsItem.cloneNode(true);
              paletteItem.querySelector('use').setAttribute("href", "#managed-icon__palette");
              paletteItem.querySelector(keyToCss('navLink')).setAttribute("href", "/settings/dashboard");
              paletteItem.querySelector(keyToCss('childWrapper')).innerText = "Change Palette";
              navItems.appendChild(paletteItem);
          }
      });

      navItemsObserver.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});

      const fixMasonryNotes = noteCounts => {
        for (const noteCount of noteCounts) {
          if (noteCount.innerText.length > 9) noteCount.innerHTML = `<span class="${keyToClasses('blackText').join(' ')}">${noteCount.querySelector('span').innerText}<span>`;
        }
      };

      //Init the script using the user preferences
      const initializePreferences = () => {
        mutationManager.start(fixMasonryNotes, masonryNotesSelector);

        waitFor(containerSelector).then(() => {
          if (state.routeName === 'peepr-route' && !matchPathname()) $(containerSelector).setAttribute('data-blog-container', '');
        });

        if (configPreferences.disableTagNag.value) window.localStorage.setItem(tsKey, Number.MAX_SAFE_INTEGER);

        if (configPreferences.collapseCaughtUp.value || configPreferences.hideRecommendedBlogs.value || configPreferences.hideRecommendedTags.value) mutationManager.start(labelCells, carouselCellSelector);
        //Css to hide the 'changes', 'Staff picks', etc. carousel
        featureStyles.build('__cc', `
          [data-watermark-carousel-title-cell] { position: relative !important; }
          [data-watermark-carousel-title-cell] > div { visibility: hidden; position: absolute !important; max-width: 100%; }
          [data-watermark-carousel-title-cell] > div canvas { visibility: hidden; }
          [data-watermark-carousel-cell] > div {
            display: none;
          }
        `, '', configPreferences.collapseCaughtUp.value);

        //Css to hide the recommended blogs carousel
        featureStyles.build('__rb', `
          [data-blog-carousel-cell] { position: relative !important; }
          [data-blog-carousel-cell] > div { visibility: hidden; position: absolute !important; max-width: 100%; }
          [data-blog-carousel-cell] > div canvas { visibility: hidden; }
          [data-blog-carousel-cell] ${keyToCss('carouselWrapper')} { display: none !important }
        `, '', configPreferences.hideRecommendedBlogs.value);
        waitFor(keyToCss('recommendedBlogs')).then(() => {
          toggle(find($a(keyToCss('sidebarItem')), keyToCss('recommendedBlogs')), !configPreferences.hideRecommendedBlogs.value);
          toggle(find($a(keyToCss('desktopContainer')), keyToCss('recommendedBlogs')), !configPreferences.hideRecommendedBlogs.value);
        });

        //Css to hide the recommended tags carousel
        featureStyles.build('__rt', `
          [data-tag-carousel-cell] { position: relative !important; }
          [data-tag-carousel-cell] > div { visibility: hidden; position: absolute !important; max-width: 100%; }
          [data-tag-carousel-cell] > div canvas { visibility: hidden; }
          [data-tag-carousel-cell] ${keyToCss('carouselWrapper')} { display: none !important }
        `, '', configPreferences.hideRecommendedTags.value);

        //Restore the original header
        if (configPreferences.originalHeaders.value) {
          addUserPortrait();
          mutationManager.start(fixHeader, postSelector);
          mutationManager.start(fixHeaderAvatar, postHeaderTargetSelector);
        }

        //Toggles Tumblr radar
        waitFor(keyToCss('radar')).then(() => {
          toggle(find($a(keyToCss('sidebarItem')), keyToCss('radar')), !configPreferences.hideTumblrRadar.value);
        });

        //Toggles Dashboard tabs
        if (isDashboard()) {
          waitFor(keyToCss('timelineHeader')).then(() => {
            toggle($(keyToCss('timelineHeader')), !configPreferences.hideDashboardTabs.value);
          });
        }

        //Create the communities icon
        waitFor(keyToCss('menuContainer')).then(() => {
          const exploreIcon = find($a(keyToCss('menuContainer')), 'use[href="#managed-icon__explore"]');
          if (exploreIcon.parentNode.children.length < 9)
          {
            const communitiesIcon = exploreIcon.cloneNode(true);
            communitiesIcon.querySelector('use').setAttribute("href", "#managed-icon__communities");
            communitiesIcon.querySelector('a').setAttribute("href", "/communities");
            exploreIcon.parentNode.insertBefore(communitiesIcon, exploreIcon);
          }
        });

        //Toggles the Explore and Shop icon
        waitFor(keyToCss('menuRight')).then(() => {
          toggle(find($a(keyToCss('menuContainer')), 'use[href="#managed-icon__explore"]'), !configPreferences.hideExplore.value);
          toggle(find($a(keyToCss('menuContainer')), 'use[href="#managed-icon__shop"]'), !configPreferences.hideTumblrShop.value);
        });

        //Toggles the Tumblr Premium nag
        waitFor(keyToCss('sidebar')).then(() => {
          toggle(find($a(keyToCss('sidebarItem')), 'div[class="Qihwb"]'), !configPreferences.hidePremium.value);
        });

        if (configPreferences.highlightLikelyBots.value || configPreferences.showFollowingLabel.value) {
          mutationManager.start(scanNotes, noteSelector);
        }

        //Css for poll numerical  results
        featureStyles.build('__ps', `
          ${keyToCss('pollAnswerPercentage')} { position: relative; bottom: 4px; }
          ${keyToCss('results')} { overflow: hidden; }`, '', configPreferences.displayVoteCounts.value);
        if (configPreferences.displayVoteCounts.value) mutationManager.start(detailPolls, answerSelector);

        if (configPreferences.votelessResults.value) mutationManager.start(pollResults, voteSelector);

        //Css for editor header old design
        featureStyles.build('__oe', `
          #glass-container ${keyToCss('menuContainer')} {
            border-bottom: none !important;

            ${keyToCss('avatarWrapper')} {
              position: absolute;
              top: -6px;
              left: -100px;
            }
            ${keyToCss('avatar')} {
              &, img {
                width: 64px !important;
                height: 64px !important;
              }
            }
            ${keyToCss('selectedBlogName')}${keyToCss('hasAvatar')} { margin-left: 0 !important; }
          }
        `, '', configPreferences.originalEditorHeaders.value);

        //Css to remove border around badges
        featureStyles.build('__bd', `
          ${keyToCss('notificationBadge')} { border: 2px solid rgba(0,0,0,0) !important; }
        `, '', configPreferences.noBadgeBorder.value);

        //Css to remove badges
        featureStyles.build('__bs', `${keyToCss('badgeContainer')}, ${keyToCss('peeprHeaderBadgesWrapper')} { display: none; }`, '', configPreferences.hideBadges.value);

        //Css for the content width and position
        if (matchPathname()) {
          featureStyles.buildScalable('__cp', `${containerSelector} { left: $NUMpx; }`, '', true, configPreferences.contentPositioning.value);
          featureStyles.buildScalable('__cw', `${containerSelector} { max-width: $NUMpx; }`, '', true, configPreferences.contentWidth.value);
          featureStyles.buildScalable('__gs', `${keyToCss('gridTimelineObject')} { width: calc($NUM% - 2px) !important; }`, '', true, 0);
          if (configPreferences.contentWidth.value > 51.5 && pathname === 'likes') {
            waitFor(keyToCss('gridded')).then(() => {
              const gridWidth = $(keyToCss('gridded')).clientWidth;
              const gridItemWidth = Math.fround(100 / Math.round(gridWidth / 178));
              featureStyles.toggleScalable('__gs', true, gridItemWidth);
            });
          }
        }

        //Css for activity feed old design
        featureStyles.build('__acs', `
          [role="tablist"] { padding: 0 !important; }
          [role="tablist"] ${keyToCss('button')}${keyToCss('tab')} {
            font-size: 1rem !important;
            line-height: 1.5 !important;
            padding: 8px !important;
            border-radius: unset !important;
            background: none !important;
          }
          [role="tablist"] ${keyToCss('button')}${keyToCss('tab')}[aria-selected="true"] {
            color: var(--accent) !important;
            box-shadow: inset 0px -2px 0px var(--accent);
          }
          [role="tablist"] ${keyToCss('button')}${keyToCss('tab')}:first-of-type [tabindex] { font-size: 0; }
          [role="tablist"] ${keyToCss('button')}${keyToCss('tab')}:first-of-type [tabindex]::after {
            font-size: 1rem;
            content: "${tr('All')}";
          }
          [role="tabpanel"] ${keyToCss('dateSeparator')} {
            background: rgba(var(--black),.07) !important;
            padding: 8px 16px important;
          }
          [role="tabpanel"] ${keyToCss('backgroundColor')} { border-top: 1px solid rgba(var(--black),.13); }
          ${keyToCss('linkToActivity')} {
            padding: 0 !important;
            height: 30px !important;
          }
          [role="tabpanel"] ${keyToCss('avatarWrapper')} ${keyToCss('avatar')},[role="tabpanel"] ${keyToCss('anonymousAvatar')},
          [role="tabpanel"] ${keyToCss('avatar')} img {
            height: 25px !important;
            width: 25px !important;
          }
          [role="tabpanel"] ${keyToCss('verticallyCentered')} { align-self: start !important; }
          [role="tabpanel"] ${keyToCss('avatarWrapperInner')},[role="tabpanel"] ${keyToCss('circleAvatar')} {border-radius: 3px !important; }
          [role="tabpanel"] ${keyToCss('badge')} ${keyToCss('border')},
          [role="tabpanel"] ${keyToCss('rollupBadge')} ${keyToCss('border')},
          [role="tabpanel"] ${keyToCss('rollupAvatar')} {border: none !important; }
          [role="tabpanel"] ${keyToCss('underlined')} span { text-decoration: none !important; }
          ${keyToCss('linkToActivity')} a { color: rgba(var(--black),.65) !important; }
        `, '', configPreferences.revertActivityFeedRedesign.value);

        //Css for conversation window scaling
        featureStyles.buildScalable('__ms', `
          ${keyToCss('conversationWindow')} {
            border-radius: 5px;
            width: calc(280px * $NUM);
            height: calc(500px * $NUM);
            max-height: calc(100vh - 80px) !important;
          }
          ${keyToCss('conversationWindow')} ${keyToCss('headerDesktop')} {
            border-radius: 5px 5px 0 0 !important;
            background: rgba(255,255,255,.1);
            backdrop-filter: blur(6px);
            padding: 8px;
          }
          ${keyToCss('conversationWindow')} ${keyToCss('footer')} {
            padding: 4px;
            border-radius: 0 0 5px 5px !important;
          }
          ${keyToCss('conversationWindow')} ${keyToCss('timestamp')} {
            text-align: center !important;
            margin: 14px 0;
            font-size: 14px;
          }
          ${keyToCss('messages')} { background: transparent !important; }
          ${keyToCss('message')} img { width: 100% !important; }
          ${keyToCss('conversation')} ${keyToCss('textareaContainer')} { border-radius: 3px; }
          ${keyToCss('minimizedConversation')} ${keyToCss('avatarWrapper')} {
            background: transparent !important;
            padding: 0 !important;
          }
          ${keyToCss('minimizedConversation')} ${keyToCss('avatar')}, ${keyToCss('minimizedConversation')} img {
            width: 48px !important;
            height: 48px !important;
          }
        `, `${keyToCss('conversationWindow')} {
          width: calc(400px * $NUM);
          height: calc(560px * $NUM);
          max-height: calc(100vh - 80px) !important;
        }`, configPreferences.revertMessagingRedesign.value, configPreferences.messagingScale.value);
        if (configPreferences.revertMessagingRedesign.value) {
          mutationManager.start(styleMessaging, conversationSelector);
        }

        featureStyles.build('__as', `.__stickyContainer > ${keyToCss('avatar')} { position: static !important; }`, '', configPreferences.disableScrollingAvatars.value);

        observer.observe(target, { childList: true, subtree: true });
      };

      //Create the "Import"/"Export" buttons
      const setupButtons = () => {
        $('#__cb').addEventListener('click', () => {
          if ($('#__c').style.display === 'none') {
            $('#__cb svg').style.setProperty('--icon-color-primary', 'rgb(var(--white-on-dark))');
          } else $('#__cb svg').style.setProperty('--icon-color-primary', 'rgba(var(--white-on-dark),.65)');
          toggle($('#__c'));
        });
        $('#__ab').addEventListener('click', () => {
          if ($('#__a').style.display === 'none') {
            $('#__ab svg').style.setProperty('--icon-color-primary', 'rgb(var(--white-on-dark))');
          } else $('#__ab svg').style.setProperty('--icon-color-primary', 'rgba(var(--white-on-dark),.65)');
          toggle($('#__a'));
        });

        //Event handler for the "Export" button
        $('#__co').addEventListener('click', () => {
          const configExport = new Blob([JSON.stringify(configPreferences, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(configExport);
          const exportLink = document.createElement('a');
          const date = new Date();
          const yy = date.getFullYear().toString();
          const mm = (date.getDay() + 1).toString();
          const dd = date.getDate().toString();
          exportLink.href = url;
          exportLink.download = `dashboard unfucker config export ${yy}-${mm}-${dd}`;

          document.documentElement.append(exportLink);
          exportLink.click();
          exportLink.remove();
          URL.revokeObjectURL(url);
        });

        //Event handler for the "Import" button
        $('#__ci').addEventListener('click', () => {
          const input = document.createElement('input');
          input.id = '__cii';
          input.type = 'file';
          input.accept = 'application/json';
          input.addEventListener('change', async function () {
            const [file] = this.files;

            if (file) {
              let msg;
              let obj = await file.text();
              try {
                obj = JSON.parse(obj);
              } catch (e) {
                console.error('Failed to import preferences from file!', e);
              }
              if (typeof obj === 'object' && obj.lastVersion) {
                configPreferences = obj;
                updatePreferences();
                console.info('Imported preferences from file!');
                msg = $str('<span id="__im">Successfully imported preferences from file!</span>');
                document.getElementById('__cio').append(msg);
                await delay(100);
                css(msg, { opacity: '1' });
                await delay(3000);
                css(msg, { opacity: '0' });
                await delay(700);
                msg.remove();
              } else {
                msg = $str('<span id="__im">Invalid JSON data!</span>');
                document.getElementById('__cio').append(msg);
                await delay(100);
                css(msg, { opacity: '1' });
                await delay(3000);
                css(msg, { opacity: '0' });
                await delay(700);
                msg.remove();
              }
            }
          });
          input.click();
        });

        $a('.configInput').forEach(currentValue => {
          currentValue.addEventListener('change', event => {
            const name = event.target.attributes.getNamedItem('name').value;
            if (event.target.attributes.getNamedItem('type').value === 'checkbox') {
              configPreferences[name].value = event.target.matches(':checked') ? 'checked' : '';
              checkboxEvent(event.target.id, event.target.matches(':checked'));
              if (event.target.closest('li').attributes.getNamedItem('active')) {
                event.target.closest('li').attributes.getNamedItem('active').value = configPreferences[name].value ? 'true' : 'false';
              }
            } else {
              configPreferences[name].value = event.target.valueAsNumber;
              rangeEvent(event.target.id, event.target.valueAsNumber);
            }
            updatePreferences();
          });
        });

        $a('.subConfigInput').forEach(currentValue => {
          currentValue.addEventListener('change', event => {
            const name = event.target.attributes.getNamedItem('name').value;
            const index = event.target.attributes.getNamedItem('index').value;
            if (event.target.matches(':checked')) configPreferences[name].style = index;
            checkboxEvent(event.target.id, event.target.matches(':checked'));
            if (event.target.closest('li').attributes.getNamedItem('active')) {
              event.target.closest('li').attributes.getNamedItem('active').value = 'true';
            } else if (event.target.closest('.submenu').querySelector("[active='true]")) {
              event.target.closest('.submenu').querySelector("[active='true]").attributes.getNamedItem('active').value = 'false';
            }
            updatePreferences();
          });
        });

        $a('.msgHexSelect').forEach(currentValue => {
          currentValue.addEventListener('change', event => {
            const name = event.target.attributes.getNamedItem('name').value;
            configPreferences.revertMessagingRedesign[name] = event.target.value;
            if (configPreferences.revertMessagingRedesign.value) mutationManager.start(styleMessaging, conversationSelector);
            updatePreferences();
          });
        });
      };

      //Does what's on the can
      const unfuck = async function () {
        if (!initialChecks()) return;

        const menu = configMenu(version, configPreferences);
        pathname = window.location.pathname.split('/')[1];

        window.requestAnimationFrame(() => {
          document.head.appendChild(styleElement);
          followingAsDefault();
          if (matchPathname()) {
            waitFor(keyToCss('sidebar')).then(() => {
              waitFor(keyToCss('sidebarContent')).then(() => {
                hide($(keyToCss('sidebarContent')));
              });

              //Insert the config menu
              $(keyToCss('sidebar')).insertBefore(menu, $(`${keyToCss('sidebar')} aside`));
              if (configPreferences.lastVersion !== version) {
                $('#__in').append($str("<span class='__n'>new!</span>"));
                $('#__cb').append($str("<span class='__n'></span>"));
                $('#__ab').append($str("<span class='__n'></span>"));
                $('#__in').addEventListener('click', () => { $a('.__n').forEach(value => hide(value)); });
                configPreferences.lastVersion = version;
                updatePreferences();
              }

              setupButtons();
            });
          }

          initializePreferences();
        });

        console.log('Dashboard fixed!');
      };

      console.info(JSON.parse(atob(state.obfuscatedFeatures)));
      console.info(featureSet);

      //Does the thing
      unfuck();

      window.setTimeout(() => { //added post fallback. does it work? who knows
        updatePreferences();
      }, 900000)

      //When the window is resized
      window.addEventListener('resize', () => {
        if (!$('#__m')) return;

        windowWidth = window.innerWidth;
        safeOffset = (windowWidth - 1000) / 2;
        $('#__contentPositioning').attributes.getNamedItem('min').value = `-${safeOffset}`;
        $('#__contentPositioning').attributes.getNamedItem('max').value = `${safeOffset}`;
        $('#__contentWidth').attributes.getNamedItem('max').value = `${windowWidth}`;
        $('#__cps').innerHTML = `
          <option value="-${safeOffset}" label="left"></option>
          <option value="0" label="default"></option>
          <option value="${safeOffset}" label="right"></option>
        `;
        $('#__cws').innerHTML = `
          <option value="990" label="default"></option>
          <option value="${windowWidth}" label="full width"></option>
        `;
      });
      window.tumblr.on('navigation', () => window.setTimeout(() => {
        unfuck().then(() => {
          window.setTimeout(() => {
            if (!$a('#__m').length) unfuck();
          }, 400);
        }).catch(() =>
          window.setTimeout(unfuck, 400)
        );
      }, 400
      ));
    });
  });
};

const getNonce = () => {
  const { nonce } = [...document.scripts].find(script => script.nonce) || '';
  if (nonce === '') console.error('Empty script nonce attribute: script may not inject');
  return nonce;
};

//Insert the script into the HTML head
const script = () => $( `
  <script id="__u" nonce="${getNonce()}">
    const unfuckDashboard = ${main.toString()};
    unfuckDashboard("${getNonce()}");
  </script>
` );

if ($( 'head' ).length === 0) {
  const newNodes = [];
  const findHead = () => {
    const nodes = newNodes.splice(0);
    if (nodes.length !== 0 && (nodes.some(node => node.matches('head') || node.querySelector('head') !== null))) {
      const head = nodes.find(node => node.matches('head'));
      $( head ).append(script());
    }
  };

  const observer = new MutationObserver(mutations => {
    const nodes = mutations
      .flatMap(({ addedNodes }) => [...addedNodes])
      .filter(node => node instanceof Element)
      .filter(node => node.isConnected);
    newNodes.push(...nodes);
    findHead();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
} else $( document.head ).append(script());

