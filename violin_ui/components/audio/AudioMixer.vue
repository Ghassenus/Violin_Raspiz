<template>
  <div class="audio-mixer">
    <h3>🎧 Audio Mixer</h3>
    <SourceControls />
    <OutputControls />
    <PlaybackControls />
  </div>
</template>

<script setup>
import SourceControls from './SourceControls.vue'
import OutputControls from './OutputControls.vue'
import PlaybackControls from './PlaybackControls.vue'
</script>

<style scoped>
.audio-mixer {
  padding: 20px;
  background: #1a1a1a;
  border: 1px solid #444;
  margin-top: 20px;
}
</style>
