import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/components/DefaultLayout.vue';
import AppLogin from '@/views/AppLogin.vue';
import HomeView from '@/views/HomeView.vue'; 

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    

    },
      {
    path: '/home',
    children: [
      {
        path: '',
        component: HomeView
      }
    ]
  },
  // 首页 /home
      
  {
    path: '/login',
    children: [
      {
        path: '',
        component: AppLogin
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;