<template>
  <div class="admin-assignments">
    <h2>Atribuição de Provas</h2>

    <form @submit.prevent="createAssignment" class="form">
      <select v-model="selectedTeamId" required>
        <option value="" disabled>Selecione a Equipe</option>
        <option v-for="team in teams" :key="team.id" :value="team.id">
          {{ team.name }} - {{ team.escola }} ({{ team.cidade }})
        </option>
      </select>

      <select v-model="selectedEvaluatorId" required>
        <option value="" disabled>Selecione o Avaliador</option>
        <option v-for="ev in evaluators" :key="ev.id" :value="ev.id">
          {{ ev.name }} - {{ ev.area_conhecimento }}
        </option>
      </select>

      <select v-model="selectedTemplateId" required>
        <option value="" disabled>Modelo de Avaliação</option>
        <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">
          {{ tpl.name }} ({{ tpl.type === 'online' ? 'Online' : 'Presencial' }})
        </option>
      </select>

      <button type="submit">Gerar Código</button>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Equipe</th>
          <th>Avaliador</th>
          <th>Modelo</th>
          <th>Tipo</th>
          <th>Status</th>
          <th>Criado em</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in assignments" :key="a.id">
          <td>{{ a.code }}</td>
          <td>{{ a.team?.name }}</td>
          <td>{{ a.evaluator?.name }}</td>
          <td>{{ a.template?.name }}</td>
          <td>{{ a.template?.type === 'online' ? 'Online' : 'Presencial' }}</td>
          <td>{{ a.status }}</td>
          <td>{{ formatDate(a.created_at) }}</td>
          <td>
            <button @click="copyCode(a.code)">Copiar Código</button>
            <button @click="deleteAssignment(a.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  assignmentsService,
  teamsService,
  evaluatorsService,
  templatesService,
  generateRandomCode
} from '@/services/supabase.js'

const teams = ref([])
const evaluators = ref([])
const templates = ref([])
const assignments = ref([])

const selectedTeamId = ref('')
const selectedEvaluatorId = ref('')
const selectedTemplateId = ref('')

const error = ref('')

const loadAll = async () => {
  try {
    teams.value = await teamsService.getAll()
    evaluators.value = await evaluatorsService.getAll()
    templates.value = await templatesService.getAll()
    assignments.value = await assignmentsService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar dados: ' + err.message
  }
}

const createAssignment = async () => {
  try {
    const team = teams.value.find(t => t.id === selectedTeamId.value)
    if (!team) throw new Error('Equipe não encontrada')

    const randomPart = generateRandomCode(8)
    const prefix = team.numero_estande || 'SEMEST'
    const fullCode = `${prefix}-${randomPart}`

    await assignmentsService.create({
      team_id: selectedTeamId.value,
      evaluator_id: selectedEvaluatorId.value,
      template_id: selectedTemplateId.value,
      code: fullCode
    })

    selectedTeamId.value = ''
    selectedEvaluatorId.value = ''
    selectedTemplateId.value = ''
    await loadAll()
  } catch (err) {
    error.value = 'Erro ao criar atribuição: ' + err.message
  }
}

const deleteAssignment = async (id) => {
  if (confirm('Excluir atribuição?')) {
    try {
      await assignmentsService.delete(id)
      await loadAll()
    } catch (err) {
      error.value = 'Erro ao excluir atribuição: ' + err.message
    }
  }
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert('Código copiado: ' + code)
  } catch {
    alert('Não foi possível copiar o código.')
  }
}

const formatDate = (iso) => {
  return iso ? new Date(iso).toLocaleString('pt-BR') : ''
}

onMounted(loadAll)
</script>

<style scoped>
.form {
  margin: 20px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.form select,
.form button {
  padding: 8px;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.error {
  color: red;
}
</style>
