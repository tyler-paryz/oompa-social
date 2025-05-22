# Oompa Social

A social networking application for Oompa Loompas to connect. This application includes features such as profiles, feeds, friend requests, messaging, and post creation with rich media uploads. It's a demo application with Pendo integration for analytics and user testing.

![Oompa Social Screenshot](https://raw.githubusercontent.com/tyler-paryz/oompa-social/main/public/screenshot.svg)

## Features

- User authentication with demo accounts
- News feed with posts from other Oompa Loompas
- User profiles with personal information and posts
- Friend requests and connections management
- Messaging system between users
- Post creation with media upload capability
- Pendo integration for tracking user interactions

## Technology Stack

- Vue 3
- Vite
- Pinia for state management
- Vue Router

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/tyler-paryz/oompa-social.git
   cd oompa-social
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Build for production
   ```
   npm run build
   ```

## Demo Credentials

You can log in with any of these emails (any password will work):
- tooty@oompa.social - Tooty Fruity, Chocolate Mixer
- ginger@oompa.social - Ginger Snap, Candy Inspector
- berry@oompa.social - Berry Bubble, Bubblegum Technician
- fizzy@oompa.social - Fizzy Lifting, Fizzy Drink Developer
- caramel@oompa.social - Caramel Swirl, Toffee Stretcher

## Deployment

This application is ready to be deployed to Vercel.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftyler-paryz%2Foompa-social)

1. Push your code to GitHub
2. Connect your GitHub account to Vercel
3. Import the repository in Vercel
4. Deploy

Vercel will automatically detect the Vite configuration and deploy your application.

## Project Structure

```
oompa-social/
├── public/              # Static assets
│   └── avatars/         # User avatar images
├── src/
│   ├── components/      # Vue components
│   ├── router/          # Route definitions
│   ├── services/        # API services and mock data
│   ├── stores/          # Pinia stores
│   └── views/           # Page components
├── index.html
└── package.json
```

## License

MIT

## Acknowledgments

- Willy Wonka for providing employment opportunities to Oompa Loompas
- Pendo for analytics tools
