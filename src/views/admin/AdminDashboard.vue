<template>
  <div class="dashboard">
    <h2>Painel FICSESI</h2>

    <div class="cards">
      <div class="card" @click="go('/admin/teams')">
        <h3>Cadastro de Equipes</h3>
        <p>Gerenciar equipes e premiações.</p>
      </div>

      <div class="card" @click="go('/admin/evaluators')">
        <h3>Cadastro de Avaliadores</h3>
        <p>Cadastrar e editar avaliadores.</p>
      </div>

      <div class="card" @click="go('/admin/questions')">
        <h3>Perguntas da Prova</h3>
        <p>Definir questões (0 a 5).</p>
      </div>

      <div class="card" @click="go('/admin/templates')">
        <h3>Modelos de Avaliação</h3>
        <p>Definir conjuntos de perguntas para online/presencial.</p>
    </div>


      <div class="card" @click="go('/admin/assignments')">
        <h3>Atribuir Provas</h3>
        <p>Gerar códigos para avaliadores.</p>
      </div>

      <div class="card" @click="go('/admin/ranking')">
        <h3>Ranking por Premiação</h3>
        <p>Ver resultados por categoria.</p>
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
