// import { ref } from 'vue'

// const user = ref(JSON.parse(localStorage.getItem('user')) || null)

// export function useAuth() {
//   const login = (userData) => {
//     user.value = userData
//     localStorage.setItem('user', JSON.stringify(userData))
//   }

//   const logout = () => {
//     user.value = null
//     localStorage.removeItem('user')
//   }

//   return {
//     user,
//     login,
//     logout,
//     isLoggedIn: computed(() => !!user.value)
//   }
// }


// import { ref } from 'vue';

// export const currentUser = ref(JSON.parse(localStorage.getItem('user')));

// export function loginUser(user) {
//   localStorage.setItem('user', JSON.stringify(user));
//   currentUser.value = user;
// }

// export function logoutUser() {
//   localStorage.removeItem('user');
//   currentUser.value = null;
// }


// stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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

