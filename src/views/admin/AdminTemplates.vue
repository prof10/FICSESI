<template>
  <div class="admin-templates">
    <header class="page-header">
      <h1>Avaliações</h1>
      <p>Modelos de avaliação e vínculo com as questões do FICSESI.</p>
    </header>

    <section class="card form-card">
      <h2>Criar modelo de avaliação</h2>

      <form @submit.prevent="createTemplate" class="form-grid">
        <div class="field-name">
          <label class="label">Nome do modelo</label>
          <input
            v-model="newTemplate.name"
            placeholder="Ex.: Avaliação Online"
            required
          />
        </div>

        <div>
          <label class="label">Tipo</label>
          <select v-model="newTemplate.type" required>
            <option value="" disabled>Selecione</option>
            <option value="online">Online</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>

        <div class="field-desc">
          <label class="label">Descrição (opcional)</label>
          <input
            v-model="newTemplate.description"
            placeholder="Breve descrição para identificar o modelo"
          />
        </div>

        <div class="form-actions">
          <button type="submit">Criar modelo</button>
        </div>
      </form>
    </section>

    <section class="card table-card">
      <div class="table-header">
        <h2>Modelos cadastrados</h2>
        <span class="table-count">{{ sortedTemplates.length }} modelo(s)</span>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th @click="setSort('name')" class="sortable">
                Nome
                <span class="sort-icon" v-if="sortBy === 'name'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('type')" class="sortable">
                Tipo
                <span class="sort-icon" v-if="sortBy === 'type'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th>Descrição</th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tpl in sortedTemplates" :key="tpl.id">
              <td>{{ tpl.name }}</td>
              <td>{{ tpl.type === 'online' ? 'Online' : 'Presencial' }}</td>
              <td class="col-desc">{{ tpl.description }}</td>
              <td class="col-actions">
                <button class="btn-secondary" @click="selectTemplate(tpl)">
                  Editar perguntas
                </button>
                <button class="btn-danger" @click="deleteTemplate(tpl.id)">
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="!sortedTemplates.length">
              <td colspan="4" class="empty">Nenhum modelo cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="selectedTemplate" class="card questions-card">
      <div class="questions-header">
        <div>
          <h2>Perguntas do modelo</h2>
          <p>Modelo selecionado: <strong>{{ selectedTemplate.name }}</strong></p>
        </div>
        <span class="badge">
          {{ selectedQuestionIds.length }} pergunta(s) selecionada(s)
        </span>
      </div>

      <p class="helper">
        Marque quais questões farão parte desta avaliação. Você pode combinar
        perguntas de escala 0–5 e perguntas abertas.
      </p>

      <div class="questions-list">
        <label
          v-for="q in allQuestions"
          :key="q.id"
          class="question-item"
        >
          <input
            type="checkbox"
            :value="q.id"
            v-model="selectedQuestionIds"
          />
          <div class="question-text">
            <span class="question-title">{{ q.text }}</span>
            <span class="question-type">
              {{ q.type === 'escala' ? 'Escala 0–5' : 'Aberta' }}
            </span>
          </div>
        </label>

        <p v-if="!allQuestions.length" class="empty">
          Nenhuma pergunta cadastrada. Cadastre questões antes de montar o modelo.
        </p>
      </div>

      <div class="questions-actions">
        <button @click="saveQuestions">Salvar perguntas do modelo</button>
        <p v-if="saveMessage" class="success">{{ saveMessage }}</p>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  templatesService,
  templateQuestionsService,
  questionsService
} from '@/services/supabase.js'

const templates = ref([])
const newTemplate = ref({ name: '', type: '', description: '' })
const selectedTemplate = ref(null)

const allQuestions = ref([])
const selectedQuestionIds = ref([])

const error = ref('')
const saveMessage = ref('')

// ordenação
const sortBy = ref('name') // 'name' | 'type'
const sortDir = ref('asc')

const loadTemplates = async () => {
  try {
    templates.value = await templatesService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar modelos: ' + err.message
  }
}

const loadAllQuestions = async () => {
  try {
    allQuestions.value = await questionsService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar perguntas: ' + err.message
  }
}

const createTemplate = async () => {
  try {
    await templatesService.create(newTemplate.value)
    newTemplate.value = { name: '', type: '', description: '' }
    await loadTemplates()
  } catch (err) {
    error.value = 'Erro ao criar modelo: ' + err.message
  }
}

const deleteTemplate = async (id) => {
  if (confirm('Excluir este modelo?')) {
    try {
      await templatesService.delete(id)
      if (selectedTemplate.value?.id === id) {
        selectedTemplate.value = null
        selectedQuestionIds.value = []
      }
      await loadTemplates()
    } catch (err) {
      error.value = 'Erro ao excluir modelo: ' + err.message
    }
  }
}

const selectTemplate = async (tpl) => {
  selectedTemplate.value = tpl
  saveMessage.value = ''
  try {
    const rows = await templateQuestionsService.getByTemplate(tpl.id)
    selectedQuestionIds.value = rows.map((r) => r.question.id)
  } catch (err) {
    error.value = 'Erro ao carregar perguntas do modelo: ' + err.message
  }
}

const saveQuestions = async () => {
  if (!selectedTemplate.value) return
  try {
    await templateQuestionsService.saveTemplateQuestions(
      selectedTemplate.value.id,
      selectedQuestionIds.value
    )
    saveMessage.value = 'Perguntas salvas com sucesso!'
  } catch (err) {
    error.value = 'Erro ao salvar perguntas do modelo: ' + err.message
  }
}

const setSort = (field) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
}

const sortedTemplates = computed(() => {
  const arr = [...templates.value]
  arr.sort((a, b) => {
    const fa = a[sortBy.value] ?? ''
    const fb = b[sortBy.value] ?? ''
    const sa = String(fa).toLocaleLowerCase('pt-BR')
    const sb = String(fb).toLocaleLowerCase('pt-BR')
    if (sa < sb) return sortDir.value === 'asc' ? -1 : 1
    if (sa > sb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
  return arr
})

onMounted(async () => {
  await Promise.all([loadTemplates(), loadAllQuestions()])
})
</script>

<style scoped>
.admin-templates {
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
  grid-template-columns: 2fr 1fr;
  gap: 12px 16px;
}

.field-name {
  grid-column: 1 / 2;
}

.field-desc {
  grid-column: 1 / -1;
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

.form-grid input,
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

.form-actions button,
.questions-actions button {
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

.form-actions button:hover,
.questions-actions button:hover {
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

.col-desc {
  max-width: 360px;
  white-space: normal;
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

.questions-card {
  max-width: 1080px;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(17, 140, 58, 0.08);
  color: #118c3a;
}

.helper {
  margin: 8px 0 14px;
  font-size: 12px;
  color: #78909c;
}

.questions-list {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.question-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  transition: background 0.15s;
}

.question-item:hover {
  background: #f5f9f6;
}

.question-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.question-title {
  font-size: 13px;
  color: #37474f;
}

.question-type {
  font-size: 11px;
  color: #78909c;
}

.questions-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.error {
  max-width: 1080px;
  margin: 0 auto;
  color: #d32f2f;
  font-size: 13px;
  padding-top: 4px;
}

.success {
  font-size: 12px;
  color: #2e7d32;
}

.empty {
  text-align: center;
  padding: 20px 8px;
  color: #90a4ae;
}

@media (max-width: 900px) {
  .admin-templates {
    padding: 20px 14px 28px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 18px 16px 18px;
  }

  .questions-header {
    flex-direction: column;
    align-items: flex-start;
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
