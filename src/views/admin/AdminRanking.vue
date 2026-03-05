<template>
  <div class="admin-ranking">
    <h2>RANKING</h2>

    <div class="filters">
      <div class="filter-block">
        <h3>Categorias (Premiações)</h3>
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
            {{ tpl.name }} ({{ tpl.type }})
          </label>
        </div>
      </div>
    </div>

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

    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="ranking.length" class="ranking-table">
      <thead>
        <tr>
          <th>Posição</th>
          <th>Equipe</th>
          <th>Categoria</th>
          <th>Etapa</th>
          <th>Pontuação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in ranking" :key="row.team_id">
          <td>{{ index + 1 }}</td>
          <td>{{ row.team_name }}</td>
          <td>{{ row.category }}</td>
          <td>{{ row.etapa_ensino }}</td>
          <td>{{ row.total_score }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!loading" class="no-data">
      Nenhum resultado para os filtros selecionados.
    </p>
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

  // categorias e etapas distintas a partir de teams
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('category, etapa_ensino')

  if (teamsError) {
    error.value = 'Erro ao carregar categorias/etapas.'
    return
  }

  const setCats = new Set(
    (teamsData || [])
      .map(t => t.category)
      .filter(c => !!c)
  )
  categories.value = Array.from(setCats).sort()

  const setEtapas = new Set(
    (teamsData || [])
      .map(t => t.etapa_ensino)
      .filter(e => !!e)
  )
  etapas.value = Array.from(setEtapas).sort()

  // modelos de avaliação
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
    if (
      !selectedCategories.value.length ||
      !selectedEtapas.value.length ||
      !selectedTemplateIds.value.length
    ) {
      error.value = 'Selecione pelo menos uma categoria, uma etapa e um modelo.'
      return
    }

    const { data, error: rankError } = await supabase
      .from('team_scores')
      .select(
        'team_id, team_name, category, etapa_ensino, template_id, total_score'
      )
      .in('category', selectedCategories.value)
      .in('etapa_ensino', selectedEtapas.value)
      .in('template_id', selectedTemplateIds.value)
      .order('total_score', { ascending: false })

    if (rankError) {
      error.value = 'Erro ao carregar ranking.'
      return
    }

    // Somar pontuações da mesma equipe em múltiplos templates selecionados
    const byTeam = new Map()

    for (const row of data || []) {
      const existing = byTeam.get(row.team_id)
      if (existing) {
        existing.total_score += row.total_score
      } else {
        byTeam.set(row.team_id, { ...row })
      }
    }

    ranking.value = Array.from(byTeam.values()).sort(
      (a, b) => b.total_score - a.total_score
    )
  } finally {
    loading.value = false
  }
}

onMounted(loadFilters)
</script>

<style scoped>
.admin-ranking {
  max-width: 900px;
  margin: 0 auto;
}

.filters {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-block h3 {
  margin-bottom: 4px;
}

.checkbox-item {
  margin-bottom: 2px;
}

.load-btn {
  padding: 8px 16px;
  margin-bottom: 12px;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table th,
.ranking-table td {
  border: 1px solid #ddd;
  padding: 6px 8px;
}

.error {
  color: red;
  margin-bottom: 8px;
}

.no-data {
  margin-top: 8px;
}
</style>
