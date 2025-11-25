export type MongoDocument = {
  _id: string;
  [key: string]: unknown;
};

export interface User extends MongoDocument {
  email: string;
  displayName?: string;
  currency: string;
  initialBalance?: number;
  createdAt: string;
}

export interface Transaction extends MongoDocument {
  userId: string;
  type: 'expense' | 'income' | 'transfer' | 'stash' | 'investment';
  categoryId: string;
  amount: number;
  currency: string;
  date: string; // ISO
  description?: string;
  receiptUrl?: string;
  recurringId?: string | null;
  createdAt: string;
}

export interface Category extends MongoDocument {
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'expense' | 'income';
  createdAt: string;
}

export interface RecurringRule extends MongoDocument {
  userId: string;
  name: string;
  type: 'expense' | 'income';
  categoryId: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRun: string; // ISO
  active: boolean;
  createdAt: string;
}

export interface SavingsGoal extends MongoDocument {
  userId: string;
  name: string;
  target: number;
  current: number;
  currency: string;
  color?: string;
  icon?: string;
  deadline?: string; // ISO
  createdAt: string;
}

export interface Investment extends MongoDocument {
  userId: string;
  name: string;
  type: 'equity' | 'property' | 'other';
  platform: 'EasyEquities' | 'EasyProperties' | 'Other';
  units?: number;
  invested: number;
  currentValue: number;
  currency: string;
  lastUpdated: string; // ISO
  createdAt: string;
}

export interface EmergencyFund extends MongoDocument {
  userId: string;
  target: number;
  current: number;
  currency: string;
  lastUpdated: string; // ISO
}

export interface Budget extends MongoDocument {
  userId: string;
  categoryId: string;
  limit: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string; // ISO
  endDate?: string; // ISO
  createdAt: string;
}

export interface Settings extends MongoDocument {
  userId: string;
  theme: 'coffee'; // locked to coffee
  currency: string;
  textSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  autoSync: boolean;
}

