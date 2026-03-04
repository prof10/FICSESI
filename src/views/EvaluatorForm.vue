<template>
  <div class="evaluator-form">
    <h2>Avaliação de Equipe</h2>

    <!-- Passo 1: Digitar código -->
    <form @submit.prevent="handleSearchCode" class="code-form">
      <input
        v-model="code"
        type="text"
        placeholder="Digite o código da prova"
        required
      />
      <button type="submit" :disabled="loadingCode">
        {{ loadingCode ? 'Buscando...' : 'Entrar' }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <!-- Passo 2: Cabeçalho + formulário -->
    <div v-if="assignment" class="team-header">
      <h3>Dados da Equipe</h3>
      <p><strong>Código:</strong> {{ assignment.code }}</p>
      <p><strong>Número do estande:</strong> {{ assignment.team?.numero_estande }}</p>
      <p><strong>Equipe:</strong> {{ assignment.team?.name }}</p>
      <p><strong>Escola:</strong> {{ assignment.team?.escola }}</p>
      <p><strong>Cidade:</strong> {{ assignment.team?.cidade }}</p>
      <p><strong>Modelo:</strong> {{ assignment.template?.name }} ({{ assignment.template?.type }})</p>

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

            <!-- ESCALA 0–5 -->
            <div v-if="item.question.type === 'escala'">
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                v-model.number="answers[item.question.id]"
              />
              <span class="range-value">
                Nota: {{ answers[item.question.id] ?? 0 }} / 5
              </span>
            </div>

            <!-- TEXTO ABERTO -->
            <div v-else-if="item.question.type === 'aberta'">
              <textarea
                rows="3"
                v-model="answers[item.question.id]"
                required
              ></textarea>
            </div>

            <!-- Fallback: texto -->
            <div v-else>
              <textarea
                rows="3"
                v-model="answers[item.question.id]"
                required
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
      team:teams ( id, name, escola, cidade, numero_estande )
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

  // Carregar perguntas do template
  loadingQuestions.value = true
  try {
    const result = await templateQuestionsService.getByTemplate(
      assignment.value.template_id
    )
    questions.value = result || []

    // inicializa objeto de respostas
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
      error.value = 'Respostas salvas, mas não foi possível atualizar o status do código.'
      return
    }

    // gera e baixa o CSV para o avaliador
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
.evaluator-form {
  max-width: 700px;
  margin: 0 auto;
}

.code-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.code-form input {
  flex: 1;
  padding: 8px;
}

.code-form button {
  padding: 8px 16px;
}

.error {
  color: red;
  margin-bottom: 12px;
}

.team-header {
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 4px;
  background: #fafafa;
  margin-top: 16px;
}

.questions-form {
  margin-top: 16px;
}

.question-block {
  margin-bottom: 16px;
}

.question-text {
  font-weight: 600;
  margin-bottom: 4px;
}

.question-block textarea {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}

.range-value {
  margin-left: 8px;
  font-weight: 600;
}

.submit-btn {
  margin-top: 8px;
  padding: 8px 16px;
}

.loading {
  margin-top: 8px;
}
</style>
