<template>
  <div class="profile-container">
    <div v-if="isLoading" class="loading-container">
      <i class="mdi mdi-loading mdi-spin"></i>
      <span>Loading profile...</span>
    </div>
    
    <template v-else-if="user">
      <div class="profile-header">
        <div class="profile-cover"></div>
        <div class="profile-info">
          <div class="profile-avatar">
            <img :src="user.avatar || '/avatars/default.svg'" alt="Profile" />
          </div>
          <div class="profile-details">
            <h1>{{ user.name }}</h1>
            <p class="role">{{ user.role }}</p>
            <p class="joined">Joined {{ formatDate(user.joinDate) }}</p>
          </div>
          <div class="profile-actions" v-if="!isCurrentUser">
            <button 
              class="action-button primary" 
              v-if="!isFriend && !hasPendingRequest"
              @click="sendFriendRequest"
            >
              <i class="mdi mdi-account-plus"></i>
              <span>Add Friend</span>
            </button>
            <button 
              class="action-button" 
              v-else-if="hasPendingRequest"
              disabled
            >
              <i class="mdi mdi-account-clock"></i>
              <span>Request Sent</span>
            </button>
            <button 
              class="action-button primary" 
              v-else
              @click="sendMessage"
            >
              <i class="mdi mdi-message"></i>
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="profile-content">
        <div class="profile-sidebar">
          <div class="profile-about card">
            <h2>About</h2>
            <p>{{ user.bio }}</p>
          </div>
          
          <div class="profile-friends card">
            <h2>Friends</h2>
            <div v-if="friends.length === 0" class="empty-state">
              <i class="mdi mdi-account-group"></i>
              <p>No friends yet</p>
            </div>
            <div v-else class="friends-grid">
              <div 
                v-for="friend in friends" 
                :key="friend.id" 
                class="friend-item"
                @click="viewProfile(friend.id)"
              >
                <img :src="friend.avatar || '/avatars/default.svg'" alt="Friend" class="friend-avatar" />
                <div class="friend-name">{{ friend.name }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="profile-posts">
          <div class="card create-post" v-if="isCurrentUser">
            <div class="post-input-container">
              <img :src="currentUser?.avatar || '/avatars/default.svg'" alt="Profile" class="avatar" />
              <div class="post-input" @click="goToCreatePost">
                <span>What's on your mind, {{ currentUser?.name?.split(' ')[0] }}?</span>
              </div>
            </div>
          </div>
          
          <div v-if="userPosts.length === 0" class="card empty-state">
            <i class="mdi mdi-file-document"></i>
            <p v-if="isCurrentUser">You haven't posted anything yet</p>
            <p v-else>{{ user.name }} hasn't posted anything yet</p>
            <button v-if="isCurrentUser" class="create-post-btn" @click="goToCreatePost">Create Post</button>
          </div>
          
          <post-card 
            v-for="post in userPosts" 
            :key="post.id" 
            :post="post"
            :current-user="currentUser"
            @like="handleLike"
            @comment="handleComment"
            @share="handleShare"
          />
        </div>
      </div>
    </template>
    
    <div v-else class="not-found card">
      <i class="mdi mdi-account-question"></i>
      <h2>User Not Found</h2>
      <p>The user you're looking for doesn't exist or has been removed.</p>
      <button class="primary-button" @click="goHome">Go to Home</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { usePostsStore } from '../stores/posts';
import { storeToRefs } from 'pinia';
import { users, generateFriendships } from '../services/mockData';
import PostCard from '../components/PostCard.vue';

export default {
  name: 'ProfileView',
  components: {
    PostCard
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const postsStore = usePostsStore();
    const { currentUser } = storeToRefs(userStore);
    
    const isLoading = ref(true);
    const user = ref(null);
    const userPosts = ref([]);
    const friends = ref([]);
    
    const userId = computed(() => route.params.id);
    
    const isCurrentUser = computed(() => {
      return currentUser.value && user.value && currentUser.value.id === user.value.id;
    });
    
    const isFriend = computed(() => {
      if (!currentUser.value || !user.value) return false;
      return userStore.friends.some(f => f.id === user.value.id);
    });
    
    const hasPendingRequest = computed(() => {
      if (!currentUser.value || !user.value) return false;
      return userStore.friendRequests.some(r => r.from === currentUser.value.id && r.to === user.value.id);
    });
    
    const loadUserData = async () => {
      isLoading.value = true;
      
      try {
        // Track profile page view in Pendo
        if (window.pendo) {
          window.pendo.track('profile_page_viewed', {
            profileId: userId.value,
            isOwnProfile: userId.value === currentUser.value?.id
          });
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Find user by ID from our mock data
        const userData = users.find(u => u.id === userId.value);
        if (userData) {
          user.value = userData;
          
          // Get user's posts
          userPosts.value = postsStore.getPostsByUser(userId.value);
          
          // Get user's friends
          const friendships = generateFriendships();
          const friendIds = friendships[userId.value] || [];
          friends.value = users.filter(u => friendIds.includes(u.id));
        } else {
          user.value = null;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    watch(() => route.params.id, () => {
      loadUserData();
    });
    
    onMounted(() => {
      loadUserData();
    });
    
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const sendFriendRequest = () => {
      // Track friend request in Pendo
      if (window.pendo) {
        window.pendo.track('friend_request_sent', {
          toUserId: user.value.id,
          toUserName: user.value.name
        });
      }
      
      const request = {
        id: 'req_' + Date.now(),
        from: currentUser.value.id,
        to: user.value.id,
        timestamp: new Date().toISOString(),
        user: user.value
      };
      
      userStore.addFriendRequest(request);
    };
    
    const sendMessage = () => {
      // Track message initiation in Pendo
      if (window.pendo) {
        window.pendo.track('message_initiated_from_profile', {
          toUserId: user.value.id,
          toUserName: user.value.name
        });
      }
      
      router.push({ 
        path: '/messages', 
        query: { userId: user.value.id } 
      });
    };
    
    const viewProfile = (profileId) => {
      // Track friend profile click in Pendo
      if (window.pendo) {
        window.pendo.track('friend_profile_clicked', {
          friendId: profileId,
          sourcePage: 'profile'
        });
      }
      
      router.push(`/profile/${profileId}`);
    };
    
    const goToCreatePost = () => {
      // Track post creation from profile in Pendo
      if (window.pendo) {
        window.pendo.track('create_post_clicked', {
          source: 'profile'
        });
      }
      
      router.push('/create-post');
    };
    
    const goHome = () => {
      router.push('/');
    };
    
    const handleLike = (postId) => {
      if (currentUser.value) {
        postsStore.likePost(postId, currentUser.value.id);
      }
    };
    
    const handleComment = (postId, content) => {
      if (currentUser.value && content.trim()) {
        const comment = {
          id: 'comment_' + Date.now(),
          userId: currentUser.value.id,
          content: content,
          timestamp: new Date().toISOString()
        };
        
        postsStore.commentOnPost(postId, comment);
      }
    };
    
    const handleShare = (postId) => {
      if (currentUser.value) {
        postsStore.sharePost(postId, currentUser.value.id);
      }
    };
    
    return {
      currentUser,
      isLoading,
      user,
      userPosts,
      friends,
      isCurrentUser,
      isFriend,
      hasPendingRequest,
      formatDate,
      sendFriendRequest,
      sendMessage,
      viewProfile,
      goToCreatePost,
      goHome,
      handleLike,
      handleComment,
      handleShare
    };
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.loading-container, .not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-container i, .not-found i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.not-found h2 {
  margin-bottom: 0.5rem;
}

.not-found p {
  margin-bottom: 1.5rem;
  color: #777;
}

.card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  padding: 1.5rem;
}

.profile-header {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
  position: relative;
}

.profile-cover {
  height: 200px;
  background-image: linear-gradient(to right, var(--primary), var(--primary-dark));
}

.profile-info {
  display: flex;
  padding: 1.5rem;
  position: relative;
}

.profile-avatar {
  margin-top: -80px;
  margin-right: 1.5rem;
}

.profile-avatar img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid var(--card-bg);
  background-color: var(--card-bg);
}

.profile-details {
  flex: 1;
}

.profile-details h1 {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}

.role {
  font-size: 1.1rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.joined {
  color: #777;
  font-size: 0.9rem;
}

.profile-actions {
  display: flex;
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background-color: var(--card-bg);
  cursor: pointer;
  font-weight: 500;
}

.action-button i {
  margin-right: 0.5rem;
}

.action-button.primary {
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
}

.action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.profile-content {
  display: flex;
  gap: 1.5rem;
}

.profile-sidebar {
  width: 35%;
}

.profile-sidebar h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.profile-posts {
  flex: 1;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.friend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.friend-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.friend-name {
  font-size: 0.9rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #777;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.create-post-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primary-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.post-input-container {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
}

.post-input {
  flex: 1;
  background-color: var(--background);
  border-radius: 20px;
  padding: 0.75rem 1rem;
  cursor: pointer;
}

.post-input span {
  color: #777;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
  }
  
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .profile-actions {
    margin-top: 1rem;
  }
}
</style> 