<template>
  <div class="app">
    <nav class="navbar">
      <router-link to="/" exact>🏠 Dashboard</router-link>
      <router-link to="/settings">⚙️ Réglages</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  display: flex;
  background-color: #1e1e1e;
  padding: 10px;
  gap: 20px;
}
.navbar a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}
.navbar a.router-link-exact-active {
  color: #4caf50;
  border-bottom: 2px solid #4caf50;
}
</style>
