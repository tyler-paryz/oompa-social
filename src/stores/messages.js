import { defineStore } from 'pinia'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    conversations: {},
    activeConversation: null
  }),
  
  actions: {
    sendMessage(recipientId, message) {
      const conversationKey = this.getConversationKey(recipientId);
      
      if (!this.conversations[conversationKey]) {
        this.conversations[conversationKey] = [];
      }
      
      const newMessage = {
        id: Date.now().toString(),
        senderId: message.senderId,
        recipientId: recipientId,
        content: message.content,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      this.conversations[conversationKey].push(newMessage);
      
      // Track message sent in Pendo
      if (window.pendo) {
        window.pendo.track('message_sent', {
          conversationId: conversationKey,
          messageId: newMessage.id,
          recipientId: recipientId
        });
      }
      
      return newMessage;
    },
    
    getConversation(userId) {
      const conversationKey = this.getConversationKey(userId);
      return this.conversations[conversationKey] || [];
    },
    
    setActiveConversation(userId) {
      this.activeConversation = userId;
      const conversation = this.getConversation(userId);
      
      // Mark all unread messages as read
      conversation.forEach(message => {
        if (message.recipientId === userId && !message.read) {
          message.read = true;
        }
      });
    },
    
    getConversationKey(userId) {
      // This assumes current user id is available in the store or elsewhere
      // For simplicity, we'll just use a placeholder here
      const currentUserId = 'current_user_id';
      
      // Create a deterministic key by sorting the IDs
      return [currentUserId, userId].sort().join('_');
    },
    
    getAllConversations() {
      return Object.entries(this.conversations).map(([key, messages]) => {
        // Get the other user's ID from the conversation key
        const userIds = key.split('_');
        const otherUserId = userIds[0] === 'current_user_id' ? userIds[1] : userIds[0];
        
        // Get the last message for preview
        const lastMessage = messages[messages.length - 1];
        
        // Count unread messages
        const unreadCount = messages.filter(
          msg => msg.recipientId === 'current_user_id' && !msg.read
        ).length;
        
        return {
          userId: otherUserId,
          lastMessage,
          unreadCount,
          timestamp: lastMessage ? lastMessage.timestamp : null
        };
      }).sort((a, b) => {
        // Sort by timestamp, most recent first
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    }
  }
}) 