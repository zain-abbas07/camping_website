import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import Signup from '../views/auth/signup.vue'
import Login from '../views/auth/Login.vue';
import Campsite from '../views/campsites/Campsite.vue';
import Bookings from '../views/user/Bookings.vue';
import CreateBooking from '../views/CreateBooking.vue' 
import Account from '@/views/user/Account.vue';
// import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue'), // Lazy loading
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/campsite/:id',
      name: 'campsite',
      component: Campsite,
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: Bookings,
    },
   { path: '/campsite/:id/book', 
    name: 'book', 
    component: CreateBooking },
  {
    path: '/signup',
    name: 'signup',
    component: Signup,
  },  
  { 
    path: '/account',
    name: 'Account',
    component: () => import('@/views/user/Account.vue'),
    meta: { requiresAuth: true }
  },

  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router
