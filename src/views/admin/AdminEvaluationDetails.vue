<template>
  <div class="evaluation-page">
    <div v-if="evaluation" class="evaluation-details">
      <header class="page-header">
        <h1>Detalhes da avaliação</h1>
        <p>Código: <span class="code-pill">{{ evaluation.code }}</span></p>
      </header>

      <section class="card header-card">
        <h2>Dados do Projeto</h2>

        <div class="info-grid">
          <div>
            <span class="label">Status</span>
            <p class="value">{{ evaluation.status }}</p>
          </div>

          <div>
            <span class="label">Nº do estande</span>
            <p class="value">{{ evaluation.team?.numero_estande || '—' }}</p>
          </div>

          <div class="wide">
            <span class="label">Projeto</span>
            <p class="value">{{ evaluation.team?.name }}</p>
          </div>

          <div class="wide">
            <span class="label">Escola</span>
            <p class="value">{{ evaluation.team?.escola }}</p>
          </div>

          <div>
            <span class="label">Cidade</span>
            <p class="value">{{ evaluation.team?.cidade }}</p>
          </div>

          <div>
            <span class="label">Etapa de ensino</span>
            <p class="value">{{ evaluation.team?.etapa_ensino }}</p>
          </div>

          <div>
            <span class="label">Área do conhecimento</span>
            <p class="value">{{ evaluation.team?.area_conhecimento }}</p>
          </div>

          <div>
            <span class="label">Categoria</span>
            <p class="value">{{ evaluation.team?.category }}</p>
          </div>

          <div class="wide">
            <span class="label">Avaliador</span>
            <p class="value">
              {{ evaluation.evaluator?.name }}
              <span class="muted">({{ evaluation.evaluator?.email }})</span>
            </p>
          </div>

          <div>
            <span class="label">Modelo</span>
            <p class="value">
              {{ evaluation.template?.name }}
              <span class="muted">
                ({{ evaluation.template?.type === 'online' ? 'Online' : 'Presencial' }})
              </span>
            </p>
          </div>

          <div>
            <span class="label">Criado em</span>
            <p class="value">{{ formatDate(evaluation.created_at) }}</p>
          </div>
        </div>
      </section>

      <section class="card answers-card">
        <h2>Respostas</h2>
        <p class="helper">
          Veja abaixo as respostas registradas para cada questão deste modelo.
        </p>

        <div class="table-wrapper">
          <table class="answers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Pergunta</th>
                <th>Tipo</th>
                <th>Resposta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ans, index) in evaluation.answers" :key="index">
                <td>{{ index + 1 }}</td>
                <td class="col-question">
                  <span v-html="ans.question?.text"></span>
                </td>
                <td>{{ ans.question?.type === 'escala' ? 'Escala 0–5' : 'Aberta' }}</td>
                <td class="col-answer">
                  <span v-if="ans.question?.type === 'escala'">
                    {{ ans.answer_value }}
                  </span>
                  <span v-else>
                    {{ ans.answer_value }}
                  </span>
                </td>
              </tr>
              <tr v-if="!evaluation.answers?.length">
                <td colspan="4" class="empty">
                  Nenhuma resposta registrada para esta avaliação.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-else class="loading">
      Carregando avaliação...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/composables/useSupabase.js'

const route = useRoute()
const evaluation = ref(null)
const error = ref('')

const loadEvaluation = async () => {
  error.value = ''
  const id = route.params.id

  const { data, error: err } = await supabase
    .from('assignments')
    .select(`
      id,
      code,
      status,
      created_at,
      team:teams (
        name,
        escola,
        cidade,
        numero_estande,
        area_conhecimento,
        category,
        etapa_ensino
      ),
      evaluator:evaluators (
        name,
        email
      ),
      template:evaluation_templates (
        name,
        type
      ),
      answers:evaluation_answers (
        answer_value,
        question:questions ( text, type )
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (err) {
    error.value = 'Erro ao carregar avaliação.'
    return
  }

  if (!data) {
    error.value = 'Avaliação não encontrada.'
    return
  }

  evaluation.value = data
}

const formatDate = (iso) => {
  return iso ? new Date(iso).toLocaleString('pt-BR') : ''
}

onMounted(loadEvaluation)
</script>

<style scoped>
.evaluation-page {
  min-height: 100vh;
  padding: 28px 32px 40px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  box-sizing: border-box;
}

.evaluation-details {
  max-width: 1080px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #118c3a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #546e7a;
}

.code-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(17, 140, 58, 0.09);
  color: #118c3a;
  font-size: 13px;
  font-weight: 600;
}

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 22px 22px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(17, 140, 58, 0.06);
  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 14px;
  font-size: 16px;
  letter-spacing: 0.09em;
  color: #118c3a;
  text-transform: uppercase;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 18px;
  font-size: 13px;
}

.info-grid .wide {
  grid-column: 1 / -1;
}

.label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #78909c;
  margin-bottom: 2px;
}

.value {
  margin: 0;
  color: #37474f;
}

.muted {
  color: #90a4ae;
  font-size: 12px;
}

.answers-card .helper {
  font-size: 12px;
  color: #78909c;
  margin-bottom: 10px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.answers-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.answers-table th,
.answers-table td {
  padding: 8px 8px;
  text-align: left;
  border-bottom: 1px solid #eceff1;
}

.answers-table th {
  font-weight: 600;
  color: #455a64;
  background-color: #f5f9f6;
}

.answers-table tbody tr:hover {
  background-color: #f9fcf9;
}

.col-question {
  max-width: 480px;
  white-space: normal;
}

.col-answer {
  max-width: 320px;
  white-space: pre-wrap;
}

.empty {
  text-align: center;
  padding: 20px 8px;
  color: #90a4ae;
}

.error {
  margin-top: 8px;
  color: #d32f2f;
  font-size: 13px;
}

.loading {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 14px;
  color: #546e7a;
}
  
@media (max-width: 900px) {
  .evaluation-page {
    padding: 20px 14px 28px;
  }

  .card {
    padding: 18px 16px 18px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
