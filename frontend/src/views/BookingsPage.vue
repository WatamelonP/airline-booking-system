<script setup>
import { ref, h, onMounted, computed } from 'vue';
import {
  NDataTable, NButton, NSpace, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSelect, NIcon, NTag,
  useMessage, useDialog, NSpin
} from 'naive-ui';
import { AddOutline, CreateOutline, TrashOutline, CloseCircleOutline } from '@vicons/ionicons5';
import { useUserStore } from '../stores/userStore.js';
import api from '../api/axios.js';

const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const loading = ref(true);
const bookings = ref([]);
const showModal = ref(false);
const saving = ref(false);
const flightOptions = ref([]);

const defaultForm = {
  flightId: null,
  seatClass: 'Economy',
  totalPassengers: 1,
  promoCode: '',
  remarks: ''
};

const formData = ref({ ...defaultForm });

const seatClassOptions = [
  { label: 'Economy', value: 'Economy' },
  { label: 'Business', value: 'Business' },
  { label: 'First Class', value: 'First' }
];

const columns = computed(() => {
  const cols = [
    {
      title: 'Booking ID',
      key: '_id',
      width: 120,
      ellipsis: { tooltip: true },
      render(row) {
        return h('span', { style: 'font-family: monospace; font-size: 0.75rem; color: #a5b4fc;' }, row._id?.slice(-8));
      }
    },
    {
      title: 'Flight',
      key: 'flight',
      width: 140,
      render(row) {
        if (row.flightId && typeof row.flightId === 'object') {
          return h('div', null, [
            h('div', { style: 'font-weight: 600;' }, row.flightId.flightNumber || '—'),
            h('div', { style: 'font-size: 0.75rem; color: var(--text-secondary);' },
              `${row.flightId.origin || ''} → ${row.flightId.destination || ''}`)
          ]);
        }
        return '—';
      }
    },
    { title: 'Class', key: 'seatClass', width: 100 },
    { title: 'Passengers', key: 'totalPassengers', width: 100, align: 'center' },
    {
      title: 'Total Price',
      key: 'totalPrice',
      width: 120,
      render(row) {
        return `₱${(row.totalPrice || 0).toLocaleString()}`;
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render(row) {
        const s = (row.status || 'pending').toLowerCase();
        return h('span', { class: `status-badge ${s}` }, row.status);
      }
    }
  ];

  if (userStore.isAdmin) {
    cols.splice(1, 0, {
      title: 'User',
      key: 'userId',
      width: 150,
      render(row) {
        if (row.userId && typeof row.userId === 'object') {
          return `${row.userId.firstName} ${row.userId.lastName}`;
        }
        return '—';
      }
    });
  }

  cols.push({
    title: 'Actions',
    key: 'actions',
    width: 140,
    render(row) {
      const btns = [];
      if (row.status !== 'Cancelled') {
        btns.push(
          h(NButton, {
            size: 'small', quaternary: true, type: 'warning',
            onClick: () => cancelBooking(row)
          }, { icon: () => h(NIcon, { component: CloseCircleOutline }), default: () => 'Cancel' })
        );
      }
      if (userStore.isAdmin) {
        btns.push(
          h(NButton, {
            size: 'small', quaternary: true, type: 'error',
            onClick: () => confirmDelete(row)
          }, { icon: () => h(NIcon, { component: TrashOutline }) })
        );
      }
      return h(NSpace, { size: 'small' }, () => btns);
    }
  });

  return cols;
});

async function fetchBookings() {
  loading.value = true;
  try {
    let res;
    if (userStore.isAdmin) {
      res = await api.get('/bookings');
    } else {
      res = await api.get(`/bookings/${userStore.userId}`);
    }
    bookings.value = res.data.bookings || [];
  } catch (err) {
    // If user has no bookings, endpoint may 404
    bookings.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchFlights() {
  try {
    const res = await api.get('/flights');
    flightOptions.value = (res.data.flights || []).map(f => ({
      label: `${f.flightNumber} — ${f.origin} → ${f.destination}`,
      value: f._id
    }));
  } catch { /* silent */ }
}

function openCreate() {
  formData.value = { ...defaultForm };
  showModal.value = true;
}

async function handleSave() {
  const f = formData.value;
  if (!f.flightId || !f.seatClass || !f.totalPassengers) {
    message.warning('Please fill required fields');
    return;
  }

  saving.value = true;
  try {
    await api.post('/bookings', {
      flightId: f.flightId,
      seatClass: f.seatClass,
      totalPassengers: f.totalPassengers,
      promoCode: f.promoCode,
      remarks: f.remarks
    });
    message.success('Booking created');
    showModal.value = false;
    fetchBookings();
  } catch (err) {
    message.error(err.response?.data?.message || 'Booking failed');
  } finally {
    saving.value = false;
  }
}

async function cancelBooking(row) {
  dialog.warning({
    title: 'Cancel Booking',
    content: 'Are you sure you want to cancel this booking?',
    positiveText: 'Yes, Cancel',
    negativeText: 'No',
    onPositiveClick: async () => {
      try {
        await api.put(`/bookings/${row._id}`, { status: 'Cancelled' });
        message.success('Booking cancelled');
        fetchBookings();
      } catch {
        message.error('Cancel failed');
      }
    }
  });
}

function confirmDelete(row) {
  dialog.error({
    title: 'Delete Booking',
    content: 'This action cannot be undone. Delete this booking?',
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await api.delete(`/bookings/${row._id}`);
        message.success('Booking deleted');
        fetchBookings();
      } catch {
        message.error('Delete failed');
      }
    }
  });
}

onMounted(() => {
  fetchBookings();
  fetchFlights();
});
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header-actions">
      <div class="page-header" style="margin-bottom: 0;">
        <h1>Bookings</h1>
        <p>{{ userStore.isAdmin ? 'Manage all bookings' : 'View and manage your bookings' }}</p>
      </div>
      <NButton type="primary" @click="openCreate" id="create-booking-btn">
        <template #icon><NIcon :component="AddOutline" /></template>
        New Booking
      </NButton>
    </div>

    <div style="margin-top: 24px;">
      <NSpin :show="loading">
        <NDataTable
          :columns="columns"
          :data="bookings"
          :bordered="false"
          :single-line="false"
          :pagination="{ pageSize: 10 }"
          striped
        />
      </NSpin>
    </div>

    <!-- Create Modal -->
    <NModal
      v-model:show="showModal"
      title="New Booking"
      preset="card"
      style="width: 500px; max-width: 95vw;"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="130">
        <NFormItem label="Flight">
          <NSelect v-model:value="formData.flightId" :options="flightOptions" placeholder="Select a flight" filterable />
        </NFormItem>
        <NFormItem label="Seat Class">
          <NSelect v-model:value="formData.seatClass" :options="seatClassOptions" />
        </NFormItem>
        <NFormItem label="Passengers">
          <NInputNumber v-model:value="formData.totalPassengers" :min="1" :max="20" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Promo Code">
          <NInput v-model:value="formData.promoCode" placeholder="Optional" />
        </NFormItem>
        <NFormItem label="Remarks">
          <NInput v-model:value="formData.remarks" type="textarea" placeholder="Optional notes" :rows="2" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">Cancel</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">Create Booking</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
