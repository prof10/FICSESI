<template>
  <div class="admin-questions">
    <header class="page-header">
      <h1>Questões</h1>
      <p>Cadastro das perguntas utilizadas nas avaliações do FICSESI.</p>
    </header>

    <section class="card form-card">
      <h2>Cadastrar questão</h2>

      <form @submit.prevent="createQuestion" class="form-grid">
        <div class="field-full">
          <label class="label">Texto da pergunta</label>
          <textarea
            v-model="newQuestion.text"
            rows="4"
            class="textarea"
            placeholder="Digite o enunciado completo da pergunta"
            required
          ></textarea>
        </div>

        <div>
          <label class="label">Tipo de pergunta</label>
          <select v-model="newQuestion.type" required>
            <option value="" disabled>Selecione</option>
            <option value="escala">Escala 0 a 5</option>
            <option value="aberta">Aberta (texto)</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit">Cadastrar questão</button>
        </div>
      </form>

      <p class="helper">
        Perguntas de tipo <strong>escala</strong> serão respondidas de 0 a 5; perguntas
        <strong>abertas</strong> recebem texto livre.
      </p>
    </section>

    <section class="card table-card">
      <div class="table-header">
        <h2>Questões cadastradas</h2>
        <span class="table-count">{{ questions.length }} questão(ões)</span>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pergunta</th>
              <th>Tipo</th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(q, index) in questions" :key="q.id">
              <td>{{ index + 1 }}</td>
              <td class="col-text">{{ q.text }}</td>
              <td>{{ q.type === 'escala' ? 'Escala 0–5' : 'Aberta' }}</td>
              <td class="col-actions">
                <button class="btn-danger" @click="deleteQuestion(q.id)">Excluir</button>
              </td>
            </tr>
            <tr v-if="!questions.length">
              <td colspan="4" class="empty">Nenhuma questão cadastrada.</td>
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
.admin-questions {
  min-height: 100vh;
  padding: 28px 32px 40px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  box-sizing: border-box;
}

.page-header {
  max-width: 960px;
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
  max-width: 960px;
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
  grid-template-columns: 3fr 1fr;
  gap: 12px 16px;
}

.field-full {
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

.textarea {
  width: 100%;
  min-height: 96px;
  max-height: 220px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid #cfd8dc;
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  background-color: #fdfdfd;
}

.textarea:focus {
  border-color: #118c3a;
  box-shadow: 0 0 0 2px rgba(17, 140, 58, 0.18);
}

.form-grid select {
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

.helper {
  margin-top: 10px;
  font-size: 12px;
  color: #78909c;
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

.col-text {
  max-width: 520px;
  white-space: normal;
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
  max-width: 960px;
  margin: 0 auto;
  color: #d32f2f;
  font-size: 13px;
  padding-top: 4px;
}

@media (max-width: 900px) {
  .admin-questions {
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
