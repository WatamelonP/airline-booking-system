<script setup>
import { ref, onMounted } from 'vue';
import { NIcon, NSpin } from 'naive-ui';
import { AirplaneOutline, BookmarkOutline, PeopleOutline, CardOutline } from '@vicons/ionicons5';
import { useUserStore } from '../stores/userStore.js';
import api from '../api/axios.js';

const userStore = useUserStore();

const loading = ref(true);
const stats = ref({
  flights: 0,
  bookings: 0,
  passengers: 0,
  payments: 0
});

onMounted(async () => {
  await userStore.fetchProfile();
  try {
    const [flightsRes, bookingsRes] = await Promise.allSettled([
      api.get('/flights'),
      api.get('/bookings')
    ]);

    if (flightsRes.status === 'fulfilled') {
      stats.value.flights = flightsRes.value.data.flights?.length || 0;
    }
    if (bookingsRes.status === 'fulfilled') {
      stats.value.bookings = bookingsRes.value.data.bookings?.length || 0;
    }

    if (userStore.isAdmin) {
      const [passRes] = await Promise.allSettled([
        api.get('/passengers')
      ]);
      if (passRes.status === 'fulfilled') {
        stats.value.passengers = passRes.value.data.passengers?.length || 0;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header">
      <h1>Welcome back, {{ userStore.user?.firstName || 'Traveler' }}! 👋</h1>
      <p>Here's an overview of your airline booking dashboard</p>
    </div>

    <NSpin :show="loading">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon indigo">
            <NIcon :component="AirplaneOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.flights }}</div>
            <div class="stat-label">Available Flights</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon cyan">
            <NIcon :component="BookmarkOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.bookings }}</div>
            <div class="stat-label">{{ userStore.isAdmin ? 'Total Bookings' : 'Your Bookings' }}</div>
          </div>
        </div>

        <div class="stat-card" v-if="userStore.isAdmin">
          <div class="stat-icon green">
            <NIcon :component="PeopleOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.passengers }}</div>
            <div class="stat-label">Passengers</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon amber">
            <NIcon :component="CardOutline" :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userStore.isAdmin ? 'Admin' : 'Passenger' }}</div>
            <div class="stat-label">Account Type</div>
          </div>
        </div>
      </div>
    </NSpin>

    <div class="glass-card" style="margin-top: 8px;">
      <h3 style="margin-bottom: 12px; font-weight: 600;">Quick Actions</h3>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <router-link to="/flights" style="text-decoration: none;">
          <div class="stat-card" style="cursor: pointer; min-width: 200px;">
            <div class="stat-icon indigo">
              <NIcon :component="AirplaneOutline" :size="20" />
            </div>
            <div class="stat-info">
              <div class="stat-label" style="font-size: 0.85rem; color: var(--text-primary);">Browse Flights</div>
            </div>
          </div>
        </router-link>
        <router-link to="/bookings" style="text-decoration: none;">
          <div class="stat-card" style="cursor: pointer; min-width: 200px;">
            <div class="stat-icon cyan">
              <NIcon :component="BookmarkOutline" :size="20" />
            </div>
            <div class="stat-info">
              <div class="stat-label" style="font-size: 0.85rem; color: var(--text-primary);">View Bookings</div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
