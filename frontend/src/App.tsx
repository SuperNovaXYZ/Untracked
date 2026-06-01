import { useState, useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';


Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

function App() {

const [entries, setEntries]= useState<any[]>([]);
const [activity, setActivity]=useState("");
const [category, setCategory]= useState("");
const [duration, setDuration]= useState(0);

const chartRef= useRef<HTMLCanvasElement>(null);



useEffect(()=>{
  if (!chartRef.current ) return

  const chart = new Chart(chartRef.current,{
    type:'doughnut',
    data: {
      labels:['Coding','Gaming','Learning','Youtube','Other'],
      datasets: [{
        data: [30,30,25,15,10],
        backgroundColor: ['#7F77DD', '#1D9E75', '#378ADD', '#E24B4A', '#888780'],
        borderWidth: 0,
      }]
    },
    options: {
      cutout: '72%',
      plugins: {legend:{display: true }}
    }
  })

  return () => chart.destroy()
},[])


useEffect(()=>{
  fetch("http://localhost:8000/entries")
  .then(res=> res.json())
  .then(data=> setEntries(data))
},[])

const submitEntry = async () => {
  await fetch("http://localhost:8000/entries", {
    method:"POST",
    headers:{"Content-type": "application/json"},
    body: JSON.stringify({activity,category,duration})
  })
  fetch("http://localhost:8000/entries")
  .then(res=> res.json())
  .then(data=> setEntries(data))
}
      

  return (
    <section className="min-h-screen w-full flex flex-col justify-center items-center">
    <h1>Untracked</h1>  
  
    <input
    type="text"
    placeholder='What Did you Do?'
    value={activity}
    onChange={e=> setActivity(e.target.value)}
    />

    <select value={category} onChange={e=> setCategory(e.target.value)}>
      <option> Coding</option>
      <option> Gaming</option>
      <option> Youtube</option>
      <option> Learning</option>
      <option> Other</option>
    </select>

    <input
    type="number"
    placeholder='How Long?'
    value={duration}
    onChange={e=> setDuration(Number(e.target.value))}
    />

    <button onClick={submitEntry}>Log Activity</button>

    <canvas ref={chartRef} width={90} height={90}/>

    <ul>
      {entries.map(entry=>(<li key={entry.id}> {entry.activity}-{entry.category}-{entry.duration}m</li>))}
    </ul>

  </section>
  )
}

export default App
