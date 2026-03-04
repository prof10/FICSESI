<template>
  <div id="app">
    <nav v-if="authStore.isLoggedIn">
      <router-link to="/admin/dashboard">Início</router-link> |
      <router-link to="/admin/teams">Equipes</router-link> |
      <router-link to="/admin/evaluators">Avaliadores</router-link> |
      <router-link to="/admin/questions">Perguntas</router-link> |
      <router-link to="/admin/templates">Avaliações</router-link> |
      <router-link to="/admin/assignments">Atribuir Provas</router-link> |
      <router-link to="/admin/ranking">Ranking</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js'
const authStore = useAuthStore()
</script>
