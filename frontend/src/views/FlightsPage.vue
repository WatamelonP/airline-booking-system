<script setup>
import { ref, h, onMounted, computed } from 'vue';
import {
  NDataTable, NButton, NSpace, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSelect, NDatePicker, NSwitch, NIcon, NTag,
  useMessage, useDialog, NSpin
} from 'naive-ui';
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5';
import { useUserStore } from '../stores/userStore.js';
import api from '../api/axios.js';

const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const loading = ref(true);
const flights = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const saving = ref(false);
const aircraftOptions = ref([]);

const defaultForm = {
  flightNumber: '',
  airline: '',
  aircraftId: null,
  origin: '',
  destination: '',
  departureDate: null,
  arrivalDate: null,
  priceEconomy: null,
  priceBusiness: null,
  priceFirst: null,
  seatsEconomy: 0,
  seatsBusiness: 0,
  seatsFirst: 0,
  status: 'Scheduled',
  isActive: true
};

const formData = ref({ ...defaultForm });

const statusOptions = [
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Boarding', value: 'Boarding' },
  { label: 'Departed', value: 'Departed' },
  { label: 'Arrived', value: 'Arrived' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Delayed', value: 'Delayed' },
];

const columns = computed(() => {
  const cols = [
    {
      title: 'Flight #',
      key: 'flightNumber',
      width: 110,
      render(row) {
        return h('span', { style: 'font-weight: 600; color: #a5b4fc;' }, row.flightNumber);
      }
    },
    { title: 'Airline', key: 'airline', width: 140 },
    { title: 'Origin', key: 'origin', width: 130 },
    { title: 'Destination', key: 'destination', width: 130 },
    {
      title: 'Departure',
      key: 'departureDate',
      width: 170,
      render(row) {
        return row.departureDate ? new Date(row.departureDate).toLocaleString() : '—';
      }
    },
    {
      title: 'Price (₱)',
      key: 'price',
      width: 140,
      render(row) {
        const p = row.price || {};
        return h('div', { style: 'font-size: 0.8rem; line-height: 1.6;' }, [
          h('div', null, `Eco: ₱${(p.economy || 0).toLocaleString()}`),
          h('div', null, `Biz: ₱${(p.business || 0).toLocaleString()}`),
          h('div', null, `1st: ₱${(p.first || 0).toLocaleString()}`),
        ]);
      }
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render(row) {
        const s = (row.status || 'scheduled').toLowerCase();
        return h('span', { class: `status-badge ${s}` }, row.status);
      }
    },
  ];

  if (userStore.isAdmin) {
    cols.push({
      title: 'Actions',
      key: 'actions',
      width: 140,
      render(row) {
        return h(NSpace, { size: 'small' }, () => [
          h(NButton, {
            size: 'small', quaternary: true,
            onClick: () => openEdit(row)
          }, { icon: () => h(NIcon, { component: CreateOutline }) }),
          h(NButton, {
            size: 'small', quaternary: true, type: 'error',
            onClick: () => confirmDelete(row)
          }, { icon: () => h(NIcon, { component: TrashOutline }) }),
        ]);
      }
    });
  }

  return cols;
});

async function fetchFlights() {
  loading.value = true;
  try {
    const res = await api.get('/flights');
    flights.value = res.data.flights || [];
  } catch (err) {
    message.error('Failed to load flights');
  } finally {
    loading.value = false;
  }
}

async function fetchAircraftOptions() {
  try {
    const res = await api.get('/aircraft');
    aircraftOptions.value = (res.data.aircrafts || []).map(a => ({
      label: `${a.model} — ${a.registrationNumber}`,
      value: a._id
    }));
  } catch {
    // silent
  }
}

function openCreate() {
  editingId.value = null;
  formData.value = { ...defaultForm };
  showModal.value = true;
}

function openEdit(row) {
  editingId.value = row._id;
  formData.value = {
    flightNumber: row.flightNumber,
    airline: row.airline,
    aircraftId: row.aircraftId?._id || row.aircraftId,
    origin: row.origin,
    destination: row.destination,
    departureDate: row.departureDate ? new Date(row.departureDate).getTime() : null,
    arrivalDate: row.arrivalDate ? new Date(row.arrivalDate).getTime() : null,
    priceEconomy: row.price?.economy,
    priceBusiness: row.price?.business,
    priceFirst: row.price?.first,
    seatsEconomy: row.availableSeats?.economy || 0,
    seatsBusiness: row.availableSeats?.business || 0,
    seatsFirst: row.availableSeats?.first || 0,
    status: row.status,
    isActive: row.isActive
  };
  showModal.value = true;
}

async function handleSave() {
  const f = formData.value;
  if (!f.flightNumber || !f.airline || !f.origin || !f.destination) {
    message.warning('Please fill required fields');
    return;
  }

  const payload = {
    flightNumber: f.flightNumber,
    airline: f.airline,
    aircraftId: f.aircraftId,
    origin: f.origin,
    destination: f.destination,
    departureDate: f.departureDate ? new Date(f.departureDate) : null,
    arrivalDate: f.arrivalDate ? new Date(f.arrivalDate) : null,
    price: {
      economy: f.priceEconomy || 0,
      business: f.priceBusiness || 0,
      first: f.priceFirst || 0
    },
    availableSeats: {
      economy: f.seatsEconomy || 0,
      business: f.seatsBusiness || 0,
      first: f.seatsFirst || 0
    },
    status: f.status,
    isActive: f.isActive
  };

  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/flights/${editingId.value}`, payload);
      message.success('Flight updated');
    } else {
      await api.post('/flights', payload);
      message.success('Flight created');
    }
    showModal.value = false;
    fetchFlights();
  } catch (err) {
    message.error(err.response?.data?.message || 'Save failed');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(row) {
  dialog.warning({
    title: 'Delete Flight',
    content: `Are you sure you want to delete flight ${row.flightNumber}?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await api.delete(`/flights/${row._id}`);
        message.success('Flight deleted');
        fetchFlights();
      } catch {
        message.error('Delete failed');
      }
    }
  });
}

onMounted(() => {
  fetchFlights();
  if (userStore.isAdmin) fetchAircraftOptions();
});
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header-actions">
      <div class="page-header" style="margin-bottom: 0;">
        <h1>Flights</h1>
        <p>Browse and manage available flights</p>
      </div>
      <NButton v-if="userStore.isAdmin" type="primary" @click="openCreate" id="create-flight-btn">
        <template #icon><NIcon :component="AddOutline" /></template>
        Add Flight
      </NButton>
    </div>

    <div style="margin-top: 24px;">
      <NSpin :show="loading">
        <NDataTable
          :columns="columns"
          :data="flights"
          :bordered="false"
          :single-line="false"
          :pagination="{ pageSize: 10 }"
          striped
        />
      </NSpin>
    </div>

    <!-- Create / Edit Modal -->
    <NModal
      v-model:show="showModal"
      :title="editingId ? 'Edit Flight' : 'Create Flight'"
      preset="card"
      style="width: 620px; max-width: 95vw;"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="130">
        <NFormItem label="Flight Number">
          <NInput v-model:value="formData.flightNumber" placeholder="e.g. PR-101" />
        </NFormItem>
        <NFormItem label="Airline">
          <NInput v-model:value="formData.airline" placeholder="e.g. Philippine Airlines" />
        </NFormItem>
        <NFormItem label="Aircraft">
          <NSelect v-model:value="formData.aircraftId" :options="aircraftOptions" placeholder="Select aircraft" clearable />
        </NFormItem>
        <NFormItem label="Origin">
          <NInput v-model:value="formData.origin" placeholder="e.g. Manila" />
        </NFormItem>
        <NFormItem label="Destination">
          <NInput v-model:value="formData.destination" placeholder="e.g. Cebu" />
        </NFormItem>
        <NFormItem label="Departure">
          <NDatePicker v-model:value="formData.departureDate" type="datetime" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Arrival">
          <NDatePicker v-model:value="formData.arrivalDate" type="datetime" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Economy Price">
          <NInputNumber v-model:value="formData.priceEconomy" :min="0" style="width: 100%;" placeholder="₱" />
        </NFormItem>
        <NFormItem label="Business Price">
          <NInputNumber v-model:value="formData.priceBusiness" :min="0" style="width: 100%;" placeholder="₱" />
        </NFormItem>
        <NFormItem label="First Class Price">
          <NInputNumber v-model:value="formData.priceFirst" :min="0" style="width: 100%;" placeholder="₱" />
        </NFormItem>
        <NFormItem label="Economy Seats">
          <NInputNumber v-model:value="formData.seatsEconomy" :min="0" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Business Seats">
          <NInputNumber v-model:value="formData.seatsBusiness" :min="0" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="First Seats">
          <NInputNumber v-model:value="formData.seatsFirst" :min="0" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Status">
          <NSelect v-model:value="formData.status" :options="statusOptions" />
        </NFormItem>
        <NFormItem label="Active">
          <NSwitch v-model:value="formData.isActive" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">Cancel</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ editingId ? 'Update' : 'Create' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
