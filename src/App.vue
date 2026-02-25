<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './composables/useSupabase.js'

const nomeEquipe = ref(''), avaliador = ref(''), nota = ref(0), avaliacoes = ref([]), loading = ref(false)

async function submit() {
  loading.value = true
  const { error } = await supabase.from('avaliacoes').insert([{ nome_equipe: nomeEquipe.value, avaliador: avaliador.value, nota: nota.value }])
  if (!error) { 
    nomeEquipe.value = ''; 
    avaliador.value = ''; 
    nota.value = 0; 
    fetch() 
  }
  loading.value = false
}

async function fetch() {
  const { data } = await supabase.from('avaliacoes').select('*').order('nota', { ascending: false })
  avaliacoes.value = data || []
}
onMounted(fetch)
</script>

<template>
  <div class="min-h-screen font-sans">
    
    <!-- CONTAINER 1: TÍTULO EM CIMA COM FUNDO ROSA -->
    <div class="bg-gradient-to-r from-pink-400 to-rose-500 py-24 md:py-32 text-center shadow-2xl">
      <div class="max-w-4xl mx-auto px-6">
        <h1 class="text-7xl md:text-9xl font-extrabold bg-gradient-to-r from-white via-yellow-300 to-orange-400 bg-clip-text text-transparent drop-shadow-4xl animate-bounce-slow mb-8">
          🧪 MVP FICSESI
        </h1>
        <p class="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl tracking-wider">
          Feira de Ciências - Avaliações Live
        </p>
      </div>
    </div>
    
    <!-- CONTAINER 2: FORM NO CENTRO COM BORDA ARREDONDADA FUNDO VERDE -->
    <div class="bg-gradient-to-b from-[#A8E6CF] to-emerald-300 py-20 md:py-32">
      <div class="max-w-2xl mx-auto px-6">
        <div class="bg-white/90 backdrop-blur-xl border-8 border-white shadow-4xl rounded-5xl p-12 md:p-20 hover:shadow-hero transition-all duration-700 hover:-translate-y-6">
          
          <!-- Título do Form -->
          <div class="text-center mb-16">
            <h2 class="text-5xl md:text-6xl font-black text-gray-800 drop-shadow-2xl mb-6">
              📝 Avaliar Equipe
            </h2>
            <div class="w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full shadow-lg"></div>
          </div>
          
          <!-- Form alinhado perfeitamente -->
          <form @submit.prevent="submit" class="space-y-12">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div class="space-y-4">
                <label class="block text-3xl font-bold text-gray-800 text-center md:text-left drop-shadow-lg">🏫 Nome da Equipe</label>
                <input 
                  v-model="nomeEquipe" 
                  class="w-full p-10 text-2xl border-4 border-green-300 rounded-4xl bg-gradient-to-r from-green-50 to-emerald-50 focus:border-pink-400 focus:ring-8 focus:ring-pink-300/50 focus:outline-none shadow-xl hover:shadow-2xl transition-all font-bold text-center md:text-left" 
                  placeholder="Nome da equipe aqui..." 
                  required 
                />
              </div>
              <div class="space-y-4">
                <label class="block text-3xl font-bold text-gray-800 text-center md:text-left drop-shadow-lg">👤 Nome do Avaliador</label>
                <input 
                  v-model="avaliador" 
                  class="w-full p-10 text-2xl border-4 border-green-300 rounded-4xl bg-gradient-to-r from-green-50 to-emerald-50 focus:border-pink-400 focus:ring-8 focus:ring-pink-300/50 focus:outline-none shadow-xl hover:shadow-2xl transition-all font-bold text-center md:text-left" 
                  placeholder="Seu nome completo..." 
                  required 
                />
              </div>
            </div>
            
            <!-- Slider centralizado -->
            <div class="text-center space-y-8">
              <label class="block text-4xl font-black text-gray-800 drop-shadow-3xl mb-12">
                ⭐ Nota (0-10): <span class="text-7xl text-amber-500 drop-shadow-4xl">{{ nota }}</span>
              </label>
              <input 
                type="range" 
                v-model="nota" 
                min="0" 
                max="10" 
                step="1" 
                class="w-4/5 md:w-3/5 h-6 bg-gradient-to-r from-green-400 to-pink-500 rounded-3xl accent-amber-500 cursor-pointer shadow-2xl mx-auto block slider-hero"
              />
            </div>
            
            <!-- Botão hero -->
            <div class="text-center">
              <button 
                :disabled="loading" 
                class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-12 px-24 rounded-4xl font-black text-4xl shadow-4xl hover:shadow-hero hover:scale-105 active:scale-95 transition-all duration-300 w-full md:w-auto disabled:opacity-50 border-4 border-white/60 mx-auto block"
              >
                {{ loading ? '💾 Salvando...' : '🚀 Enviar Avaliação' }}
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
    
    <!-- CONTAINER 3: RANKING ABAIXO -->
    <div class="bg-gradient-to-b from-slate-100 to-gray-200 py-20 md:py-32">
      <div class="max-w-6xl mx-auto px-6">
        <div class="bg-white/95 backdrop-blur-xl border-8 border-white shadow-4xl rounded-5xl p-12 md:p-20">
          
          <!-- Título Ranking -->
          <div class="text-center mb-16">
            <h2 class="text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent drop-shadow-3xl mb-6">
              🏆 Ranking por Nota
            </h2>
            <div class="w-32 h-1 bg-gradient-to-r from-amber-500 to-pink-500 mx-auto rounded-full shadow-lg"></div>
          </div>
          
          <!-- Tabela Ranking -->
          <div v-if="!avaliacoes.length" class="text-center py-32 bg-gradient-to-r from-emerald-50 to-green-50 rounded-4xl">
            <div class="text-9xl mb-12 animate-bounce">🎉</div>
            <h3 class="text-5xl font-black text-gray-800 mb-6 drop-shadow-xl">Nenhuma avaliação ainda!</h3>
            <p class="text-3xl text-gray-700 font-bold">Seja o primeiro! 🚀</p>
          </div>
          
          <div v-else class="overflow-x-auto rounded-4xl shadow-2xl">
            <table class="w-full bg-white rounded-4xl overflow-hidden shadow-4xl">
              <thead class="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl md:text-3xl">
                <tr>
                  <th class="p-12 text-left font-black rounded-tl-4xl">🏫 Equipe</th>
                  <th class="p-12 font-black">👤 Avaliador</th>
                  <th class="p-12 font-black text-center">⭐ Nota</th>
                  <th class="p-12 font-black rounded-tr-4xl text-right">📅 Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(av, i) in avaliacoes" :key="av.id" class="hover:bg-emerald-50 transition-all duration-300 border-b-2 border-gray-100 last:border-b-0 hover:shadow-xl">
                  <td class="p-12 font-bold text-2xl text-gray-800 flex items-center gap-8">
                    {{ av.nome_equipe }}
                    <span class="bg-gradient-to-r from-amber-400 to-pink-400 text-gray-900 px-8 py-4 rounded-full text-2xl font-black shadow-2xl border-4 border-white">
                      #{{ i+1 }}
                    </span>
                  </td>
                  <td class="p-12 text-xl font-bold text-gray-700">{{ av.avaliador }}</td>
                  <td class="p-12 text-center">
                    <div class="text-5xl font-black text-green-600 mb-4 drop-shadow-2xl">{{ av.nota }}/10</div>
                    <div class="flex gap-2 justify-center mx-auto w-fit">
                      <span v-for="n in 10" :key="n" 
                            class="w-10 h-10 rounded-full shadow-lg border-4 border-gray-200" 
                            :class="n <= av.nota ? 'bg-gradient-to-r from-amber-400 to-pink-400 scale-110 hover:scale-125 transition-all' : 'bg-gray-200'"></span>
                    </div>
                  </td>
                  <td class="p-12 text-2xl font-bold text-gray-600 text-right">{{ new Date(av.created_at).toLocaleString('pt-BR') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animações custom */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}

@keyframes shadow-hero {
  0% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
  100% { box-shadow: 0 35px 80px -12px rgba(0, 0, 0, 0.4); }
}

.shadow-hero {
  animation: shadow-hero 0.6s ease-out;
}

.slider-hero::-webkit-slider-thumb {
  width: 48px !important;
  height: 48px !important;
  background: linear-gradient(45deg, #f59e0b, #ec4899) !important;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.6) !important;
  border: 6px solid white !important;
}

/* Fonte mais profissional */
.font-sans {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
