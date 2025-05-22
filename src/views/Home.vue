<template>
  <div class="home-container">
    <section class="post-creator">
      <div class="post-input-container">
        <img :src="currentUser?.avatar || '/avatars/default.svg'" alt="Profile" class="avatar" />
        <div class="post-input" @click="goToCreatePost">
          <span>What's on your mind, {{ currentUser?.name?.split(' ')[0] }}?</span>
        </div>
      </div>
      <div class="post-actions">
        <button class="post-action" @click="goToCreatePost('image')">
          <i class="mdi mdi-image"></i>
          <span>Photo</span>
        </button>
        <button class="post-action" @click="goToCreatePost('text')">
          <i class="mdi mdi-text"></i>
          <span>Text</span>
        </button>
      </div>
    </section>

    <section class="feed-container">
      <div v-if="isLoading" class="loading-container">
        <i class="mdi mdi-loading mdi-spin"></i>
        <span>Loading posts...</span>
      </div>
      
      <div v-else-if="posts.length === 0" class="empty-feed">
        <i class="mdi mdi-emoticon-sad"></i>
        <p>No posts yet! Be the first to create one.</p>
        <button class="create-post-btn" @click="goToCreatePost">Create Post</button>
      </div>
      
      <template v-else>
        <post-card 
          v-for="post in posts" 
          :key="post.id" 
          :post="post"
          :current-user="currentUser"
          @like="handleLike"
          @comment="handleComment"
          @share="handleShare"
        />
      </template>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { usePostsStore } from '../stores/posts';
import { storeToRefs } from 'pinia';
import { generateInitialPosts, users } from '../services/mockData';
import PostCard from '../components/PostCard.vue';

export default {
  name: 'HomeView',
  components: {
    PostCard
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const postsStore = usePostsStore();
    const { currentUser } = storeToRefs(userStore);
    
    const isLoading = ref(true);
    const posts = ref([]);
    
    // Load initial posts
    onMounted(async () => {
      // Track home page view in Pendo
      if (window.pendo) {
        window.pendo.track('home_page_viewed');
      }
      
      try {
        // Simulate API loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If the posts store is empty, populate it with initial posts
        if (postsStore.posts.length === 0) {
          const initialPosts = generateInitialPosts();
          initialPosts.forEach(post => {
            // Augment the post with user data
            post.user = users.find(u => u.id === post.userId);
            postsStore.addPost(post);
          });
        }
        
        // Get posts from the store
        posts.value = postsStore.getFeedPosts();
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        isLoading.value = false;
      }
    });
    
    const goToCreatePost = (type = null) => {
      // Track post creation intent in Pendo
      if (window.pendo) {
        window.pendo.track('create_post_clicked', {
          source: 'home',
          type: type || 'unspecified'
        });
      }
      
      if (type) {
        router.push({ path: '/create-post', query: { type } });
      } else {
        router.push('/create-post');
      }
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
      posts,
      goToCreatePost,
      handleLike,
      handleComment,
      handleShare
    };
  }
};
</script>

<style scoped>
.home-container {
  max-width: 700px;
  margin: 0 auto;
}

.post-creator {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.post-input-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
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

.post-actions {
  display: flex;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.post-action {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  border: none;
  background: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}

.post-action:hover {
  background-color: var(--background);
}

.post-action i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
  color: var(--primary);
}

.feed-container {
  margin-bottom: 2rem;
}

.loading-container, .empty-feed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading-container i, .empty-feed i {
  font-size: 3rem;
  color: var(--primary);
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

.create-post-btn:hover {
  background-color: var(--primary-dark);
}

@media (max-width: 768px) {
  .home-container {
    padding: 0 0.5rem;
  }
}
</style> 