export default {
  template: `
    <div class="audio-mixer">
      <h3>🎛️ Audio Mixer</h3>
      <SourceControls />
      <OutputControls />
      <PlaybackControls />
    </div>
  `,
  components: {
    SourceControls: window.SourceControls,
    OutputControls: window.OutputControls,
    PlaybackControls: window.PlaybackControls
  }
}
