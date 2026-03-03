<template>
  <div class="admin-templates">
    <h2>Modelos de Avaliação</h2>

    <form @submit.prevent="createTemplate" class="form">
  <input
    v-model="newTemplate.name"
    placeholder="Nome do modelo (ex: Avaliação Online)"
    required
  />

  <select v-model="newTemplate.type" required>
    <option value="" disabled>Tipo</option>
    <option value="online">Online</option>
    <option value="presencial">Presencial</option>
  </select>

  <input
    v-model="newTemplate.description"
    placeholder="Descrição (opcional)"
  />

  <button type="submit">Criar Modelo</button>
</form>


    <table class="table">
      <thead>
       
        <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Ações</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="tpl in templates" :key="tpl.id">
            <td>{{ tpl.name }}</td>
            <td>{{ tpl.type === 'online' ? 'Online' : 'Presencial' }}</td>
            <td>{{ tpl.description }}</td>
            <td>
            <button @click="selectTemplate(tpl)">Editar Perguntas</button>
            <button @click="deleteTemplate(tpl.id)">Excluir</button>
            </td>
        </tr>


      </tbody>
    </table>

    <hr v-if="selectedTemplate" />

    <div v-if="selectedTemplate">
      <h3>Perguntas do Modelo: {{ selectedTemplate.name }}</h3>

      <p>Marque quais perguntas farão parte desta avaliação.</p>

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
          {{ q.text }} — {{ q.type === 'escala' ? 'Escala 0–5' : 'Aberta' }}
        </label>
      </div>

      <button @click="saveQuestions">Salvar Perguntas do Modelo</button>

      <p v-if="saveMessage" class="success">{{ saveMessage }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

onMounted(async () => {
  await Promise.all([loadTemplates(), loadAllQuestions()])
})
</script>

<style scoped>
.form { margin: 20px 0; display: flex; gap: 8px; flex-wrap: wrap; }
.form input, .form button { padding: 8px; }
.table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; }

.questions-list {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.question-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.error { color: red; margin-top: 10px; }
.success { color: green; margin-top: 10px; }
</style>
