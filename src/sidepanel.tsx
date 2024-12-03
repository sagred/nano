import React from 'react'
import ReactDOM from 'react-dom/client'
import { Chat } from '@/components/Chat'
import './index.css'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="h-screen bg-background flex flex-col">
      <header className="flex items-center px-4 py-2 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-foreground">Text Modifier</h1>
      </header>
      <main className="flex-1 overflow-hidden bg-background">
        <Chat />
      </main>
    </div>
  </React.StrictMode>
)