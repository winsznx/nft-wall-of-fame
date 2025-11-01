import { useState } from 'react'

export default function ChainSelector({ selectedChain, onChainChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const chains = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      icon: 'à',
      color: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-500/30',
      enabled: true
    },
    {
      id: 'polygon',
      name: 'Polygon',
      icon: '!',
      color: 'from-purple-500 to-violet-600',
      borderColor: 'border-purple-500/30',
      enabled: false
    },
    {
      id: 'base',
      name: 'Base',
      icon: '=5',
      color: 'from-blue-400 to-sky-600',
      borderColor: 'border-blue-400/30',
      enabled: false
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      icon: 'Æ',
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/30',
      enabled: false
    }
  ]

  const currentChain = chains.find(c => c.id === selectedChain) || chains[0]

  const handleChainSelect = (chain) => {
    if (chain.enabled) {
      onChainChange(chain.id)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r ${currentChain.color} border ${currentChain.borderColor} font-semibold text-sm transition-all hover:scale-105 shadow-lg`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentChain.icon}</span>
        <span className="hidden sm:inline">{currentChain.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full mt-2 right-0 z-20 bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden min-w-[200px]">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleChainSelect(chain)}
                disabled={!chain.enabled}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  chain.enabled
                    ? 'hover:bg-white/10 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                } ${selectedChain === chain.id ? 'bg-white/5' : ''}`}
              >
                <span className="text-2xl">{chain.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{chain.name}</div>
                  {!chain.enabled && (
                    <div className="text-xs text-gray-400">Coming soon</div>
                  )}
                </div>
                {selectedChain === chain.id && (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
