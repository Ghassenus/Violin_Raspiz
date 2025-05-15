export default {
  template: `
    <div>
      <h3>📶 Wi-Fi (ESP1)</h3>
      <div>
        <input v-model="ssid" placeholder="SSID" class="form-control w-25 d-inline">
        <input v-model="password" type="password" placeholder="Mot de passe" class="form-control w-25 d-inline ms-2">
        <button @click="connectWifi" class="btn btn-success ms-2">Connecter</button>
      </div>
    </div>
  `,
  data() {
    return {
      ssid: '',
      password: ''
    };
  },
  methods: {
    connectWifi() {
      fetch(`http://${window.VIOLIN_CONFIG.ESP1_IP}/api/wifi/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid: this.ssid, pass: this.password })
      }).then(() => alert("Connexion demandée !"))
        .catch(err => console.error("Erreur WiFi:", err));
    }
  }
};
