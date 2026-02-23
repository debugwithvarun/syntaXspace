
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/Auth/AuthProvider.tsx'
import PopUpProvider from './context/PopUp/PopUpProvider.tsx'
import { NetworkProvider } from './context/Network/NetworkProvider.tsx'
import IdleProvider from './context/Idle/IdleProvider.tsx'
import ChatProvider from './context/chat/ChatProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        <IdleProvider>
          <NetworkProvider>
            <PopUpProvider>

              <App />
            </PopUpProvider>
          </NetworkProvider>
        </IdleProvider>
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>

)
