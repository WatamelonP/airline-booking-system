<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NIcon, NButton } from 'naive-ui';
import { useUserStore } from '../stores/userStore.js';
import {
  GridOutline,
  AirplaneOutline,
  BookmarkOutline,
  ConstructOutline,
  PeopleOutline,
  GridSharp,
  CardOutline,
  PersonOutline,
  LogOutOutline
} from '@vicons/ionicons5';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const navItems = computed(() => {
  const items = [
    { label: 'Dashboard', icon: GridOutline, path: '/', section: 'main' },
    { label: 'Flights', icon: AirplaneOutline, path: '/flights', section: 'main' },
    { label: 'Bookings', icon: BookmarkOutline, path: '/bookings', section: 'main' },
    { label: 'Profile', icon: PersonOutline, path: '/profile', section: 'main' },
  ];

  if (userStore.isAdmin) {
    items.push(
      { label: 'Aircraft', icon: ConstructOutline, path: '/aircraft', section: 'admin' },
      { label: 'Passengers', icon: PeopleOutline, path: '/passengers', section: 'admin' },
      { label: 'Seats', icon: GridSharp, path: '/seats', section: 'admin' },
      { label: 'Payments', icon: CardOutline, path: '/payments', section: 'admin' },
    );
  }

  return items;
});

const mainItems = computed(() => navItems.value.filter(i => i.section === 'main'));
const adminItems = computed(() => navItems.value.filter(i => i.section === 'admin'));

const userInitials = computed(() => {
  if (!userStore.user) return '?';
  const f = userStore.user.firstName?.[0] || '';
  const l = userStore.user.lastName?.[0] || '';
  return (f + l).toUpperCase();
});

const userName = computed(() => {
  if (!userStore.user) return 'User';
  return `${userStore.user.firstName} ${userStore.user.lastName}`;
});

function navigateTo(path) {
  router.push(path);
}

function handleLogout() {
  userStore.logout();
  router.push('/login');
}

function isActive(path) {
  return route.path === path;
}
</script>

<template>
  <aside class="app-sidebar">
    <div class="brand">
      <h2>✈ SkyVoyage</h2>
      <span>Airline Booking</span>
    </div>

    <nav class="sidebar-nav">
      <div class="sidebar-section-title">Navigation</div>
      <div
        v-for="item in mainItems"
        :key="item.path"
        :class="['sidebar-item', { active: isActive(item.path) }]"
        @click="navigateTo(item.path)"
      >
        <span class="icon">
          <NIcon :component="item.icon" :size="18" />
        </span>
        {{ item.label }}
      </div>

      <template v-if="adminItems.length > 0">
        <div class="sidebar-section-title">Administration</div>
        <div
          v-for="item in adminItems"
          :key="item.path"
          :class="['sidebar-item', { active: isActive(item.path) }]"
          @click="navigateTo(item.path)"
        >
          <span class="icon">
            <NIcon :component="item.icon" :size="18" />
          </span>
          {{ item.label }}
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="avatar">{{ userInitials }}</div>
        <div class="user-info">
          <div class="name">{{ userName }}</div>
          <div class="role">{{ userStore.isAdmin ? 'Administrator' : 'Passenger' }}</div>
        </div>
      </div>
      <NButton
        quaternary
        block
        size="small"
        @click="handleLogout"
        style="justify-content: flex-start; color: var(--text-secondary);"
      >
        <template #icon>
          <NIcon :component="LogOutOutline" />
        </template>
        Sign Out
      </NButton>
    </div>
  </aside>
</template>
