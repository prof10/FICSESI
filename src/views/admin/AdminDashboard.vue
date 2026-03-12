<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>FICSESI</h1>
      <p>Painel administrativo</p>
    </header>

    <div class="cards">
      <div class="card" @click="go('/admin/teams')">
        <h3>PROJETOS</h3>
        <p>Cadastro e gestão dos projetos participantes.</p>
      </div>

      <div class="card" @click="go('/admin/evaluators')">
        <h3>AVALIADORES</h3>
        <p>Cadastro e gestão dos avaliadores participantes.</p>
      </div>

      <div class="card" @click="go('/admin/questions')">
        <h3>QUESTÕES</h3>
        <p>Banco de questões para avaliações.</p>
      </div>

      <div class="card" @click="go('/admin/templates')">
        <h3>AVALIAÇÕES</h3>
        <p>Modelos de avaliações.</p>
      </div>

      <div class="card" @click="go('/admin/assignments')">
        <h3>ATRIBUIÇÃO DE AVALIAÇÕES</h3>
        <p>Vincule equipes, avaliadores e avaliações.</p>
      </div>

      <div class="card" @click="go('/admin/ranking')">
        <h3>RANKING</h3>
        <p>Classificação geral do evento.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const go = (path) => router.push(path)
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 32px 32px 40px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  box-sizing: border-box;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 32px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 28px;
  color: #118c3a;
  letter-spacing: 0.08em;
}

.dashboard-header p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #4f5b62;
}

.cards {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 18px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  border: 1px solid rgba(17, 140, 58, 0.05);
}

.card h3 {
  margin: 0 0 6px;
  font-size: 15px;
  letter-spacing: 0.09em;
  color: #118c3a;
}

.card p {
  margin: 0;
  font-size: 13px;
  color: #546e7a;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
}

@media (max-width: 600px) {
  .dashboard {
    padding: 20px 16px 28px;
  }

  .dashboard-header h1 {
    font-size: 22px;
  }
}
</style>
