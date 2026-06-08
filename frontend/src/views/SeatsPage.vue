<script setup>
import { ref, h, onMounted } from 'vue';
import {
  NDataTable, NButton, NSpace, NModal, NForm, NFormItem,
  NInput, NSelect, NSwitch, NIcon, NTag,
  useMessage, useDialog, NSpin
} from 'naive-ui';
import { AddOutline, CreateOutline, TrashOutline, LockOpenOutline } from '@vicons/ionicons5';
import api from '../api/axios.js';

const message = useMessage();
const dialog = useDialog();

const loading = ref(true);
const seats = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const saving = ref(false);

const defaultForm = {
  flightId: '',
  seatNumber: '',
  seatClass: 'Economy',
  isAvailable: true,
  passengerId: ''
};

const formData = ref({ ...defaultForm });

const seatClassOptions = [
  { label: 'Economy', value: 'Economy' },
  { label: 'Business', value: 'Business' },
  { label: 'First', value: 'First' }
];

const columns = [
  {
    title: 'Seat #',
    key: 'seatNumber',
    width: 100,
    render(row) {
      return h('span', { style: 'font-weight: 700; font-family: monospace; color: #a5b4fc;' }, row.seatNumber);
    }
  },
  {
    title: 'Class',
    key: 'seatClass',
    width: 100,
    render(row) {
      const colors = { Economy: 'info', Business: 'warning', First: 'success' };
      return h(NTag, { size: 'small', type: colors[row.seatClass] || 'default', bordered: false }, () => row.seatClass);
    }
  },
  {
    title: 'Flight',
    key: 'flightId',
    width: 150,
    render(row) {
      if (row.flightId && typeof row.flightId === 'object') {
        return row.flightId.flightNumber || row.flightId._id?.slice(-8);
      }
      return h('span', { style: 'font-family: monospace; font-size: 0.75rem;' }, row.flightId?.slice(-8) || '—');
    }
  },
  {
    title: 'Available',
    key: 'isAvailable',
    width: 100,
    render(row) {
      return h(NTag, {
        type: row.isAvailable ? 'success' : 'error',
        size: 'small',
        bordered: false
      }, () => row.isAvailable ? 'Available' : 'Booked');
    }
  },
  {
    title: 'Passenger',
    key: 'passengerId',
    width: 140,
    render(row) {
      if (row.passengerId && typeof row.passengerId === 'object') {
        return `${row.passengerId.firstName || ''} ${row.passengerId.lastName || ''}`.trim() || '—';
      }
      return row.passengerId ? row.passengerId.slice(-8) : '—';
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 160,
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(NButton, {
          size: 'small', quaternary: true,
          onClick: () => openEdit(row)
        }, { icon: () => h(NIcon, { component: CreateOutline }) }),
        !row.isAvailable ? h(NButton, {
          size: 'small', quaternary: true, type: 'warning',
          onClick: () => releaseSeat(row)
        }, { icon: () => h(NIcon, { component: LockOpenOutline }), default: () => 'Release' }) : null,
        h(NButton, {
          size: 'small', quaternary: true, type: 'error',
          onClick: () => confirmDelete(row)
        }, { icon: () => h(NIcon, { component: TrashOutline }) }),
      ].filter(Boolean));
    }
  }
];

async function fetchSeats() {
  loading.value = true;
  try {
    const res = await api.get('/seats');
    seats.value = Array.isArray(res.data) ? res.data : (res.data.seats || []);
  } catch {
    seats.value = [];
  } finally {
    loading.value = false;
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
    flightId: typeof row.flightId === 'object' ? row.flightId?._id : row.flightId,
    seatNumber: row.seatNumber,
    seatClass: row.seatClass,
    isAvailable: row.isAvailable,
    passengerId: typeof row.passengerId === 'object' ? row.passengerId?._id : (row.passengerId || '')
  };
  showModal.value = true;
}

async function handleSave() {
  const f = formData.value;
  if (!f.flightId || !f.seatNumber || !f.seatClass) {
    message.warning('Please fill required fields');
    return;
  }

  const payload = {
    flightId: f.flightId,
    seatNumber: f.seatNumber,
    seatClass: f.seatClass,
    isAvailable: f.isAvailable,
    passengerId: f.passengerId || undefined
  };

  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/seats/${editingId.value}`, payload);
      message.success('Seat updated');
    } else {
      await api.post('/seats', payload);
      message.success('Seat created');
    }
    showModal.value = false;
    fetchSeats();
  } catch (err) {
    message.error(err.response?.data?.message || 'Save failed');
  } finally {
    saving.value = false;
  }
}

async function releaseSeat(row) {
  dialog.warning({
    title: 'Release Seat',
    content: `Release seat ${row.seatNumber}? This will make it available again.`,
    positiveText: 'Release',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await api.put(`/seats/${row._id}/release`);
        message.success('Seat released');
        fetchSeats();
      } catch {
        message.error('Release failed');
      }
    }
  });
}

function confirmDelete(row) {
  dialog.warning({
    title: 'Delete Seat',
    content: `Delete seat ${row.seatNumber}?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await api.delete(`/seats/${row._id}`);
        message.success('Seat deleted');
        fetchSeats();
      } catch {
        message.error('Delete failed');
      }
    }
  });
}

onMounted(fetchSeats);
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header-actions">
      <div class="page-header" style="margin-bottom: 0;">
        <h1>Seats</h1>
        <p>Manage seat assignments and availability</p>
      </div>
      <NButton type="primary" @click="openCreate" id="create-seat-btn">
        <template #icon><NIcon :component="AddOutline" /></template>
        Add Seat
      </NButton>
    </div>

    <div style="margin-top: 24px;">
      <NSpin :show="loading">
        <NDataTable
          :columns="columns"
          :data="seats"
          :bordered="false"
          :single-line="false"
          :pagination="{ pageSize: 15 }"
          striped
        />
      </NSpin>
    </div>

    <NModal
      v-model:show="showModal"
      :title="editingId ? 'Edit Seat' : 'Add Seat'"
      preset="card"
      style="width: 480px; max-width: 95vw;"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="120">
        <NFormItem label="Flight ID">
          <NInput v-model:value="formData.flightId" placeholder="Flight ObjectId" />
        </NFormItem>
        <NFormItem label="Seat Number">
          <NInput v-model:value="formData.seatNumber" placeholder="e.g. 12A" />
        </NFormItem>
        <NFormItem label="Seat Class">
          <NSelect v-model:value="formData.seatClass" :options="seatClassOptions" />
        </NFormItem>
        <NFormItem label="Available">
          <NSwitch v-model:value="formData.isAvailable" />
        </NFormItem>
        <NFormItem label="Passenger ID">
          <NInput v-model:value="formData.passengerId" placeholder="Optional — Passenger ObjectId" />
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
