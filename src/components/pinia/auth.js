import { defineStore } from 'pinia'
import axiosInstance from '../services/axiosInstance'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !isTokenExpired(state.token),
    userRole: (state) => state.user ? state.user.AccountAuthority : null,
  },
  actions: {
    async login(username, password) {
      try {
        const response = await axiosInstance.post('/account/login', {
          accountUsername: username,
          accountPassword: password,
        })
        this.setToken(response.data.token)
        this.user = response.data.user
      } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message)
        throw error
      }
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      delete axiosInstance.defaults.headers.common['Authorization']
    },
    async checkAuth() {
      const token = localStorage.getItem('token')
      if (token && !isTokenExpired(token)) {
        this.setToken(token)
        try {
          const response = await axiosInstance.get('/account/me/')
          this.user = response.data
        } catch (error) {
          this.logout()
        }
      } else {
        this.logout()
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: localStorage,
        paths: ['token', 'user']
      },
    ],
  },
})

function isTokenExpired(token) {
  if (!token) return true
  const decodedToken = jwtDecode(token)  // Changed this line
  const currentTime = Date.now() / 1000
  return decodedToken.exp < currentTime
}