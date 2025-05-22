<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.svg" alt="Oompa Social Logo" class="login-logo" />
        <h1>Oompa Social</h1>
        <p>A social network for Oompa Loompas</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="your.name@oompa.social"
            required
            @focus="trackFieldFocus('email')"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              placeholder="Enter your password"
              required
              @focus="trackFieldFocus('password')"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
              @focus="trackFieldFocus('show_password_button')"
            >
              <i class="mdi" :class="showPassword ? 'mdi-eye-off' : 'mdi-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-options">
          <div class="remember-me">
            <input 
              type="checkbox" 
              id="remember" 
              v-model="rememberMe"
              @focus="trackFieldFocus('remember_me')"
            />
            <label for="remember">Remember me</label>
          </div>
          <a 
            href="#" 
            class="forgot-password"
            @click.prevent="handleForgotPassword"
            @focus="trackFieldFocus('forgot_password')"
          >
            Forgot password?
          </a>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="isLoading"
          @focus="trackFieldFocus('login_button')"
        >
          <span v-if="isLoading">
            <i class="mdi mdi-loading mdi-spin"></i>
            Logging in...
          </span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <div class="login-demo-info">
        <h3>Demo Users</h3>
        <p>You can log in with any of these emails (any password will work):</p>
        <ul>
          <li v-for="user in demoUsers" :key="user.email">
            <a href="#" @click.prevent="fillLoginForm(user.email)">
              {{ user.name }} - {{ user.email }}
            </a>
          </li>
        </ul>
      </div>
      
      <div class="login-footer">
        <p>&copy; 2023 Wonka Industries</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { users, mockLogin } from '../services/mockData';

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    
    const email = ref('');
    const password = ref('');
    const rememberMe = ref(false);
    const showPassword = ref(false);
    const isLoading = ref(false);
    const error = ref('');
    
    // List of demo users from our mock data
    const demoUsers = users.map(user => ({
      name: user.name,
      email: user.email
    }));
    
    const handleLogin = async () => {
      if (!email.value || !password.value) {
        error.value = 'Please enter both email and password';
        return;
      }
      
      isLoading.value = true;
      error.value = '';
      
      try {
        // Track login attempt in Pendo
        if (window.pendo) {
          window.pendo.track('login_attempt', {
            email: email.value
          });
        }
        
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use our mock login function
        const result = mockLogin(email.value, password.value);
        
        if (result.success) {
          // Login successful
          userStore.login(result.user);
          
          // Check if there's a redirect parameter to handle routing back to where the user tried to access
          const redirectPath = route.query.redirect || '/';
          router.push(redirectPath);
          
          // Track successful login in Pendo
          if (window.pendo) {
            window.pendo.track('login_successful', {
              userId: result.user.id,
              userName: result.user.name
            });
          }
        } else {
          // Login failed
          error.value = result.message || 'Invalid email or password';
          
          // Track login failure in Pendo
          if (window.pendo) {
            window.pendo.track('login_failed', {
              reason: error.value
            });
          }
        }
      } catch (err) {
        error.value = 'An error occurred during login. Please try again.';
        
        // Track login error in Pendo
        if (window.pendo) {
          window.pendo.track('login_error', {
            error: err.message
          });
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleForgotPassword = () => {
      // This is just a mock function since we don't have real auth
      alert('In a real app, this would send a password reset email.');
      
      // Track forgot password click in Pendo
      if (window.pendo) {
        window.pendo.track('forgot_password_click');
      }
    };
    
    const fillLoginForm = (userEmail) => {
      email.value = userEmail;
      password.value = 'password123'; // Any password would work
      
      // Track demo user selection in Pendo
      if (window.pendo) {
        window.pendo.track('demo_user_selected', {
          email: userEmail
        });
      }
    };
    
    const trackFieldFocus = (fieldName) => {
      // Track field focus in Pendo
      if (window.pendo) {
        window.pendo.track('field_focus', {
          field: fieldName,
          page: 'login'
        });
      }
    };
    
    return {
      email,
      password,
      rememberMe,
      showPassword,
      isLoading,
      error,
      demoUsers,
      handleLogin,
      handleForgotPassword,
      fillLoginForm,
      trackFieldFocus
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background);
  background-image: linear-gradient(135deg, #FF7E1C 0%, #B35300 100%);
  padding: 2rem;
}

.login-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.login-header {
  padding: 2rem;
  text-align: center;
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border);
}

.login-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.login-header h1 {
  color: var(--primary);
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.login-header p {
  color: var(--text-dark);
  opacity: 0.8;
}

.login-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: var(--primary);
  outline: none;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 0.5rem;
}

.forgot-password {
  color: var(--primary);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error);
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: var(--primary-dark);
}

.login-button:disabled {
  background-color: var(--primary-light);
  cursor: not-allowed;
}

.login-button i {
  margin-right: 0.5rem;
}

.login-demo-info {
  padding: 1.5rem 2rem;
  background-color: rgba(var(--primary), 0.05);
  border-top: 1px solid var(--border);
}

.login-demo-info h3 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.login-demo-info ul {
  list-style: none;
  padding-left: 0;
}

.login-demo-info li {
  margin-bottom: 0.5rem;
}

.login-demo-info a {
  color: var(--secondary);
  text-decoration: none;
}

.login-demo-info a:hover {
  text-decoration: underline;
}

.login-footer {
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  border-top: 1px solid var(--border);
}

@media (max-width: 600px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-header {
    padding: 1.5rem;
  }
  
  .login-logo {
    width: 80px;
    height: 80px;
  }
  
  .login-form {
    padding: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style> 