import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Campsite from '../views/Campsite.vue';
import Bookings from '../views/Bookings.vue';
import CreateBooking from '../views/CreateBooking.vue' 

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
    { path: '/bookings', name: 'bookings', component: Bookings },
  { path: '/campsite/:id/book', name: 'book', component: CreateBooking },

  ],
})

export default router
