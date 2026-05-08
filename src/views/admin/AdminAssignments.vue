<template>
  <div class="admin-assignments">
    <header class="page-header">
      <h1>Atribuição de avaliações</h1>
      <p>Vincule projetos, avaliadores e modelos para gerar códigos de avaliação.</p>
    </header>

    <section class="card form-card">
      <h2>Gerar código de avaliação</h2>
      <form @submit.prevent="createAssignment" class="form-grid">
        <div>
          <label class="label">Equipe</label>
          <select v-model="selectedTeamId" required>
            <option value="" disabled>Selecione a equipe</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.numero_estande || '—' }} — {{ team.name }} ·
              {{ team.escola }} ({{ team.cidade }})
            </option>
          </select>
        </div>

        <div>
          <label class="label">Avaliador</label>
          <select v-model="selectedEvaluatorId" required>
            <option value="" disabled>Selecione o avaliador</option>
            <option v-for="ev in evaluators" :key="ev.id" :value="ev.id">
              {{ ev.name }} — {{ ev.area_conhecimento }}
            </option>
          </select>
        </div>

        <div>
          <label class="label">Modelo de avaliação</label>
          <select v-model="selectedTemplateId" required>
            <option value="" disabled>Selecione o modelo</option>
            <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">
              {{ tpl.name }} ({{ tpl.type === 'online' ? 'Virtual' : 'Pitch' }})
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Gerando...' : 'Gerar código' }}
          </button>
        </div>
      </form>
    </section>

    <!-- SEÇÃO DE IMPORTAÇÃO -->
    <section class="card import-card">
      <h2>Importar Atribuições</h2>

      <p class="helper">
        Você pode importar arquivos .xlsx, .xls ou .csv com as colunas:<br />
        <strong>N° ESTANDE; CATEGORIA DA PREMIAÇÃO; ÁREA DE CONHECIMENTO; NOME DO ARTIGO; AVALIADOR; TIPO</strong><br />
        <span style="font-size:12px; color:#2e7d32;">
          ⚠️ Os valores de <strong>Nome do Artigo</strong> e <strong>Avaliador</strong> devem
          corresponder exatamente aos já cadastrados no sistema.<br />
          O campo <strong>TIPO</strong> deve ser <strong>online</strong> (Virtual) ou
          <strong>pitch</strong> (Pitch).
        </span>
      </p>

      <div class="import-options">
        <div class="file-import">
          <label for="assignment-file">Importar atribuições por Excel ou CSV:</label>
          <input
            id="assignment-file"
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            @change="handleFile"
          />
        </div>
      </div>

      <div class="import-preview">
        <div class="preview-header">
          <span>
            {{ csvData.length ? `✅ ${csvData.length} atribuições prontas` : 'Pré-visualização das Atribuições' }}
          </span>
          <button
            type="button"
            @click="importAssignments"
            class="import-btn"
            :disabled="!csvData.length || importing"
          >
            {{ importing ? 'Importando...' : 'IMPORTAR AGORA' }}
          </button>
        </div>

        <div v-if="csvData.length" class="preview-table">
          <table>
            <thead>
              <tr>
                <th>N° Estande</th>
                <th>Categoria da Premiação</th>
                <th>Área de Conhecimento</th>
                <th>Nome do Artigo</th>
                <th>Avaliador</th>
                <th>Tipo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in csvData.slice(0, 5)" :key="i">
                <td>{{ row.estande }}</td>
                <td>{{ row.premiacao }}</td>
                <td>{{ row.area_conhecimento }}</td>
                <td>{{ row.nome_artigo?.slice(0, 30) }}</td>
                <td>{{ row.avaliador?.slice(0, 25) }}</td>
                <td>{{ row.tipo }}</td>
                <td>
                  <span :style="{ color: row._error ? '#d32f2f' : '#118c3a', fontWeight: 600 }">
                    {{ row._error ? '⚠️ ' + row._error : '✅ OK' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="importErrors.length" class="import-error-list">
          <strong>⚠️ Linhas com erro (não serão importadas):</strong><br />
          <span v-for="(e, i) in importErrors" :key="i">• {{ e }}<br /></span>
        </p>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-header">
        <h2>Atribuições geradas</h2>
        <!-- ✅ Contador + botão exportar -->
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="table-count">{{ sortedAssignments.length }} código(s)</span>
          <button
            class="btn-export"
            @click="exportToExcel"
            :disabled="!sortedAssignments.length"
          >
            ⬇ Exportar Excel
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th @click="setSort('code')" class="sortable">
                Código
                <span class="sort-icon" v-if="sortBy === 'code'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="setSort('estande')" class="sortable">
                N° Estande
                <span class="sort-icon" v-if="sortBy === 'estande'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="setSort('category')" class="sortable">
                Categoria da Premiação
                <span class="sort-icon" v-if="sortBy === 'category'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="setSort('area')" class="sortable">
                Área de Conhecimento
                <span class="sort-icon" v-if="sortBy === 'area'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="setSort('team')" class="sortable">
                Nome do Artigo
                <span class="sort-icon" v-if="sortBy === 'team'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="setSort('evaluator')" class="sortable">
                Avaliador
                <span class="sort-icon" v-if="sortBy === 'evaluator'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="setSort('type')" class="sortable">
                Tipo
                <span class="sort-icon" v-if="sortBy === 'type'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th @click="setSort('status')" class="sortable">
                Status
                <span class="sort-icon" v-if="sortBy === 'status'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
              </th>
              <th class="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in sortedAssignments" :key="a.id">
              <td><span class="code-pill">{{ a.code }}</span></td>
              <td>{{ a.team?.numero_estande || '—' }}</td>
              <td>{{ a.team?.category || getTeamField(a.team_id, 'category') }}</td>
              <td>{{ a.team?.area_conhecimento || getTeamField(a.team_id, 'area_conhecimento') }}</td>
              <td>{{ a.team?.name || getTeamField(a.team_id, 'name') }}</td>
              <td>{{ a.evaluator?.name }}</td>
              <td>{{ a.template?.type === 'online' ? 'Virtual' : 'Pitch' }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="{ pending: a.status === 'pendente', done: a.status === 'respondido' }"
                >
                  {{ a.status }}
                </span>
              </td>
              <td class="col-actions">
                <button class="btn-secondary" @click="copyCode(a.code)">Copiar</button>
                <button class="btn-secondary" @click="goToEvaluationDetails(a.id)">Ver respostas</button>
                <button class="btn-danger" @click="deleteAssignment(a.id)" :disabled="isDeleting">
                  {{ isDeleting ? 'Excluindo...' : 'Excluir' }}
                </button>
              </td>
            </tr>
            <tr v-if="!sortedAssignments.length">
              <td colspan="9" class="empty">Nenhuma atribuição cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import {
  assignmentsService,
  teamsService,
  evaluatorsService,
  templatesService,
  generateRandomCode
} from '@/services/supabase.js'

const router = useRouter()

const teams       = ref([])
const evaluators  = ref([])
const templates   = ref([])
const assignments = ref([])

const selectedTeamId      = ref('')
const selectedEvaluatorId = ref('')
const selectedTemplateId  = ref('')
const error      = ref('')
const isLoading  = ref(false)
const isDeleting = ref(false)

const csvData      = ref([])
const fileInput    = ref(null)
const importing    = ref(false)
const importErrors = ref([])

const sortBy  = ref('created_at')
const sortDir = ref('desc')

// ── Helper fallback ───────────────────────────────────────────
const getTeamField = (teamId, field) => {
  const t = teams.value.find(t => t.id === teamId)
  return t?.[field] ?? ''
}

// ── Normalização ──────────────────────────────────────────────
const normalize = (text = '') =>
  text.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const headerMap = {
  'estande':                  'estande',
  'n estande':                'estande',
  'n° estande':               'estande',
  'no estande':               'estande',
  'numero estande':           'estande',
  'número estande':           'estande',
  'premiacao':                'premiacao',
  'premiação':                'premiacao',
  'categoria':                'premiacao',
  'category':                 'premiacao',
  'categoria da premiacao':   'premiacao',
  'categoria da premiação':   'premiacao',
  'categoria premiacao':      'premiacao',
  'categoria premiação':      'premiacao',
  'area do conhecimento':     'area_conhecimento',
  'área do conhecimento':     'area_conhecimento',
  'area de conhecimento':     'area_conhecimento',
  'área de conhecimento':     'area_conhecimento',
  'area conhecimento':        'area_conhecimento',
  'área conhecimento':        'area_conhecimento',
  'nome do artigo':           'nome_artigo',
  'projeto':                  'nome_artigo',
  'name':                     'nome_artigo',
  'avaliador':                'avaliador',
  'nome do avaliador':        'avaliador',
  'tipo':                     'tipo',
  'type':                     'tipo',
  'modelo':                   'tipo',
}

// ── Parsers ───────────────────────────────────────────────────
const parseCsvFile = async (file) => {
  const text = await file.text()
  const wb = XLSX.read(text, { type: 'string', FS: ';' })
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false })
}

const parseExcelFile = async (file) => {
  const ab = await file.arrayBuffer()
  const wb = XLSX.read(ab)
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false })
}

// ── Validação e cruzamento ────────────────────────────────────
const resolveRows = (rows) => {
  const errors   = []
  const resolved = []

  rows.forEach((row, idx) => {
    const mapped = {
      estande: '', premiacao: '', area_conhecimento: '',
      nome_artigo: '', avaliador: '', tipo: ''
    }

    Object.entries(row).forEach(([key, value]) => {
      const field = headerMap[normalize(key)]
      if (field) mapped[field] = value?.toString().trim() || ''
    })

    const lineNum = idx + 2

    const team = teams.value.find(t => {
      const matchName    = mapped.nome_artigo && normalize(t.name) === normalize(mapped.nome_artigo)
      const matchEstande = mapped.estande &&
        String(t.numero_estande) === String(mapped.estande).replace(/\D/g, '')
      return matchName || matchEstande
    })

    if (!team) {
      const label = mapped.nome_artigo || mapped.estande || `linha ${lineNum}`
      errors.push(`Linha ${lineNum}: projeto "${label}" não encontrado.`)
      mapped._error = 'Projeto não encontrado'
      resolved.push(mapped)
      return
    }

    const evaluator = evaluators.value.find(
      e => normalize(e.name) === normalize(mapped.avaliador)
    )

    if (!evaluator) {
      errors.push(`Linha ${lineNum}: avaliador "${mapped.avaliador}" não encontrado.`)
      mapped._error = 'Avaliador não encontrado'
      resolved.push(mapped)
      return
    }

    const tipoNorm = normalize(mapped.tipo)
    const tipoKey  = tipoNorm === 'online' || tipoNorm === 'virtual' ? 'online' : 'pitch'
    const template = templates.value.find(t => t.type === tipoKey)

    if (!template) {
      errors.push(`Linha ${lineNum}: nenhum modelo do tipo "${mapped.tipo}" encontrado.`)
      mapped._error = `Modelo "${mapped.tipo}" não encontrado`
      resolved.push(mapped)
      return
    }

    mapped._teamId      = team.id
    mapped._evaluatorId = evaluator.id
    mapped._templateId  = template.id
    mapped._teamEstande = team.numero_estande
    resolved.push(mapped)
  })

  return { resolved, errors }
}

const handleFile = async (e) => {
  error.value        = ''
  csvData.value      = []
  importErrors.value = []

  const file = e.target.files?.[0]
  if (!file) return

  const fileName = file.name.toLowerCase()

  try {
    let rows = []

    if (fileName.endsWith('.csv')) {
      rows = await parseCsvFile(file)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      rows = await parseExcelFile(file)
    } else {
      error.value = 'Selecione um arquivo .xlsx, .xls ou .csv.'
      return
    }

    if (!rows.length) {
      error.value = 'A planilha não possui linhas para importar.'
      return
    }

    const firstKeys    = Object.keys(rows[0]).map(normalize)
    const hasArtigo    = firstKeys.some(k => headerMap[k] === 'nome_artigo')
    const hasAvaliador = firstKeys.some(k => headerMap[k] === 'avaliador')

    if (!hasArtigo || !hasAvaliador) {
      error.value =
        'Cabeçalho inválido. Use as colunas: N° ESTANDE; CATEGORIA DA PREMIAÇÃO; ÁREA DE CONHECIMENTO; NOME DO ARTIGO; AVALIADOR; TIPO.'
      return
    }

    const { resolved, errors } = resolveRows(rows)
    csvData.value      = resolved
    importErrors.value = errors

    if (resolved.every(r => r._error)) {
      error.value = 'Nenhuma linha válida encontrada. Verifique os erros abaixo.'
    }
  } catch (err) {
    error.value = 'Erro ao ler arquivo: ' + err.message
  }
}

// ── Importação ────────────────────────────────────────────────
const importAssignments = async () => {
  const validRows = csvData.value.filter(r => !r._error)
  if (!validRows.length) return

  importing.value = true
  error.value     = ''
  let successCount = 0

  try {
    for (const row of validRows) {
      const randomPart = generateRandomCode(4)
      const fullCode   = `${row._teamEstande || 'SEMEST'}-${randomPart}`

      await assignmentsService.create({
        team_id:      row._teamId,
        evaluator_id: row._evaluatorId,
        template_id:  row._templateId,
        code:         fullCode
      })
      successCount++
    }

    csvData.value      = []
    importErrors.value = []
    if (fileInput.value) fileInput.value.value = ''

    await loadAll()
    alert(`✅ ${successCount} atribuições importadas!`)
  } catch (err) {
    error.value = 'Erro ao importar: ' + err.message
  } finally {
    importing.value = false
  }
}

// ── Exportar para Excel ───────────────────────────────────────
const exportToExcel = () => {
  if (!sortedAssignments.value.length) {
    alert('Nenhuma atribuição para exportar.')
    return
  }

  const rows = sortedAssignments.value.map(a => ({
    'Código':                 a.code,
    'N° Estande':             a.team?.numero_estande || getTeamField(a.team_id, 'numero_estande') || '—',
    'Categoria da Premiação': a.team?.category       || getTeamField(a.team_id, 'category')       || '—',
    'Área de Conhecimento':   a.team?.area_conhecimento || getTeamField(a.team_id, 'area_conhecimento') || '—',
    'Nome do Artigo':         a.team?.name            || getTeamField(a.team_id, 'name')           || '—',
    'Avaliador':              a.evaluator?.name        || '—',
    'Tipo':                   a.template?.type === 'online' ? 'Virtual' : 'Pitch',
    'Status':                 a.status === 'respondido' ? 'RESPONDIDO' : 'PENDENTE',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  ws['!cols'] = [
    { wch: 14 }, // Código
    { wch: 12 }, // N° Estande
    { wch: 25 }, // Categoria da Premiação
    { wch: 25 }, // Área de Conhecimento
    { wch: 60 }, // Nome do Artigo
    { wch: 25 }, // Avaliador
    { wch: 10 }, // Tipo
    { wch: 14 }, // Status
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Atribuições')

  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  XLSX.writeFile(wb, `atribuicoes_${date}.xlsx`)
}

// ── CRUD ──────────────────────────────────────────────────────
const goToEvaluationDetails = (id) => router.push(`/admin/evaluations/${id}`)

const loadAll = async () => {
  try {
    teams.value       = await teamsService.getAll()
    evaluators.value  = await evaluatorsService.getAll()
    templates.value   = await templatesService.getAll()
    assignments.value = await assignmentsService.getAll()
  } catch (err) {
    error.value = 'Erro ao carregar dados: ' + err.message
  }
}

const createAssignment = async () => {
  isLoading.value = true
  try {
    const team = teams.value.find(t => t.id === selectedTeamId.value)
    if (!team) throw new Error('Equipe não encontrada')

    const randomPart = generateRandomCode(4)
    const fullCode   = `${team.numero_estande || 'SEMEST'}-${randomPart}`

    await assignmentsService.create({
      team_id:      selectedTeamId.value,
      evaluator_id: selectedEvaluatorId.value,
      template_id:  selectedTemplateId.value,
      code:         fullCode
    })

    selectedTeamId.value      = ''
    selectedEvaluatorId.value = ''
    selectedTemplateId.value  = ''
    await loadAll()
  } catch (err) {
    error.value = 'Erro ao criar atribuição: ' + err.message
  } finally {
    isLoading.value = false
  }
}

const deleteAssignment = async (id) => {
  if (confirm('Excluir atribuição? Esta ação não pode ser desfeita.\n\n✅ Respostas e pontuações serão removidas automaticamente.')) {
    isDeleting.value = true
    try {
      await assignmentsService.delete(id)
      await loadAll()
      alert('✅ Atribuição excluída com sucesso!')
    } catch (err) {
      error.value = 'Erro ao excluir: ' + err.message
    } finally {
      isDeleting.value = false
    }
  }
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert('Código copiado: ' + code)
  } catch {
    alert('Não foi possível copiar o código.')
  }
}

const setSort = (field) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value  = field
    sortDir.value = 'asc'
  }
}

const sortedAssignments = computed(() => {
  const arr = [...assignments.value]

  arr.sort((a, b) => {
    let fa, fb

    switch (sortBy.value) {
      case 'estande':
        fa = a.team?.numero_estande ?? getTeamField(a.team_id, 'numero_estande')
        fb = b.team?.numero_estande ?? getTeamField(b.team_id, 'numero_estande')
        return sortDir.value === 'asc'
          ? (Number(fa) || 0) - (Number(fb) || 0)
          : (Number(fb) || 0) - (Number(fa) || 0)

      case 'category':
        fa = a.team?.category ?? getTeamField(a.team_id, 'category')
        fb = b.team?.category ?? getTeamField(b.team_id, 'category')
        break

      case 'area':
        fa = a.team?.area_conhecimento ?? getTeamField(a.team_id, 'area_conhecimento')
        fb = b.team?.area_conhecimento ?? getTeamField(b.team_id, 'area_conhecimento')
        break

      case 'team':
        fa = a.team?.name ?? getTeamField(a.team_id, 'name')
        fb = b.team?.name ?? getTeamField(b.team_id, 'name')
        break

      case 'evaluator':
        fa = a.evaluator?.name ?? ''
        fb = b.evaluator?.name ?? ''
        break

      case 'type':
        fa = a.template?.type ?? ''
        fb = b.template?.type ?? ''
        break

      default:
        fa = a[sortBy.value] ?? ''
        fb = b[sortBy.value] ?? ''
    }

    if (sortBy.value === 'created_at') {
      return sortDir.value === 'asc'
        ? new Date(fa || 0) - new Date(fb || 0)
        : new Date(fb || 0) - new Date(fa || 0)
    }

    const sa = String(fa).toLocaleLowerCase('pt-BR')
    const sb = String(fb).toLocaleLowerCase('pt-BR')
    if (sa < sb) return sortDir.value === 'asc' ? -1 : 1
    if (sa > sb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return arr
})

onMounted(loadAll)
</script>

<style scoped>
.admin-assignments {
  min-height: 100vh;
  padding: 28px 32px 40px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  box-sizing: border-box;
}

.page-header { max-width: 1080px; margin: 0 auto 20px; }

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #118c3a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header p { margin: 4px 0 0; font-size: 14px; color: #546e7a; }

.card {
  max-width: 1080px;
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

.import-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 2px dashed #81c784 !important;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 16px;
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

.form-grid select {
  width: 100%;
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

.table-card { overflow: hidden; }

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-count { font-size: 12px; color: #78909c; }
.table-wrapper { width: 100%; overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }

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

.table tbody tr:hover { background-color: #f9fcf9; }

.code-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(17, 140, 58, 0.08);
  color: #118c3a;
  font-size: 12px;
  font-weight: 600;
}

.status-pill {
  display: inline-block;
  min-width: 80px;
  text-align: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill.pending { background: rgba(239, 83, 80, 0.12); color: #d32f2f; }
.status-pill.done    { background: rgba(0, 179, 74, 0.14);  color: #118c3a; }

.col-actions { text-align: right; white-space: nowrap; }

.btn-secondary {
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  background: #ffffff;
  color: #118c3a;
  border: 1px solid rgba(17, 140, 58, 0.25);
  margin-right: 6px;
  transition: background 0.18s, color 0.18s, transform 0.18s;
}

.btn-secondary:hover {
  background: #118c3a;
  color: #ffffff;
  transform: translateY(-1px);
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

.btn-danger:hover { background: #d32f2f; transform: translateY(-1px); }

/* ✅ Botão exportar */
.btn-export {
  border: none;
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: #118c3a;
  color: #ffffff;
  letter-spacing: 0.05em;
  transition: background 0.18s, transform 0.18s;
}

.btn-export:hover:not(:disabled) {
  background: #02983f;
  transform: translateY(-1px);
}

.btn-export:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.empty { text-align: center; padding: 20px 8px; color: #90a4ae; }

.error {
  max-width: 1080px;
  margin: 0 auto;
  color: #d32f2f;
  font-size: 13px;
  padding-top: 4px;
}

@media (max-width: 900px) {
  .admin-assignments { padding: 20px 14px 28px; }
  .form-grid { grid-template-columns: 1fr; }
  .card { padding: 18px 16px 18px; }
}

.table th.sortable { cursor: pointer; user-select: none; }
.table th.sortable:hover { background-color: #ecf4ee; }
.sort-icon { margin-left: 4px; font-size: 11px; color: #78909c; }

.helper {
  color: #118c3a;
  font-size: 14px;
  font-weight: 500;
  margin: 8px 0 16px 0;
  background: rgba(17, 140, 58, 0.08);
  padding: 10px 14px;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
  line-height: 1.7;
}

.import-options { margin: 0; display: grid; gap: 16px; }

.file-import label {
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 12px;
  display: block;
}

.file-import input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #c8e6c9;
  border-radius: 12px;
  background: #fff;
  color: #2e7d32;
  box-sizing: border-box;
}

.file-import input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
  outline: none;
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
  gap: 12px;
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

.preview-table { overflow-x: auto; }

.preview-table table {
  width: 100%;
  font-size: 13px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.preview-table tr:hover td { background: rgba(129, 199, 132, 0.1); }

.import-error-list {
  margin-top: 14px;
  padding: 10px 14px;
  background: rgba(211, 47, 47, 0.06);
  border-left: 4px solid #ef5350;
  border-radius: 8px;
  font-size: 13px;
  color: #b71c1c;
  line-height: 1.8;
}
</style>