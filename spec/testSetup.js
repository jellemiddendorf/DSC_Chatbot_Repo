const { JSDOM } = require('jsdom');

// Define the HTML page structure
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSC Chatbot</title>
</head>
<body>
    <div id="header-placeholder"></div>
    <button class="chatbot-toggler">
        <span style="display: block" class="material-symbols-rounded">mode_comment</span>
        <span class="material-symbols-outlined">close</span>
    </button>
    <div class="chatbot">
        <header>
            <span class="material-symbols-rounded">mode_comment</span>
            <h7>Zehnders support Chatbot!</h7>
        </header>
        <ul class="chatbox">
            <!-- Initially, you may want to mock an initial message or leave this empty -->
            <li class="chat incoming">
                <span class="zehnder-letter">Z</span>
                <p>Hallo ik ben Zehndy!<br>Hoe kan ik je helpen?</p>
            </li>
        </ul>
        <div class="chat-input">
            <textarea placeholder="Uw vraag..." spellcheck="false" required></textarea>
            <span id="send-btn" class="material-symbols-rounded">send</span>
        </div>
        <div class="user-agreement" style="display: none;" id="user-agreement">
            <label>
                <input type="checkbox" id="agree-checkbox">
                Ik begrijp dat Zehnder niet aansprakelijk is voor informatie van de chatbot of enige verliezen. Alle informatie moet worden geverifieerd. <br>
            </label>
            <button class="agree-button">Accepteer</button>
        </div>
    </div>
</body>
</html>`;

// Initialize jsdom with options to support cookies and handle external resources
const jsdom = new JSDOM(html, {
  url: "http://localhost",
  referrer: "http://localhost",
  contentType: "text/html",
  includeNodeLocations: true,
  storageQuota: 10000000
});

const { window } = jsdom;

// Extend the global object with properties from the window object
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.Node = window.Node;
global.URL = window.URL;

// Utility function to set a cookie
function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;
}

// Utility function to clear the cookies
function clearCookies() {
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
}

// Ensure all window properties not already global are added to the global scope
Object.keys(window).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = window[property];
  }
});

// Include necessary mocks and polyfills for functions and properties
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};

// Set up mocks and polyfills for the testing environment
global.HTMLElement = window.HTMLElement;
global.HTMLInputElement = window.HTMLInputElement;
global.MouseEvent = window.MouseEvent;

// Enable Fetch API support
// global.fetch = require('node-fetch');

// Mock local storage and session storage
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;

// Mocking cookie support
global.document.cookie = '';
global.navigator.cookieEnabled = true;

// Support for animations and transitions
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;

// Mock event listener setup to debug events not fully simulated in jsdom
document.addEventListener = (event, cb) => {
  console.log(`Mock listener added for ${event}`);
};
