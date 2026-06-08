<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NForm, NFormItem, NInput, NButton, NSpace, NGrid, NGi, useMessage } from 'naive-ui';
import { useUserStore } from '../stores/userStore.js';

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();

const loading = ref(false);
const formData = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  password: '',
  confirmPassword: '',
  mobileNo: ''
});

async function handleRegister() {
  const f = formData.value;
  if (!f.firstName || !f.lastName || !f.email || !f.password || !f.mobileNo) {
    message.warning('Please fill in all required fields');
    return;
  }
  if (f.password !== f.confirmPassword) {
    message.error('Passwords do not match');
    return;
  }
  if (f.mobileNo.length !== 11) {
    message.error('Mobile number must be 11 digits');
    return;
  }

  loading.value = true;
  try {
    await userStore.register({
      firstName: f.firstName,
      lastName: f.lastName,
      middleName: f.middleName,
      email: f.email,
      password: f.password,
      mobileNo: f.mobileNo
    });
    message.success('Registration successful! Please sign in.');
    router.push('/login');
  } catch (err) {
    const msg = err.response?.data?.message || 'Registration failed';
    message.error(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card fade-in-up" style="max-width: 520px;">
      <h1>Create Account</h1>
      <p class="subtitle">Join SkyVoyage and start your journey</p>

      <NForm @submit.prevent="handleRegister">
        <NGrid :cols="2" :x-gap="12">
          <NGi>
            <NFormItem label="First Name" required>
              <NInput v-model:value="formData.firstName" placeholder="Juan" size="large" id="reg-fname" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="Last Name" required>
              <NInput v-model:value="formData.lastName" placeholder="Dela Cruz" size="large" id="reg-lname" />
            </NFormItem>
          </NGi>
        </NGrid>

        <NFormItem label="Middle Name">
          <NInput v-model:value="formData.middleName" placeholder="Optional" size="large" id="reg-mname" />
        </NFormItem>

        <NFormItem label="Email Address" required>
          <NInput v-model:value="formData.email" placeholder="you@example.com" size="large" id="reg-email" />
        </NFormItem>

        <NFormItem label="Mobile Number" required>
          <NInput v-model:value="formData.mobileNo" placeholder="09XXXXXXXXX" size="large" maxlength="11" id="reg-mobile" />
        </NFormItem>

        <NGrid :cols="2" :x-gap="12">
          <NGi>
            <NFormItem label="Password" required>
              <NInput v-model:value="formData.password" type="password" show-password-on="click" placeholder="••••••••" size="large" id="reg-password" />
            </NFormItem>
          </NGi>
          <NGi>
            <NFormItem label="Confirm Password" required>
              <NInput v-model:value="formData.confirmPassword" type="password" show-password-on="click" placeholder="••••••••" size="large" id="reg-confirm" @keyup.enter="handleRegister" />
            </NFormItem>
          </NGi>
        </NGrid>

        <NSpace vertical :size="16" style="margin-top: 8px;">
          <NButton type="primary" block size="large" :loading="loading" @click="handleRegister" id="reg-submit" style="font-weight: 600;">
            Create Account
          </NButton>
        </NSpace>
      </NForm>

      <div class="auth-link">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </div>
    </div>
  </div>
</template>
