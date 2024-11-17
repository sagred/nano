// src/App.tsx
import { Chat } from '@/components/Chat';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-lg overflow-hidden border border-slate-700 shadow-xl m-4">
        <header className="flex items-center px-6 py-4 border-b border-slate-700 bg-slate-800">
          <h1 className="text-xl font-semibold text-white">Nano Search Chat</h1>
        </header>
        <main className="flex-1 overflow-hidden">
          <Chat />
        </main>
      </div>
    </div>
  );
}

export default App;