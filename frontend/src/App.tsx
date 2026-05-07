import { useState, useEffect } from 'react'


function App() {

const [entries, setEntries]= useState<any[]>([]);
const [activity, setActivity]=useState("");
const [category, setCategory]= useState("");
const [duration, setDuration]= useState(0);


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

    <ul>
      {entries.map(entry=>(<li key={entry.id}> {entry.activity}-{entry.category}-{entry.duration}m</li>))}
    </ul>

  </section>
  )
}

export default App
