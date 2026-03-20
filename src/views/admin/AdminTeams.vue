<template>
  <div class="admin-teams">
    <header class="page-header">
      <h1>Projetos</h1>
      <p>Cadastro e gestão dos projetos participantes da FICSESI.</p>
    </header>

    <section class="card form-card">
      <h2>Cadastar Projeto</h2>

      <form @submit.prevent="createTeam" class="form-grid">
        <input v-model="newTeam.numero_estande" placeholder="N° Estande" />

        <input v-model="newTeam.name" placeholder="Nome do Projeto" required />

        <input v-model="newTeam.escola" placeholder="Escola" required />

        <input v-model="newTeam.cidade" placeholder="Cidade" required />

        <select v-model="newTeam.area_conhecimento" required>
          <option value="" disabled>Área de Conhecimento</option>
          <option value="Ciências Humanas e Sociais">Ciências Humanas e Sociais</option>
          <option value="Ciências da Natureza">Ciências da Natureza</option>
          <option value="Engenharias">Engenharias</option>
          <option value="Empreendedorismo">Empreendedorismo</option>
        </select>

        <select v-model="newTeam.etapa_ensino" required>
          <option value="" disabled>Etapa de Ensino</option>
          <option value="Educação Infantil">Educação Infantil</option>
          <option value="Anos Iniciais">Anos Iniciais</option>
          <option value="Anos Finais">Anos Finais</option>
          <option value="Ensino Médio">Ensino Médio</option>
          <option value="Anos Finais EJA">Anos Finais - EJA</option>
          <option value="Ensino Médio EJA">Ensino Médio - EJA</option>
        </select>

        <select v-model="newTeam.category" required>
          <option value="" disabled>Categoria da Premiação</option>
          <option value="Educação Infantil">Educação Infantil</option>
          <option value="Anos Iniciais">Anos Iniciais</option>
          <option value="Anos Finais">Anos Finais</option>
          <option value="Ciências da Natureza">Ciências da Natureza</option>
          <option value="Ciências Humanas">Ciências Humanas</option>
          <option value="Empreendedorismo">Empreendedorismo</option>
          <option value="Engenharias">Engenharias</option>
          <option value="Mentes Criativas">Mentes Criativas</option>
          <option value="EJA">EJA</option>
        </select>

        <div class="form-actions">
          <button type="submit">Cadastrar projeto</button>
        </div>
      </form>
    </section>

    <!-- 📥 IMPORT CSV - COLE AQUI -->
<section class="card import-card">
  
  
  <div class="import-options">
    <!-- Opção 1: Textarea CSV -->
    <div class="csv-paste">
      <label>Cole o CSV aqui:</label>
      <textarea 
        v-model="csvText" 
        rows="6" 
        placeholder="numero_estande;name;escola;cidade;area_conhecimento;etapa_ensino;category
001;Robô Solar;SESI 101;Curitiba;Engenharias;Ensino Médio;Engenharias"
        @input="parseCsvText"
      ></textarea>
    </div>
    
    
   
  </div>
  
  <!-- Preview + Importar -->
  <div v-if="csvData.length" class="import-preview">
    <div class="preview-header">
      <span>✅ {{ csvData.length }} projetos prontos</span>
      <button @click="importTeams" class="import-btn" :disabled="importing">
        {{ importing ? 'Importando...' : 'IMPORTAR AGORA' }}
      </button>
    </div>
    <div class="preview-table">
      <table>
        <thead>
          <tr>
            <th>Estande</th>
            <th>Projeto</th>
            <th>Escola</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in csvData.slice(0,3)" :key="i">
            <td>{{ row.numero_estande }}</td>
            <td>{{ row.name?.slice(0,20) }}</td>
            <td>{{ row.escola }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>


    <section class="card table-card">
      <div class="table-header">
        <h2>Projetos cadastrados</h2>
        <span class="table-count">{{ sortedTeams.length }} equipe(s)</span>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th @click="setSort('numero_estande')" class="sortable">
                N° Estande
                <span class="sort-icon" v-if="sortBy === 'numero_estande'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('name')" class="sortable">
                Nome do Projeto
                <span class="sort-icon" v-if="sortBy === 'name'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('escola')" class="sortable">
                Escola
                <span class="sort-icon" v-if="sortBy === 'escola'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('cidade')" class="sortable">
                Cidade
                <span class="sort-icon" v-if="sortBy === 'cidade'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('area_conhecimento')" class="sortable">
                Área de Conhecimento
                <span class="sort-icon" v-if="sortBy === 'area_conhecimento'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('etapa_ensino')" class="sortable">
                Etapa de Ensino
                <span class="sort-icon" v-if="sortBy === 'etapa_ensino'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th @click="setSort('category')" class="sortable">
                Categoria da Premiação
                <span class="sort-icon" v-if="sortBy === 'category'">
                  {{ sortDir === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in sortedTeams" :key="team.id">
              <td>{{ team.numero_estande }}</td>
              <td>{{ team.name }}</td>
              <td>{{ team.escola }}</td>
              <td>{{ team.cidade }}</td>
              <td>{{ team.area_conhecimento }}</td>
              <td>{{ team.etapa_ensino }}</td>
              <td>{{ team.category }}</td>
              <td class="col-actions">
                <button class="btn-danger" @click="deleteTeam(team.id)">Excluir</button>
              </td>
            </tr>
            <tr v-if="!sortedTeams.length">
              <td colspan="8" class="empty">Nenhuma equipe cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { teamsService } from '@/services/supabase.js'

const teams = ref([])
const newTeam = ref({
  numero_estande: '',
  name: '',
  escola: '',
  cidade: '',
  area_conhecimento: '',
  category: '',
  etapa_ensino: ''
})
const error = ref('')

// 👇 NOVO: IMPORT
const csvText = ref('')
const csvData = ref([])
const fileInput = ref(null)
const importing = ref(false)

const sortBy = ref('name')
const sortDir = ref('asc')

// Parse CSV texto ou arquivo
const parseCsvText = () => {
  if (!csvText.value.trim()) {
    csvData.value = []
    return
  }
  const lines = csvText.value.split('\n').filter(l => l.trim())
  const headers = lines[0].split(';').map(h => h.trim().toLowerCase())
  
  csvData.value = lines.slice(1)
    .map(line => {
      const values = line.split(';').map(v => v.trim().replace(/"/g, ''))
      const row = {}
      headers.forEach((h, i) => row[h] = values[i] || '')
      return row
    })
    .filter(row => row.name && row.escola)
}

const handleFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.name.endsWith('.csv')) {
    const text = await file.text()
    csvText.value = text
    parseCsvText()
  }
  // Excel futuramente
}

const importTeams = async () => {
  importing.value = true
  let successCount = 0
  
  try {
    for (const row of csvData.value) {
      await teamsService.create({
        numero_estande: row.numero_estande || '',
        name: row.name || '',
        escola: row.escola || '',
        cidade: row.cidade || '',
        area_conhecimento: row.area_conhecimento || '',
        etapa_ensino: row.etapa_ensino || '',
        category: row.category || ''
      })
      successCount++
    }
    
    csvText.value = ''
    csvData.value = []
    await loadTeams()
    alert(`✅ ${successCount} projetos importados!`)
  } catch (err) {
    error.value = 'Erro: ' + err.message
  } finally {
    importing.value = false
  }
}

// Resto igual...
const loadTeams = async () => {
  try {
    teams.value = await teamsService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar: ' + err.message
  }
}

const createTeam = async () => {
  try {
    await teamsService.create(newTeam.value)
    newTeam.value = { numero_estande: '', name: '', escola: '', cidade: '', area_conhecimento: '', category: '', etapa_ensino: '' }
    loadTeams()
  } catch (err) {
    error.value = 'Erro ao cadastrar: ' + err.message
  }
}

const deleteTeam = async (id) => {
  if (confirm('Excluir equipe?')) {
    try {
      await teamsService.delete(id)
      loadTeams()
    } catch (err) {
      error.value = 'Erro ao excluir: ' + err.message
    }
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

const sortedTeams = computed(() => {
  const arr = [...teams.value]
  arr.sort((a, b) => {
    const fa = a[sortBy.value] ?? ''
    const fb = b[sortBy.value] ?? ''
    if (sortBy.value === 'numero_estande') {
      const na = Number(fa) || 0
      const nb = Number(fb) || 0
      return sortDir.value === 'asc' ? na - nb : nb - na
    }
    const sa = String(fa).toLocaleLowerCase('pt-BR')
    const sb = String(fb).toLocaleLowerCase('pt-BR')
    if (sa < sb) return sortDir.value === 'asc' ? -1 : 1
    if (sa > sb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
  return arr
})

onMounted(loadTeams)
</script>


<style scoped>
.admin-teams {
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

/* TODOS OS CARDS */
.card {
  max-width: 1080px;
  margin: 0 auto 20px;
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 22px 22px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(17, 140, 58, 0.06);
  box-sizing: border-box;
}

.card h2 {
  margin: 0 0 14px;
  font-size: 16px;
  letter-spacing: 0.09em;
  color: #118c3a;
  text-transform: uppercase;
}

/* IMPORT CARD VERDE */
.import-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 2px dashed #81c784 !important;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

/* TABELA */
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
  max-width: 1080px;
  margin: 0 auto;
  color: #d32f2f;
  font-size: 13px;
  padding-top: 4px;
}

/* RESPONSIVO */
@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .admin-teams {
    padding: 20px 14px 28px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .card {
    padding: 18px 16px 18px;
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

/* 🔥 IMPORT CSV PERFEITO */
.helper {
  color: #118c3a;
  font-size: 14px;
  font-weight: 500;
  margin: 8px 0 16px 0;
  letter-spacing: 0.3px;
  background: rgba(17, 140, 58, 0.08);
  padding: 10px 14px;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
}

.import-options {
  margin: 0;
}

.csv-paste {
  width: 100%;
  box-sizing: border-box;
}

.csv-paste label {
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 12px;
  display: block;
  letter-spacing: 0.3px;
}

.csv-paste textarea {
  width: 100%;
  height: 160px;
  padding: 14px;
  margin: 0;
  box-sizing: border-box;
  border: 2px solid #c8e6c9;
  border-radius: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  resize: vertical;
  background: linear-gradient(135deg, #f9fcf9 0%, #fafaf5 100%);
  color: #2e7d32;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.csv-paste textarea:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
  outline: none;
}

.csv-paste textarea::placeholder {
  color: #81c784;
  font-style: italic;
}

.import-preview {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  padding: 20px;
  border-radius: 16px;
  border-left: 5px solid #4caf50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header span {
  color: #2e7d32;
  font-weight: 700;
  font-size: 15px;
  background: rgba(76, 175, 80, 0.12);
  padding: 8px 16px;
  border-radius: 999px;
}

.import-btn {
  background: linear-gradient(135deg, #00b34a 0%, #02983f 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  box-shadow: 0 6px 18px rgba(0, 179, 74, 0.4);
  transition: all 0.25s ease;
}

.import-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #02983f 0%, #006d2c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 179, 74, 0.5);
}

.import-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 6px rgba(0, 179, 74, 0.2);
}

.preview-table {
  overflow-x: auto;
}

.preview-table table {
  width: 100%;
  font-size: 13px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-collapse: collapse;
}

.preview-table th {
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  padding: 12px 16px;
  text-align: left;
  color: #1b5e20;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 11px;
}

.preview-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #dcedc8;
  color: #2e7d32;
}

.preview-table tr:hover td {
  background: rgba(129, 199, 132, 0.1);
}
</style>

