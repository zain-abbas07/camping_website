import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: JSON.parse(localStorage.getItem('user')) || null,
  }),
  actions: {
    loginUser(user) {
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logoutUser() {
      this.currentUser = null;
      localStorage.removeItem('user');
    },
  },
});