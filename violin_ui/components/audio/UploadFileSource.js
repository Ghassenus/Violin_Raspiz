export default {
  name: "UploadFileSource",
  template: `
    <div>
      <h4>📁 Fichier local</h4>
      <input type="file" @change="upload">
    </div>
  `,
  methods: {
    upload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const form = new FormData();
      form.append("file", file);

      fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/upload`, {
        method: "POST",
        body: form
      });
    }
  }
}
