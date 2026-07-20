import { useState, useEffect } from 'react'
import './App.css'

function App() {

const [apiTest, setApiTest] = useState(null);
useEffect(() => {
    fetch("https://localhost:5000/test")
    .then(res => res.json())
    .then(data => setApiTest(data))
    .catch(() => setApiTest({ message: "API not reachable" }));
}, []);

return (
    <>
    <h2>Welcome to PulseVote</h2>

    <hr />
    <h3>API Test Endpoint Result:</h3>
    {apiTest ? (
        <pre>{JSON.stringify(apiTest, null, 2)}</pre>
    ) : (
        <span>Loading...</span>
    )}

    </>
)
}

export default App
