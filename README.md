# Conversio Backend

Conversio Backend is the server-side API for a social chat application. It handles user authentication, profile management, post creation, comments, bookmarks, direct messaging, and real-time chat events using Socket.IO.

This project is built with Node.js, Express, MongoDB, and Mongoose, and is structured to run locally or deploy on Railway.

## Features

- User registration and login with JWT-based authentication
- User profile fetch and update
- Follow and follower endpoints
- Feed posts with pagination
- Create posts with optional image upload
- Like posts
- Create nested comments and fetch post comment threads
- Bookmark posts and fetch saved posts
- Direct message conversations
- Message history APIs
- Real-time chat rooms and typing indicators with Socket.IO

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- Multer
- JWT
- Railway-ready deployment config

## Project Structure

```text
config/         Environment, database, and CORS configuration
controllers/    Route handlers for auth, users, posts, chat, and bookmarks
middlewares/    Upload handling and global error middleware
models/         Mongoose models
routes/         API route definitions
services/       Shared service logic such as file URL generation
sockets/        Socket.IO setup
utils/          Shared utilities like async handler and custom errors
app.js          Express app configuration
server.js       Server bootstrap entrypoint
```

## API Modules

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Users

- `GET /api/users/:id`
- `GET /api/users?query=...`
- `PATCH /api/users/:id`
- `POST /api/users/:id/follow`
- `POST /api/users/:id/unfollow`
- `GET /api/users/:id/following`
- `GET /api/users/:id/followers`

### Posts

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts/:id/like`
- `POST /api/posts/:postId/comments`
- `GET /api/posts/:postId/comments`

### Bookmarks

- `POST /api/bookmark/:id`
- `GET /api/bookmark/:id`

### Chat

- `POST /api/chat/dm`
- `GET /api/chat/:conversationId/messages`
- `GET /api/chat/conversation`
- `POST /api/chat/message`

## Real-Time Events

Socket.IO is used for direct messaging and room-based communication.

- `joinRoom`
- `joinDm`
- `sendDm`
- `typing`

## Environment Variables

Copy `.env.example` to `.env` and configure the following values:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `PEPPER`
- `SALT_ROUNDS`
- `CLIENT_URL`
- `ALLOWED_ORIGINS`
- `UPLOAD_DIR`
- `UPLOAD_BASE_URL`
- `MAX_FILE_SIZE_MB`

## Run Locally

```bash
npm install
npm run dev
```

The app exposes a health endpoint at `GET /health`.

## Deployment

This backend is prepared for Railway deployment.

1. Push the repository to GitHub.
2. Create a Railway project from the repo.
3. Add the environment variables from `.env.example`.
4. Set `MONGO_URI` to your MongoDB connection string.
5. Deploy the service.

## Upload Storage Note

The app currently stores uploaded files on the local filesystem. That is fine for local development, but Railway uses ephemeral storage, so uploaded files can be lost after redeploys or restarts.

For production, the next recommended improvement is moving uploads to a cloud storage provider such as Cloudinary, Amazon S3, or Supabase Storage.
