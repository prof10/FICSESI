<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>FICSESI</h1>
        <p>Painel administrativo</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <label class="field">
          <span>Usuário</span>
          <input
            v-model="user"
            type="text"
            placeholder="admin"
            required
          />
        </label>

        <label class="field">
          <span>Senha</span>
          <input
            v-model="password"
            type="password"
            placeholder="********"
            required
          />
        </label>

        <button type="submit" class="primary-btn">
          Entrar
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>

      
    </div>
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
  if (user.value === 'admin' && password.value === '@12345678.') {
    authStore.login()
    router.push('/admin/dashboard')
  } else {
    error.value = 'Usuário ou senha incorretos.'
  }
}
</script>



<style scoped>
.login-page {
  min-height: 100vh;
  height: 100vh;           /* força altura exata da viewport */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #b7f5a6 0%, #e3ffda 40%, #ffffff 100%);
  overflow: hidden;        /* evita scroll vertical */
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #fdfdfd;
  border-radius: 18px;
  padding: 28px 24px 18px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-header h1 {
  margin: 0;
  font-size: 24px;
  color: #00964a;
  letter-spacing: 1px;
}

.login-header p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #555;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.field span {
  color: #333;
}

.field input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid #cfd8dc;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field input:focus {
  border-color: #00964a;
  box-shadow: 0 0 0 2px rgba(0, 150, 74, 0.18);
}

.primary-btn {
  margin-top: 8px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #00964a, #00b85a);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.primary-btn:hover {
  box-shadow: 0 4px 10px rgba(0, 150, 74, 0.4);
  transform: translateY(-1px);
}

.primary-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.error {
  margin-top: 8px;
  color: #d32f2f;
  font-size: 13px;
}

.hint {
  margin-top: 10px;
  font-size: 12px;
  text-align: center;
  color: #777;
}

.hint strong {
  font-weight: 600;
}

/* Mobile-first; já está responsivo, mas reduz título em telas menores */
@media (max-width: 400px) {
  .login-card {
    padding: 20px 16px 14px;
  }

  .login-header h1 {
    font-size: 20px;
  }
}
</style>
