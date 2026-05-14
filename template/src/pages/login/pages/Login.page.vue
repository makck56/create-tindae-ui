<script setup lang="ts">
import { useRoute } from 'vue-router';
import LoginView from '../features/login/views/Login.view.vue';

defineOptions({ name: 'Login' });

const route = useRoute();
const redirect = (route.query.redirect as string) || '/';
</script>

<template>
  <LoginView :redirect="redirect" />
</template>
