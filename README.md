# Chat App Backend

This backend is structured to run locally and deploy cleanly on Railway.

## Environment variables

Copy `.env.example` to `.env` for local development and configure the same variables in Railway:

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

## Local development

```bash
npm install
npm run dev
```

## Railway deployment

1. Push this repository to GitHub.
2. Create a new Railway project from the repo.
3. Add the environment variables from `.env.example` in Railway.
4. Add a MongoDB connection string in `MONGO_URI`.
5. Deploy. Railway will run `npm start`.

## Important upload note

The app still uses local disk uploads by default. That works on Railway, but Railway storage is ephemeral, which means uploaded files can disappear after redeploys or restarts.

For production, the recommended next step is moving uploads to object storage like Cloudinary, S3, or Supabase Storage and storing the returned public URLs in MongoDB.
