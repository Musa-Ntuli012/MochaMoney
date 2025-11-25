# Deploying MochaMoney to Vercel

## Prerequisites

1. A Vercel account (free tier works)
2. MongoDB Atlas cluster with connection string
3. GitHub repository (optional, but recommended)

## Deployment Steps

### 1. Install Vercel CLI (optional, or use web interface)

```bash
npm i -g vercel
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A secure random string (keep this secret!)
- `DB_NAME` - Database name (default: `mochamoney`)
- `PORT` - Leave empty (Vercel handles this)

### 3. Deploy via Vercel CLI

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 4. Frontend API URL

After deployment, Vercel will give you a URL like `https://your-app.vercel.app`.

**You don't need to set `VITE_API_URL`** - the frontend will automatically use the same domain for API calls when `VITE_API_URL` is not set in production.

If you want to use a different API URL, you can set it in Vercel's environment variables:
- `VITE_API_URL` - Optional, leave empty to use same domain

### 5. Recurring Rules on Vercel

The auto-run for recurring expenses runs on each serverless function invocation. For more reliable scheduling:

**Option 1: Vercel Cron Jobs (Pro plan)**
- Add a `vercel.json` cron configuration (or use Vercel dashboard)
- Set up a cron job to hit `POST /api/cron/recurring` every hour
- Set `CRON_SECRET` environment variable for security

**Option 2: External Cron Service (Free)**
- Use a free service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com)
- Set it to call `POST https://your-app.vercel.app/api/cron/recurring` every hour
- Add `X-Cron-Secret` header with your `CRON_SECRET` value (optional but recommended)

**Option 3: Manual Trigger**
- Recurring rules will also run automatically when any API endpoint is called
- Less reliable but works without additional setup

## Important Notes

- The Express server runs as serverless functions on Vercel
- Each API route is a separate function (cold starts may add latency)
- MongoDB connection is reused across invocations when possible
- Recurring rules auto-run on function invocations (not on a timer)

## Troubleshooting

- **Connection refused errors**: Make sure `VITE_API_URL` points to your Vercel deployment
- **MongoDB connection issues**: Verify `MONGODB_URI` is set correctly in Vercel
- **CORS errors**: Vercel handles CORS automatically, but check if your frontend domain is allowed

