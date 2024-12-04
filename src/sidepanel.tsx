import React from 'react'
import ReactDOM from 'react-dom/client'
import { Chat } from '@/components/Chat'
import './index.css'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="h-screen bg-background flex flex-col">
      <main className="flex-1 overflow-hidden bg-background">
        <Chat />
      </main>
    </div>
  </React.StrictMode>
)