<template>
  <div class="admin-ranking-page">
    <header class="page-header">
      <h1>Ranking</h1>
      <p>Visualize a classificação das equipes por categoria, etapa e modelo de avaliação.</p>
    </header>

    <section class="card filters-card">
      <h2>Filtros do ranking</h2>

      <div class="filters">
        <div class="filter-block">
          <h3>Categorias da premiação</h3>
          <div v-for="cat in categories" :key="cat" class="checkbox-item">
            <label>
              <input
                type="checkbox"
                v-model="selectedCategories"
                :value="cat"
              />
              {{ cat }}
            </label>
          </div>
        </div>

        <div class="filter-block">
          <h3>Etapa de ensino</h3>
          <div v-for="etapa in etapas" :key="etapa" class="checkbox-item">
            <label>
              <input
                type="checkbox"
                v-model="selectedEtapas"
                :value="etapa"
              />
              {{ etapa }}
            </label>
          </div>
        </div>

        <div class="filter-block">
          <h3>Modelos de avaliação</h3>
          <div
            v-for="tpl in templates"
            :key="tpl.id"
            class="checkbox-item"
          >
            <label>
              <input
                type="checkbox"
                v-model="selectedTemplateIds"
                :value="tpl.id"
              />
              {{ tpl.name }} ({{ tpl.type === 'online' ? 'Virtual' : 'Pitch' }})
            </label>
          </div>
        </div>
      </div>

      <div class="filters-actions">
        <button
          class="load-btn"
          @click="loadRanking"
          :disabled="
            loading ||
            !selectedCategories.length ||
            !selectedEtapas.length ||
            !selectedTemplateIds.length
          "
        >
          {{ loading ? 'Carregando...' : 'Gerar ranking' }}
        </button>
        <p class="hint">
          Selecione pelo menos uma categoria, uma etapa e um modelo para gerar a classificação.
        </p>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section class="card ranking-card">
      <div class="table-header">
        <h2>Resultado</h2>
        <span class="table-count">{{ ranking.length }} equipe(s)</span>
      </div>

      <div class="table-wrapper" v-if="ranking.length">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Projeto</th>
              <th>Categoria da premiação</th>
              <th>Etapa</th>
              <th>Pontuação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in ranking" :key="row.team_id">
              <td>
                <span class="badge-pos" :class="{ first: index === 0 }">
                  {{ index + 1 }}
                </span>
              </td>
              <td>{{ row.team_name }}</td>
              <td>{{ row.category }}</td>
              <td>{{ row.etapa_ensino }}</td>
              <td class="score">{{ row.total_score }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else-if="!loading" class="no-data">
        Nenhum resultado para os filtros selecionados.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase.js'

const categories = ref([])
const etapas = ref([])
const templates = ref([])

const selectedCategories = ref([])
const selectedEtapas = ref([])
const selectedTemplateIds = ref([])

const ranking = ref([])
const loading = ref(false)
const error = ref('')

const loadFilters = async () => {
  error.value = ''

  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('category, etapa_ensino')

  if (teamsError) {
    error.value = 'Erro ao carregar categorias/etapas.'
    return
  }

  const setCats = new Set(
    (teamsData || [])
      .map((t) => t.category)
      .filter((c) => !!c)
  )
  categories.value = Array.from(setCats).sort()

  const setEtapas = new Set(
    (teamsData || [])
      .map((t) => t.etapa_ensino)
      .filter((e) => !!e)
  )
  etapas.value = Array.from(setEtapas).sort()

  const { data: tplData, error: tplError } = await supabase
    .from('evaluation_templates')
    .select('id, name, type')
    .order('created_at', { ascending: true })

  if (tplError) {
    error.value = 'Erro ao carregar modelos de avaliação.'
    return
  }

  templates.value = tplData || []
}

const loadRanking = async () => {
  error.value = ''
  ranking.value = []
  loading.value = true

  try {
    console.log('🔍 Filtros:', {
      categories: selectedCategories.value,
      etapas: selectedEtapas.value,
      templates: selectedTemplateIds.value
    })

    if (
      !selectedCategories.value.length ||
      !selectedEtapas.value.length ||
      !selectedTemplateIds.value.length
    ) {
      error.value = 'Selecione pelo menos uma categoria, uma etapa e um modelo.'
      return
    }

    // Query da VIEW
    const { data, error: rankError } = await supabase
      .from('team_template_averages')
      .select('team_id, team_name, category, etapa_ensino, template_id, avg_score, evaluator_count')
      .in('category', selectedCategories.value)
      .in('etapa_ensino', selectedEtapas.value)
      .in('template_id', selectedTemplateIds.value)
      .order('avg_score', { ascending: false })

    console.log('📊 DADOS BRUTOS DA VIEW:', data)
    console.log('❌ Erro query?', rankError)

    if (rankError) {
      error.value = 'Erro ao carregar ranking.'
      console.error('Erro completo:', rankError)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum dado retornado')
      ranking.value = []
      return
    }

    const byTeam = new Map()

    for (const row of data) {
      console.log('🔢 Linha:', {
        team: row.team_name,
        template: row.template_id,
        avg: row.avg_score,
        avaliadores: row.evaluator_count
      })
      
      const existing = byTeam.get(row.team_id)
      if (existing) {
        existing.total_score += row.avg_score
        console.log('➕ Já existia, novo total:', existing.total_score)
      } else {
        byTeam.set(row.team_id, { 
          ...row, 
          total_score: row.avg_score 
        })
        console.log('🆕 Novo time, score inicial:', row.avg_score)
      }
    }

    const finalRanking = Array.from(byTeam.values()).sort((a, b) => b.total_score - a.total_score)
    console.log('🏁 RANKING FINAL:', finalRanking)
    
    ranking.value = finalRanking

  } catch (err) {
    console.error('💥 Erro geral:', err)
    error.value = 'Erro inesperado.'
  } finally {
    loading.value = false
  }
}



onMounted(loadFilters)
</script>

<style scoped>
.admin-ranking-page {
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

.filters {
  display: flex;
  gap: 32px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter-block {
  min-width: 200px;
}

.filter-block h3 {
  margin: 0 0 6px;
  font-size: 13px;
  color: #455a64;
}

.checkbox-item {
  margin-bottom: 3px;
  font-size: 13px;
}

.checkbox-item label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.filters-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
}

.load-btn {
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

.load-btn:hover:not(:disabled) {
  background: #02983f;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 179, 74, 0.45);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.hint {
  font-size: 12px;
  color: #78909c;
}

.error {
  margin-top: 8px;
  color: #d32f2f;
  font-size: 13px;
}

.ranking-card {
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

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ranking-table th,
.ranking-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #eceff1;
}

.ranking-table th {
  font-weight: 600;
  color: #455a64;
  background-color: #f5f9f6;
}

.ranking-table tbody tr:hover {
  background-color: #f9fcf9;
}

.badge-pos {
  display: inline-block;
  min-width: 26px;
  text-align: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(120, 144, 156, 0.12);
  color: #37474f;
  font-weight: 600;
  font-size: 12px;
}

.badge-pos.first {
  background: rgba(0, 179, 74, 0.18);
  color: #118c3a;
}

.score {
  font-weight: 600;
  color: #118c3a;
}

.no-data {
  margin-top: 8px;
  font-size: 13px;
  color: #78909c;
}

@media (max-width: 900px) {
  .admin-ranking-page {
    padding: 20px 14px 28px;
  }

  .card {
    padding: 18px 16px 18px;
  }

  .filters {
    flex-direction: column;
    gap: 20px;
  }

  .filters-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

