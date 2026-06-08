import { createRouter, createWebHistory } from 'vue-router';

import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import DashboardPage from '../views/DashboardPage.vue';
import FlightsPage from '../views/FlightsPage.vue';
import BookingsPage from '../views/BookingsPage.vue';
import AircraftPage from '../views/AircraftPage.vue';
import PassengersPage from '../views/PassengersPage.vue';
import SeatsPage from '../views/SeatsPage.vue';
import PaymentsPage from '../views/PaymentsPage.vue';
import ProfilePage from '../views/ProfilePage.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/flights',
    name: 'Flights',
    component: FlightsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: BookingsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/aircraft',
    name: 'Aircraft',
    component: AircraftPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/passengers',
    name: 'Passengers',
    component: PassengersPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/seats',
    name: 'Seats',
    component: SeatsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: PaymentsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.guest && token) {
    next('/');
  } else {
    next();
  }
});

export default router;
