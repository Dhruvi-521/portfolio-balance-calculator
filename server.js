import express from 'express';
const app = express();
app.use(express.json());
app.post('/api/calculate', (req, res) => {
  try {
    const result = calculate(req.body);
    res.json(result);
  } catch (error) { res.status(400).json({ error: error.message || 'Please check your inputs.' }); }
});
function calculate(body) {
  const { holdings = [] } = body;
  if (!Array.isArray(holdings) || holdings.length === 0) throw new Error('Add at least one coin to calculate.');
  const clean = holdings.map((coin) => {
    const name = String(coin.name || '').trim();
    if (coin.quantity === '' || coin.quantity === null || coin.quantity === undefined) throw new Error('Enter a quantity for every coin.');
    if (coin.price === '' || coin.price === null || coin.price === undefined) throw new Error('Enter a price for every coin.');
    const quantity = Number(coin.quantity);
    const price = Number(coin.price);
    if (!name) throw new Error('Enter a coin name or symbol for every row.');
    if (!Number.isFinite(quantity) || quantity < 0) throw new Error('Coin quantity must be zero or more.');
    if (!Number.isFinite(price) || price < 0) throw new Error('Coin price must be zero or more.');
    return { name, quantity, price, value: quantity * price, targetPercent: Number(coin.targetPercent || 0) };
  });
  const total = clean.reduce((sum, c) => sum + c.value, 0);
  if (Math.abs(clean.reduce((sum, c) => sum + c.targetPercent, 0) - 100) > 0.001) {
    throw new Error('Target allocation percentages must total exactly 100%.');
    }
  return { total, holdings: clean.map((c) => ({ ...c, share: total > 0 ? (c.value / total) * 100 : 0, targetValue: total * c.targetPercent / 100, difference: total * c.targetPercent / 100 - c.value, targetQuantity: c.price > 0 ? (total * c.targetPercent / 100) / c.price : null })) };
}
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.listen(5000, () => console.log('Local API running at http://localhost:5000'));
