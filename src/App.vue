<template>
  <div class="app">
    <header v-if="isAuthenticated">
      <nav class="navbar">
        <div class="navbar-brand">
          <router-link to="/" class="logo">
            <img src="/logo.svg" alt="Oompa Social Logo" />
            <h1>Oompa Social</h1>
          </router-link>
        </div>
        <div class="navbar-menu">
          <router-link to="/" class="nav-item">
            <i class="mdi mdi-home"></i>
            <span>Home</span>
          </router-link>
          <router-link :to="`/profile/${currentUser?.id}`" class="nav-item">
            <i class="mdi mdi-account"></i>
            <span>Profile</span>
          </router-link>
          <router-link to="/messages" class="nav-item">
            <i class="mdi mdi-message"></i>
            <span>Messages</span>
            <span v-if="unreadMessageCount > 0" class="badge">{{ unreadMessageCount }}</span>
          </router-link>
          <router-link to="/friends" class="nav-item">
            <i class="mdi mdi-account-group"></i>
            <span>Friends</span>
            <span v-if="pendingFriendRequests > 0" class="badge">{{ pendingFriendRequests }}</span>
          </router-link>
          <router-link to="/ecosystem" class="nav-item">
            <i class="mdi mdi-apps"></i>
            <span>Ecosystem</span>
          </router-link>
          <button class="nav-item logout-button" @click="logout">
            <i class="mdi mdi-logout"></i>
            <span>Logout</span>
          </button>
        </div>
        <div class="navbar-end">
          <div class="user-dropdown" @click="toggleDropdown">
            <img :src="currentUser?.avatar || '/avatars/default.svg'" alt="Profile" class="avatar" />
            <span class="user-name">{{ currentUser?.name }}</span>
            <div class="dropdown-indicator">
              <i class="mdi mdi-chevron-down"></i>
              <span class="dropdown-label">Menu</span>
            </div>
            
            <div class="dropdown-menu" v-if="showDropdown">
              <div class="dropdown-item" @click="showNotifications = !showNotifications">
                <i class="mdi mdi-bell"></i>
                <span>Notifications</span>
                <span v-if="unreadNotifications > 0" class="badge">{{ unreadNotifications }}</span>
              </div>
              <router-link :to="`/profile/${currentUser?.id}`" class="dropdown-item">
                <i class="mdi mdi-account-circle"></i>
                <span>My Profile</span>
              </router-link>
              <router-link to="/create-post" class="dropdown-item">
                <i class="mdi mdi-plus-circle"></i>
                <span>Create Post</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="logout">
                <i class="mdi mdi-logout"></i>
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div class="notifications-panel" v-if="showNotifications">
        <div class="notifications-header">
          <h3>Notifications</h3>
          <button class="close-btn" @click="showNotifications = false">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="notifications-list" v-if="notifications.length > 0">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <i 
                class="mdi" 
                :class="{
                  'mdi-thumb-up': notification.type === 'like',
                  'mdi-comment': notification.type === 'comment',
                  'mdi-account-plus': notification.type === 'friend_request'
                }"
              ></i>
            </div>
            <div class="notification-content">
              <p>{{ notification.content }}</p>
              <span class="timestamp">{{ formatTime(notification.timestamp) }}</span>
            </div>
          </div>
        </div>
        <div class="empty-notifications" v-else>
          <i class="mdi mdi-bell-off"></i>
          <p>No notifications yet</p>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>
    
    <app-footer />
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import { storeToRefs } from 'pinia';
import AppFooter from './components/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppFooter
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { currentUser, isAuthenticated, notifications, friendRequests } = storeToRefs(userStore);
    
    const showDropdown = ref(false);
    const showNotifications = ref(false);
    
    const unreadNotifications = computed(() => {
      return notifications.value.filter(n => !n.read).length;
    });
    
    const pendingFriendRequests = computed(() => {
      return friendRequests.value.length;
    });
    
    const unreadMessageCount = ref(0); // This would be calculated from a messages store
    
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
      if (showDropdown.value) {
        showNotifications.value = false;
      }
    };
    
    const logout = () => {
      // Track logout event in Pendo before we log out
      if (typeof window !== 'undefined' && window.pendo) {
        window.pendo.track('user_logout');
      }
      
      // Use the logout route which will handle the state cleanup
      router.push('/logout');
      
      // Close the dropdown
      showDropdown.value = false;
    };
    
    const handleNotificationClick = (notification) => {
      // Mark notification as read
      userStore.clearNotification(notification.id);
      
      // Navigate based on notification type
      if (notification.type === 'like' || notification.type === 'comment') {
        // Navigate to the post
        router.push(`/post/${notification.relatedId}`);
      } else if (notification.type === 'friend_request') {
        // Navigate to friend requests page
        router.push('/friends');
      }
      
      showNotifications.value = false;
      
      // Track notification click in Pendo
      if (typeof window !== 'undefined' && window.pendo) {
        window.pendo.track('notification_clicked', {
          notificationType: notification.type,
          notificationId: notification.id
        });
      }
    };
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffSecs < 60) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    };
    
    const trackFooterLink = (linkType) => {
      // Track footer link clicks in Pendo
      if (typeof window !== 'undefined' && window.pendo) {
        window.pendo.track('footer_link_clicked', {
          linkType
        });
      }
    };
    
    // Close dropdown when clicking outside
    onMounted(() => {
      document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.user-dropdown');
        const notificationsPanel = document.querySelector('.notifications-panel');
        
        if (dropdown && !dropdown.contains(e.target) && 
            (!notificationsPanel || !notificationsPanel.contains(e.target))) {
          showDropdown.value = false;
          showNotifications.value = false;
        }
      });
    });
    
    return {
      currentUser,
      isAuthenticated,
      notifications,
      showDropdown,
      showNotifications,
      unreadNotifications,
      pendingFriendRequests,
      unreadMessageCount,
      toggleDropdown,
      logout,
      handleNotificationClick,
      formatTime,
      trackFooterLink
    };
  }
};
</script>

<style>
@import '@mdi/font/css/materialdesignicons.min.css';

:root {
  --primary: #FF7E1C;
  --primary-light: #FFA557;
  --primary-dark: #B35300;
  --secondary: #884A1B;
  --secondary-light: #AA6F44;
  --secondary-dark: #5D2E0A;
  --accent: #34A853;
  --accent-light: #66D384;
  --accent-dark: #1F7535;
  --text-dark: #333333;
  --text-light: #FFFFFF;
  --background: #F5F5F5;
  --card-bg: #FFFFFF;
  --border: #E0E0E0;
  --success: #4CAF50;
  --warning: #FFC107;
  --error: #F44336;
  --info: #2196F3;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background);
  color: var(--text-dark);
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: var(--card-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  height: 60px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary);
}

.logo img {
  height: 40px;
  margin-right: 10px;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

.navbar-menu {
  display: flex;
  align-items: center;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-dark);
  padding: 0.5rem 1rem;
  position: relative;
}

.nav-item i {
  font-size: 1.5rem;
}

.nav-item span {
  font-size: 0.8rem;
}

.nav-item.router-link-active {
  color: var(--primary);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--error);
  color: var(--text-light);
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  min-width: 1.2rem;
  text-align: center;
}

.navbar-end {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.user-name {
  margin-right: 0.5rem;
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--card-bg);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  text-decoration: none;
  color: var(--text-dark);
}

.dropdown-item i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.dropdown-item:hover {
  background-color: var(--background);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border);
  margin: 0.5rem 0;
}

.notifications-panel {
  position: absolute;
  top: 60px;
  right: 1rem;
  background-color: var(--card-bg);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-dark);
}

.notifications-list {
  padding: 0.5rem 0;
}

.notification-item {
  display: flex;
  padding: 0.7rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
}

.notification-item:hover {
  background-color: var(--background);
}

.notification-item.unread {
  background-color: rgba(var(--primary), 0.05);
}

.notification-icon {
  margin-right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-light);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-light);
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin-bottom: 0.3rem;
}

.timestamp {
  font-size: 0.8rem;
  color: #666;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #888;
}

.empty-notifications i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

main {
  flex: 1;
  padding: 1.5rem;
}

footer {
  background-color: var(--card-bg);
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links a {
  margin-left: 1rem;
  color: var(--text-dark);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--primary);
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem;
  }
  
  .logo h1 {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .nav-item {
    padding: 0.5rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .footer-links a {
    margin: 0 0.5rem;
  }
}

.logout-button {
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  cursor: pointer;
}

.logout-button:hover {
  color: var(--primary);
}

.dropdown-indicator {
  display: flex;
  align-items: center;
  background-color: var(--primary-light);
  padding: 2px 8px;
  border-radius: 12px;
  color: var(--text-light);
}

.dropdown-label {
  font-size: 0.75rem;
  margin-left: 2px;
}
</style>
