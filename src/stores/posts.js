import { defineStore } from 'pinia'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    userPosts: {}
  }),
  
  actions: {
    addPost(post) {
      this.posts.unshift(post);
      
      // Add to user's posts collection
      if (!this.userPosts[post.userId]) {
        this.userPosts[post.userId] = [];
      }
      this.userPosts[post.userId].unshift(post);
      
      // Track post creation in Pendo
      if (window.pendo) {
        window.pendo.track('post_created', {
          postId: post.id,
          postType: post.type,
          hasMedia: !!post.media
        });
      }
    },
    
    likePost(postId, userId) {
      const post = this.posts.find(p => p.id === postId);
      if (post && !post.likes.includes(userId)) {
        post.likes.push(userId);
        
        // Track post like in Pendo
        if (window.pendo) {
          window.pendo.track('post_liked', {
            postId: postId,
            postAuthorId: post.userId
          });
        }
      }
      
      // Also update in userPosts
      if (this.userPosts[post.userId]) {
        const userPost = this.userPosts[post.userId].find(p => p.id === postId);
        if (userPost && !userPost.likes.includes(userId)) {
          userPost.likes.push(userId);
        }
      }
    },
    
    commentOnPost(postId, comment) {
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.comments.push(comment);
        
        // Track post comment in Pendo
        if (window.pendo) {
          window.pendo.track('post_commented', {
            postId: postId,
            postAuthorId: post.userId,
            commentId: comment.id
          });
        }
      }
      
      // Also update in userPosts
      if (this.userPosts[post.userId]) {
        const userPost = this.userPosts[post.userId].find(p => p.id === postId);
        if (userPost) {
          userPost.comments.push(comment);
        }
      }
    },
    
    sharePost(postId, userId) {
      const originalPost = this.posts.find(p => p.id === postId);
      if (originalPost) {
        const sharePost = {
          id: 'share_' + Date.now(),
          userId: userId,
          type: 'share',
          originalPost: originalPost,
          content: '',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        };
        
        this.posts.unshift(sharePost);
        
        if (!this.userPosts[userId]) {
          this.userPosts[userId] = [];
        }
        this.userPosts[userId].unshift(sharePost);
        
        // Track post shared in Pendo
        if (window.pendo) {
          window.pendo.track('post_shared', {
            originalPostId: postId,
            originalAuthorId: originalPost.userId,
            sharingUserId: userId
          });
        }
      }
    },
    
    getPostsByUser(userId) {
      return this.userPosts[userId] || [];
    },
    
    getFeedPosts() {
      return this.posts;
    }
  }
}) 