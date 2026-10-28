function calculate(body) {
  const { holdings = [] } = body || {};
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
    const targetPercent = Number(coin.targetPercent || 0);
    if (!Number.isFinite(targetPercent) || targetPercent < 0 || targetPercent > 100) throw new Error('Target percentages must be between 0 and 100.');
    return { name, quantity, price, value: quantity * price, targetPercent };
  });
  const total = clean.reduce((sum, c) => sum + c.value, 0);
  if (Math.abs(clean.reduce((sum, c) => sum + c.targetPercent, 0) - 100) > 0.001) throw new Error('Target allocation percentages must total exactly 100%.');
  return { total, holdings: clean.map((c) => ({ ...c, share: total > 0 ? c.value / total * 100 : 0, targetValue: total * c.targetPercent / 100, difference: total * c.targetPercent / 100 - c.value, targetQuantity: c.price > 0 ? total * c.targetPercent / 100 / c.price : null })) };
}
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST to calculate.' });
  try { return res.status(200).json(calculate(req.body)); }
  catch (error) { return res.status(400).json({ error: error.message || 'Please check your inputs.' }); }
}
