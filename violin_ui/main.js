import { log } from './modules/log.js';
window.log = log;

const PARTIALS_PATH = "partials/";
const MODULES_PATH = "modules/";

const routes = {
  "#dashboard": { html: "dashboard.html", js: "dashboard.js" },
  "#wifi":      { html: "wifi.html",      js: "wifi.js" },
  "#bluetooth": { html: "bluetooth.html", js: "bluetooth.js" },
  "#audio":     { html: "audio.html",     js: "audio.js" },
  "#settings":  { html: "settings.html",  js: "settings.js" },
  "#terminal":  { html: "terminal.html",  js: "terminal.js" },
};

function loadRoute(route) {
  const target = routes[route] || routes["#dashboard"];
  fetch(PARTIALS_PATH + target.html)
    .then(res => res.text())
    .then(html => {
      document.getElementById("main-content").innerHTML = html;
      return import(`./${MODULES_PATH}${target.js}`);
    })
    .then(module => {
      module.default?.init?.();
      window[route.replace("#","")] = module.default;
    })
    .catch(err => log.error("Erreur chargement route: " + err));
}

window.addEventListener("hashchange", () => loadRoute(location.hash));
window.addEventListener("DOMContentLoaded", () => loadRoute(location.hash || "#dashboard"));
