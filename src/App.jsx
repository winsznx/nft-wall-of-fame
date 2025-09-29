import { useEffect, useState } from 'react'
import { fetchNFTs } from './services/nftService'

function NFTModal({ nft, walletAddress, onClose }) {
  if (!nft) return null

  const contract = nft.contractAddress || nft.contract || ''
  const tokenId = nft.tokenId || nft.id || ''
  const isChainEth = true // adjust if multi-chain info is provided by your fetchNFTs
  const etherscanBase = isChainEth ? 'https://etherscan.io' : 'https://polygonscan.com'
  const tokenEtherscan = contract && tokenId
    ? `${etherscanBase}/token/${contract}?a=${tokenId}`
    : `${etherscanBase}/address/${walletAddress}`

  const openExplorer = (url) => window.open(url, '_blank', 'noopener')

  const openOpenSea = () => {
    if (!contract || !tokenId) return
    openExplorer(`https://opensea.io/assets/${contract}/${tokenId}`)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(tokenEtherscan)
      alert('Link copied to clipboard')
    } catch {
      alert('Could not copy link')
    }
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      tabIndex="-1"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        className="relative max-w-4xl w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        role="document"
      >
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-black/30">
            <img
              src={nft.image}
              alt={nft.name || `NFT ${tokenId}`}
              className="w-full h-full object-contain p-6"
              onError={(e) => {
                e.currentTarget.src =
                  'https://via.placeholder.com/600x600/111827/FFFFFF?text=No+Image'
              }}
            />
          </div>

          <div className="p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{nft.name || `#${tokenId}`}</h3>
                <p className="text-gray-400 mt-1">{nft.collection || 'Unknown Collection'}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    Token ID: {tokenId || '—'}
                  </span>
                  {contract && (
                    <span className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/5 truncate max-w-xs">
                      Contract: {contract}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-4 text-gray-300 hover:text-white rounded-full p-2"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-sm mt-4 flex-1 overflow-auto">
              {nft.description || 'No description available.'}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => openExplorer(tokenEtherscan)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 font-semibold"
              >
                View on Etherscan
              </button>

              <button
                onClick={openOpenSea}
                disabled={!contract || !tokenId}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-semibold disabled:opacity-40"
              >
                OpenSea
              </button>

              <button
                onClick={copyLink}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-semibold"
              >
                Copy Link
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <div>Owner: <span className="font-mono">{walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : '—'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [inputAddress, setInputAddress] = useState('')
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // modal / selection
  const [selectedNft, setSelectedNft] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // pagination (client-side)
  const [page, setPage] = useState(1)
  const perPage = 12
  const totalPages = Math.max(1, Math.ceil(nfts.length / perPage))

  // Mock NFT data (kept as in your original file)
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

  // Keep your original wallet connect function unchanged except for a small subscribe guard
  const handleConnectWallet = async () => {
    try {
      const { appKit } = await import('./config/walletConnect.js')

      // Listen for account changes
      appKit.subscribeAccount(async (account) => {
        if (account && account.address) {
          setWalletAddress(account.address)
          setLoading(true)
          const nftData = await fetchNFTs(account.address)
          setNfts(nftData)
          setPage(1)
          setLoading(false)
        }
      })

      appKit.open()
    } catch (err) {
      console.error('WalletConnect error:', err)
      alert('Please add your WalletConnect Project ID to .env file')
    }
  }

  const handleAddressSubmit = async (e) => {
    e && e.preventDefault()
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
      setNfts(nftData || [])
      setPage(1)

      if (!nftData || nftData.length === 0) {
        setError('No NFTs found for this address')
      }
    } catch (err) {
      setError('Failed to fetch NFTs. Please check the address.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // keyboard: close modal on Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
        setSelectedNft(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // derived slice for pagination
  const visibleNfts = nfts.slice((page - 1) * perPage, page * perPage)

  const openNftDetails = (nft) => {
    setSelectedNft(nft)
    setIsModalOpen(true)
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleConnectWallet}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
              >
                Connect Wallet
              </button>

              <div className="text-sm text-gray-300 hidden md:block text-right">
                <div>Connected: {walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 'Not connected'}</div>
                <div className="text-xs text-gray-400">Click an NFT to view on-chain</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-12">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleAddressSubmit} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold mb-3">Explore Any Wallet</h2>
            <p className="text-gray-400 mb-4">Enter any Ethereum wallet address or ENS name</p>

            <div className="flex gap-3">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="0x... or vitalik.eth"
                className="flex-1 bg-black/30 border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'View NFTs'}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </form>
        </div>

        {/* Wallet indicator */}
        {walletAddress && (
          <div className="mb-6 text-center">
            <p className="text-gray-400">Viewing NFTs for</p>
            <p className="text-lg font-mono bg-black/30 inline-block px-4 py-2 rounded-lg mt-2">
              {walletAddress}
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
            <p className="mt-4 text-gray-400">Fetching NFTs...</p>
          </div>
        )}

        {/* Gallery */}
        {!loading && nfts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleNfts.map((nft, i) => (
                <article
                  key={i}
                  tabIndex={0}
                  role="button"
                  onClick={() => openNftDetails(nft)}
                  onKeyDown={(e) => (e.key === 'Enter' ? openNftDetails(nft) : null)}
                  className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="aspect-square overflow-hidden bg-black/30 relative">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/400x400/111827/FFFFFF?text=Image+Unavailable'
                      }}
                    />
                    <div className="absolute top-3 left-3 text-xs bg-black/50 px-2 py-1 rounded">
                      {nft.collection || 'Unknown'}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate">{nft.name || `#${nft.tokenId}`}</h3>
                    <p className="text-gray-400 text-sm truncate mt-1">{nft.collection}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <span className="text-xs text-gray-500">#{nft.tokenId || '—'}</span>
                      <span className="text-purple-400 text-sm">View on chain →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, nfts.length)} of {nfts.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <div className="text-sm text-gray-300 px-3 py-2 bg-white/3 rounded">{page} / {totalPages}</div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}

        {/* Empty / initial state */}
        {!loading && nfts.length === 0 && (
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

      {/* Modal */}
      {isModalOpen && (
        <NFTModal
          nft={selectedNft}
          walletAddress={walletAddress}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedNft(null)
          }}
        />
      )}
    </div>
  )
}

export default App
