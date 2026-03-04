<template>
  <div class="admin-questions">
    <h2>Perguntas da Prova</h2>

    <form @submit.prevent="createQuestion" class="form">
      <input
        v-model="newQuestion.text"
        placeholder="Texto da pergunta"
        required
      />

      <select v-model="newQuestion.type" required>
        <option value="" disabled>Tipo de pergunta</option>
        <option value="escala">Escala 0 a 5</option>
        <option value="aberta">Aberta (texto)</option>
      </select>

      <button type="submit">Cadastrar</button>
    </form>

    <p style="margin-top:8px;">
      Perguntas do tipo "escala" serão respondidas de 0 a 5; perguntas "abertas" recebem texto livre.
    </p>

    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Pergunta</th>
          <th>Tipo</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(q, index) in questions" :key="q.id">
          <td>{{ index + 1 }}</td>
          <td>{{ q.text }}</td>
          <td>{{ q.type === 'escala' ? 'Escala 0–5' : 'Aberta' }}</td>
          <td>
           
            <button @click="deleteQuestion(q.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { questionsService } from '@/services/supabase.js'

const questions = ref([])
const newQuestion = ref({ text: '', type: '' })
const error = ref('')

const loadQuestions = async () => {
  try {
    questions.value = await questionsService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar: ' + err.message
  }
}

const createQuestion = async () => {
  try {
    await questionsService.create(newQuestion.value)
    newQuestion.value = { text: '', type: '' }
    loadQuestions()
  } catch (err) {
    error.value = 'Erro ao cadastrar: ' + err.message
  }
}

const deleteQuestion = async (id) => {
  if (confirm('Excluir pergunta?')) {
    try {
      await questionsService.delete(id)
      loadQuestions()
    } catch (err) {
      error.value = 'Erro ao excluir: ' + err.message
    }
  }
}



onMounted(loadQuestions)
</script>

<style scoped>
.form { margin: 20px 0; }
.form input, .form select { margin: 5px; padding: 8px; }
.table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; }
.error { color: red; }
</style>
