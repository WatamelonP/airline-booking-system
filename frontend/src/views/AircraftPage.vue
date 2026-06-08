<script setup>
import { ref, h, onMounted } from 'vue';
import {
  NDataTable, NButton, NSpace, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSwitch, NIcon, NTag,
  useMessage, useDialog, NSpin
} from 'naive-ui';
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5';
import { useUserStore } from '../stores/userStore.js';
import api from '../api/axios.js';

const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const loading = ref(true);
const aircrafts = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const saving = ref(false);

const defaultForm = {
  model: '',
  airline: '',
  registrationNumber: '',
  totalSeats: 0,
  economySeats: 0,
  businessSeats: 0,
  firstSeats: 0,
  isActive: true
};

const formData = ref({ ...defaultForm });

const columns = [
  {
    title: 'Model',
    key: 'model',
    width: 160,
    render(row) {
      return h('span', { style: 'font-weight: 600; color: #a5b4fc;' }, row.model);
    }
  },
  { title: 'Airline', key: 'airline', width: 160 },
  {
    title: 'Reg. Number',
    key: 'registrationNumber',
    width: 140,
    render(row) {
      return h('span', { style: 'font-family: monospace;' }, row.registrationNumber);
    }
  },
  { title: 'Total Seats', key: 'totalSeats', width: 100, align: 'center' },
  {
    title: 'Seat Classes',
    key: 'seatClasses',
    width: 200,
    render(row) {
      const sc = row.seatClasses || {};
      return h(NSpace, { size: 'small' }, () => [
        h(NTag, { size: 'small', type: 'info', bordered: false }, () => `Eco: ${sc.economy || 0}`),
        h(NTag, { size: 'small', type: 'warning', bordered: false }, () => `Biz: ${sc.business || 0}`),
        h(NTag, { size: 'small', type: 'success', bordered: false }, () => `1st: ${sc.first || 0}`),
      ]);
    }
  },
  {
    title: 'Active',
    key: 'isActive',
    width: 80,
    render(row) {
      return h(NTag, {
        type: row.isActive ? 'success' : 'error',
        size: 'small',
        bordered: false
      }, () => row.isActive ? 'Yes' : 'No');
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render(row) {
      if (!userStore.isAdmin) return null;
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
  }
];

async function fetchAircrafts() {
  loading.value = true;
  try {
    const res = await api.get('/aircraft');
    aircrafts.value = res.data.aircrafts || [];
  } catch (err) {
    message.error('Failed to load aircraft');
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
    model: row.model,
    airline: row.airline,
    registrationNumber: row.registrationNumber,
    totalSeats: row.totalSeats,
    economySeats: row.seatClasses?.economy || 0,
    businessSeats: row.seatClasses?.business || 0,
    firstSeats: row.seatClasses?.first || 0,
    isActive: row.isActive
  };
  showModal.value = true;
}

async function handleSave() {
  const f = formData.value;
  if (!f.model || !f.airline || !f.registrationNumber) {
    message.warning('Please fill required fields');
    return;
  }

  const payload = {
    model: f.model,
    airline: f.airline,
    registrationNumber: f.registrationNumber,
    totalSeats: f.totalSeats,
    seatClasses: {
      economy: f.economySeats,
      business: f.businessSeats,
      first: f.firstSeats
    },
    isActive: f.isActive
  };

  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/aircraft/${editingId.value}`, payload);
      message.success('Aircraft updated');
    } else {
      await api.post('/aircraft', payload);
      message.success('Aircraft created');
    }
    showModal.value = false;
    fetchAircrafts();
  } catch (err) {
    message.error(err.response?.data?.message || 'Save failed');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(row) {
  dialog.warning({
    title: 'Delete Aircraft',
    content: `Delete ${row.model} (${row.registrationNumber})?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await api.delete(`/aircraft/${row._id}`);
        message.success('Aircraft deleted');
        fetchAircrafts();
      } catch {
        message.error('Delete failed');
      }
    }
  });
}

onMounted(fetchAircrafts);
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header-actions">
      <div class="page-header" style="margin-bottom: 0;">
        <h1>Aircraft</h1>
        <p>Manage aircraft fleet</p>
      </div>
      <NButton v-if="userStore.isAdmin" type="primary" @click="openCreate" id="create-aircraft-btn">
        <template #icon><NIcon :component="AddOutline" /></template>
        Add Aircraft
      </NButton>
    </div>

    <div style="margin-top: 24px;">
      <NSpin :show="loading">
        <NDataTable
          :columns="columns"
          :data="aircrafts"
          :bordered="false"
          :single-line="false"
          :pagination="{ pageSize: 10 }"
          striped
        />
      </NSpin>
    </div>

    <NModal
      v-model:show="showModal"
      :title="editingId ? 'Edit Aircraft' : 'Add Aircraft'"
      preset="card"
      style="width: 520px; max-width: 95vw;"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="140">
        <NFormItem label="Model">
          <NInput v-model:value="formData.model" placeholder="e.g. Airbus A320" />
        </NFormItem>
        <NFormItem label="Airline">
          <NInput v-model:value="formData.airline" placeholder="e.g. Cebu Pacific" />
        </NFormItem>
        <NFormItem label="Reg. Number">
          <NInput v-model:value="formData.registrationNumber" placeholder="e.g. RP-C3191" />
        </NFormItem>
        <NFormItem label="Total Seats">
          <NInputNumber v-model:value="formData.totalSeats" :min="0" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Economy Seats">
          <NInputNumber v-model:value="formData.economySeats" :min="0" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Business Seats">
          <NInputNumber v-model:value="formData.businessSeats" :min="0" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="First Class Seats">
          <NInputNumber v-model:value="formData.firstSeats" :min="0" style="width: 100%;" />
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
