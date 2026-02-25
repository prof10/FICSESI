<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './composables/useSupabase.js'

const nomeEquipe = ref(''), avaliador = ref(''), nota = ref(0), avaliacoes = ref([]), loading = ref(false)

async function submit() {
  loading.value = true
  const { error } = await supabase.from('avaliacoes').insert([{ nome_equipe: nomeEquipe.value, avaliador: avaliador.value, nota: nota.value }])
  if (!error) { nomeEquipe.value = ''; avaliador.value = ''; nota.value = 0; fetch() }
  loading.value = false
}

async function fetch() {
  const { data } = await supabase.from('avaliacoes').select('*').order('nota', { ascending: false })
  avaliacoes.value = data || []
}
onMounted(fetch)
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <h1 class="text-4xl font-bold mb-12 text-center text-gray-800">🧪 MVP FICSESI</h1>
    
    <!-- FORM -->
    <div class="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-xl mb-12">
      <h2 class="text-2xl font-semibold mb-6 text-gray-700">📝 Avaliar Equipe</h2>
      <form @submit.prevent="submit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input v-model="nomeEquipe" placeholder="Nome da Equipe" class="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition" required />
        <input v-model="avaliador" placeholder="Seu Nome (Avaliador)" class="p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition" required />
        <div class="md:col-span-2">
          <label class="block text-lg font-medium mb-2">⭐ Nota (0-10): {{ nota }}/10</label>
          <input type="range" v-model="nota" min="0" max="10" step="1" class="w-full h-4 bg-gray-200 rounded-lg accent-blue-500 cursor-pointer" />
        </div>
        <button :disabled="loading" class="md:col-span-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
          {{ loading ? '💾 Salvando...' : '🚀 Enviar Avaliação' }}
        </button>
      </form>
    </div>
    
    <!-- RANKING LIVE -->
    <div class="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-xl">
      <h2 class="text-2xl font-semibold mb-6 text-gray-700 flex items-center"><span>🏆</span> Ranking por Nota</h2>
      <div v-if="!avaliacoes.length" class="text-center py-12 text-gray-500">Nenhuma avaliação ainda... Seja o primeiro! 🎉</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full bg-white rounded-xl shadow-md">
          <thead class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <tr><th class="p-4 text-left rounded-tl-xl font-bold">Equipe</th><th class="p-4 font-bold">Avaliador</th><th class="p-4 font-bold">Nota</th><th class="p-4 rounded-tr-xl font-bold">Data/Hora</th></tr>
          </thead>
          <tbody>
            <tr v-for="(av, i) in avaliacoes" :key="av.id" class="hover:bg-gray-50 transition border-b last:border-b-0">
              <td class="p-4 font-semibold text-gray-800">{{ av.nome_equipe }} <span class="text-sm bg-blue-100 px-2 py-1 rounded-full">#{{ i+1 }}</span></td>
              <td class="p-4 text-gray-600">{{ av.avaliador }}</td>
              <td class="p-4">
                <span class="text-2xl font-black text-green-600">{{ av.nota }}/10</span>
                <div class="flex gap-1 mt-1"><span v-for="n in 10" :key="n" class="w-3 h-3 rounded-full" :class="n <= av.nota ? 'bg-yellow-400' : 'bg-gray-200'"></span></div>
              </td>
              <td class="p-4 text-sm text-gray-500">{{ new Date(av.created_at).toLocaleString('pt-BR') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
