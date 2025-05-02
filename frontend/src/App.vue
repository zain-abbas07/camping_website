<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template>
  <div class="bg-gray-100 min-h-screen">
    <NavBar />
    <router-view />
  </div>
</template>

<style>
body {
  font-family: Arial, sans-serif;
  text-align: center;
}
</style>
