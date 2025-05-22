<template>
  <div class="messages-container">
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h2>Messages</h2>
      </div>
      
      <div class="conversations-list">
        <div v-if="isLoadingConversations" class="loading-state">
          <i class="mdi mdi-loading mdi-spin"></i>
          <span>Loading conversations...</span>
        </div>
        
        <div v-else-if="conversations.length === 0" class="empty-state">
          <i class="mdi mdi-message-text-outline"></i>
          <p>No conversations yet</p>
          <button class="primary-button" @click="goToFriends">Find Friends</button>
        </div>
        
        <div v-else>
          <div 
            v-for="conversation in conversations" 
            :key="conversation.userId"
            class="conversation-item"
            :class="{ active: activeUserId === conversation.userId }"
            @click="setActiveConversation(conversation.userId)"
          >
            <img 
              :src="getUserById(conversation.userId)?.avatar || '/avatars/default.svg'" 
              alt="User" 
              class="avatar" 
            />
            <div class="conversation-info">
              <div class="conversation-name">{{ getUserById(conversation.userId)?.name || 'Unknown User' }}</div>
              <div class="conversation-preview">
                {{ getPreviewText(conversation) }}
              </div>
            </div>
            <div class="conversation-meta">
              <div class="conversation-time">{{ formatTime(conversation.timestamp) }}</div>
              <div class="unread-badge" v-if="conversation.unreadCount > 0">
                {{ conversation.unreadCount }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-main">
      <div v-if="!activeUserId" class="no-chat-selected">
        <i class="mdi mdi-message-text-outline"></i>
        <h2>Select a conversation</h2>
        <p>Choose a conversation from the sidebar or start a new one</p>
      </div>
      
      <template v-else>
        <div class="chat-header">
          <img 
            :src="getUserById(activeUserId)?.avatar || '/avatars/default.svg'" 
            alt="User" 
            class="avatar" 
          />
          <div class="user-info">
            <div class="user-name">{{ getUserById(activeUserId)?.name || 'Unknown User' }}</div>
            <div class="user-status">{{ getUserById(activeUserId)?.role }}</div>
          </div>
          <div class="chat-actions">
            <button class="action-button" @click="viewProfile(activeUserId)">
              <i class="mdi mdi-account"></i>
              <span>Profile</span>
            </button>
          </div>
        </div>
        
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="isLoadingMessages" class="loading-state">
            <i class="mdi mdi-loading mdi-spin"></i>
            <span>Loading messages...</span>
          </div>
          
          <div v-else-if="activeMessages.length === 0" class="empty-state">
            <i class="mdi mdi-message-outline"></i>
            <p>No messages yet</p>
            <p class="hint">Say hello to start a conversation!</p>
          </div>
          
          <template v-else>
            <div 
              v-for="message in activeMessages" 
              :key="message.id"
              class="message-item"
              :class="{ 
                'current-user': message.senderId === currentUser?.id,
                'other-user': message.senderId !== currentUser?.id
              }"
            >
              <img 
                v-if="message.senderId !== currentUser?.id"
                :src="getUserById(message.senderId)?.avatar || '/avatars/default.svg'" 
                alt="User"
                class="message-avatar"
              />
              <div class="message-bubble">
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </template>
        </div>
        
        <div class="chat-input">
          <form @submit.prevent="sendMessage">
            <input 
              type="text" 
              v-model="messageText" 
              placeholder="Type a message..." 
              class="message-input"
              @focus="trackFieldFocus('message_input')"
            />
            <button 
              type="submit" 
              class="send-button"
              :disabled="!messageText.trim()"
            >
              <i class="mdi mdi-send"></i>
            </button>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useMessagesStore } from '../stores/messages';
import { storeToRefs } from 'pinia';
import { users, generateInitialMessages } from '../services/mockData';

export default {
  name: 'MessagesView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const messagesStore = useMessagesStore();
    const { currentUser } = storeToRefs(userStore);
    
    const isLoadingConversations = ref(true);
    const isLoadingMessages = ref(false);
    const activeUserId = ref(null);
    const messageText = ref('');
    const conversations = ref([]);
    const messagesContainer = ref(null);
    
    // Get active messages based on activeUserId
    const activeMessages = computed(() => {
      if (!activeUserId.value) return [];
      return messagesStore.getConversation(activeUserId.value);
    });
    
    // Initialize active conversation from route query if present
    onMounted(async () => {
      await loadConversations();
      
      if (route.query.userId) {
        setActiveConversation(route.query.userId);
      }
      
      // Track page view in Pendo
      if (window.pendo) {
        window.pendo.track('messages_page_viewed', {
          hasActiveConversation: !!activeUserId.value
        });
      }
    });
    
    // Scroll to bottom of messages when they change
    watch(activeMessages, () => {
      nextTick(() => {
        scrollToBottom();
      });
    });
    
    // Load conversations data
    const loadConversations = async () => {
      isLoadingConversations.value = true;
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Initialize with mock data if store is empty
        if (Object.keys(messagesStore.conversations).length === 0) {
          const initialMessages = generateInitialMessages();
          
          // Update the keys to use current user's ID
          const updatedConversations = {};
          for (const [key, messages] of Object.entries(initialMessages)) {
            const newKey = key.replace('user1', currentUser.value.id);
            updatedConversations[newKey] = messages;
          }
          
          // Add to store
          messagesStore.conversations = updatedConversations;
        }
        
        // Get conversations from store
        conversations.value = messagesStore.getAllConversations();
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        isLoadingConversations.value = false;
      }
    };
    
    // Set active conversation and mark as read
    const setActiveConversation = (userId) => {
      isLoadingMessages.value = true;
      
      activeUserId.value = userId;
      messagesStore.setActiveConversation(userId);
      
      // Track conversation opened in Pendo
      if (window.pendo) {
        window.pendo.track('conversation_opened', {
          userId: userId,
          userName: getUserById(userId)?.name
        });
      }
      
      // Simulate loading delay
      setTimeout(() => {
        isLoadingMessages.value = false;
        scrollToBottom();
      }, 500);
    };
    
    // Send a new message
    const sendMessage = () => {
      if (!messageText.value.trim() || !activeUserId.value || !currentUser.value) return;
      
      const message = {
        senderId: currentUser.value.id,
        content: messageText.value.trim()
      };
      
      messagesStore.sendMessage(activeUserId.value, message);
      messageText.value = '';
      
      // Update conversations list
      loadConversations();
    };
    
    // Helper to get user data by ID
    const getUserById = (userId) => {
      return users.find(user => user.id === userId);
    };
    
    // Format timestamp for display
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Today - show time
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        // Yesterday
        return 'Yesterday';
      } else if (diffDays < 7) {
        // Within a week - show day name
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        // Older - show date
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    };
    
    // Get preview text for conversation list
    const getPreviewText = (conversation) => {
      if (!conversation.lastMessage) return 'No messages yet';
      
      const isSentByCurrentUser = conversation.lastMessage.senderId === currentUser.value?.id;
      const prefix = isSentByCurrentUser ? 'You: ' : '';
      const content = conversation.lastMessage.content;
      
      // Truncate if too long
      const maxLength = 30;
      if (content.length > maxLength) {
        return prefix + content.substring(0, maxLength) + '...';
      }
      
      return prefix + content;
    };
    
    // Scroll messages container to bottom
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };
    
    // Navigate to user profile
    const viewProfile = (userId) => {
      // Track profile view from messages in Pendo
      if (window.pendo) {
        window.pendo.track('profile_viewed_from_messages', {
          userId: userId
        });
      }
      
      router.push(`/profile/${userId}`);
    };
    
    // Navigate to friends page
    const goToFriends = () => {
      router.push('/friends');
    };
    
    // Track field focus for analytics
    const trackFieldFocus = (fieldName) => {
      if (window.pendo) {
        window.pendo.track('field_focus', {
          field: fieldName,
          page: 'messages',
          conversationWith: activeUserId.value
        });
      }
    };
    
    return {
      currentUser,
      isLoadingConversations,
      isLoadingMessages,
      activeUserId,
      messageText,
      conversations,
      activeMessages,
      messagesContainer,
      setActiveConversation,
      sendMessage,
      getUserById,
      formatTime,
      getPreviewText,
      viewProfile,
      goToFriends,
      trackFieldFocus
    };
  }
};
</script>

<style scoped>
.messages-container {
  display: flex;
  height: calc(100vh - 140px);
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.sidebar-header h2 {
  font-size: 1.2rem;
  margin: 0;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.conversation-item:hover {
  background-color: var(--background);
}

.conversation-item.active {
  background-color: rgba(var(--primary), 0.05);
  border-left: 3px solid var(--primary);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.75rem;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.conversation-preview {
  font-size: 0.85rem;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  margin-left: 0.5rem;
}

.conversation-time {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.unread-badge {
  background-color: var(--primary);
  color: var(--text-light);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
}

.user-status {
  font-size: 0.85rem;
  color: var(--primary);
}

.chat-actions {
  display: flex;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
}

.action-button i {
  margin-right: 0.25rem;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: var(--background);
}

.message-item {
  display: flex;
  margin-bottom: 1rem;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.current-user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  border-radius: 18px;
  padding: 0.75rem 1rem;
  position: relative;
}

.current-user .message-bubble {
  background-color: var(--primary);
  color: var(--text-light);
  border-bottom-right-radius: 4px;
}

.other-user .message-bubble {
  background-color: var(--card-bg);
  border-bottom-left-radius: 4px;
}

.message-content {
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  text-align: right;
  opacity: 0.8;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid var(--border);
}

.chat-input form {
  display: flex;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  margin-right: 0.5rem;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary);
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .empty-state, .no-chat-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 2rem;
}

.loading-state i, .empty-state i, .no-chat-selected i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.no-chat-selected h2 {
  margin-bottom: 0.5rem;
}

.empty-state p, .no-chat-selected p {
  color: #777;
  margin-bottom: 1rem;
}

.hint {
  font-style: italic;
  opacity: 0.7;
}

.primary-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .messages-container {
    flex-direction: column;
    height: calc(100vh - 130px);
  }
  
  .chat-sidebar {
    width: 100%;
    height: 30%;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  
  .chat-main {
    height: 70%;
  }
  
  .message-bubble {
    max-width: 80%;
  }
}
</style> 