<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NForm, NFormItem, NInput, NButton, NSpace, useMessage } from 'naive-ui';
import { useUserStore } from '../stores/userStore.js';

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();

const loading = ref(false);
const formData = ref({
  email: '',
  password: ''
});

async function handleLogin() {
  if (!formData.value.email || !formData.value.password) {
    message.warning('Please fill in all fields');
    return;
  }

  loading.value = true;
  try {
    await userStore.login(formData.value.email, formData.value.password);
    message.success('Welcome back!');
    router.push('/');
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed';
    message.error(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card fade-in-up">
      <h1>Welcome Back</h1>
      <p class="subtitle">Sign in to your SkyVoyage account</p>

      <NForm @submit.prevent="handleLogin">
        <NFormItem label="Email Address" path="email">
          <NInput
            v-model:value="formData.email"
            placeholder="you@example.com"
            size="large"
            id="login-email"
          />
        </NFormItem>
        <NFormItem label="Password" path="password">
          <NInput
            v-model:value="formData.password"
            type="password"
            show-password-on="click"
            placeholder="Enter your password"
            size="large"
            id="login-password"
            @keyup.enter="handleLogin"
          />
        </NFormItem>
        <NSpace vertical :size="16" style="margin-top: 8px;">
          <NButton
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleLogin"
            id="login-submit"
            style="font-weight: 600;"
          >
            Sign In
          </NButton>
        </NSpace>
      </NForm>

      <div class="auth-link">
        Don't have an account?
        <router-link to="/register">Create one</router-link>
      </div>
    </div>
  </div>
</template>
