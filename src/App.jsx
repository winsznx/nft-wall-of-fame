import { useState } from 'react'
 import { fetchNFTs } from './services/nftService'

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [inputAddress, setInputAddress] = useState('')
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Mock NFT data for testing
  const mockNFTs = [
    {
      name: 'Bored Ape #1234',
      collection: 'Bored Ape Yacht Club',
      image: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=NFT+1',
      tokenId: '1234'
    },
    {
      name: 'CryptoPunk #5678',
      collection: 'CryptoPunks',
      image: 'https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=NFT+2',
      tokenId: '5678'
    },
    {
      name: 'Azuki #9012',
      collection: 'Azuki',
      image: 'https://via.placeholder.com/300x300/EC4899/FFFFFF?text=NFT+3',
      tokenId: '9012'
    },
    {
      name: 'Doodle #3456',
      collection: 'Doodles',
      image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=NFT+4',
      tokenId: '3456'
    }
  ]
  const handleConnectWallet = async () => {
  try {
    const { appKit } = await import('./config/walletConnect.js')
    
    // Listen for account changes
    appKit.subscribeAccount(async (account) => {
      if (account.address) {
        setWalletAddress(account.address)
        setLoading(true)
        const nftData = await fetchNFTs(account.address)
        setNfts(nftData)
        setLoading(false)
      }
    })
    
    appKit.open()
  } catch (err) {
    console.error('WalletConnect error:', err)
    alert('Please add your WalletConnect Project ID to .env file')
  }
}


// ... inside your App component ...

const handleAddressSubmit = async (e) => {
  e.preventDefault()
  if (!inputAddress.trim()) {
    setError('Please enter a wallet address')
    return
  }
  
  setError('')
  setLoading(true)
  setWalletAddress(inputAddress)
  
  try {
    // Fetch real NFTs from Alchemy
    const nftData = await fetchNFTs(inputAddress)
    setNfts(nftData)
    
    if (nftData.length === 0) {
      setError('No NFTs found for this address')
    }
  } catch (err) {
    setError('Failed to fetch NFTs. Please check the address.')
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-purple-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                NFT Wall of Fame
              </h1>
              <p className="text-gray-400 text-sm mt-1">Powered by WalletConnect & Alchemy</p>
            </div>
            <button
              onClick={handleConnectWallet}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Explore Any Wallet</h2>
            <p className="text-gray-400 mb-6">
              Enter any Ethereum wallet address or ENS name
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="0x... or vitalik.eth"
                className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              
              <button
                onClick={handleAddressSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'View NFTs'}
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Display */}
        {walletAddress && (
          <div className="mb-8 text-center">
            <p className="text-gray-400">Viewing NFTs for:</p>
            <p className="text-lg font-mono bg-black/30 inline-block px-4 py-2 rounded-lg mt-2">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Fetching NFTs...</p>
          </div>
        )}

        {/* NFT Gallery */}
        {!loading && nfts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="aspect-square overflow-hidden bg-black/30">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{nft.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{nft.collection}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs text-gray-500">#{nft.tokenId}</span>
                    <span className="text-purple-400 text-sm">View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && nfts.length === 0 && !walletAddress && (
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-400 text-sm">View your NFTs instantly</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Explore Wallets</h3>
              <p className="text-gray-400 text-sm">Discover any NFT collection</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Chain</h3>
              <p className="text-gray-400 text-sm">Ethereum, Polygon & more</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>Built for WalletConnect Contest • Powered by Reown & Alchemy</p>
        </div>
      </footer>
    </div>
  )
}

export default App