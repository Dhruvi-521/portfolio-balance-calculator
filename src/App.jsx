import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2, Wallet, RotateCcw, Coins, ChartNoAxesCombined, ShieldCheck } from 'lucide-react';
const initial = "balance" === 'value' ? [
  { id: 1, name: 'Bitcoin (BTC)', quantity: '0.25', price: '6200000' },
  { id: 2, name: 'Ethereum (ETH)', quantity: '2', price: '320000' },
  { id: 3, name: 'Solana (SOL)', quantity: '10', price: '12000' },
] : [
  { id: 1, name: 'Bitcoin (BTC)', quantity: '0.25', price: '6200000', targetPercent: '50' },
  { id: 2, name: 'Ethereum (ETH)', quantity: '2', price: '320000', targetPercent: '30' },
  { id: 3, name: 'Solana (SOL)', quantity: '10', price: '12000', targetPercent: '20' },
];
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value) || 0);
export default function App() {
  const [coins, setCoins] = useState(initial);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const totalInput = useMemo(() => coins.reduce((sum, c) => sum + Math.max(0, Number(c.quantity) || 0) * Math.max(0, Number(c.price) || 0), 0), [coins]);
  const allocation = coins.reduce((sum, c) => sum + (Number(c.targetPercent) || 0), 0);
  const update = (id, key, value) => { setCoins(old => old.map(c => c.id === id ? { ...c, [key]: value } : c)); setResult(null); setError(''); };
  const addCoin = () => { setCoins(old => [...old, { id: Date.now(), name: '', quantity: '', price: '', ...("balance" === 'balance' ? { targetPercent: '' } : {}) }]); setResult(null); };
  const removeCoin = (id) => { setCoins(old => old.length > 1 ? old.filter(c => c.id !== id) : old); setResult(null); };
  const reset = () => { setCoins(initial.map(c => ({ ...c }))); setResult(null); setError(''); };
  async function calculate() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ holdings: coins.map(c => ({ name: c.name, quantity: c.quantity, price: c.price, targetPercent: c.targetPercent })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Calculation failed.');
      setResult(data);
    } catch (e) { setError(e.message || 'Could not reach the calculator API. Start the app using npm run dev.'); }
    finally { setLoading(false); }
  }
  const targetValid = Math.abs(allocation - 100) < 0.001;
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><ChartNoAxesCombined size={21}/></span><span>Coinwise <small>CRYPTO TOOLS</small></span></a><span className="top-note"><span className="status-dot"/> Simple. Clear. In control.</span></header>
    <main id="top" className="main-content">
      <section className="hero"><div className="eyebrow"><span className="eyebrow-line"/>{"balance" === 'value' ? 'PORTFOLIO OVERVIEW' : 'PORTFOLIO PLANNER'}</div><h1>{"Portfolio Balance Calculator"}</h1><p>{"Enter current holdings and target allocation percentages to estimate the value and quantity to buy or sell. Percentages must total 100%."}</p><div className="hero-pills"><span><ShieldCheck size={15}/> No wallet connection</span><span><Coins size={15}/> Manual price inputs</span></div></section>
      <div className="workspace">
        <section className="panel input-panel"><div className="panel-heading"><div><h2>Your coins</h2><p>{"balance" === 'value' ? 'Add the coins you currently hold.' : 'Enter holdings and your target mix.'}</p></div><button className="text-button" onClick={reset}><RotateCcw size={15}/> Reset</button></div>
          <div className="coin-table"><div className={'table-head ' + ("balance" === 'balance' ? 'balance-grid' : '')}><span>COIN / SYMBOL</span><span>QUANTITY</span><span>PRICE (₹)</span>{"balance" === 'balance' && <span>TARGET %</span>}<span/></div>
            {coins.map((coin, index) => <div className={'coin-row ' + ("balance" === 'balance' ? 'balance-grid' : '')} key={coin.id}><div className="coin-name-cell"><span className={'coin-icon coin-icon-' + (index % 4)}>{(coin.name.trim()[0] || '?').toUpperCase()}</span><input aria-label="Coin name" placeholder="e.g. Bitcoin" value={coin.name} onChange={e => update(coin.id, 'name', e.target.value)}/></div><input aria-label="Quantity owned" inputMode="decimal" type="number" min="0" step="any" placeholder="0.00" value={coin.quantity} onChange={e => update(coin.id, 'quantity', e.target.value)}/><input aria-label="Price per coin in rupees" inputMode="decimal" type="number" min="0" step="any" placeholder="0.00" value={coin.price} onChange={e => update(coin.id, 'price', e.target.value)}/>{"balance" === 'balance' && <div className="percent-input"><input aria-label="Target allocation percentage" inputMode="decimal" type="number" min="0" max="100" step="any" placeholder="0" value={coin.targetPercent} onChange={e => update(coin.id, 'targetPercent', e.target.value)}/><span>%</span></div>}<button className="icon-button remove-button" title="Remove coin" aria-label="Remove coin" onClick={() => removeCoin(coin.id)} disabled={coins.length === 1}><Trash2 size={16}/></button></div>)}
          </div>
          <button className="add-button" onClick={addCoin}><Plus size={16}/> Add another coin</button>
          {"balance" === 'balance' && <div className={'allocation-status ' + (targetValid ? 'valid' : 'invalid')}><span>Target allocation total</span><strong>{allocation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%</strong><small>{targetValid ? 'Your allocation adds up to 100%.' : `Adjust by ${(100 - allocation).toLocaleString('en-IN', { maximumFractionDigits: 2 })} percentage points to reach 100%.`}</small></div>}
          <div className="input-total"><span>Current portfolio value</span><strong>{money(totalInput)}</strong></div>
          <button className="primary-button" onClick={calculate} disabled={loading || ("balance" === 'balance' && !targetValid)}>{loading ? 'Calculating…' : "balance" === 'value' ? 'Calculate portfolio value' : 'Calculate target balance'} <span>→</span></button>
          {error && <p className="error-message" role="alert">{error}</p>}
          <p className="fine-print">Values use the prices you enter. This tool does not fetch live market prices.</p>
        </section>
        <section className="panel results-panel"><div className="panel-heading"><div><h2>{"balance" === 'value' ? 'Portfolio summary' : 'Rebalancing plan'}</h2><p>{"balance" === 'value' ? 'A clear view of your portfolio.' : 'Estimated changes to reach your target.'}</p></div><span className="result-icon"><Wallet size={19}/></span></div>
          {!result ? <div className="empty-state"><div className="empty-illustration"><ChartNoAxesCombined size={32}/></div><h3>Your results will appear here</h3><p>{"balance" === 'value' ? 'Enter your coin details and calculate to see your total value and each coin’s share.' : 'Set your target percentages, then calculate to see estimated buy and sell amounts.'}</p><div className="preview-line"><span>Calculation status</span><span className="waiting-dot">Ready when you are</span></div></div> : <div className="results-content"><div className="total-card"><span>{"balance" === 'value' ? 'TOTAL PORTFOLIO VALUE' : 'CURRENT PORTFOLIO VALUE'}</span><strong>{money(result.total)}</strong><small>{result.holdings.length} assets included</small></div>
            <div className="breakdown-title"><h3>{"balance" === 'value' ? 'Asset breakdown' : 'Target allocation & action'}</h3><span>{result.holdings.length} coins</span></div>
            <div className="result-list">{result.holdings.map((coin, i) => <div className="result-item" key={coin.name + i}><div className="result-item-top"><span className={'coin-icon small coin-icon-' + (i % 4)}>{(coin.name[0] || '?').toUpperCase()}</span><div className="result-asset"><strong>{coin.name}</strong><small>{coin.quantity.toLocaleString('en-IN', { maximumFractionDigits: 8 })} coins</small></div><div className="result-amount"><strong>{money(coin.value)}</strong><small>{coin.share.toFixed(2)}% of portfolio</small></div></div><div className="share-track"><span style={{ width: `${Math.min(100, coin.share)}%` }}/></div>{"balance" === 'balance' && <div className="target-details"><div><span>Target value</span><strong>{money(coin.targetValue)}</strong></div><div><span>{coin.difference > 0.005 ? 'Estimated buy' : coin.difference < -0.005 ? 'Estimated sell' : 'Action'}</span><strong className={coin.difference > 0.005 ? 'buy-text' : coin.difference < -0.005 ? 'sell-text' : ''}>{Math.abs(coin.difference) < 0.005 ? 'No change' : money(Math.abs(coin.difference))}</strong></div><div><span>Target quantity</span><strong>{coin.targetQuantity === null ? 'Enter price' : coin.targetQuantity.toLocaleString('en-IN', { maximumFractionDigits: 8 })}</strong></div></div>}</div>)}</div>
            {"balance" === 'balance' && <div className="notice"><ShieldCheck size={17}/><p>Estimates assume your total portfolio value stays the same. Trading fees, taxes, price changes, and minimum order sizes are not included.</p></div>}
            <button className="secondary-button" onClick={() => { setResult(null); setError(''); }}>Edit inputs</button>
          </div>}
        </section>
      </div>
      <section className="how-section"><div><span className="step-number">01</span><div><strong>Enter your holdings</strong><p>Use your own quantities and current prices.</p></div></div><div><span className="step-number">02</span><div><strong>Run the calculation</strong><p>Your inputs are checked by the calculator API.</p></div></div><div><span className="step-number">03</span><div><strong>Review your result</strong><p>Use the breakdown as an informational estimate.</p></div></div></section>
    </main><footer className="footer"><span>Coinwise <span className="footer-dot">·</span> Built for learning</span><span>Not financial advice. Prices are user-provided estimates.</span></footer>
  </div>;
}
