<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <NavBar />
    <div class="pt-20"> <!-- Space for fixed navbar -->
      <router-view />
    </div>
  </div>
</template>

<style>
/* Replace @apply with direct Tailwind utility classes */
body {
  font-family: Arial, sans-serif;
  text-align: center;
  margin: 0;
  padding: 0;
}

/* Add these classes in the template instead of using @apply */

</style>