<template>
  <div class="evaluator-page">
    <div class="evaluator-form">
      <header class="page-header">
        <h1>Avaliação de equipes</h1>
        <p>Informe o código recebido para acessar a ficha de avaliação.</p>
      </header>

      <!-- Passo 1: Digitar código -->
      <section class="card code-card">
        <h2>Entrada do código</h2>
        <form @submit.prevent="handleSearchCode" class="code-form">
          <input
            v-model="code"
            type="text"
            placeholder="Digite o código da avaliação"
            required
          />
          <button type="submit" :disabled="loadingCode">
            {{ loadingCode ? 'Buscando...' : 'Entrar' }}
          </button>
        </form>
        <p v-if="error" class="error">{{ error }}</p>
      </section>

      <!-- Passo 2: Cabeçalho + formulário -->
      <section v-if="assignment" class="card team-card">
        <h2>Dados da equipe</h2>

        <div class="team-grid">
          <div>
            <span class="label">Código</span>
            <p class="value code-pill">{{ assignment.code }}</p>
          </div>

          <div>
            <span class="label">Nº do estande</span>
            <p class="value">{{ assignment.team?.numero_estande || '—' }}</p>
          </div>

          <div class="wide">
            <span class="label">Equipe</span>
            <p class="value">{{ assignment.team?.name }}</p>
          </div>

          <div class="wide">
            <span class="label">Escola</span>
            <p class="value">{{ assignment.team?.escola }}</p>
          </div>

          <div>
            <span class="label">Cidade</span>
            <p class="value">{{ assignment.team?.cidade }}</p>
          </div>

          <div>
            <span class="label">Área do conhecimento</span>
            <p class="value">{{ assignment.team?.area_conhecimento }}</p>
          </div>

          <div class="wide">
            <span class="label">Modelo</span>
            <p class="value">
              {{ assignment.template?.name }}
              <span class="muted">
                ({{ assignment.template?.type === 'online' ? 'Online' : 'Presencial' }})
              </span>
            </p>
          </div>
        </div>

        <!-- Formulário de avaliação -->
        <form @submit.prevent="handleSubmitEvaluation" class="questions-form">
          <div v-if="loadingQuestions" class="loading">
            Carregando perguntas...
          </div>

          <div v-else>
            <div
              v-for="(item, index) in questions"
              :key="item.id"
              class="question-block"
            >
              <p class="question-text">
                {{ index + 1 }}. {{ item.question.text }}
              </p>

              <!-- ESCALA 0–5 com estrelas -->
              <div
                v-if="item.question.type === 'escala'"
                class="stars-wrapper"
              >
                <div class="stars">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    class="star"
                    :class="{ active: (answers[item.question.id] ?? 0) >= n }"
                    @click="setStar(item.question.id, n)"
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    class="star zero"
                    :class="{ active: (answers[item.question.id] ?? 0) === 0 }"
                    @click="setStar(item.question.id, 0)"
                  >
                    0
                  </button>
                </div>
                <span class="star-value">
                  Nota: {{ answers[item.question.id] ?? 0 }} / 5
                </span>
              </div>

              <!-- TEXTO ABERTO -->
              <div v-else-if="item.question.type === 'aberta'">
                <textarea
                  rows="3"
                  v-model="answers[item.question.id]"
                  required
                  placeholder="Digite sua resposta"
                ></textarea>
              </div>

              <!-- Fallback: texto -->
              <div v-else>
                <textarea
                  rows="3"
                  v-model="answers[item.question.id]"
                  required
                  placeholder="Digite sua resposta"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              class="submit-btn"
              :disabled="submitting || questions.length === 0"
            >
              {{ submitting ? 'Enviando...' : 'Enviar avaliação' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/composables/useSupabase.js'
import { templateQuestionsService } from '@/services/supabase.js'

const code = ref('')
const assignment = ref(null)
const questions = ref([])
const answers = ref({})

const error = ref('')
const loadingCode = ref(false)
const loadingQuestions = ref(false)
const submitting = ref(false)

const handleSearchCode = async () => {
  error.value = ''
  assignment.value = null
  questions.value = []
  answers.value = {}
  loadingCode.value = true

  const trimmedCode = code.value.trim()

  const { data, error: err } = await supabase
    .from('assignments')
    .select(`
      id,
      code,
      status,
      template_id,
      template:evaluation_templates ( id, name, type ),
      team:teams (
        id,
        name,
        escola,
        cidade,
        numero_estande,
        area_conhecimento
      )
    `)
    .eq('code', trimmedCode)
    .maybeSingle()

  loadingCode.value = false

  if (err) {
    error.value = 'Erro ao buscar código. Tente novamente.'
    return
  }

  if (!data) {
    error.value = 'Código inválido.'
    return
  }

  if (data.status !== 'pendente') {
    error.value = 'Este código já foi utilizado para uma avaliação.'
    return
  }

  assignment.value = data

  loadingQuestions.value = true
  try {
    const result = await templateQuestionsService.getByTemplate(
      assignment.value.template_id
    )
    questions.value = result || []

    const initialAnswers = {}
    for (const item of questions.value) {
      initialAnswers[item.question.id] =
        item.question.type === 'escala' ? 0 : ''
    }
    answers.value = initialAnswers
  } catch (e) {
    error.value = 'Erro ao carregar perguntas.'
  } finally {
    loadingQuestions.value = false
  }
}

const setStar = (questionId, value) => {
  answers.value = {
    ...answers.value,
    [questionId]: value
  }
}

const makeCsvAndDownload = () => {
  if (!assignment.value) return

  const header = [
    'codigo',
    'equipe',
    'escola',
    'cidade',
    'pergunta',
    'tipo',
    'resposta'
  ]

  const lines = questions.value.map((item, index) => {
    const q = item.question
    const value = answers.value[q.id]
    return [
      assignment.value.code,
      assignment.value.team?.name,
      assignment.value.team?.escola,
      assignment.value.team?.cidade,
      `${index + 1}. ${q.text}`,
      q.type,
      value
    ]
  })

  const rows = [header, ...lines]

  const csvString = rows
    .map(row =>
      row
        .map(field => `"${String(field ?? '').replace(/"/g, '""')}"`)
        .join(';')
    )
    .join('\n')

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `avaliacao-${assignment.value.code}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleSubmitEvaluation = async () => {
  if (!assignment.value) return

  // valida se todas as respostas foram preenchidas
  for (const item of questions.value) {
    const qid = item.question.id
    const value = answers.value[qid]
    if (value === '' || value === null || value === undefined) {
      error.value = 'Preencha todas as respostas antes de enviar.'
      return
    }
  }

  error.value = ''
  submitting.value = true

  try {
    const rows = questions.value.map((item) => ({
      assignment_id: assignment.value.id,
      question_id: item.question.id,
      answer_value: String(answers.value[item.question.id])
    }))

    const { error: insertError } = await supabase
      .from('evaluation_answers')
      .insert(rows)

    if (insertError) {
      console.error('Erro insert evaluation_answers', insertError)
      error.value = 'Erro ao salvar respostas. Tente novamente.'
      return
    }

    const { error: updateError } = await supabase
      .from('assignments')
      .update({ status: 'respondido' })
      .eq('id', assignment.value.id)

    if (updateError) {
      console.error('Erro update assignments', updateError)
      error.value =
        'Respostas salvas, mas não foi possível atualizar o status do código.'
      return
    }

    makeCsvAndDownload()

    alert('Avaliação enviada com sucesso!')
    assignment.value = null
    questions.value = []
    answers.value = {}
    code.value = ''
  } catch (e) {
    console.error('Erro inesperado', e)
    error.value = 'Erro ao enviar avaliação. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.evaluator-page {
  min-height: 100vh;
  padding: 28px 32px 40px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  box-sizing: border-box;
}

.evaluator-form {
  max-width: 780px;
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
  margin: 4px 0 0;
  font-size: 14px;
  color: #546e7a;
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

.code-form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.code-form input {
  flex: 1;
  min-width: 180px;
  padding: 9px 11px;
  border-radius: 999px;
  border: 1px solid #cfd8dc;
  font-size: 14px;
  outline: none;
  background-color: #fdfdfd;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.code-form input:focus {
  border-color: #118c3a;
  box-shadow: 0 0 0 2px rgba(17, 140, 58, 0.18);
}

.code-form button {
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

.code-form button:hover:not(:disabled) {
  background: #02983f;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 179, 74, 0.45);
}

.code-form button:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  margin-top: 8px;
  color: #d32f2f;
  font-size: 13px;
}

.team-card {
  margin-top: 6px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 18px;
  font-size: 13px;
  margin-top: 8px;
}

.team-grid .wide {
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

.code-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(17, 140, 58, 0.09);
  color: #118c3a;
  font-size: 12px;
  font-weight: 600;
}

.questions-form {
  margin-top: 18px;
}

.question-block {
  padding: 12px 10px;
  border-radius: 14px;
  background: #f8fcf8;
  border: 1px solid #e0f2e9;
  margin-bottom: 12px;
}

.question-text {
  font-weight: 600;
  margin: 0 0 6px;
  color: #37474f;
}

.question-block textarea {
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #cfd8dc;
  font-size: 13px;
  box-sizing: border-box;
  resize: vertical;
  outline: none;
  background: #ffffff;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.question-block textarea:focus {
  border-color: #118c3a;
  box-shadow: 0 0 0 2px rgba(17, 140, 58, 0.18);
}

/* Estrelas 0–5 */
.stars-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  padding: 0 2px;
  color: #cfd8dc;
  transition: color 0.15s, transform 0.15s;
}

.star.active {
  color: #ffc107;
}

.star.zero {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid #cfd8dc;
  line-height: 1;
}

.star.zero.active {
  border-color: #118c3a;
  color: #118c3a;
}

.star:hover {
  transform: translateY(-1px);
}

.star-value {
  font-size: 13px;
  color: #455a64;
  font-weight: 500;
}

.submit-btn {
  margin-top: 10px;
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
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

.submit-btn:hover:not(:disabled) {
  background: #02983f;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 179, 74, 0.45);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.loading {
  margin-top: 10px;
  font-size: 13px;
  color: #546e7a;
}

@media (max-width: 900px) {
  .evaluator-page {
    padding: 20px 14px 28px;
  }

  .card {
    padding: 18px 16px 18px;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }

  .code-form {
    flex-direction: column;
  }

  .code-form button {
    width: 100%;
    text-align: center;
  }
}
</style>
