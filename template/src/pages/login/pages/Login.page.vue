<script setup lang="ts">
import { useRoute } from 'vue-router';
import LoginView from '../features/login/views/Login.view.vue';
import { ROUTE_NAMES } from '@/shared/constants/routeNames';

defineOptions({ name: ROUTE_NAMES.Login.LOGIN });

const route = useRoute();
const redirect = (route.query.redirect as string) || '/';
</script>

<template>
  <LoginView :redirect="redirect" />
</template>
