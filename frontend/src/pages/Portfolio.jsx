import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js'
import PortfolioTable from '../components/PortfolioTable'
import StatCard from '../components/StatCard'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const PALETTE = ['#10b981','#6366f1','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6']

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/trade/portfolio')
      setPortfolio(data)
    } catch (e) {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const stocks = portfolio?.stocks || []
  const pnl = portfolio?.profitLoss || 0

  const donutData = {
    labels: stocks.map(s => s.symbol),
    datasets: [{
      data: stocks.map(s => s.totalValue),
      backgroundColor: PALETTE,
      borderColor: '#0a0f1e',
      borderWidth: 3
    }]
  }

  const barData = {
    labels: stocks.map(s => s.symbol),
    datasets: [
      {
        label: 'Invested',
        data: stocks.map(s => parseFloat((s.buyPrice * s.quantity).toFixed(2))),
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderRadius: 6
      },
      {
        label: 'Current',
        data: stocks.map(s => s.totalValue),
        backgroundColor: 'rgba(16,185,129,0.7)',
        borderRadius: 6
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.raw}` } }
    },
    scales: {
      x: { grid: { color: '#1e293b' }, ticks: { color: '#475569' } },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#475569', callback: v => `$${v}` } }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">💼 My Portfolio</h1>
        <p className="text-dark-500 text-sm mt-0.5">Track and manage your investments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Holdings" value={stocks.length} sub="Active positions" icon="📦" color="blue" />
        <StatCard title="Invested" value={`$${(portfolio?.totalInvestment||0).toFixed(2)}`} sub="Total cost basis" icon="📥" color="purple" />
        <StatCard title="Market Value" value={`$${(portfolio?.currentValue||0).toFixed(2)}`} sub="Today's value" icon="💹" color="green" />
        <StatCard title="P & L" value={`${pnl>=0?'+':''}$${pnl.toFixed(2)}`}
          sub={`${pnl>=0?'+':''}${portfolio?.totalInvestment ? ((pnl/portfolio.totalInvestment)*100).toFixed(2) : '0.00'}% return`}
          icon={pnl>=0?'🟢':'🔴'} color={pnl>=0?'green':'red'} trend={pnl>=0?'up':'down'} />
      </div>

      {/* Charts row */}
      {stocks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-white font-bold mb-1">Asset Allocation</h3>
            <p className="text-dark-500 text-xs mb-4">% by current value</p>
            <div className="h-56">
              <Doughnut data={donutData} options={{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'right', labels:{ color:'#94a3b8', font:{ size:11 }, padding:12 } } } }} />
            </div>
          </div>
          <div className="card">
            <h3 className="text-white font-bold mb-1">Invested vs Current Value</h3>
            <p className="text-dark-500 text-xs mb-4">Per stock comparison</p>
            <div className="h-56">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <PortfolioTable stocks={stocks} onUpdate={fetch} />
    </div>
  )
}
