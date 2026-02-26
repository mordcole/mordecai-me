import { useState, useEffect } from 'react'

function App() {
  const [count, setCount] = useState(0)

  // 1. Load the count when the page opens
  useEffect(() => {
    fetch('http://localhost:3001/count')
      .then(res => res.json())
      .then(data => setCount(data.value))
      .catch(err => console.error("API Error:", err))
  }, [])

  // 2. Update the count when clicked
  const increment = () => {
    fetch('http://localhost:3001/increment', { method: 'POST' })
      .then(res => res.json())
      .then(data => setCount(data.value))
      .catch(err => console.error("API Error:", err))
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>My Full Stack Counter</h1>
      <h2 style={{ fontSize: '80px', margin: '20px' }}>{count}</h2>
      <button
        onClick={increment}
        style={{ padding: '15px 30px', fontSize: '20px', cursor: 'pointer' }}
      >
        Add +1
      </button>
    </div>
  )
}

export default App
