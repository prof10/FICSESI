import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    role: null
  }),
  actions: {
    login() {
      this.isLoggedIn = true
      this.role = 'admin'
    },
    logout() {
      this.isLoggedIn = false
      this.role = null
    }
  }
})
