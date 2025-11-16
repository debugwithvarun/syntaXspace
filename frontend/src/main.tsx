
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/Auth/AuthProvider.tsx' 
import PopUpProvider from './context/PopUp/PopUpProvider.tsx' 
import { NetworkProvider } from './context/Network/NetworkProvider.tsx'
import IdleProvider from './context/Idle/IdleProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <NetworkProvider>
        <PopUpProvider>
          <IdleProvider>

          <App />
          </IdleProvider>
        </PopUpProvider>
      </NetworkProvider>
    </AuthProvider>
  </BrowserRouter>

)
