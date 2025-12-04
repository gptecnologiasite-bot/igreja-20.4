import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

Array.from(document.querySelectorAll('link[rel*="icon"]')).forEach(l => {
  l.href = '/admac.png?v=2'
  if (!l.type) l.type = 'image/png'
})
