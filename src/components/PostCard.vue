<template>
  <div class="post-card">
    <div class="post-header">
      <img :src="post.user?.avatar || '/avatars/default.svg'" alt="User Avatar" class="avatar" />
      <div class="post-info">
        <div class="post-author">{{ post.user?.name || 'Unknown User' }}</div>
        <div class="post-meta">{{ formatTime(post.createdAt) }} · {{ post.user?.role }}</div>
      </div>
    </div>
    
    <div class="post-content">
      <!-- Regular post content -->
      <p v-if="post.type !== 'share'">{{ post.content }}</p>
      
      <!-- Shared post -->
      <div v-else class="shared-post-wrapper">
        <p v-if="post.content">{{ post.content }}</p>
        <div class="shared-post">
          <div class="shared-post-header">
            <img 
              :src="post.originalPost.user?.avatar || '/avatars/default.svg'" 
              alt="Original Author" 
              class="avatar-small" 
            />
            <div class="shared-post-info">
              <div class="post-author">{{ post.originalPost.user?.name || 'Unknown User' }}</div>
              <div class="post-meta">{{ formatTime(post.originalPost.createdAt) }}</div>
            </div>
          </div>
          <p>{{ post.originalPost.content }}</p>
          <img 
            v-if="post.originalPost.media" 
            :src="post.originalPost.media" 
            alt="Post media" 
            class="post-media"
            @click="trackMediaView(post.originalPost.id)"
          />
        </div>
      </div>
      
      <!-- Post media for regular posts -->
      <img 
        v-if="post.type !== 'share' && post.media" 
        :src="post.media" 
        alt="Post media" 
        class="post-media"
        @click="trackMediaView(post.id)"
      />
    </div>
    
    <div class="post-stats">
      <div class="likes">
        <i class="mdi mdi-thumb-up"></i>
        <span>{{ post.likes.length }}</span>
      </div>
      <div class="comments-shares">
        <span v-if="post.comments.length">{{ post.comments.length }} comments</span>
        <span v-if="post.shares">{{ post.shares }} shares</span>
      </div>
    </div>
    
    <div class="post-actions">
      <button 
        class="action-button" 
        :class="{ 'liked': hasLiked }"
        @click="like"
      >
        <i class="mdi mdi-thumb-up"></i>
        <span>Like</span>
      </button>
      <button class="action-button" @click="showCommentInput = !showCommentInput">
        <i class="mdi mdi-comment-outline"></i>
        <span>Comment</span>
      </button>
      <button class="action-button" @click="share">
        <i class="mdi mdi-share"></i>
        <span>Share</span>
      </button>
    </div>
    
    <div class="comments-section" v-if="post.comments.length > 0 || showCommentInput">
      <div class="comment-list" v-if="post.comments.length > 0">
        <div class="comment-item" v-for="comment in post.comments" :key="comment.id">
          <img 
            :src="getUserById(comment.userId)?.avatar || '/avatars/default.svg'" 
            alt="Commenter Avatar" 
            class="avatar-small" 
          />
          <div class="comment-bubble">
            <div class="comment-author">{{ getUserById(comment.userId)?.name || 'Unknown User' }}</div>
            <p>{{ comment.content }}</p>
            <div class="comment-meta">{{ formatTime(comment.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div class="comment-input-container" v-if="showCommentInput">
        <img :src="currentUser?.avatar || '/avatars/default.svg'" alt="Your Avatar" class="avatar-small" />
        <div class="comment-input-wrapper">
          <input 
            type="text" 
            v-model="commentText" 
            placeholder="Write a comment..." 
            class="comment-input"
            @keyup.enter="submitComment"
            @focus="trackCommentFocus"
          />
          <button 
            class="comment-submit" 
            :disabled="!commentText.trim()" 
            @click="submitComment"
          >
            <i class="mdi mdi-send"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { users } from '../services/mockData';

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    },
    currentUser: {
      type: Object,
      default: null
    }
  },
  emits: ['like', 'comment', 'share'],
  setup(props, { emit }) {
    const showCommentInput = ref(false);
    const commentText = ref('');
    
    const hasLiked = computed(() => {
      return props.currentUser && props.post.likes.includes(props.currentUser.id);
    });
    
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
    
    const getUserById = (userId) => {
      return users.find(user => user.id === userId);
    };
    
    const like = () => {
      // Track like action in Pendo
      if (window.pendo) {
        window.pendo.track('post_like_button_clicked', {
          postId: props.post.id,
          postAuthor: props.post.user?.name,
          alreadyLiked: hasLiked.value
        });
      }
      
      emit('like', props.post.id);
    };
    
    const submitComment = () => {
      if (commentText.value.trim()) {
        // Track comment submission in Pendo
        if (window.pendo) {
          window.pendo.track('comment_submitted', {
            postId: props.post.id,
            postAuthor: props.post.user?.name,
            commentLength: commentText.value.length
          });
        }
        
        emit('comment', props.post.id, commentText.value);
        commentText.value = '';
      }
    };
    
    const share = () => {
      // Track share action in Pendo
      if (window.pendo) {
        window.pendo.track('post_share_button_clicked', {
          postId: props.post.id,
          postAuthor: props.post.user?.name
        });
      }
      
      emit('share', props.post.id);
    };
    
    const trackMediaView = (postId) => {
      // Track media view in Pendo
      if (window.pendo) {
        window.pendo.track('post_media_viewed', {
          postId: postId
        });
      }
    };
    
    const trackCommentFocus = () => {
      // Track comment input focus in Pendo
      if (window.pendo) {
        window.pendo.track('comment_input_focused', {
          postId: props.post.id
        });
      }
    };
    
    return {
      showCommentInput,
      commentText,
      hasLiked,
      formatTime,
      getUserById,
      like,
      submitComment,
      share,
      trackMediaView,
      trackCommentFocus
    };
  }
};
</script>

<style scoped>
.post-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.75rem;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.post-info {
  flex: 1;
}

.post-author {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.post-meta {
  font-size: 0.8rem;
  color: #777;
}

.post-content {
  padding: 0 1rem 1rem;
}

.post-content p {
  margin-bottom: 0.75rem;
  white-space: pre-line;
}

.post-media {
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
}

.shared-post-wrapper {
  margin-bottom: 0.5rem;
}

.shared-post {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.shared-post-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  color: #777;
  font-size: 0.9rem;
  border-top: 1px solid var(--border);
}

.likes {
  display: flex;
  align-items: center;
}

.likes i {
  color: var(--primary);
  margin-right: 0.25rem;
}

.post-actions {
  display: flex;
  border-top: 1px solid var(--border);
  padding: 0.5rem;
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
  color: #777;
  border-radius: 4px;
}

.action-button:hover {
  background-color: var(--background);
}

.action-button i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.action-button.liked {
  color: var(--primary);
}

.comments-section {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
}

.comment-list {
  margin-bottom: 0.75rem;
}

.comment-item {
  display: flex;
  margin-bottom: 0.75rem;
}

.comment-bubble {
  background-color: var(--background);
  border-radius: 18px;
  padding: 0.5rem 0.75rem;
  flex: 1;
}

.comment-author {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.comment-bubble p {
  margin-bottom: 0.25rem;
}

.comment-meta {
  font-size: 0.75rem;
  color: #777;
}

.comment-input-container {
  display: flex;
  align-items: center;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  position: relative;
}

.comment-input {
  flex: 1;
  border-radius: 18px;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid var(--border);
  background-color: var(--background);
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary);
}

.comment-submit {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  padding: 0.25rem;
}

.comment-submit:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style> 