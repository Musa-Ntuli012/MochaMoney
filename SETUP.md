# MochaMoney Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure MongoDB Atlas**
   
   a. Create a cluster and database named `mochamoney`
   
   b. Create a database user (read/write on `mochamoney`)
   
   c. Keep the connection string handy (`mongodb+srv://...`)
   
3. **Set Environment Variables**
   
   Copy the provided example file and fill in the values:
   ```bash
   cp env.example .env.local
   ```
   - `MONGODB_URI` — paste the Atlas connection string
   - `JWT_SECRET` — any long random string for signing tokens
   - `VITE_API_URL` — defaults to `http://localhost:4000`

4. **Set Up Database Collections**
   
   In your MongoDB Atlas cluster, create the following collections in a database named `mochamoney`:
   - `users`
   - `transactions`
   - `categories`
   - `recurring_rules`
   - `savings_goals`
   - `investments`
   - `emergency_funds`
   - `budgets`
   - `settings`

5. **Start API Server**
   ```bash
   npm run server
   ```

6. **Start Vite Dev Server**
   ```bash
   npm run dev
   ```

## API Server Configuration

- Runs on `http://localhost:4000` by default
- Reads `MONGODB_URI`, `JWT_SECRET`, `DB_NAME`, and `PORT` from `.env.local`
- Auth endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Transactions endpoints (JWT protected):
  - `GET /api/transactions`
  - `POST /api/transactions`
  - `DELETE /api/transactions/:id`

## Development

- **API Server**: `npm run server` (runs on http://localhost:4000)
- **Dev Server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Project Structure

```
MochaMoney/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   └── theme/          # Theme CSS
├── public/             # Static assets
└── Logo.png           # App logo
```

## Troubleshooting

### "User not authenticated" errors
- Ensure you're logged in; tokens expire after 7 days
- Confirm the frontend is pointing to the correct `VITE_API_URL`
- Check that the API server is running and `JWT_SECRET` matches on both environments

### Database connection issues
- Verify `MONGODB_URI` in `.env.local`
- Ensure the Atlas user has read/write access to `mochamoney`
- Ensure collections exist in the database

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Clear `node_modules` and reinstall if needed

## Next Steps

1. Register a user via the Auth screen
2. Test add/delete transactions
3. Expand the API/endpoints for other collections
4. Customize the theme if needed
5. Deploy frontend + API server (Vercel/Netlify/Render)

