# MochaMoney - Coffee-themed Budget Tracker

**Brew Your Financial Future**

A premium, coffee-themed personal finance tool built with React, TypeScript, and MongoDB Atlas. Track expenses, manage budgets, set savings goals, and monitor investments all in one beautiful, coffee-inspired interface.

## Features

- ☕ **Dashboard** - Overview of your financial health
- 💰 **Expense Tracking** - Record and categorize expenses
- 🔄 **Recurring Expenses** - Manage recurring transactions
- 📊 **Budgets** - Set and track category-level budgets
- 🎯 **Savings Goals** - Create and track stash savings goals
- 📈 **Investments** - Track EasyEquities and EasyProperties positions
- 🆘 **Emergency Fund** - Monitor and manage emergency savings
- 📄 **Reports & Export** - Generate reports and export data

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with custom coffee theme
- **State Management**: Zustand + React Query
- **Routing**: React Router
- **Animations**: Framer Motion
- **Database**: MongoDB Atlas (via lightweight Express API proxy)
- **PWA**: Service Worker + IndexedDB caching

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas cluster + database user

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MochaMoney
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and update:
- `MONGODB_URI` with your Atlas connection string
- `JWT_SECRET` with a random string for signing tokens
- `VITE_API_URL` if you change the server port

4. Start the API server (holds the MongoDB connection string):
```bash
npm run server
```

5. In a separate terminal start the Vite dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Create database `mochamoney` with the collections listed in the SRS
3. Create a database user with least-privilege access to that DB
4. Copy the connection string into `.env.local` as `MONGODB_URI`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment

### Deploy to Vercel (Recommended)

MochaMoney is configured to deploy to Vercel with both frontend and API support:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or connect your GitHub repository to Vercel for automatic deployments.

3. **Set Environment Variables** in Vercel dashboard:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string
   - `DB_NAME` - Database name (default: `mochamoney`)
   - `CRON_SECRET` - Optional, for securing the recurring rules cron endpoint

4. **Recurring Rules**: Set up a cron job (Vercel Pro or external service) to call `POST /api/cron/recurring` periodically.

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── store/           # Zustand stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── theme/           # Theme and global styles
```

## Design System

The app uses a coffee-themed design system with:
- **Colors**: Espresso (#3F2A22), Coffee Bean (#8B5E3C), Milk Foam (#E8D7B9)
- **Typography**: Playfair Display (headlines), Inter (body), Outfit (numbers)
- **Components**: Custom-styled components with coffee-inspired gradients

## Security Notes

⚠️ **Important**: Never embed MongoDB Atlas credentials directly in client-side code. Keep the URI inside the API server (`npm run server`) or other backend runtime and lock the DB user to the minimum privileges needed.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

