<script setup>
import { ref, h, onMounted } from 'vue';
import {
  NDataTable, NButton, NSpace, NModal, NForm, NFormItem,
  NInput, NSelect, NDatePicker, NIcon,
  useMessage, useDialog, NSpin
} from 'naive-ui';
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5';
import api from '../api/axios.js';

const message = useMessage();
const dialog = useDialog();

const loading = ref(true);
const passengers = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const saving = ref(false);

const defaultForm = {
  bookingId: '',
  userId: '',
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: null,
  gender: 'Male',
  nationality: '',
  passportNumber: '',
  passportExpiry: null,
  specialRequests: ''
};

const formData = ref({ ...defaultForm });

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' }
];

const columns = [
  {
    title: 'Name',
    key: 'name',
    width: 180,
    render(row) {
      const name = `${row.firstName} ${row.middleName ? row.middleName + ' ' : ''}${row.lastName}`;
      return h('span', { style: 'font-weight: 600;' }, name);
    }
  },
  { title: 'Gender', key: 'gender', width: 90 },
  { title: 'Nationality', key: 'nationality', width: 120 },
  {
    title: 'Date of Birth',
    key: 'dateOfBirth',
    width: 130,
    render(row) {
      return row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : '—';
    }
  },
  {
    title: 'Passport',
    key: 'passportNumber',
    width: 130,
    render(row) {
      return h('span', { style: 'font-family: monospace; font-size: 0.8rem;' }, row.passportNumber || '—');
    }
  },
  {
    title: 'Booking',
    key: 'bookingId',
    width: 120,
    render(row) {
      const id = typeof row.bookingId === 'object' ? row.bookingId?._id : row.bookingId;
      return h('span', { style: 'font-family: monospace; font-size: 0.75rem; color: #a5b4fc;' }, id?.slice(-8) || '—');
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
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
  }
];

async function fetchPassengers() {
  loading.value = true;
  try {
    const res = await api.get('/passengers');
    passengers.value = res.data.passengers || [];
  } catch {
    passengers.value = [];
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
    bookingId: typeof row.bookingId === 'object' ? row.bookingId?._id : row.bookingId,
    userId: typeof row.userId === 'object' ? row.userId?._id : row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    middleName: row.middleName || '',
    dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth).getTime() : null,
    gender: row.gender,
    nationality: row.nationality,
    passportNumber: row.passportNumber || '',
    passportExpiry: row.passportExpiry ? new Date(row.passportExpiry).getTime() : null,
    specialRequests: row.specialRequests || ''
  };
  showModal.value = true;
}

async function handleSave() {
  const f = formData.value;
  if (!f.firstName || !f.lastName || !f.gender || !f.nationality) {
    message.warning('Please fill required fields');
    return;
  }

  const payload = {
    bookingId: f.bookingId,
    userId: f.userId || undefined,
    firstName: f.firstName,
    lastName: f.lastName,
    middleName: f.middleName,
    dateOfBirth: f.dateOfBirth ? new Date(f.dateOfBirth) : undefined,
    gender: f.gender,
    nationality: f.nationality,
    passportNumber: f.passportNumber,
    passportExpiry: f.passportExpiry ? new Date(f.passportExpiry) : undefined,
    specialRequests: f.specialRequests
  };

  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/passengers/${editingId.value}`, payload);
      message.success('Passenger updated');
    } else {
      await api.post('/passengers', payload);
      message.success('Passenger created');
    }
    showModal.value = false;
    fetchPassengers();
  } catch (err) {
    message.error(err.response?.data?.message || 'Save failed');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(row) {
  dialog.warning({
    title: 'Delete Passenger',
    content: `Delete ${row.firstName} ${row.lastName}?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await api.delete(`/passengers/${row._id}`);
        message.success('Passenger deleted');
        fetchPassengers();
      } catch {
        message.error('Delete failed');
      }
    }
  });
}

onMounted(fetchPassengers);
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header-actions">
      <div class="page-header" style="margin-bottom: 0;">
        <h1>Passengers</h1>
        <p>Manage passenger records</p>
      </div>
      <NButton type="primary" @click="openCreate" id="create-passenger-btn">
        <template #icon><NIcon :component="AddOutline" /></template>
        Add Passenger
      </NButton>
    </div>

    <div style="margin-top: 24px;">
      <NSpin :show="loading">
        <NDataTable
          :columns="columns"
          :data="passengers"
          :bordered="false"
          :single-line="false"
          :pagination="{ pageSize: 10 }"
          striped
        />
      </NSpin>
    </div>

    <NModal
      v-model:show="showModal"
      :title="editingId ? 'Edit Passenger' : 'Add Passenger'"
      preset="card"
      style="width: 540px; max-width: 95vw;"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="130">
        <NFormItem label="Booking ID">
          <NInput v-model:value="formData.bookingId" placeholder="Mongo ObjectId" />
        </NFormItem>
        <NFormItem label="First Name">
          <NInput v-model:value="formData.firstName" placeholder="First name" />
        </NFormItem>
        <NFormItem label="Last Name">
          <NInput v-model:value="formData.lastName" placeholder="Last name" />
        </NFormItem>
        <NFormItem label="Middle Name">
          <NInput v-model:value="formData.middleName" placeholder="Optional" />
        </NFormItem>
        <NFormItem label="Date of Birth">
          <NDatePicker v-model:value="formData.dateOfBirth" type="date" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Gender">
          <NSelect v-model:value="formData.gender" :options="genderOptions" />
        </NFormItem>
        <NFormItem label="Nationality">
          <NInput v-model:value="formData.nationality" placeholder="e.g. Filipino" />
        </NFormItem>
        <NFormItem label="Passport #">
          <NInput v-model:value="formData.passportNumber" placeholder="Optional" />
        </NFormItem>
        <NFormItem label="Passport Expiry">
          <NDatePicker v-model:value="formData.passportExpiry" type="date" style="width: 100%;" />
        </NFormItem>
        <NFormItem label="Special Requests">
          <NInput v-model:value="formData.specialRequests" type="textarea" placeholder="e.g. Wheelchair, vegetarian meal" :rows="2" />
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
