<template>
  <div class="admin-teams">
    <h2>Cadastro de Equipes</h2>

    <form @submit.prevent="createTeam" class="form">
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
      </select>

      

      <button type="submit">Cadastrar</button>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th>N° Estande</th>
          <th>Nome</th>
          <th>Escola</th>
          <th>Cidade</th>
          <th>Área de Conhecimento</th>
          <th>Etapa</th>
          <th>Premiação</th>          
          <th>Ações</th>
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
          
          <td>
            
            <button @click="deleteTeam(team.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

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
.form { margin: 20px 0; }
.form input, .form select { margin: 5px; padding: 8px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; }
.error { color: red; }
</style>
