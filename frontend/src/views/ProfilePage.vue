<script setup>
import { ref, onMounted } from 'vue';
import {
  NForm, NFormItem, NInput, NButton, NSpace, NGrid, NGi,
  NCard, NTag, NDescriptions, NDescriptionsItem,
  useMessage, NSpin
} from 'naive-ui';
import { useUserStore } from '../stores/userStore.js';
import api from '../api/axios.js';

const message = useMessage();
const userStore = useUserStore();

const loading = ref(true);
const editing = ref(false);
const saving = ref(false);

const formData = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  mobileNo: ''
});

onMounted(async () => {
  await userStore.fetchProfile();
  if (userStore.user) {
    formData.value = {
      firstName: userStore.user.firstName || '',
      lastName: userStore.user.lastName || '',
      middleName: userStore.user.middleName || '',
      email: userStore.user.email || '',
      mobileNo: userStore.user.mobileNo || ''
    };
  }
  loading.value = false;
});

function toggleEdit() {
  editing.value = !editing.value;
}

async function handleSave() {
  const f = formData.value;
  if (!f.firstName || !f.lastName || !f.email || !f.mobileNo) {
    message.warning('Please fill required fields');
    return;
  }

  saving.value = true;
  try {
    await api.put(`/users/${userStore.user._id}`, {
      firstName: f.firstName,
      lastName: f.lastName,
      middleName: f.middleName,
      email: f.email,
      mobileNo: f.mobileNo
    });
    message.success('Profile updated');
    await userStore.fetchProfile();
    editing.value = false;
  } catch (err) {
    message.error(err.response?.data?.message || 'Update failed');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="fade-in-up">
    <div class="page-header">
      <h1>Profile</h1>
      <p>View and manage your account information</p>
    </div>

    <NSpin :show="loading">
      <div style="max-width: 640px;">
        <!-- Profile Card -->
        <div class="glass-card" style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
            <div style="
              width: 64px; height: 64px; border-radius: 50%;
              background: var(--accent-gradient);
              display: flex; align-items: center; justify-content: center;
              font-size: 1.4rem; font-weight: 700; flex-shrink: 0;
            ">
              {{ (userStore.user?.firstName?.[0] || '') + (userStore.user?.lastName?.[0] || '') }}
            </div>
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 2px;">
                {{ userStore.user?.firstName }} {{ userStore.user?.middleName }} {{ userStore.user?.lastName }}
              </h2>
              <NTag :type="userStore.isAdmin ? 'warning' : 'info'" size="small" :bordered="false">
                {{ userStore.isAdmin ? 'Administrator' : 'Passenger' }}
              </NTag>
            </div>
          </div>

          <!-- View Mode -->
          <div v-if="!editing">
            <NDescriptions :column="1" label-placement="left" bordered size="small">
              <NDescriptionsItem label="Email">{{ userStore.user?.email }}</NDescriptionsItem>
              <NDescriptionsItem label="Mobile">{{ userStore.user?.mobileNo }}</NDescriptionsItem>
              <NDescriptionsItem label="First Name">{{ userStore.user?.firstName }}</NDescriptionsItem>
              <NDescriptionsItem label="Last Name">{{ userStore.user?.lastName }}</NDescriptionsItem>
              <NDescriptionsItem label="Middle Name">{{ userStore.user?.middleName || '—' }}</NDescriptionsItem>
            </NDescriptions>

            <NButton type="primary" style="margin-top: 20px;" @click="toggleEdit" id="edit-profile-btn">
              Edit Profile
            </NButton>
          </div>

          <!-- Edit Mode -->
          <div v-else>
            <NForm label-placement="left" label-width="110">
              <NGrid :cols="2" :x-gap="12">
                <NGi>
                  <NFormItem label="First Name">
                    <NInput v-model:value="formData.firstName" />
                  </NFormItem>
                </NGi>
                <NGi>
                  <NFormItem label="Last Name">
                    <NInput v-model:value="formData.lastName" />
                  </NFormItem>
                </NGi>
              </NGrid>
              <NFormItem label="Middle Name">
                <NInput v-model:value="formData.middleName" placeholder="Optional" />
              </NFormItem>
              <NFormItem label="Email">
                <NInput v-model:value="formData.email" />
              </NFormItem>
              <NFormItem label="Mobile No.">
                <NInput v-model:value="formData.mobileNo" maxlength="11" />
              </NFormItem>
            </NForm>

            <NSpace style="margin-top: 16px;">
              <NButton @click="toggleEdit">Cancel</NButton>
              <NButton type="primary" :loading="saving" @click="handleSave">Save Changes</NButton>
            </NSpace>
          </div>
        </div>
      </div>
    </NSpin>
  </div>
</template>
