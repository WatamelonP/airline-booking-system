import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/axios.js';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  const isAdmin = computed(() => {
    if (!token.value) return false;
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      return payload.isAdmin === true;
    } catch {
      return false;
    }
  });

  const userId = computed(() => {
    if (!token.value) return null;
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const res = await api.post('/users/login', { email, password });
    token.value = res.data.auth;
    localStorage.setItem('token', res.data.auth);
    await fetchProfile();
    return res.data;
  }

  async function register(userData) {
    const res = await api.post('/users/register', userData);
    return res.data;
  }

  async function fetchProfile() {
    try {
      const res = await api.get('/users/profile');
      user.value = res.data.user;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    userId,
    login,
    register,
    fetchProfile,
    logout
  };
});
