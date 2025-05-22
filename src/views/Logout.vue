<template>
  <div class="logout-container">
    <div class="logout-message">
      <i class="mdi mdi-loading mdi-spin"></i>
      <h2>Logging out...</h2>
      <p>You will be redirected to the login page.</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

export default {
  name: 'LogoutView',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    
    onMounted(() => {
      // Track logout event in Pendo
      if (window.pendo) {
        window.pendo.track('user_logout');
      }
      
      // Perform logout
      userStore.logout();
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    });
    
    return {};
  }
};
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background);
}

.logout-message {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  max-width: 400px;
}

.logout-message i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.logout-message h2 {
  margin-bottom: 1rem;
}

.logout-message p {
  color: #666;
}
</style> 