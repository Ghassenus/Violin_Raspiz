import { io } from './vendor/socket.io/socket.io.esm.min.js'
import { log } from './modules/log.js';


// Initialise la connexion Socket.IO Raspiz une seule fois
window.raspSocket = io(window.RASPIZ_SOCKET);

// (Optionnel) loggue l’état de la connexion
window.raspSocket.on('connect', () => {
  log.info('Socket.IO Raspiz connecté');
});
window.raspSocket.on('disconnect', () => {
  log.info('Socket.IO Raspiz déconnecté');
});

const PARTIALS_PATH = "partials/";
const MODULES_PATH  = "modules/";

const routes = {
  "#dashboard":  { html: "dashboard.html",  js: "dashboard.js" },
  "#wifi":       { html: "wifi.html",       js: "wifi.js" },
  "#bluetooth":  { html: "bluetooth.html",  js: "bluetooth.js" },
  "#audio":      { html: "audio.html",      js: "audio.js" },
  "#settings":   { html: "settings.html",   js: "settings.js" },
  // On garde #terminal si tu veux garder un contenu spécifique en plus,
  // mais l'affichage principal se fait maintenant dans le footer.
  "#terminal":   { html: "terminal.html",   js: "terminal.js" }
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
      // Init du module de la page
      module.default?.init?.();
      // Exposer global pour les onclick dynamiques
      const name = route.replace("#", "");
      window[name] = module.default;
      // Surbrillance du lien actif
      document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`nav a[href="${route}"]`);
      if (link) link.classList.add('active');

      // Toujours (re)lancer l'init du footer-console et  ré-init console persistante
      import('./modules/terminal.js')
        .then(term => term.default.init())
        .catch(err => log.error("Impossible d'init console : " + err));
    })
    .catch(err => log.error("Erreur chargement route : " + err));
}

window.addEventListener("hashchange", e => {
  const oldHash = e.oldURL.includes("#") ? e.oldURL.split("#")[1] : "";
  if (oldHash) {
    const prevModule = window[oldHash];
    prevModule?.cleanup?.();
  }
  loadRoute(location.hash);
});

window.addEventListener("DOMContentLoaded", () => {
  loadRoute(location.hash || "#dashboard");
});
