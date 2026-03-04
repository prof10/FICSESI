<template>
  <div class="evaluation-details" v-if="evaluation">
    <h2>Detalhes da Avaliação</h2>

    <section class="header-section">
      <h3>Dados da Equipe</h3>
      <p><strong>Código:</strong> {{ evaluation.code }}</p>
      <p><strong>Status:</strong> {{ evaluation.status }}</p>
      <p><strong>Número do estande:</strong> {{ evaluation.team?.numero_estande }}</p>
      <p><strong>Equipe:</strong> {{ evaluation.team?.name }}</p>
      <p><strong>Escola:</strong> {{ evaluation.team?.escola }}</p>
      <p><strong>Cidade:</strong> {{ evaluation.team?.cidade }}</p>  
      <p><strong>Etapa de Ensino:</strong> {{ evaluation.team?.etapa_ensino }}</p>    
      <p><strong>Área do Conhecimento:</strong> {{ evaluation.team?.area_conhecimento }} </p>
      <p><strong>Categoria:</strong> {{ evaluation.team?.category }} </p>
      <p><strong>Avaliador:</strong> {{ evaluation.evaluator?.name }} ({{ evaluation.evaluator?.email }})</p>
      
      <p>
        <strong>Modelo:</strong>
        {{ evaluation.template?.name }}
        ({{ evaluation.template?.type }})
      </p>
      <p><strong>Criado em:</strong> {{ formatDate(evaluation.created_at) }}</p>
    </section>

    <section class="answers-section">
      <h3>Respostas</h3>
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
            <td>{{ ans.question?.text }}</td>
            <td>{{ ans.question?.type }}</td>
            <td>{{ ans.answer_value }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </div>

  <div v-else class="loading">
    Carregando avaliação...
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
      team:teams ( name, escola, cidade, numero_estande, area_conhecimento, category, etapa_ensino),
      evaluator:evaluators ( name, email ),
      template:evaluation_templates ( name, type ),
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
.evaluation-details {
  max-width: 900px;
  margin: 0 auto;
}

.header-section {
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 4px;
  background: #fafafa;
  margin-bottom: 16px;
}

.answers-section h3 {
  margin-bottom: 8px;
}

.answers-table {
  width: 100%;
  border-collapse: collapse;
}

.answers-table th,
.answers-table td {
  border: 1px solid #ddd;
  padding: 6px 8px;
}

.error {
  color: red;
  margin-top: 12px;
}

.loading {
  max-width: 900px;
  margin: 0 auto;
}
</style>
