<template>
  <div class="admin-teams">
    <header class="page-header">
      <h1>Equipes</h1>
      <p>Cadastro e gestão das equipes participantes do FICSESI.</p>
    </header>

    <section class="card form-card">
      <h2>Cadastar equipe</h2>

      <form @submit.prevent="createTeam" class="form-grid">
        <input v-model="newTeam.numero_estande" placeholder="N° Estande" />

        <input v-model="newTeam.name" placeholder="Nome da Equipe" required />

        <input v-model="newTeam.escola" placeholder="Escola" required />

        <input v-model="newTeam.cidade" placeholder="Cidade" required />

        <select v-model="newTeam.area_conhecimento" required>
          <option value="" disabled>Área de Conhecimento</option>
          <option value="Ciências Humanas e Sociais">Ciências Humanas e Sociais</option>
          <option value="Ciências da Natureza">Ciências da Natureza</option>
          <option value="Engenharias">Engenharias</option>
          <option value="Empreendedorismo">Empreendedorismo</option>
        </select>

        <select v-model="newTeam.etapa_ensino" required>
          <option value="" disabled>Etapa de Ensino</option>
          <option value="Educação Infantil">Educação Infantil</option>
          <option value="Anos Iniciais">Anos Iniciais</option>
          <option value="Anos Finais">Anos Finais</option>
          <option value="Ensino Médio">Ensino Médio</option>
          <option value="Anos Finais EJA">Anos Finais - EJA</option>
          <option value="Ensino Médio EJA">Ensino Médio - EJA</option>
        </select>

        <select v-model="newTeam.category" required>
          <option value="" disabled>Premiação</option>
          <option value="Educação Infantil">Educação Infantil</option>
          <option value="Anos Iniciais">Anos Iniciais</option>
          <option value="Anos Finais">Anos Finais</option>
          <option value="Ciências da Natureza">Ciências da Natureza</option>
          <option value="Ciências Humanas">Ciências Humanas</option>
          <option value="Empreendedorismo">Empreendedorismo</option>
          <option value="Engenharias">Engenharias</option>
          <option value="Mentes Criativas">Mentes Criativas</option>
          <option value="EJA">EJA</option>
        </select>

        <div class="form-actions">
          <button type="submit">Cadastrar equipe</button>
        </div>
      </form>
    </section>

    <section class="card table-card">
      <div class="table-header">
        <h2>Equipes cadastradas</h2>
        <span class="table-count">{{ teams.length }} equipe(s)</span>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>N° Estande</th>
              <th>Nome</th>
              <th>Escola</th>
              <th>Cidade</th>
              <th>Área de Conhecimento</th>
              <th>Etapa de Ensino</th>
              <th>Categoria</th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams" :key="team.id">
              <td>{{ team.numero_estande }}</td>
              <td>{{ team.name }}</td>
              <td>{{ team.escola }}</td>
              <td>{{ team.cidade }}</td>
              <td>{{ team.area_conhecimento }}</td>
              <td>{{ team.etapa_ensino }}</td>
              <td>{{ team.category }}</td>
              <td class="col-actions">
                <button class="btn-danger" @click="deleteTeam(team.id)">Excluir</button>
              </td>
            </tr>
            <tr v-if="!teams.length">
              <td colspan="8" class="empty">Nenhuma equipe cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { teamsService } from '@/services/supabase.js'

const teams = ref([])
const newTeam = ref({
  numero_estande: '',
  name: '',
  escola: '',
  cidade: '',
  area_conhecimento: '',
  category: '',
  etapa_ensino: ''
})
const error = ref('')

const loadTeams = async () => {
  try {
    teams.value = await teamsService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar: ' + err.message
  }
}

const createTeam = async () => {
  try {
    await teamsService.create(newTeam.value)
    newTeam.value = {
      numero_estande: '',
      name: '',
      escola: '',
      cidade: '',
      area_conhecimento: '',
      category: '',
      etapa_ensino: ''
    }
    loadTeams()
  } catch (err) {
    error.value = 'Erro ao cadastrar: ' + err.message
  }
}

const deleteTeam = async (id) => {
  if (confirm('Excluir equipe?')) {
    try {
      await teamsService.delete(id)
      loadTeams()
    } catch (err) {
      error.value = 'Erro ao excluir: ' + err.message
    }
  }
}

onMounted(loadTeams)
</script>

<style scoped>
.admin-teams {
  min-height: 100vh;
  padding: 28px 32px 40px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  box-sizing: border-box;
}

.page-header {
  max-width: 1080px;
  margin: 0 auto 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #118c3a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #546e7a;
}

.card {
  max-width: 1080px;
  margin: 0 auto 20px;
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 22px 22px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(17, 140, 58, 0.06);
}

.card h2 {
  margin: 0 0 14px;
  font-size: 16px;
  letter-spacing: 0.09em;
  color: #118c3a;
  text-transform: uppercase;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px 16px;
}

.form-grid input,
.form-grid select {
  padding: 9px 11px;
  border-radius: 999px;
  border: 1px solid #cfd8dc;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  background-color: #fdfdfd;
}

.form-grid input:focus,
.form-grid select:focus {
  border-color: #118c3a;
  box-shadow: 0 0 0 2px rgba(17, 140, 58, 0.18);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.form-actions button {
  border: none;
  border-radius: 999px;
  padding: 9px 20px;
  background: #00b34a;
  color: #ffffff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 6px 18px rgba(0, 179, 74, 0.38);
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
}

.form-actions button:hover {
  background: #02983f;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 179, 74, 0.45);
}

.table-card {
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.table-count {
  font-size: 12px;
  color: #78909c;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th,
.table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #eceff1;
}

.table th {
  font-weight: 600;
  color: #455a64;
  background-color: #f5f9f6;
}

.table tbody tr:hover {
  background-color: #f9fcf9;
}

.col-actions {
  text-align: right;
  white-space: nowrap;
}

.btn-danger {
  border: none;
  border-radius: 999px;
  padding: 5px 11px;
  font-size: 12px;
  cursor: pointer;
  background: #ef5350;
  color: #ffffff;
  transition: background 0.18s, transform 0.18s;
}

.btn-danger:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

.empty {
  text-align: center;
  padding: 20px 8px;
  color: #90a4ae;
}

.error {
  max-width: 1080px;
  margin: 0 auto;
  color: #d32f2f;
  font-size: 13px;
  padding-top: 4px;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .admin-teams {
    padding: 20px 14px 28px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 18px 16px 18px;
  }
}
</style>
