<script setup>
import { ref, h, onMounted } from 'vue';
import {
  NDataTable, NButton, NSpace, NModal, NForm, NFormItem,
  NInput, NInputNumber, NSelect, NIcon, NTag,
  useMessage, useDialog, NSpin
} from 'naive-ui';
import { AddOutline, SearchOutline } from '@vicons/ionicons5';
import { useUserStore } from '../stores/userStore.js';
import api from '../api/axios.js';

const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const loading = ref(false);
const payments = ref([]);
const showCreateModal = ref(false);
const showSearchModal = ref(false);
const saving = ref(false);

const defaultForm = {
  bookingId: '',
  userId: '',
  amount: 0,
  paymentMethod: 'GCash'
};

const formData = ref({ ...defaultForm });
const searchBookingId = ref('');
const searchResult = ref(null);
const searching = ref(false);

const methodOptions = [
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Debit Card', value: 'Debit Card' },
  { label: 'GCash', value: 'GCash' },
  { label: 'Maya', value: 'Maya' },
  { label: 'Bank Transfer', value: 'Bank Transfer' }
];

const statusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Refunded', value: 'Refunded' }
];

const columns = [
  {
    title: 'Payment ID',
    key: '_id',
    width: 120,
    render(row) {
      return h('span', { style: 'font-family: monospace; font-size: 0.75rem; color: #a5b4fc;' }, row._id?.slice(-8));
    }
  },
  {
    title: 'Booking',
    key: 'bookingId',
    width: 120,
    render(row) {
      const id = typeof row.bookingId === 'object' ? row.bookingId?._id : row.bookingId;
      return h('span', { style: 'font-family: monospace; font-size: 0.75rem;' }, id?.slice(-8) || '—');
    }
  },
  {
    title: 'Amount',
    key: 'amount',
    width: 120,
    render(row) {
      return h('span', { style: 'font-weight: 600;' }, `₱${(row.amount || 0).toLocaleString()}`);
    }
  },
  {
    title: 'Method',
    key: 'paymentMethod',
    width: 120,
    render(row) {
      return h(NTag, { size: 'small', bordered: false }, () => row.paymentMethod);
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
  },
  {
    title: 'Paid At',
    key: 'paidAt',
    width: 160,
    render(row) {
      return row.paidAt ? new Date(row.paidAt).toLocaleString() : '—';
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    render(row) {
      if (!userStore.isAdmin) return null;
      return h(NSpace, { size: 'small' }, () => [
        h(NSelect, {
          size: 'small',
          value: row.status,
          options: statusOptions,
          style: 'width: 130px;',
          onUpdateValue: (val) => updateStatus(row._id, val)
        })
      ]);
    }
  }
];

async function searchPayment() {
  if (!searchBookingId.value) {
    message.warning('Enter a booking ID');
    return;
  }
  searching.value = true;
  try {
    const res = await api.get(`/payments/booking/${searchBookingId.value}`);
    searchResult.value = res.data.payment;
    // Also add to list if not present
    const exists = payments.value.find(p => p._id === searchResult.value._id);
    if (!exists) {
      payments.value = [searchResult.value, ...payments.value];
    }
    message.success('Payment found');
    showSearchModal.value = false;
  } catch {
    searchResult.value = null;
    message.error('Payment not found for this booking');
  } finally {
    searching.value = false;
  }
}

function openCreate() {
  formData.value = { ...defaultForm };
  showCreateModal.value = true;
}

async function handleCreate() {
  const f = formData.value;
  if (!f.bookingId || !f.amount || !f.paymentMethod) {
    message.warning('Please fill required fields');
    return;
  }

  saving.value = true;
  try {
    const res = await api.post('/payments', {
      bookingId: f.bookingId,
      userId: f.userId || undefined,
      amount: f.amount,
      paymentMethod: f.paymentMethod
    });
    message.success('Payment created');
    payments.value = [res.data.payment, ...payments.value];
    showCreateModal.value = false;
  } catch (err) {
    message.error(err.response?.data?.message || 'Create failed');
  } finally {
    saving.value = false;
  }
}

async function updateStatus(paymentId, status) {
  try {
    await api.put(`/payments/${paymentId}/status`, { status });
    message.success('Payment status updated');
    // Update locally
    const p = payments.value.find(x => x._id === paymentId);
    if (p) {
      p.status = status;
      if (status === 'Completed') p.paidAt = new Date().toISOString();
    }
  } catch {
    message.error('Update failed');
  }
}

onMounted(() => {
  // Payments don't have a "get all" endpoint, so we start empty
  // Users can search by booking ID
  loading.value = false;
});
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header-actions">
      <div class="page-header" style="margin-bottom: 0;">
        <h1>Payments</h1>
        <p>Create payments and search by booking</p>
      </div>
      <NSpace>
        <NButton @click="showSearchModal = true" id="search-payment-btn">
          <template #icon><NIcon :component="SearchOutline" /></template>
          Search by Booking
        </NButton>
        <NButton type="primary" @click="openCreate" id="create-payment-btn">
          <template #icon><NIcon :component="AddOutline" /></template>
          New Payment
        </NButton>
      </NSpace>
    </div>

    <div style="margin-top: 24px;">
      <NDataTable
        :columns="columns"
        :data="payments"
        :bordered="false"
        :single-line="false"
        :pagination="{ pageSize: 10 }"
        striped
      />
      <div v-if="payments.length === 0" class="glass-card" style="text-align: center; padding: 48px; margin-top: 16px; color: var(--text-secondary);">
        <p style="font-size: 1.1rem; margin-bottom: 8px;">No payments loaded yet</p>
        <p style="font-size: 0.85rem;">Use "Search by Booking" to find payments or create a new one.</p>
      </div>
    </div>

    <!-- Search Modal -->
    <NModal
      v-model:show="showSearchModal"
      title="Search Payment by Booking"
      preset="card"
      style="width: 440px; max-width: 95vw;"
    >
      <NForm label-placement="left" label-width="100">
        <NFormItem label="Booking ID">
          <NInput v-model:value="searchBookingId" placeholder="Enter booking ObjectId" @keyup.enter="searchPayment" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showSearchModal = false">Cancel</NButton>
          <NButton type="primary" :loading="searching" @click="searchPayment">Search</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- Create Modal -->
    <NModal
      v-model:show="showCreateModal"
      title="Create Payment"
      preset="card"
      style="width: 480px; max-width: 95vw;"
      :mask-closable="false"
    >
      <NForm label-placement="left" label-width="120">
        <NFormItem label="Booking ID">
          <NInput v-model:value="formData.bookingId" placeholder="Booking ObjectId" />
        </NFormItem>
        <NFormItem label="User ID">
          <NInput v-model:value="formData.userId" placeholder="User ObjectId (optional)" />
        </NFormItem>
        <NFormItem label="Amount">
          <NInputNumber v-model:value="formData.amount" :min="0" style="width: 100%;" placeholder="₱" />
        </NFormItem>
        <NFormItem label="Method">
          <NSelect v-model:value="formData.paymentMethod" :options="methodOptions" />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showCreateModal = false">Cancel</NButton>
          <NButton type="primary" :loading="saving" @click="handleCreate">Create Payment</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
