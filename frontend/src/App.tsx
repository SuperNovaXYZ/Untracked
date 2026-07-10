import { useState, useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const CATEGORY_COLORS: Record<string, string> = {
  Coding: '#7F77DD',
  Gaming: '#1D9E75',
  Learning: '#378ADD',
  Youtube: '#E24B4A',
  Other: '#888780',
}

function App() {
  const [entries, setEntries] = useState<any[]>([])
  const [activity, setActivity] = useState('')
  const [category, setCategory] = useState('Coding')
  const [duration, setDuration] = useState(0)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/entries')
      .then(res => res.json())
      .then(data => setEntries(data))
  }, [])

  useEffect(() => {
    if (!chartRef.current) return

    const data = ['Coding', 'Gaming', 'Learning', 'Youtube', 'Other'].map(cat =>
      entries.filter(e => e.category === cat).reduce((a, b) => a + b.duration, 0)
    )

    if (chartInstance.current) {
      chartInstance.current.data.datasets[0].data = data
      chartInstance.current.update()
    } else {
      chartInstance.current = new Chart(chartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Coding', 'Gaming', 'Learning', 'Youtube', 'Other'],
          datasets: [{
            data,
            backgroundColor: Object.values(CATEGORY_COLORS),
            borderWidth: 0,
          }]
        },
        options: {
          cutout: '72%',
          plugins: { legend: { display: false } }
        }
      })
    }

    return () => {
      chartInstance.current?.destroy()
      chartInstance.current = null
    }
  }, [entries])

  const submitEntry = async () => {
    if (!activity || !duration) return
    await fetch('http://localhost:8000/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, category, duration })
    })
    fetch('http://localhost:8000/entries')
      .then(res => res.json())
      .then(data => setEntries(data))
    setActivity('')
    setDuration(0)
  }

  const total = (cats: string[]) =>
    entries.filter(e => cats.includes(e.category)).reduce((a, b) => a + b.duration, 0)

  const productiveTotal = total(['Coding', 'Learning'])
  const gamingTotal = total(['Gaming'])
  const allTracked = entries.reduce((a, b) => a + b.duration, 0)

  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 max-w-4xl mx-auto">

      {/* topbar */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-800 mb-5">
        <span className="font-semibold text-sm tracking-wide text-white">Untracked</span>
        <span className="text-xs text-gray-500">{today}</span>
      </div>

      {/* log form */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="What did you do?"
          value={activity}
          onChange={e => setActivity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitEntry()}
          className="flex-1 text-sm px-3 h-9 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="text-sm px-3 h-9 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none"
        >
          <option>Coding</option>
          <option>Gaming</option>
          <option>Learning</option>
          <option>Youtube</option>
          <option>Other</option>
        </select>
        <input
          type="number"
          placeholder="mins"
          value={duration || ''}
          onChange={e => setDuration(Number(e.target.value))}
          className="w-20 text-sm px-3 h-9 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-600 focus:outline-none"
        />
        <button
          onClick={submitEntry}
          className="h-9 px-4 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          + Log it
        </button>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Productive', value: fmt(productiveTotal), sub: 'Coding + learning' },
          { label: 'Gaming', value: fmt(gamingTotal), sub: 'Intentional' },
          { label: 'Total tracked', value: fmt(allTracked), sub: `${entries.length} entries` },
        ].map(m => (
          <div key={m.label} className="bg-gray-900 rounded-xl border border-gray-800 p-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-xl font-semibold text-white">{m.value || '0m'}</p>
            <p className="text-xs text-gray-600 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* two column */}
      <div className="grid grid-cols-2 gap-3 mb-5">

        {/* today's log */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Today's log</p>
          {['Coding', 'Gaming', 'Learning', 'Youtube', 'Other'].map(cat => {
            const mins = total([cat])
            if (!mins) return null
            const max = Math.max(...['Coding', 'Gaming', 'Learning', 'Youtube', 'Other'].map(c => total([c])))
            return (
              <div key={cat} className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                <span className="text-xs w-16 text-gray-400">{cat}</span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(mins / max) * 100}%`, background: CATEGORY_COLORS[cat] }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{fmt(mins)}</span>
              </div>
            )
          })}
          {entries.length === 0 && <p className="text-xs text-gray-700">No entries yet — log something above.</p>}
        </div>

        {/* donut */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 overflow-hidden">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">This week</p>
          <div className="flex items-center gap-3">
            <canvas ref={chartRef} width={80} height={80} className="flex-shrink-0 !w-[80px] !h-[80px]" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {['Coding', 'Gaming', 'Learning', 'Youtube', 'Other'].map(cat => (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                  <span className="text-gray-400 truncate">{cat}</span>
                  <span className="text-gray-500 ml-auto flex-shrink-0">{fmt(total([cat]))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* recent entries */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Recent entries</p>
          <span className="text-xs text-green-500 bg-green-950 px-2 py-0.5 rounded-full border border-green-900">Live from Supabase</span>
        </div>
        {entries.length === 0 && <p className="text-xs text-gray-700">Nothing logged yet.</p>}
        {[...entries].reverse().slice(0, 8).map(entry => (
          <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[entry.category] || '#888780' }} />
            <span className="flex-1 text-sm text-gray-200">{entry.activity}</span>
            <span className="text-xs text-gray-600">{entry.category}</span>
            <span className="text-xs font-medium text-gray-400 w-10 text-right">{fmt(entry.duration)}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default App
