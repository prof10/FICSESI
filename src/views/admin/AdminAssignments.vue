<template>
  <div class="admin-assignments">
    <header class="page-header">
      <h1>Atribuição de avaliações</h1>
      <p>Vincule equipes, avaliadores e modelos para gerar códigos de avaliação.</p>
    </header>

    <section class="card form-card">
      <h2>Gerar código de avaliação</h2>

      <form @submit.prevent="createAssignment" class="form-grid">
        <div>
          <label class="label">Equipe</label>
          <select v-model="selectedTeamId" required>
            <option value="" disabled>Selecione a equipe</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.numero_estande || '—' }} — {{ team.name }} ·
              {{ team.escola }} ({{ team.cidade }})
            </option>
          </select>
        </div>

        <div>
          <label class="label">Avaliador</label>
          <select v-model="selectedEvaluatorId" required>
            <option value="" disabled>Selecione o avaliador</option>
            <option v-for="ev in evaluators" :key="ev.id" :value="ev.id">
              {{ ev.name }} — {{ ev.area_conhecimento }}
            </option>
          </select>
        </div>

        <div>
          <label class="label">Modelo de avaliação</label>
          <select v-model="selectedTemplateId" required>
            <option value="" disabled>Selecione o modelo</option>
            <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">
              {{ tpl.name }} ({{ tpl.type === 'online' ? 'Online' : 'Presencial' }})
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit">Gerar código</button>
        </div>
      </form>
    </section>

    <section class="card table-card">
      <div class="table-header">
        <h2>Atribuições geradas</h2>
        <span class="table-count">{{ sortedAssignments.length }} código(s)</span>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th @click="setSort('code')" class="sortable">
                Código
                <span class="sort-icon" v-if="sortBy === 'code'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('team')" class="sortable">
                Equipe
                <span class="sort-icon" v-if="sortBy === 'team'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('evaluator')" class="sortable">
                Avaliador
                <span class="sort-icon" v-if="sortBy === 'evaluator'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('template')" class="sortable">
                Modelo
                <span class="sort-icon" v-if="sortBy === 'template'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('type')" class="sortable">
                Tipo
                <span class="sort-icon" v-if="sortBy === 'type'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('status')" class="sortable">
                Status
                <span class="sort-icon" v-if="sortBy === 'status'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('created_at')" class="sortable">
                Criado em
                <span class="sort-icon" v-if="sortBy === 'created_at'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in sortedAssignments" :key="a.id">
              <td><span class="code-pill">{{ a.code }}</span></td>
              <td>{{ a.team?.name }}</td>
              <td>{{ a.evaluator?.name }}</td>
              <td>{{ a.template?.name }}</td>
              <td>{{ a.template?.type === 'online' ? 'Online' : 'Presencial' }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="{
                    pending: a.status === 'pendente',
                    done: a.status === 'respondido'
                  }"
                >
                  {{ a.status }}
                </span>
              </td>
              <td>{{ formatDate(a.created_at) }}</td>
              <td class="col-actions">
                <button class="btn-secondary" @click="copyCode(a.code)">
                  Copiar
                </button>
                <button class="btn-secondary" @click="goToEvaluationDetails(a.id)">
                  Ver respostas
                </button>
                <button class="btn-danger" @click="deleteAssignment(a.id)">
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="!sortedAssignments.length">
              <td colspan="8" class="empty">Nenhuma atribuição cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import {
  assignmentsService,
  teamsService,
  evaluatorsService,
  templatesService,
  generateRandomCode
} from '@/services/supabase.js'

const router = useRouter()

const teams = ref([])
const evaluators = ref([])
const templates = ref([])
const assignments = ref([])

const selectedTeamId = ref('')
const selectedEvaluatorId = ref('')
const selectedTemplateId = ref('')
const error = ref('')

// estado de ordenação
const sortBy = ref('created_at') // 'code' | 'team' | 'evaluator' | 'template' | 'type' | 'status' | 'created_at'
const sortDir = ref('desc')

const goToEvaluationDetails = (id) => {
  router.push(`/admin/evaluations/${id}`)
}

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
    const team = teams.value.find((t) => t.id === selectedTeamId.value)
    if (!team) throw new Error('Equipe não encontrada')

    const randomPart = generateRandomCode(4)
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

const setSort = (field) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
}

const sortedAssignments = computed(() => {
  const arr = [...assignments.value]

  arr.sort((a, b) => {
    let fa
    let fb

    switch (sortBy.value) {
      case 'team':
        fa = a.team?.name ?? ''
        fb = b.team?.name ?? ''
        break
      case 'evaluator':
        fa = a.evaluator?.name ?? ''
        fb = b.evaluator?.name ?? ''
        break
      case 'template':
        fa = a.template?.name ?? ''
        fb = b.template?.name ?? ''
        break
      case 'type':
        fa = a.template?.type ?? ''
        fb = b.template?.type ?? ''
        break
      default:
        fa = a[sortBy.value] ?? ''
        fb = b[sortBy.value] ?? ''
    }

    // campo de data
    if (sortBy.value === 'created_at') {
      const da = new Date(fa || 0).getTime()
      const db = new Date(fb || 0).getTime()
      return sortDir.value === 'asc' ? da - db : db - da
    }

    const sa = String(fa).toLocaleLowerCase('pt-BR')
    const sb = String(fb).toLocaleLowerCase('pt-BR')
    if (sa < sb) return sortDir.value === 'asc' ? -1 : 1
    if (sa > sb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return arr
})

onMounted(loadAll)
</script>

<style scoped>
.admin-assignments {
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 16px;
}

.label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #78909c;
}

.form-grid select {
  width: 100%;
  padding: 9px 11px;
  border-radius: 999px;
  border: 1px solid #cfd8dc;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
  background-color: #fdfdfd;
  transition: border-color 0.18s, box-shadow 0.18s;
}

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

.code-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(17, 140, 58, 0.08);
  color: #118c3a;
  font-size: 12px;
  font-weight: 600;
}

/* Status colorido */
.status-pill {
  display: inline-block;
  min-width: 80px;
  text-align: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill.pending {
  background: rgba(239, 83, 80, 0.12);
  color: #d32f2f;
}

.status-pill.done {
  background: rgba(0, 179, 74, 0.14);
  color: #118c3a;
}

.col-actions {
  text-align: right;
  white-space: nowrap;
}

.btn-secondary {
  border: none;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  background: #ffffff;
  color: #118c3a;
  border: 1px solid rgba(17, 140, 58, 0.25);
  margin-right: 6px;
  transition: background 0.18s, color 0.18s, transform 0.18s;
}

.btn-secondary:hover {
  background: #118c3a;
  color: #ffffff;
  transform: translateY(-1px);
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
  .admin-assignments {
    padding: 20px 14px 28px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 18px 16px 18px;
  }
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table th.sortable:hover {
  background-color: #ecf4ee;
}

.sort-icon {
  margin-left: 4px;
  font-size: 11px;
  color: #78909c;
}
</style>
