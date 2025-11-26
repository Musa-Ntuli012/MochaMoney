import 'dotenv/config';
import app, { runDueRecurringRules, RECURRING_INTERVAL_MS } from '../api/[...]';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`MochaMoney API server running on http://localhost:${PORT}`);
  runDueRecurringRules();
  setInterval(runDueRecurringRules, RECURRING_INTERVAL_MS);
});

