import AudioMixer from '../components/audio/AudioMixer.js'

export default {
  name: "Audio",
  components: { AudioMixer },
  template: `
    <div class="page audio">
      <h2>🎧 Audio Mixer</h2>
      <AudioMixer />
    </div>
  `
}
