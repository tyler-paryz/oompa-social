// Mock Oompa Loompa users
export const users = [
  {
    id: 'user1',
    name: 'Tooty Fruity',
    email: 'tooty@oompa.social',
    avatar: '/avatars/avatar1.svg',
    role: 'Chocolate Mixer',
    bio: 'Mixing chocolate by day, mixing beats by night! Love creating sweet symphonies in the factory.',
    joinDate: '2023-05-12'
  },
  {
    id: 'user2',
    name: 'Ginger Snap',
    email: 'ginger@oompa.social',
    avatar: '/avatars/avatar2.svg',
    role: 'Candy Inspector',
    bio: 'Quality control is my passion. If it passes my test, it\'s good enough for Wonka!',
    joinDate: '2023-04-20'
  },
  {
    id: 'user3',
    name: 'Berry Bubble',
    email: 'berry@oompa.social',
    avatar: '/avatars/avatar3.svg',
    role: 'Bubblegum Technician',
    bio: 'Creating bubbles that never pop! Ask me about my record-breaking bubble from last summer.',
    joinDate: '2023-06-15'
  },
  {
    id: 'user4',
    name: 'Fizzy Lifting',
    email: 'fizzy@oompa.social',
    avatar: '/avatars/avatar4.svg',
    role: 'Fizzy Drink Developer',
    bio: 'Making drinks that lift you up (literally). Just stay away from ceiling fans!',
    joinDate: '2023-02-28'
  },
  {
    id: 'user5',
    name: 'Caramel Swirl',
    email: 'caramel@oompa.social',
    avatar: '/avatars/avatar5.svg',
    role: 'Toffee Stretcher',
    bio: 'Stretching toffee and stretching my creativity. Yoga enthusiast and candy craftsman.',
    joinDate: '2023-01-15'
  }
];

// Mock posts
export const generateInitialPosts = () => {
  return [
    {
      id: 'post1',
      userId: 'user2',
      type: 'text',
      content: 'Just inspected a batch of perfect everlasting gobstoppers! #QualityControl',
      likes: ['user1', 'user3'],
      comments: [
        {
          id: 'comment1',
          userId: 'user1',
          content: 'Great job! Those are my favorites!',
          timestamp: '2023-09-15T15:30:00Z'
        }
      ],
      createdAt: '2023-09-15T14:20:00Z'
    },
    {
      id: 'post2',
      userId: 'user3',
      type: 'image',
      content: 'Check out this amazing bubblegum I made that turns your tongue blue and then green and then back to normal!',
      media: '/posts/bubblegum.svg',
      likes: ['user1', 'user2', 'user4', 'user5'],
      comments: [],
      createdAt: '2023-09-15T12:45:00Z'
    },
    {
      id: 'post3',
      userId: 'user1',
      type: 'text',
      content: 'Anyone else tired of the same chocolate songs on the factory radio? #NeedNewTunes',
      likes: ['user4'],
      comments: [
        {
          id: 'comment2',
          userId: 'user4',
          content: 'I\'ve been saying this for weeks!',
          timestamp: '2023-09-14T18:22:00Z'
        },
        {
          id: 'comment3',
          userId: 'user5',
          content: 'I actually like the classics...',
          timestamp: '2023-09-14T19:10:00Z'
        }
      ],
      createdAt: '2023-09-14T17:30:00Z'
    },
    {
      id: 'post4',
      userId: 'user5',
      type: 'image',
      content: 'Stretched a record-breaking piece of toffee today! Over 50 feet long!',
      media: '/posts/toffee.svg',
      likes: ['user1', 'user2', 'user3'],
      comments: [
        {
          id: 'comment4',
          userId: 'user2',
          content: 'Impressive! But did it pass inspection? 🧐',
          timestamp: '2023-09-13T14:25:00Z'
        },
        {
          id: 'comment5',
          userId: 'user5',
          content: 'Of course it did, I\'m a professional!',
          timestamp: '2023-09-13T14:40:00Z'
        }
      ],
      createdAt: '2023-09-13T13:15:00Z'
    },
    {
      id: 'post5',
      userId: 'user4',
      type: 'text',
      content: 'Reminder: Factory picnic this Saturday! I\'m bringing my special fizzy lemonade that makes you hover for 10 seconds! #FactoryFun',
      likes: ['user1', 'user2', 'user3', 'user5'],
      comments: [
        {
          id: 'comment6',
          userId: 'user1',
          content: 'Can\'t wait! I\'ll bring chocolate cookies!',
          timestamp: '2023-09-12T11:30:00Z'
        }
      ],
      createdAt: '2023-09-12T10:20:00Z'
    }
  ];
};

// Mock friend connections
export const generateFriendships = () => {
  return {
    user1: ['user2', 'user3', 'user4'],
    user2: ['user1', 'user5'],
    user3: ['user1', 'user4', 'user5'],
    user4: ['user1', 'user3'],
    user5: ['user2', 'user3']
  };
};

// Mock friend requests
export const generateFriendRequests = () => {
  return [
    {
      id: 'req1',
      from: 'user5',
      to: 'user1',
      timestamp: '2023-09-15T09:20:00Z'
    },
    {
      id: 'req2',
      from: 'user4',
      to: 'user2',
      timestamp: '2023-09-14T16:45:00Z'
    }
  ];
};

// Mock conversation data
export const generateInitialMessages = () => {
  return {
    'user1_user2': [
      {
        id: 'msg1',
        senderId: 'user1',
        recipientId: 'user2',
        content: 'Hey Ginger, how\'s the quality control today?',
        timestamp: '2023-09-15T10:20:00Z',
        read: true
      },
      {
        id: 'msg2',
        senderId: 'user2',
        recipientId: 'user1',
        content: 'Hi Tooty! It\'s going great. Found a few wonky gobstoppers but mostly perfect batches!',
        timestamp: '2023-09-15T10:25:00Z',
        read: true
      },
      {
        id: 'msg3',
        senderId: 'user1',
        recipientId: 'user2',
        content: 'Nice! Are you coming to the factory picnic this weekend?',
        timestamp: '2023-09-15T10:30:00Z',
        read: true
      },
      {
        id: 'msg4',
        senderId: 'user2',
        recipientId: 'user1',
        content: 'Wouldn\'t miss it! I\'m bringing my special candy apple dip.',
        timestamp: '2023-09-15T10:35:00Z',
        read: false
      }
    ],
    'user1_user3': [
      {
        id: 'msg5',
        senderId: 'user3',
        recipientId: 'user1',
        content: 'Tooty! I heard your new chocolate mix is amazing!',
        timestamp: '2023-09-14T15:20:00Z',
        read: true
      },
      {
        id: 'msg6',
        senderId: 'user1',
        recipientId: 'user3',
        content: 'Thanks Berry! I added a hint of cherry. Want to try some tomorrow?',
        timestamp: '2023-09-14T15:30:00Z',
        read: true
      },
      {
        id: 'msg7',
        senderId: 'user3',
        recipientId: 'user1',
        content: 'Absolutely! I\'ll stop by your station after lunch.',
        timestamp: '2023-09-14T15:35:00Z',
        read: false
      }
    ]
  };
};

// Generate notifications
export const generateNotifications = () => {
  return [
    {
      id: 'notif1',
      userId: 'user1',
      type: 'like',
      content: 'Ginger Snap liked your post',
      relatedId: 'post3',
      timestamp: '2023-09-15T16:30:00Z',
      read: false
    },
    {
      id: 'notif2',
      userId: 'user1',
      type: 'comment',
      content: 'Berry Bubble commented on your post',
      relatedId: 'post1',
      timestamp: '2023-09-15T14:45:00Z',
      read: true
    },
    {
      id: 'notif3',
      userId: 'user1',
      type: 'friend_request',
      content: 'You have a new friend request from Caramel Swirl',
      relatedId: 'req1',
      timestamp: '2023-09-15T09:20:00Z',
      read: false
    }
  ];
};

// Mock login function
export const mockLogin = (email, password) => {
  // For demo purposes, any password works
  const user = users.find(u => u.email === email);
  if (user) {
    return {
      success: true,
      user: { ...user }
    };
  }
  return {
    success: false,
    message: 'User not found'
  };
};

// For creating new posts
export const createNewPost = (userId, postData) => {
  const newPost = {
    id: 'post_' + Date.now(),
    userId,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
    ...postData
  };
  
  return newPost;
}; 