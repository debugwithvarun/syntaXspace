
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.tsx'
import PopUpProvider from './context/PopUpProvider.tsx'
import { NetworkProvider } from './context/NetworkProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <NetworkProvider>
        <PopUpProvider>
          <App />
        </PopUpProvider>
      </NetworkProvider>
    </AuthProvider>
  </BrowserRouter>

)
