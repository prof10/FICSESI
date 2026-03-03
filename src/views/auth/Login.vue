<template>
  <div style="max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ccc;">
    <h2>Login Admin FICSESI</h2>
    <form @submit.prevent="handleLogin">
      <div style="margin: 10px 0;">
        <input v-model="user" placeholder="Usuário (admin)" style="width: 100%; padding: 10px;" required />
      </div>
      <div style="margin: 10px 0;">
        <input v-model="password" type="password" placeholder="Senha (12345678)" style="width: 100%; padding: 10px;" required />
      </div>
      <button type="submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none;">Entrar</button>
      <p v-if="error" style="color: red;">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const user = ref('admin')
const password = ref('')
const error = ref('')
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = () => {
  if (user.value === 'admin' && password.value === '12345678') {
    authStore.login()
    router.push('/admin/dashboard')
  } else {
    error.value = 'Senha errada!'
  }
}
</script>
