<template>
  <div class="admin-evaluators">
    <h2>Cadastro de Avaliadores</h2>

    <form @submit.prevent="createEvaluator" class="form">
      <input
        v-model="newEvaluator.name"
        placeholder="Nome do Avaliador"
        required
      />
      <input
        v-model="newEvaluator.email"
        type="email"
        placeholder="E-mail"
        required
      />

      <select v-model="newEvaluator.area_conhecimento" required>
        <option value="" disabled>Área de Conhecimento</option>
        <option value="Ciências Humanas e Sociais">Ciências Humanas e Sociais</option>
        <option value="Ciências da Natureza">Ciências da Natureza</option>
        <option value="Engenharias">Engenharias</option>
        <option value="Empreendedorismo">Empreendedorismo</option>
      </select>

      <button type="submit">Cadastrar</button>
    </form>

    <table class="table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Área de Conhecimento</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ev in evaluators" :key="ev.id">
          <td>{{ ev.name }}</td>
          <td>{{ ev.email }}</td>
          <td>{{ ev.area_conhecimento }}</td>
          <td>
            
            <button @click="deleteEvaluator(ev.id)">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { evaluatorsService } from '@/services/supabase.js'

const evaluators = ref([])
const newEvaluator = ref({
  name: '',
  email: '',
  area_conhecimento: ''
})
const error = ref('')

const loadEvaluators = async () => {
  try {
    evaluators.value = await evaluatorsService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar: ' + err.message
  }
}

const createEvaluator = async () => {
  try {
    await evaluatorsService.create(newEvaluator.value)
    newEvaluator.value = { name: '', email: '', area_conhecimento: '' }
    loadEvaluators()
  } catch (err) {
    error.value = 'Erro ao cadastrar: ' + err.message
  }
}

const deleteEvaluator = async (id) => {
  if (confirm('Excluir avaliador?')) {
    try {
      await evaluatorsService.delete(id)
      loadEvaluators()
    } catch (err) {
      error.value = 'Erro ao excluir: ' + err.message
    }
  }
}



onMounted(loadEvaluators)
</script>

<style scoped>
.form { margin: 20px 0; }
.form input, .form select { margin: 5px; padding: 8px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; }
.error { color: red; }
</style>
