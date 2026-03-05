<template>
  <div class="dashboard">
    <h2>Painel FICSESI</h2>

    <div class="cards">
      <div class="card" @click="go('/admin/teams')">
        <h3>EQUIPES</h3>        
      </div>

      <div class="card" @click="go('/admin/evaluators')">
        <h3>AVALIADORES</h3>
        
      </div>

      <div class="card" @click="go('/admin/questions')">
        <h3>QUESTÕES</h3>
        
      </div>

      <div class="card" @click="go('/admin/templates')">
        <h3>AVALIAÇÕES</h3>
        
    </div>


      <div class="card" @click="go('/admin/assignments')">
        <h3>ATRIBUIÇÃO DE AVALIAÇÕES</h3>
        
      </div>

      <div class="card" @click="go('/admin/ranking')">
        <h3>RANKING</h3>
        
      </div>


    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const go = (path) => {
  router.push(path)
}
</script>

<style scoped>
.dashboard { padding: 20px; }
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.card {
  flex: 1 1 220px;
  border: 1px solid #ddd;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow .2s;
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
</style>
