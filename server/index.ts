import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
function getNextRunDate(current: Date, frequency: RecurringFrequency): string {
  const next = new Date(current);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

async function executeRecurringRule(rule: any) {
  await connectClient();
  const db = client.db(DATABASE_NAME);
  const now = new Date();
  const nextRunDate = new Date(rule.nextRun);
  const transaction = {
    userId: rule.userId,
    type: rule.type,
    categoryId: rule.categoryId,
    amount: rule.amount,
    currency: rule.currency,
    date: now.toISOString(),
    description: rule.name,
    recurringId: rule._id.toString(),
    createdAt: now.toISOString(),
  };

  await db.collection('transactions').insertOne(transaction);
  await db.collection('recurring_rules').updateOne(
    { _id: new ObjectId(rule._id) },
    {
      $set: {
        nextRun: getNextRunDate(nextRunDate, rule.frequency as RecurringFrequency),
        lastRun: now.toISOString(),
      },
    }
  );
}

async function runDueRecurringRules() {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const nowIso = new Date().toISOString();
    const dueRules = await db
      .collection('recurring_rules')
      .find({ active: true, nextRun: { $lte: nowIso } })
      .toArray();
    for (const rule of dueRules) {
      await executeRecurringRule(rule);
    }
  } catch (error) {
    console.error('Recurring runner error', error);
  }
}

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

const DATABASE_NAME = process.env.DB_NAME || 'mochamoney';
const PORT = Number(process.env.PORT) || 4000;
const RECURRING_INTERVAL_MS = Number(process.env.RECURRING_INTERVAL_MS) || 60_000;

const client = new MongoClient(MONGODB_URI);

async function connectClient() {
  if (!client.topology?.isConnected()) {
    await client.connect();
  }
}

const app = express();
app.use(cors());
app.use(express.json());

interface AuthedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

function createToken(payload: { id: string; email: string }) {
  return jwt.sign({ sub: payload.id, email: payload.email }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

const authMiddleware = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const users = db.collection('users');
    const { email, password, displayName, currency = 'ZAR' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = {
      email,
      passwordHash,
      displayName,
      currency,
      createdAt: new Date().toISOString(),
    };

    const result = await users.insertOne(doc);
    const user = { _id: result.insertedId, email, displayName, currency, createdAt: doc.createdAt };
    const token = createToken({ id: result.insertedId.toString(), email });
    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const users = db.collection('users');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await users.findOne({ email });
    if (!user?.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken({ id: user._id.toString(), email: user.email });
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(req.user!.id) }, { projection: { passwordHash: 0 } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/auth/me', authMiddleware, async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const users = db.collection('users');
    const { displayName, currency } = req.body;
    const update = {
      ...(displayName !== undefined ? { displayName } : {}),
      ...(currency !== undefined ? { currency } : {}),
      updatedAt: new Date().toISOString(),
    };
    await users.updateOne({ _id: new ObjectId(req.user!.id) }, { $set: update });
    const user = await users.findOne({ _id: new ObjectId(req.user!.id) }, { projection: { passwordHash: 0 } });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.use('/api/transactions', authMiddleware);

app.get('/api/transactions', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const items = await db
      .collection('transactions')
      .find({ userId: req.user?.id })
      .sort({ date: -1 })
      .toArray();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const doc = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('transactions').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.delete('/api/transactions/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const result = await db
      .collection('transactions')
      .deleteOne({ _id: new ObjectId(id), userId: req.user?.id });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

app.use('/api/budgets', authMiddleware);

app.get('/api/budgets', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const budgets = await db.collection('budgets').find({ userId: req.user?.id }).sort({ createdAt: -1 }).toArray();
    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.post('/api/budgets', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const doc = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('budgets').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

app.put('/api/budgets/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const { limit, period } = req.body;
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (limit !== undefined) update.limit = limit;
    if (period) update.period = period;
    const result = await db
      .collection('budgets')
      .findOneAndUpdate({ _id: new ObjectId(id), userId: req.user?.id }, { $set: update }, { returnDocument: 'after' });
    if (!result) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

app.delete('/api/budgets/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const result = await db.collection('budgets').deleteOne({ _id: new ObjectId(id), userId: req.user?.id });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

app.use('/api/savings', authMiddleware);

app.get('/api/savings', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const goals = await db
      .collection('savings_goals')
      .find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

app.post('/api/savings', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const doc = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('savings_goals').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

app.put('/api/savings/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const { current, target, color } = req.body;
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (current !== undefined) update.current = current;
    if (target !== undefined) update.target = target;
    if (color !== undefined) update.color = color;
    const goal = await db
      .collection('savings_goals')
      .findOneAndUpdate({ _id: new ObjectId(id), userId: req.user?.id }, { $set: update }, { returnDocument: 'after' });
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

app.delete('/api/savings/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const result = await db
      .collection('savings_goals')
      .deleteOne({ _id: new ObjectId(id), userId: req.user?.id });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

app.use('/api/investments', authMiddleware);

app.get('/api/investments', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const investments = await db
      .collection('investments')
      .find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

app.post('/api/investments', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const doc = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    const result = await db.collection('investments').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

app.put('/api/investments/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const { currentValue, invested, units, type, platform } = req.body;
    const update: Record<string, unknown> = { lastUpdated: new Date().toISOString() };
    if (currentValue !== undefined) update.currentValue = currentValue;
    if (invested !== undefined) update.invested = invested;
    if (units !== undefined) update.units = units;
    if (type) update.type = type;
    if (platform) update.platform = platform;
    const investment = await db
      .collection('investments')
      .findOneAndUpdate({ _id: new ObjectId(id), userId: req.user?.id }, { $set: update }, { returnDocument: 'after' });
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.json(investment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

app.delete('/api/investments/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const result = await db
      .collection('investments')
      .deleteOne({ _id: new ObjectId(id), userId: req.user?.id });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

app.use('/api/emergency', authMiddleware);

app.get('/api/emergency', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const fund = await db.collection('emergency_funds').findOne({ userId: req.user?.id });
    res.json(fund);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch emergency fund' });
  }
});

app.post('/api/emergency', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const doc = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    const result = await db.collection('emergency_funds').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create emergency fund' });
  }
});

app.put('/api/emergency/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const { current, target } = req.body;
    const update: Record<string, unknown> = { lastUpdated: new Date().toISOString() };
    if (current !== undefined) update.current = current;
    if (target !== undefined) update.target = target;
    const fund = await db
      .collection('emergency_funds')
      .findOneAndUpdate({ _id: new ObjectId(id), userId: req.user?.id }, { $set: update }, { returnDocument: 'after' });
    if (!fund) {
      return res.status(404).json({ error: 'Emergency fund not found' });
    }
    res.json(fund);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update emergency fund' });
  }
});

app.delete('/api/emergency/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const result = await db
      .collection('emergency_funds')
      .deleteOne({ _id: new ObjectId(id), userId: req.user?.id });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Emergency fund not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete emergency fund' });
  }
});

app.use('/api/recurring', authMiddleware);

app.get('/api/recurring', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const rules = await db
      .collection('recurring_rules')
      .find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(rules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recurring rules' });
  }
});

app.post('/api/recurring', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const doc = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date().toISOString(),
      nextRun: req.body.nextRun || new Date().toISOString(),
      active: req.body.active ?? true,
    };
    const result = await db.collection('recurring_rules').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create recurring rule' });
  }
});

app.put('/api/recurring/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const update = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    const rule = await db
      .collection('recurring_rules')
      .findOneAndUpdate({ _id: new ObjectId(id), userId: req.user?.id }, { $set: update }, { returnDocument: 'after' });
    if (!rule) {
      return res.status(404).json({ error: 'Recurring rule not found' });
    }
    res.json(rule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update recurring rule' });
  }
});

app.delete('/api/recurring/:id', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const result = await db
      .collection('recurring_rules')
      .deleteOne({ _id: new ObjectId(id), userId: req.user?.id });
    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Recurring rule not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete recurring rule' });
  }
});

app.post('/api/recurring/:id/run', async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const { id } = req.params;
    const rule = await db.collection('recurring_rules').findOne({ _id: new ObjectId(id), userId: req.user?.id });

    if (!rule) {
      return res.status(404).json({ error: 'Recurring rule not found' });
    }

    const now = new Date();
    const nextRunDate = new Date(rule.nextRun);
    if (nextRunDate > now) {
      return res.status(400).json({ error: 'Rule is not due yet' });
    }

    await executeRecurringRule(rule);
    const updatedRule = await db.collection('recurring_rules').findOne({ _id: new ObjectId(id) });
    res.json({ rule: updatedRule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to run recurring rule' });
  }
});

// Cron endpoint for running due recurring rules (can be called by Vercel Cron or external services)
app.post('/api/cron/recurring', async (req: Request, res: Response) => {
  // Optional: Protect with a secret token
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await runDueRecurringRules();
    res.json({ success: true, message: 'Recurring rules processed' });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({ error: 'Failed to process recurring rules' });
  }
});

app.get('/api/reports/transactions.csv', authMiddleware, async (req: AuthedRequest, res: Response) => {
  try {
    await connectClient();
    const db = client.db(DATABASE_NAME);
    const transactions = await db
      .collection('transactions')
      .find({ userId: req.user?.id })
      .sort({ date: -1 })
      .toArray();

    const header = [
      'type',
      'categoryId',
      'amount',
      'currency',
      'date',
      'description',
      'recurringId',
    ];
    const rows = transactions.map((t) =>
      [
        t.type,
        t.categoryId,
        t.amount,
        t.currency,
        t.date,
        (t.description || '').replace(/"/g, '""'),
        t.recurringId || '',
      ].join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

// Export for Vercel serverless
export default app;

// Only start server if running locally
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`MochaMoney API server running on http://localhost:${PORT}`);
    runDueRecurringRules();
    setInterval(runDueRecurringRules, RECURRING_INTERVAL_MS);
  });
} else {
  // On Vercel, run recurring rules on cold start (they'll run on each request)
  // For production, consider using Vercel Cron Jobs for scheduled tasks
  runDueRecurringRules();
}

