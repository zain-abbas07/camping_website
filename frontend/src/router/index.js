import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import Signup from '../views/auth/signup.vue'
import Login from '../views/auth/Login.vue';
import Campsite from '../views/campsites/Campsite.vue';
import Bookings from '../views/user/Bookings.vue';
import CreateBooking from '../views/CreateBooking.vue' 
import Account from '@/views/user/Account.vue';
import Dashboard from '@/views/owner/Dashboard.vue';
import AddListing from '@/views/owner/AddListing.vue';
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
  {
    path: '/owner/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/owner/Dashboard.vue'),
    meta: { requiresAuth: true, ownerOnly: true }
  },
  {
    path: '/owner/campsite/:id',
    name: 'CampsiteDetails',
    component: () => import('@/views/owner/CampsiteDetails.vue'),
    meta: { requiresAuth: true, ownerOnly: true },
  },
  {
    path: '/owner/add-listing',
    name: 'AddListing',
    component: AddListing,
    meta: { requiresAuth: true, ownerOnly: true },
  },
  {
    path: '/owner/bookings',
    name: 'OwnerBookings',
    component: () => import('@/views/owner/BookingDetailsOwner.vue'),
    meta: { requiresAuth: true, ownerOnly: true },
  },
  {
    path: '/messages',
    name: 'MessagePage',
    component: () => import('@/views/MessagePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/messages/chat',
    name: 'MessageChat',
    component: () => import('@/views/user/MessageChat.vue')
  }

  ],
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!user;



  if (to.meta.requiresAuth && !isAuthenticated) {
   return next('/login');
  } 
  if (to.meta.ownerOnly && user?.role.toLowerCase() !== 'owner') {
    
    return next('/'); 
  }
  
    next();
  
});

export default router
