# SigmaGPT

SigmaGPT is a ChatGPT-style AI chat application built with React, Express, MongoDB, and the OpenAI API. It supports authenticated chat history, guest conversations, smart thread titles, markdown rendering, syntax-highlighted code blocks, dark/light mode, and a responsive chat interface.

## Live Demo

[https://sigma-gpt-frontend-v2zn.onrender.com/](https://sigma-gpt-frontend-v2zn.onrender.com/)

You can create an account or continue as a guest to try the chat experience.

## Project Highlights

- ChatGPT-style conversational interface
- Login, signup, and guest mode
- Saved chat threads for authenticated users
- AI-generated chat titles
- Inline thread rename
- Delete confirmation for chat threads
- Full conversation context sent to AI for better replies
- Markdown rendering with syntax-highlighted code blocks
- Copy buttons for code blocks and full messages
- Auto-growing textarea with multiline paste support
- Auto-scroll to latest message
- Dark/light theme toggle with saved preference
- Responsive layout with mobile sidebar drawer

## Case Study

### Problem

Most basic AI chat demos only send a single prompt and display a response. They usually do not provide a real user workflow: authentication, saved conversations, thread management, polished message rendering, or a responsive interface.

### Solution

SigmaGPT turns a simple AI chat idea into a more complete product-style experience. Users can sign up, continue as guests, create and revisit chat threads, rename or delete conversations, and interact with AI responses in a clean markdown-based chat UI.

The app focuses on practical chat usability: persistent threads, readable code blocks, copy actions, smart titles, theme support, error handling, loading states, and mobile-friendly navigation.

### Engineering Focus

- JWT-based authentication
- MongoDB models for users, threads, and messages
- Protected backend routes for saved chat history
- OpenAI chat completion integration
- Conversation context memory for authenticated chats
- Component-based React frontend
- Theme system using CSS variables
- Responsive layout with sidebar behavior for mobile screens
- Safer UX around destructive actions and duplicate sends

## Tech Stack

- React
- Vite
- React Router
- CSS Modules
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- OpenAI API
- React Markdown
- rehype-highlight
- Render deployment

## Features

- User signup and login
- Guest mode without saved history
- Protected chat workspace
- Create new chat threads
- View previous chat history
- Open old conversations
- Rename chat threads inline
- Delete chat threads with confirmation
- AI-generated short thread titles
- Full chat context memory
- Markdown response rendering
- Syntax-highlighted code blocks
- Copy code and full messages
- Auto-growing multiline textarea
- Loading and error states
- Dark/light theme toggle
- Responsive desktop and mobile UI

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ashardeveloper/sigma-gpt.git
cd sigma-gpt
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend` folder:

```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The backend will run on:

```txt
http://localhost:8080
```

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
```

Create a `.env` file inside the `Frontend` folder:

```env
VITE_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Open the app at:

```txt
http://localhost:5173
```

## Deployment Notes

The frontend is deployed on Render:

[https://sigma-gpt-frontend-v2zn.onrender.com/](https://sigma-gpt-frontend-v2zn.onrender.com/)

The backend requires environment variables for MongoDB, JWT authentication, OpenAI API access, and the deployed frontend URL for CORS.

## Scope

SigmaGPT is an AI chat application. It is not intended to replace ChatGPT or provide guaranteed factual accuracy.

AI responses can be incorrect, so important information should be verified.
