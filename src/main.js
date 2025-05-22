import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Create pinia instance
const pinia = createPinia()

// Initialize the Vue app
const app = createApp(App)

// Use Pinia for state management
app.use(pinia)

// Use Vue Router
app.use(router)

// Mount the app
app.mount('#app')

// Initialize Pendo - will be properly configured when user logs in
if (window.pendo) {
  // Default initialization for anonymous users
  window.pendo.initialize({
    visitor: {
      id: 'anonymous-user'     // Required if user is logged in
    },
    account: {
      id: 'oompa-social-app'   // Required if using Pendo Feedback
    }
  });
}

// Import after app initialization to avoid circular dependencies
import { useUserStore } from './stores/user'

// Function to check auth state
const checkAuthState = () => {
  const userStore = useUserStore()
  
  console.log('Auth state:', userStore.isAuthenticated ? 'Authenticated' : 'Not authenticated')
  
  // Redirect to login if needed and not already on login page
  if (!userStore.isAuthenticated && router.currentRoute.value.name !== 'Login') {
    console.log('Redirecting to login')
    router.push('/login')
  }
}

// Check auth state on app start
checkAuthState()
