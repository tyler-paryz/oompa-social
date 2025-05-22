import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
    friends: [],
    friendRequests: [],
    notifications: []
  }),
  
  actions: {
    login(userData) {
      this.currentUser = userData;
      this.isAuthenticated = true;
      
      // Initialize Pendo with user data
      if (window.pendo) {
        window.pendo.initialize({
          visitor: {
            id: userData.id,
            email: userData.email,
            full_name: userData.name,
            role: "oompa_loompa"
          },
          account: {
            id: "oompa-social-app",
            name: "Oompa Social Platform"
          }
        });
      }
    },
    
    logout() {
      this.currentUser = null;
      this.isAuthenticated = false;
      this.friends = [];
      this.friendRequests = [];
      this.notifications = [];
    },
    
    addFriend(friend) {
      this.friends.push(friend);
      
      // Track friend added event in Pendo
      if (window.pendo) {
        window.pendo.track('friend_added', {
          friendId: friend.id,
          friendName: friend.name
        });
      }
    },
    
    addFriendRequest(request) {
      this.friendRequests.push(request);
    },
    
    acceptFriendRequest(requestId) {
      const index = this.friendRequests.findIndex(req => req.id === requestId);
      if (index !== -1) {
        const request = this.friendRequests[index];
        this.friends.push(request.user);
        this.friendRequests.splice(index, 1);
        
        // Track friend request accepted in Pendo
        if (window.pendo) {
          window.pendo.track('friend_request_accepted', {
            friendId: request.user.id,
            friendName: request.user.name
          });
        }
      }
    },
    
    rejectFriendRequest(requestId) {
      const index = this.friendRequests.findIndex(req => req.id === requestId);
      if (index !== -1) {
        this.friendRequests.splice(index, 1);
      }
    },
    
    addNotification(notification) {
      this.notifications.push(notification);
    },
    
    clearNotification(notificationId) {
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    }
  }
}) 