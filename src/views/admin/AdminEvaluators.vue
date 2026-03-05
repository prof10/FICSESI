<template>
  <div class="admin-evaluators">
    <header class="page-header">
      <h1>Avaliadores</h1>
      <p>Cadastro e gestão dos avaliadores do FICSESI.</p>
    </header>

    <section class="card form-card">
      <h2>Cadastrar avaliador</h2>

      <form @submit.prevent="createEvaluator" class="form-grid">
        <input
          v-model="newEvaluator.name"
          placeholder="Nome do avaliador"
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

        <div class="form-actions">
          <button type="submit">Cadastrar avaliador</button>
        </div>
      </form>
    </section>

    <section class="card table-card">
      <div class="table-header">
        <h2>Avaliadores cadastrados</h2>
        <span class="table-count">{{ evaluators.length }} avaliador(es)</span>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Área de Conhecimento</th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in evaluators" :key="ev.id">
              <td>{{ ev.name }}</td>
              <td>{{ ev.email }}</td>
              <td>{{ ev.area_conhecimento }}</td>
              <td class="col-actions">
                <button class="btn-danger" @click="deleteEvaluator(ev.id)">Excluir</button>
              </td>
            </tr>
            <tr v-if="!evaluators.length">
              <td colspan="4" class="empty">Nenhum avaliador cadastrado.</td>
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
.admin-evaluators {
  min-height: 100vh;
  padding: 28px 32px 40px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  box-sizing: border-box;
}

.page-header {
  max-width: 800px;
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
  max-width: 800px;
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

.form-grid input,
.form-grid select {
  padding: 9px 11px;
  border-radius: 999px;
  border: 1px solid #cfd8dc;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  background-color: #fdfdfd;
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
  max-width: 800px;
  margin: 0 auto;
  color: #d32f2f;
  font-size: 13px;
  padding-top: 4px;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 18px 16px 18px;
  }

  .admin-evaluators {
    padding: 20px 14px 28px;
  }
}
</style>
