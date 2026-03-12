<template>
  <div id="app">
    <header v-if="authStore.isLoggedIn" class="topbar">
      <nav class="topbar-nav">
        <router-link to="/admin/dashboard">Início</router-link>
        <router-link to="/admin/teams">Projetos</router-link>
        <router-link to="/admin/evaluators">Avaliadores</router-link>
        <router-link to="/admin/questions">Questões</router-link>
        <router-link to="/admin/templates">Avaliações</router-link>
        <router-link to="/admin/assignments">Atribuição de Avaliações</router-link>
        <router-link to="/admin/ranking">Ranking</router-link>
      </nav>
    </header>

    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js'
const authStore = useAuthStore()
</script>

<style>
.topbar {
  width: 100%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.topbar-nav {
  max-width: 1180px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.topbar-nav a {
  color: #118c3a;
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 999px;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.topbar-nav a.router-link-active {
  background-color: #118c3a;
  color: #ffffff;
}

.topbar-nav a:hover {
  background-color: rgba(17, 140, 58, 0.08);
}

/* opcional: some o texto em telas muito pequenas e deixe tipo "menu" depois */
@media (max-width: 640px) {
  .topbar-nav {
    padding: 8px 12px;
    gap: 8px;
    font-size: 11px;
  }
}
</style>
