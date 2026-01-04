import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/tab-icon.png'
import { Button } from '@/components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="w-full max-w-[1280px] mx-auto p-8 text-center">
      <div className="flex justify-center items-center gap-4">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img 
            src={viteLogo} 
            className="h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] will-change-[filter]" 
            alt="Vite logo" 
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img 
            src={reactLogo} 
            className="h-24 p-6 transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] will-change-[filter] animate-[spin_20s_linear_infinite] motion-reduce:animate-none" 
            alt="React logo" 
          />
        </a>
      </div>
      <h1 className="text-5xl font-bold leading-tight mb-8">Vite + React</h1>
      <div className="p-8">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="rounded-lg border border-transparent px-5 py-3 text-base font-medium bg-[#1a1a1a] cursor-pointer transition-[border-color] duration-250 hover:border-[#646cff] focus:outline focus:outline-4 focus:outline-[auto_-webkit-focus-ring-color]"
        >
          count is {count}
        </button>
        <div className="mt-4">
          <Button onClick={() => setCount((count) => count + 1)}>
            shadcn Button - count is {count}
          </Button>
        </div>
        <p className="mt-4">
          Edit <code className="font-mono bg-[rgba(255,255,255,0.1)] px-1 py-0.5 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-[#888]">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
