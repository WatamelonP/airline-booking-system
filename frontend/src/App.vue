<script setup>
import { computed } from 'vue';
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider } from 'naive-ui';
import { darkTheme } from 'naive-ui';
import { useRoute } from 'vue-router';
import { useUserStore } from './stores/userStore.js';
import AppSidebar from './components/AppSidebar.vue';

const route = useRoute();
const userStore = useUserStore();

const showLayout = computed(() => {
  return userStore.isAuthenticated && route.name !== 'Login' && route.name !== 'Register';
});

const themeOverrides = {
  common: {
    primaryColor: '#6366f1',
    primaryColorHover: '#818cf8',
    primaryColorPressed: '#4f46e5',
    primaryColorSuppl: '#6366f1',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    bodyColor: '#0a0a0f',
    cardColor: 'rgba(255, 255, 255, 0.04)',
    modalColor: '#141420',
    popoverColor: '#1a1a2e',
    tableColor: 'rgba(255, 255, 255, 0.02)',
    inputColor: 'rgba(255, 255, 255, 0.05)',
    actionColor: 'rgba(255, 255, 255, 0.04)',
    hoverColor: 'rgba(255, 255, 255, 0.08)',
    tableColorHover: 'rgba(99, 102, 241, 0.06)',
    tableColorStriped: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    dividerColor: 'rgba(255, 255, 255, 0.06)',
    textColorBase: '#f1f5f9',
    textColor1: '#f1f5f9',
    textColor2: '#cbd5e1',
    textColor3: '#94a3b8',
  },
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusLarge: '10px',
  },
  Card: {
    borderRadius: '12px',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  DataTable: {
    borderRadius: '12px',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    thColor: 'rgba(255, 255, 255, 0.04)',
    tdColor: 'transparent',
    tdColorHover: 'rgba(99, 102, 241, 0.06)',
  },
  Input: {
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderHover: '1px solid rgba(99, 102, 241, 0.5)',
    borderFocus: '1px solid #6366f1',
    color: 'rgba(255, 255, 255, 0.05)',
  },
  Menu: {
    borderRadius: '8px',
    itemColorActive: 'rgba(99, 102, 241, 0.12)',
    itemColorActiveHover: 'rgba(99, 102, 241, 0.15)',
    itemTextColorActive: '#a5b4fc',
    itemTextColorActiveHover: '#a5b4fc',
    itemIconColorActive: '#a5b4fc',
    itemIconColorActiveHover: '#a5b4fc',
  },
  Dialog: {
    borderRadius: '16px',
  },
  Tag: {
    borderRadius: '20px',
  }
};
</script>

<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <!-- Authenticated Layout with Sidebar -->
          <div v-if="showLayout" class="app-layout">
            <AppSidebar />
            <main class="main-content">
              <router-view v-slot="{ Component }">
                <transition name="page" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </main>
          </div>

          <!-- Guest Layout (Login/Register) -->
          <div v-else>
            <router-view v-slot="{ Component }">
              <transition name="page" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
