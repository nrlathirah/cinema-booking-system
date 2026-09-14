import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ShowtimesView from '../views/ShowtimesView.vue'
import SeatMapView from '../views/SeatMapView.vue'
import MenuView from '../views/MenuView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import AdminShowtimesView from '../views/admin/AdminShowtimesView.vue'
import AdminHallsView from '../views/admin/AdminHallsView.vue'
import AdminMenuView from '../views/admin/AdminMenuView.vue'
import AdminBookingsView from '../views/admin/AdminBookingsView.vue'
import AdminOrdersView from '../views/admin/AdminOrdersView.vue'
import AdminReportsView from '../views/admin/AdminReportsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/showtimes',
      name: 'showtimes',
      component: ShowtimesView,
    },
    {
      path: '/showtimes/:id/seats',
      name: 'seat-map',
      component: SeatMapView,
    },
    {
      path: '/menu',
      name: 'menu',
      component: MenuView,
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/showtimes' },
        { path: 'showtimes', name: 'admin-showtimes', component: AdminShowtimesView },
        { path: 'halls', name: 'admin-halls', component: AdminHallsView },
        { path: 'menu', name: 'admin-menu', component: AdminMenuView },
        { path: 'bookings', name: 'admin-bookings', component: AdminBookingsView },
        { path: 'orders', name: 'admin-orders', component: AdminOrdersView },
        { path: 'reports', name: 'admin-reports', component: AdminReportsView },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin) {
    const auth = useAuthStore()
    if (!auth.isAdmin) return '/'
  }
})

export default router
