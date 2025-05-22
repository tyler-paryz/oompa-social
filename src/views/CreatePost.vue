<template>
  <div class="create-post-container">
    <div class="card">
      <div class="card-header">
        <h1>Create Post</h1>
        <button class="close-button" @click="cancel">
          <i class="mdi mdi-close"></i>
        </button>
      </div>
      
      <div class="card-content">
        <div class="user-info">
          <img :src="currentUser?.avatar || '/avatars/default.svg'" alt="Profile" class="avatar" />
          <div class="user-name">{{ currentUser?.name }}</div>
        </div>
        
        <div class="post-input-wrapper">
          <textarea 
            v-model="content" 
            placeholder="What's on your mind?"
            class="post-input"
            @focus="trackFieldFocus('content')"
          ></textarea>
        </div>
        
        <div class="media-section" v-if="postType === 'image' || mediaPreview">
          <div class="media-header">
            <h3>
              <i class="mdi mdi-image"></i>
              <span>Photo</span>
            </h3>
            <button class="remove-media" @click="removeMedia" v-if="mediaPreview">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
          
          <div class="media-preview" v-if="mediaPreview">
            <img :src="mediaPreview" alt="Preview" />
          </div>
          
          <div class="media-upload" v-else>
            <label for="media-input" class="upload-label">
              <i class="mdi mdi-upload"></i>
              <span>Add Photos</span>
              <input 
                type="file" 
                id="media-input" 
                accept="image/*,.svg" 
                @change="handleFileSelect"
                @focus="trackFieldFocus('media_input')"
              />
            </label>
          </div>
        </div>
        
        <div class="post-types">
          <h3>Add to your post:</h3>
          <div class="post-type-buttons">
            <button 
              class="type-button" 
              :class="{ active: postType === 'image' }"
              @click="setPostType('image')"
            >
              <i class="mdi mdi-image"></i>
              <span>Photo</span>
            </button>
            <button 
              class="type-button" 
              :class="{ active: postType === 'text' }"
              @click="setPostType('text')"
            >
              <i class="mdi mdi-text"></i>
              <span>Text Only</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="card-footer">
        <button 
          class="post-button" 
          :disabled="!isValid" 
          @click="createPost"
        >
          <span v-if="isSubmitting">
            <i class="mdi mdi-loading mdi-spin"></i>
            Posting...
          </span>
          <span v-else>Post</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { usePostsStore } from '../stores/posts';
import { storeToRefs } from 'pinia';
import { createNewPost } from '../services/mockData';

export default {
  name: 'CreatePostView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const postsStore = usePostsStore();
    const { currentUser } = storeToRefs(userStore);
    
    const content = ref('');
    const postType = ref('text');
    const mediaFile = ref(null);
    const mediaPreview = ref('');
    const isSubmitting = ref(false);
    
    // Set initial post type from query parameter if available
    onMounted(() => {
      if (route.query.type) {
        setPostType(route.query.type);
      }
      
      // Track page view in Pendo
      if (window.pendo) {
        window.pendo.track('create_post_page_viewed', {
          initialType: postType.value
        });
      }
    });
    
    const isValid = computed(() => {
      return content.value.trim() || mediaFile.value;
    });
    
    const setPostType = (type) => {
      // Track post type change in Pendo
      if (window.pendo && postType.value !== type) {
        window.pendo.track('post_type_changed', {
          fromType: postType.value,
          toType: type
        });
      }
      
      postType.value = type;
    };
    
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        mediaFile.value = file;
        
        // Create a preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          mediaPreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
        
        // Track file selection in Pendo
        if (window.pendo) {
          window.pendo.track('media_file_selected', {
            fileType: file.type,
            fileSize: file.size
          });
        }
      }
    };
    
    const removeMedia = () => {
      mediaFile.value = null;
      mediaPreview.value = '';
      
      // Track media removal in Pendo
      if (window.pendo) {
        window.pendo.track('media_removed');
      }
    };
    
    const trackFieldFocus = (fieldName) => {
      // Track field focus in Pendo
      if (window.pendo) {
        window.pendo.track('field_focus', {
          field: fieldName,
          page: 'create_post'
        });
      }
    };
    
    const createPost = async () => {
      if (!isValid.value || !currentUser.value) return;
      
      isSubmitting.value = true;
      
      try {
        // Track post creation attempt in Pendo
        if (window.pendo) {
          window.pendo.track('post_creation_started', {
            type: postType.value,
            hasMedia: !!mediaFile.value,
            contentLength: content.value.length
          });
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a media path (in a real app, this would be an upload process)
        let mediaPath = null;
        if (mediaFile.value) {
          // For demo purposes, we'll just use the preview URL directly
          // In a real app, this would upload the file and return a URL
          mediaPath = mediaPreview.value;
        }
        
        // Create post object using our helper function
        const post = createNewPost(currentUser.value.id, {
          type: mediaPath ? 'image' : 'text',
          content: content.value,
          media: mediaPath,
          user: currentUser.value // Add user data to the post
        });
        
        // Add post to store
        postsStore.addPost(post);
        
        // Navigate back to home after successful post
        router.push('/');
        
        // Track post creation success in Pendo
        if (window.pendo) {
          window.pendo.track('post_creation_completed', {
            postId: post.id,
            type: post.type
          });
        }
      } catch (error) {
        console.error('Error creating post:', error);
        
        // Track post creation error in Pendo
        if (window.pendo) {
          window.pendo.track('post_creation_error', {
            error: error.message
          });
        }
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const cancel = () => {
      // Track cancel action in Pendo
      if (window.pendo) {
        window.pendo.track('post_creation_cancelled', {
          hasContent: content.value.length > 0,
          hasMedia: !!mediaFile.value
        });
      }
      
      router.push('/');
    };
    
    return {
      currentUser,
      content,
      postType,
      mediaPreview,
      isSubmitting,
      isValid,
      setPostType,
      handleFileSelect,
      removeMedia,
      createPost,
      cancel,
      trackFieldFocus
    };
  }
};
</script>

<style scoped>
.create-post-container {
  max-width: 600px;
  margin: 0 auto;
}

.card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.card-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.close-button:hover {
  background-color: var(--background);
}

.card-content {
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.75rem;
}

.user-name {
  font-weight: 600;
}

.post-input-wrapper {
  margin-bottom: 1rem;
}

.post-input {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 1.1rem;
}

.post-input:focus {
  outline: none;
}

.media-section {
  margin-bottom: 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--background);
}

.media-header h3 {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
}

.media-header h3 i {
  margin-right: 0.5rem;
  color: var(--primary);
}

.remove-media {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.remove-media:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.media-preview {
  text-align: center;
  padding: 1rem;
}

.media-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.media-upload {
  padding: 2rem;
  text-align: center;
}

.upload-label {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.upload-label:hover {
  border-color: var(--primary);
}

.upload-label i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
}

.upload-label input {
  display: none;
}

.post-types {
  margin-top: 1.5rem;
}

.post-types h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.post-type-buttons {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.type-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
}

.type-button i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.type-button.active {
  background-color: var(--background);
  font-weight: 600;
}

.type-button.active i {
  color: var(--primary);
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
  text-align: right;
}

.post-button {
  padding: 0.75rem 2rem;
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.post-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.post-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.post-button i {
  margin-right: 0.5rem;
}

@media (max-width: 600px) {
  .create-post-container {
    padding: 0 0.5rem;
  }
  
  .post-button {
    width: 100%;
  }
}
</style> 