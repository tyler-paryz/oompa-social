<template>
  <div class="router-debug" v-if="isDebug">
    <div class="debug-badge">
      <span>Route: {{ $route.name }}</span>
      <span>Path: {{ $route.path }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RouterDebug',
  computed: {
    isDebug() {
      // Check if import.meta.env exists and MODE is defined
      try {
        return import.meta.env && import.meta.env.MODE !== 'production';
      } catch (error) {
        // Default to false if there's any issue
        return false;
      }
    }
  }
}
</script>

<style scoped>
.router-debug {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
}
.debug-badge {
  display: flex;
  flex-direction: column;
}
</style> 