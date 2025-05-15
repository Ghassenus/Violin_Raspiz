export default {
  data() {
    return {
      target: "bluetooth"
    }
  },
  methods: {
    setOutput(target) {
      this.target = target;
      fetch(`/api/audio/output`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target })
      });
    }
  },
  template: `
    <div>
      <h5>🔊 Sortie Audio</h5>
      <div class="btn-group">
        <button class="btn btn-sm" :class="target === 'bluetooth' ? 'btn-primary' : 'btn-outline-primary'" @click="setOutput('bluetooth')">Bluetooth</button>
        <button class="btn btn-sm" :class="target === 'jack' ? 'btn-primary' : 'btn-outline-primary'" @click="setOutput('jack')">Jack</button>
        <button class="btn btn-sm" :class="target === 'both' ? 'btn-primary' : 'btn-outline-primary'" @click="setOutput('both')">Les deux</button>
      </div>
    </div>
  `
}
