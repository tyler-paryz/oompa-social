<template>
  <div class="friends-container">
    <div class="tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'friends' }"
        @click="setActiveTab('friends')"
      >
        <i class="mdi mdi-account-multiple"></i>
        <span>Friends</span>
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'requests' }"
        @click="setActiveTab('requests')"
      >
        <i class="mdi mdi-account-clock"></i>
        <span>Friend Requests</span>
        <span class="badge" v-if="friendRequests.length">{{ friendRequests.length }}</span>
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'suggestions' }"
        @click="setActiveTab('suggestions')"
      >
        <i class="mdi mdi-account-plus"></i>
        <span>Suggestions</span>
      </button>
    </div>
    
    <div class="content">
      <!-- Friends List -->
      <div v-if="activeTab === 'friends'" class="friends-list">
        <h1>Your Friends</h1>
        
        <div v-if="isLoading" class="loading-state">
          <i class="mdi mdi-loading mdi-spin"></i>
          <span>Loading friends...</span>
        </div>
        
        <div v-else-if="friends.length === 0" class="empty-state">
          <i class="mdi mdi-account-group"></i>
          <p>You haven't added any friends yet</p>
          <button class="primary-button" @click="setActiveTab('suggestions')">Find Friends</button>
        </div>
        
        <div v-else class="friends-grid">
          <div class="friend-card" v-for="friend in friends" :key="friend.id">
            <div class="friend-header">
              <img :src="friend.avatar || '/avatars/default.svg'" alt="Friend" class="avatar" />
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-role">{{ friend.role }}</div>
              </div>
            </div>
            <div class="friend-actions">
              <button class="action-button" @click="viewProfile(friend.id)">
                <i class="mdi mdi-account"></i>
                <span>Profile</span>
              </button>
              <button class="action-button" @click="messageUser(friend.id)">
                <i class="mdi mdi-message"></i>
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Friend Requests -->
      <div v-else-if="activeTab === 'requests'" class="requests-list">
        <h1>Friend Requests</h1>
        
        <div v-if="isLoading" class="loading-state">
          <i class="mdi mdi-loading mdi-spin"></i>
          <span>Loading requests...</span>
        </div>
        
        <div v-else-if="friendRequests.length === 0" class="empty-state">
          <i class="mdi mdi-account-clock"></i>
          <p>You don't have any friend requests right now</p>
          <button class="primary-button" @click="setActiveTab('suggestions')">Find Friends</button>
        </div>
        
        <div v-else class="requests-grid">
          <div class="request-card" v-for="request in friendRequests" :key="request.id">
            <div class="request-header">
              <img :src="getUserById(request.from)?.avatar || '/avatars/default.svg'" alt="User" class="avatar" />
              <div class="request-info">
                <div class="request-name">{{ getUserById(request.from)?.name }}</div>
                <div class="request-meta">{{ formatTime(request.timestamp) }}</div>
              </div>
            </div>
            <div class="request-actions">
              <button class="action-button accept" @click="acceptRequest(request.id)">
                <i class="mdi mdi-check"></i>
                <span>Accept</span>
              </button>
              <button class="action-button reject" @click="rejectRequest(request.id)">
                <i class="mdi mdi-close"></i>
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Friend Suggestions -->
      <div v-else-if="activeTab === 'suggestions'" class="suggestions-list">
        <h1>Friend Suggestions</h1>
        
        <div v-if="isLoading" class="loading-state">
          <i class="mdi mdi-loading mdi-spin"></i>
          <span>Loading suggestions...</span>
        </div>
        
        <div v-else-if="suggestions.length === 0" class="empty-state">
          <i class="mdi mdi-account-search"></i>
          <p>No suggestions available right now</p>
        </div>
        
        <div v-else class="suggestions-grid">
          <div class="suggestion-card" v-for="user in suggestions" :key="user.id">
            <div class="suggestion-header">
              <img :src="user.avatar || '/avatars/default.svg'" alt="User" class="avatar" />
              <div class="suggestion-info">
                <div class="suggestion-name">{{ user.name }}</div>
                <div class="suggestion-role">{{ user.role }}</div>
              </div>
            </div>
            <div class="suggestion-actions">
              <button 
                class="action-button primary" 
                @click="sendFriendRequest(user.id)"
                :disabled="hasSentRequest(user.id)"
              >
                <i 
                  :class="hasSentRequest(user.id) ? 'mdi mdi-account-clock' : 'mdi mdi-account-plus'"
                ></i>
                <span>{{ hasSentRequest(user.id) ? 'Request Sent' : 'Add Friend' }}</span>
              </button>
              <button class="action-button" @click="viewProfile(user.id)">
                <i class="mdi mdi-account"></i>
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';
import { users, generateFriendships, generateFriendRequests } from '../services/mockData';

export default {
  name: 'FriendsView',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const { currentUser, friends: storeFriends, friendRequests: storeFriendRequests } = storeToRefs(userStore);
    
    const activeTab = ref('friends');
    const isLoading = ref(true);
    const friends = ref([]);
    const friendRequests = ref([]);
    const suggestions = ref([]);
    const sentRequests = ref([]);
    
    const setActiveTab = (tab) => {
      // Track tab change in Pendo
      if (window.pendo) {
        window.pendo.track('friends_tab_changed', {
          fromTab: activeTab.value,
          toTab: tab
        });
      }
      
      activeTab.value = tab;
    };
    
    const loadData = async () => {
      isLoading.value = true;
      
      try {
        // Track page view in Pendo
        if (window.pendo) {
          window.pendo.track('friends_page_viewed', {
            initialTab: activeTab.value
          });
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // If we don't have friend data in the store yet, initialize it
        if (storeFriends.value.length === 0) {
          const friendships = generateFriendships();
          const userFriendIds = friendships[currentUser.value?.id] || [];
          const userFriends = users.filter(u => userFriendIds.includes(u.id));
          
          // Add friends to the store
          userFriends.forEach(friend => {
            userStore.addFriend(friend);
          });
        }
        
        // If we don't have friend requests data in the store yet, initialize it
        if (storeFriendRequests.value.length === 0) {
          const allRequests = generateFriendRequests();
          const incomingRequests = allRequests.filter(req => req.to === currentUser.value?.id);
          
          // Add friend requests to the store
          incomingRequests.forEach(request => {
            const requestWithUser = {
              ...request,
              user: users.find(u => u.id === request.from)
            };
            userStore.addFriendRequest(requestWithUser);
          });
          
          // Get outgoing requests for tracking
          const outgoingRequests = allRequests.filter(req => req.from === currentUser.value?.id);
          sentRequests.value = outgoingRequests.map(req => req.to);
        }
        
        // Get friends from the store
        friends.value = storeFriends.value;
        
        // Get friend requests from the store
        friendRequests.value = storeFriendRequests.value;
        
        // Generate suggestions by filtering out current friends and the current user
        const friendIds = friends.value.map(f => f.id);
        suggestions.value = users.filter(
          user => user.id !== currentUser.value?.id && !friendIds.includes(user.id)
        );
      } catch (error) {
        console.error('Error loading friends data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    onMounted(() => {
      loadData();
    });
    
    const getUserById = (userId) => {
      return users.find(user => user.id === userId);
    };
    
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
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
    
    const viewProfile = (userId) => {
      // Track profile click in Pendo
      if (window.pendo) {
        window.pendo.track('profile_clicked_from_friends', {
          userId: userId,
          fromTab: activeTab.value
        });
      }
      
      router.push(`/profile/${userId}`);
    };
    
    const messageUser = (userId) => {
      // Track message click in Pendo
      if (window.pendo) {
        window.pendo.track('message_clicked_from_friends', {
          userId: userId
        });
      }
      
      router.push({
        path: '/messages',
        query: { userId }
      });
    };
    
    const acceptRequest = (requestId) => {
      // Track request acceptance in Pendo
      if (window.pendo) {
        window.pendo.track('friend_request_accepted_from_friends', {
          requestId: requestId
        });
      }
      
      userStore.acceptFriendRequest(requestId);
    };
    
    const rejectRequest = (requestId) => {
      // Track request rejection in Pendo
      if (window.pendo) {
        window.pendo.track('friend_request_rejected', {
          requestId: requestId
        });
      }
      
      userStore.rejectFriendRequest(requestId);
    };
    
    const sendFriendRequest = (userId) => {
      if (hasSentRequest(userId)) return;
      
      // Track sending friend request in Pendo
      if (window.pendo) {
        window.pendo.track('friend_request_sent_from_friends', {
          toUserId: userId
        });
      }
      
      const user = getUserById(userId);
      const request = {
        id: 'req_' + Date.now(),
        from: currentUser.value.id,
        to: userId,
        timestamp: new Date().toISOString(),
        user: user
      };
      
      // Add to sent requests for UI tracking
      sentRequests.value.push(userId);
      
      // In a real app, this would send the request to the API
      // For this demo, we'll just track it locally
    };
    
    const hasSentRequest = (userId) => {
      return sentRequests.value.includes(userId);
    };
    
    return {
      activeTab,
      isLoading,
      currentUser,
      friends,
      friendRequests,
      suggestions,
      setActiveTab,
      getUserById,
      formatTime,
      viewProfile,
      messageUser,
      acceptRequest,
      rejectRequest,
      sendFriendRequest,
      hasSentRequest
    };
  }
};
</script>

<style scoped>
.friends-container {
  max-width: 800px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  font-weight: 500;
}

.tab-button i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.tab-button.active {
  color: var(--primary);
  background-color: rgba(var(--primary), 0.05);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--primary);
}

.badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--error);
  color: var(--text-light);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.content {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-state i, .empty-state i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: #777;
}

.primary-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.friends-grid, .requests-grid, .suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.friend-card, .request-card, .suggestion-card {
  background-color: var(--background);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.friend-card:hover, .request-card:hover, .suggestion-card:hover {
  transform: translateY(-3px);
}

.friend-header, .request-header, .suggestion-header {
  display: flex;
  padding: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
}

.friend-info, .request-info, .suggestion-info {
  flex: 1;
}

.friend-name, .request-name, .suggestion-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.friend-role, .suggestion-role {
  font-size: 0.9rem;
  color: var(--primary);
}

.request-meta {
  font-size: 0.8rem;
  color: #777;
}

.friend-actions, .request-actions, .suggestion-actions {
  display: flex;
  padding: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.action-button i {
  margin-right: 0.25rem;
}

.action-button:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-button.primary {
  background-color: var(--primary);
  color: var(--text-light);
}

.action-button.primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.action-button.accept {
  color: var(--success);
}

.action-button.reject {
  color: var(--error);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .tabs {
    flex-direction: column;
  }
  
  .tab-button {
    padding: 0.75rem;
  }
  
  .tab-button.active::after {
    height: 0;
    width: 0;
  }
  
  .friends-grid, .requests-grid, .suggestions-grid {
    grid-template-columns: 1fr;
  }
}
</style> 