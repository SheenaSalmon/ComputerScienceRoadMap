import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "bootstrap/dist/css/bootstrap.min.css";

import App from './App.jsx'

// Mount the single-page app into Vite's root element. StrictMode helps surface
// unsafe side effects during development without changing production behavior.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
