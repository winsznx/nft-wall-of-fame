import { useEffect, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Grid3x3, Grid2x2, ArrowUp, Share2, Download, Star, Search, SlidersHorizontal, ExternalLink, Copy, Check, Menu, Heart } from 'lucide-react'
import { fetchNFTs } from './services/nftService'

// Helper to resolve ENS names
async function resolveENS(ensNameOrAddress) {
  if (ensNameOrAddress.startsWith('0x')) {
    return ensNameOrAddress
  }
  
  try {
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${ensNameOrAddress}`)
    const data = await response.json()
    if (data.address) {
      return data.address
    }
  } catch (error) {
    console.error('ENS resolution error:', error)
  }
  
  return ensNameOrAddress
}

// Toast Notification Component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-sky-500'

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
      <div className={`${bg} text-white px-5 py-2.5 rounded-xl shadow-xl flex items-center gap-3 max-w-sm`}>
        <div className="font-medium truncate">{message}</div>
        <button onClick={onClose} className="hover:opacity-80 p-1 rounded-full">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// NFT Modal Component
function NFTModal({ nft, walletAddress, onClose, onToggleFavorite, isFavorite }) {
  const [copied, setCopied] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  if (!nft) return null

  const contract = nft.contractAddress || nft.contract || ''
  const tokenId = nft.tokenId || nft.id || ''
  const isChainEth = true
  const etherscanBase = isChainEth ? 'https://etherscan.io' : 'https://polygonscan.com'
  const tokenEtherscan = contract && tokenId
    ? `${etherscanBase}/token/${contract}?a=${tokenId}`
    : `${etherscanBase}/address/${walletAddress}`

  const openExplorer = (url) => window.open(url, '_blank', 'noopener')

  const openOpenSea = () => {
    if (!contract || !tokenId) return
    openExplorer(`https://opensea.io/assets/ethereum/${contract}/${tokenId}`)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(tokenEtherscan)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Could not copy link')
    }
  }

  const shareNFT = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft.name || `NFT #${tokenId}`,
          text: `Check out this NFT from ${nft.collection}`,
          url: tokenEtherscan
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyLink()
        }
      }
    } else {
      copyLink()
    }
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = nft.image
    link.download = `${nft.name || tokenId}.png`
    link.click()
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX
    if (touchStartX.current - touchEndX.current > 100) {
      onClose()
    }
  }

  const getRarityColor = (rarity) => {
    const colors = {
      'Common': 'text-gray-400 bg-gray-500/20',
      'Rare': 'text-blue-400 bg-blue-500/20',
      'Epic': 'text-indigo-400 bg-indigo-500/20',
      'Legendary': 'text-yellow-400 bg-yellow-500/20'
    }
    return colors[rarity] || 'text-gray-400 bg-gray-500/20'
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      tabIndex="-1"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900/95 to-blue-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <div className="relative bg-black/20">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
              </div>
            )}
            <img
              src={nft.image}
              alt={nft.name || `NFT ${tokenId}`}
              className={`w-full h-[min(60vh,60vw)] md:h-full object-contain p-4 sm:p-6 cursor-zoom-in ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onLoad={() => setImageLoaded(true)}
              onClick={() => setFullscreen(true)}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/600x600/111827/FFFFFF?text=No+Image'
                setImageLoaded(true)
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <button
                onClick={onToggleFavorite}
                className="bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-all"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
              >
                <Star size={18} className={isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white"} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(nft.image).then(() => {})
                }}
                className="bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-all"
                title="Copy image URL"
              >
                <Copy size={16} className="text-white" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-lg sm:text-2xl font-bold break-words leading-tight">{nft.name || `#${tokenId}`}</h3>
                <p className="text-gray-300 mt-1 text-sm sm:text-base truncate">{nft.collection || 'Unknown Collection'}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-white/6 px-3 py-1 rounded-full border border-white/10">
                    Token ID: <span className="font-mono ml-1">{tokenId || '—'}</span>
                  </span>
                  {nft.rarity && (
                    <span className={`text-xs px-3 py-1 rounded-full border ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity}
                    </span>
                  )}
                </div>

                {contract && (
                  <div className="mt-2 text-xs text-gray-400 break-all">
                    <span className="font-semibold">Contract:</span> <span className="font-mono">{contract.slice(0, 10)}...{contract.slice(-8)}</span>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-gray-300 hover:text-white rounded-full p-2 hover:bg-white/6 transition-all"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto mb-4 text-sm leading-relaxed text-gray-300">
              <p className="whitespace-pre-wrap">{nft.description || 'No description available.'}</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => openExplorer(tokenEtherscan)}
                  className="px-3 sm:px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                  title="Open on Etherscan"
                >
                  <ExternalLink size={16} />
                  <span className="hidden sm:inline">Etherscan</span>
                  <span className="sm:hidden">Explorer</span>
                </button>

                <button
                  onClick={openOpenSea}
                  disabled={!contract || !tokenId}
                  className="px-3 sm:px-4 py-2.5 rounded-lg bg-white/6 border border-white/8 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-white/10 transition-all"
                  title="Open on OpenSea"
                >
                  <ExternalLink size={16} />
                  <span className="hidden sm:inline">OpenSea</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={copyLink}
                  className="px-3 py-2.5 rounded-lg bg-white/6 border border-white/8 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  title="Copy explorer link"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={shareNFT}
                  className="px-3 py-2.5 rounded-lg bg-white/6 border border-white/8 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  title="Share NFT"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  onClick={downloadImage}
                  className="px-3 py-2.5 rounded-lg bg-white/6 border border-white/8 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  title="Download image"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/8 text-xs sm:text-sm text-gray-300">
              <div className="break-all">
                <span className="text-gray-400">Owner:</span> <span className="font-mono">{walletAddress ? `${walletAddress.slice(0,8)}...${walletAddress.slice(-6)}` : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-10"
            aria-label="Close fullscreen"
          >
            <X size={32} />
          </button>
          <img
            src={nft.image}
            alt={nft.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}

// Favorites Modal Component
function FavoritesModal({ nfts, favorites, onClose, onViewNFT, onRemoveFavorite }) {
  const favoriteNfts = nfts.filter(nft => 
    favorites.has(`${nft.contractAddress}-${nft.tokenId}`)
  )

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900/95 to-blue-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-white/10 p-4 sm:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Star size={24} className="text-yellow-400 fill-yellow-400" />
              Favorite NFTs
            </h2>
            <p className="text-gray-400 text-sm mt-1">{favoriteNfts.length} saved</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-300 hover:text-white rounded-full p-2 hover:bg-white/6 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {favoriteNfts.length === 0 ? (
            <div className="text-center py-12">
              <Star size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-gray-400">Tap the star icon on any NFT to save it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteNfts.map((nft, i) => (
                <div
                  key={i}
                  className="bg-white/4 rounded-xl overflow-hidden border border-white/8 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="aspect-square overflow-hidden relative bg-black/20">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onClick={() => onViewNFT(nft)}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x400/111827/FFFFFF?text=Image+Unavailable'
                      }}
                    />
                    <button
                      onClick={() => onRemoveFavorite(nft)}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-red-600/80 transition-all"
                      title="Remove from favorites"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold truncate">{nft.name || `#${nft.tokenId}`}</h3>
                    <p className="text-gray-400 text-sm truncate">{nft.collection}</p>
                    <button
                      onClick={() => onViewNFT(nft)}
                      className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg text-sm font-semibold transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [inputAddress, setInputAddress] = useState('')
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedNft, setSelectedNft] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)

  const [toast, setToast] = useState(null)

  const [favorites, setFavorites] = useState(new Set())

  const [page, setPage] = useState(1)
  const [gridSize, setGridSize] = useState(4)

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [filterCollection, setFilterCollection] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const [recentSearches, setRecentSearches] = useState([])

  const [showScrollTop, setShowScrollTop] = useState(false)

  const perPage = gridSize * 3

  const collections = ['all', ...new Set(nfts.map(nft => nft.collection).filter(Boolean))]

  const filteredAndSortedNfts = nfts
    .filter(nft => {
      const matchesSearch = !searchTerm || 
        nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.collection?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.tokenId?.includes(searchTerm)
      
      const matchesCollection = filterCollection === 'all' || nft.collection === filterCollection

      return matchesSearch && matchesCollection
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'tokenId') return (a.tokenId || '').localeCompare(b.tokenId || '')
      if (sortBy === 'collection') return (a.collection || '').localeCompare(b.collection || '')
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedNfts.length / perPage))
  const visibleNfts = filteredAndSortedNfts.slice((page - 1) * perPage, page * perPage)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleConnectWallet = async () => {
    try {
      const { appKit } = await import('./config/walletConnect.js')

      appKit.subscribeAccount(async (account) => {
        if (account && account.address) {
          setWalletAddress(account.address)
          setLoading(true)
          try {
            const result = await fetchNFTs(account.address)
            setNfts(result || [])
            setPage(1)
            
            if (result && result.length > 0) {
              showToast(`Connected! Loaded ${result.length} NFTs`, 'success')
            } else {
              showToast('Connected! No NFTs found in this wallet', 'info')
            }
          } catch (err) {
            console.error('Error fetching NFTs:', err)
            showToast('Failed to fetch NFTs', 'error')
          } finally {
            setLoading(false)
          }
        }
      })

      appKit.open()
    } catch (err) {
      console.error('WalletConnect error:', err)
      showToast('Please add your WalletConnect Project ID to .env file', 'error')
    }
  }

  const handleAddressSubmit = async (e) => {
    e && e.preventDefault()
    if (!inputAddress.trim()) {
      showToast('Please enter a wallet address', 'error')
      return
    }

    setError('')
    setLoading(true)
    setWalletAddress(inputAddress)

    setRecentSearches(prev => {
      const updated = [inputAddress, ...prev.filter(addr => addr !== inputAddress)].slice(0, 5)
      return updated
    })

    try {
      const nftData = await fetchNFTs(inputAddress)
      setNfts(nftData || [])
      setPage(1)

      if (!nftData || nftData.length === 0) {
        showToast('No NFTs found for this address', 'error')
      } else {
        showToast(`Found ${nftData.length} NFTs!`, 'success')
      }
    } catch (err) {
      showToast('Failed to fetch NFTs', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openNftDetails = (nft) => {
    setSelectedNft(nft)
    setIsModalOpen(true)
  }

  const toggleFavorite = (nft) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      const key = `${nft.contractAddress}-${nft.tokenId}`
      if (newFavorites.has(key)) {
        newFavorites.delete(key)
        showToast('Removed from favorites', 'info')
      } else {
        newFavorites.add(key)
        showToast('Added to favorites', 'success')
      }
      return newFavorites
    })
  }

  const isFavorite = (nft) => {
    return favorites.has(`${nft.contractAddress}-${nft.tokenId}`)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
        setSelectedNft(null)
        setShowFilters(false)
        setShowFavoritesModal(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getGridClass = () => {
    if (gridSize === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (gridSize === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const stats = {
    total: nfts.length,
    collections: new Set(nfts.map(n => n.collection)).size,
    favorites: favorites.size
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white selection:bg-indigo-600/30 selection:text-white">
      <header className="border-b border-indigo-500/25 backdrop-blur-sm sticky top-0 z-40 bg-black/30">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button className="p-2 rounded-md hover:bg-white/6 transition-colors md:hidden" aria-label="menu">
                <Menu size={20}/>
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent truncate">
                  NFT Wall of Fame
                </h1>
                <div className="text-xs text-gray-400 hidden sm:block truncate">
                  Discover, inspect & save NFTs across wallets
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="text-xs sm:text-sm text-gray-300 bg-black/30 px-2 sm:px-3 py-1.5 rounded-lg">
                  {walletAddress ? <span className="font-mono">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span> : <span className="text-gray-500">Not connected</span>}
                </div>
              </div>

              <button
                onClick={handleConnectWallet}
                className="bg-indigo-600 hover:bg-indigo-700 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
              >
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div id="wallet-search" className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <form onSubmit={handleAddressSubmit} className="bg-white/4 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Explore Any Wallet</h2>
                <p className="text-gray-400 text-sm mb-3">Enter an Ethereum address or ENS name (e.g. <span className="font-mono">vitalik.eth</span>)</p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                      placeholder="0x... or vitalik.eth"
                      className="w-full bg-black/30 border border-indigo-500/30 rounded-lg px-10 py-3 focus:outline-none focus:border-indigo-400 text-sm sm:text-base pr-16"
                      aria-label="Wallet address or ENS name"
                    />
                    {inputAddress && !inputAddress.startsWith('0x') && !inputAddress.includes('.') && (
                      <button
                        type="button"
                        onClick={() => setInputAddress(inputAddress + '.eth')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 px-3 py-1.5 rounded text-xs sm:text-sm font-semibold transition-all"
                        aria-label="append .eth"
                      >
                        + .eth
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-4 sm:px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-all whitespace-nowrap flex items-center gap-2"
                    aria-label="View NFTs"
                  >
                    {loading ? 'Loading...' : 'View NFTs'}
                  </button>
                </div>

                {recentSearches.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/6">
                    <p className="text-xs text-gray-400 mb-2">Recent searches</p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((addr, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInputAddress(addr)
                            handleAddressSubmit()
                          }}
                          className="text-xs bg-white/6 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/8 font-mono transition-all"
                        >
                          {addr.length > 20 ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : addr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex flex-col items-end gap-3">
                <div className="text-xs text-gray-400">Quick actions</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInputAddress('vitalik.eth')
                      setTimeout(() => handleAddressSubmit(), 50)
                    }}
                    className="bg-white/6 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-all"
                  >
                    Try Vitalik
                  </button>

                  <button
                    onClick={() => showToast('ENS resolver available — try "name.eth"', 'info')}
                    className="bg-white/6 px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-all"
                  >
                    ENS help
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {nfts.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white/4 backdrop-blur-lg rounded-2xl p-3 sm:p-4 border border-white/8">
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
              <div>
                <span className="text-gray-400">Total NFTs:</span> <span className="font-bold text-indigo-300">{stats.total}</span>
              </div>
              <div>
                <span className="text-gray-400">Collections:</span> <span className="font-bold text-blue-300">{stats.collections}</span>
              </div>
              <div>
                <span className="text-gray-400">Favorites:</span> <span className="font-bold text-yellow-300">{stats.favorites}</span>
              </div>
            </div>
            
            <div className="text-xs sm:text-sm font-mono text-gray-300 break-all">
              {walletAddress && `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`}
            </div>
          </div>
        )}

        {nfts.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white/6 border border-white/8 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                aria-expanded={showFilters}
                aria-controls="filters-panel"
              >
                <SlidersHorizontal size={16} />
                <span className="text-sm">Filters</span>
              </button>

              <div className="flex items-center gap-2 bg-white/6 border border-white/8 rounded-lg p-1">
                <button
                  onClick={() => setGridSize(2)}
                  className={`p-2 rounded transition-all ${gridSize === 2 ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
                  aria-label="2 columns"
                  title="2 columns"
                >
                  <Grid2x2 size={16} />
                </button>
                <button
                  onClick={() => setGridSize(3)}
                  className={`p-2 rounded transition-all ${gridSize === 3 ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
                  aria-label="3 columns"
                  title="3 columns"
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setGridSize(4)}
                  className={`p-2 rounded transition-all ${gridSize === 4 ? 'bg-indigo-600' : 'hover:bg-white/10'}`}
                  aria-label="4 columns"
                  title="4 columns"
                >
                  <Grid3x3 size={18} className="scale-110" />
                </button>
              </div>

              <div className="flex-1 min-w-[180px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search NFTs, collections or token IDs..."
                  className="w-full bg-white/4 border border-white/8 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-400 text-sm"
                />
              </div>
            </div>

            {showFilters && (
              <div id="filters-panel" className="bg-white/4 backdrop-blur-lg rounded-2xl p-4 border border-white/8 space-y-4 animate-slide-down">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value)
                        setPage(1)
                      }}
                      className="w-full bg-black/30 border border-white/8 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 text-sm"
                    >
                      <option value="default">Default</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="tokenId">Token ID</option>
                      <option value="collection">Collection</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Collection</label>
                    <select
                      value={filterCollection}
                      onChange={(e) => {
                        setFilterCollection(e.target.value)
                        setPage(1)
                      }}
                      className="w-full bg-black/30 border border-white/8 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400 text-sm"
                    >
                      {collections.map(col => (
                        <option key={col} value={col}>
                          {col === 'all' ? 'All Collections' : col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/8">
                  <span className="text-sm text-gray-400">
                    {filteredAndSortedNfts.length} NFT{filteredAndSortedNfts.length !== 1 ? 's' : ''} found
                  </span>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSortBy('default')
                      setFilterCollection('all')
                      setPage(1)
                    }}
                    className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
            <p className="mt-4 text-gray-400">Fetching NFTs…</p>
            
            <div className={`grid ${getGridClass()} gap-4 sm:gap-6 mt-8`}>
              {[...Array(perPage)].map((_, i) => (
                <div key={i} className="bg-white/4 rounded-2xl overflow-hidden border border-white/8 animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-white/6 to-white/3" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/6 rounded w-3/4" />
                    <div className="h-3 bg-white/6 rounded w-1/2" />
                    <div className="h-3 bg-white/6 rounded w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && visibleNfts.length > 0 && (
          <>
            <div className={`grid ${getGridClass()} gap-4 sm:gap-6`}>
              {visibleNfts.map((nft, i) => (
                <article
                  key={i}
                  tabIndex={0}
                  role="button"
                  onClick={() => openNftDetails(nft)}
                  onKeyDown={(e) => (e.key === 'Enter' ? openNftDetails(nft) : null)}
                  className="bg-white/4 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/8 hover:border-indigo-500/30 transition-all hover:scale-[1.03] cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <div className="aspect-square overflow-hidden relative bg-black/20">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x400/111827/FFFFFF?text=Image+Unavailable'
                      }}
                    />
                    <div className="absolute top-2 left-2 text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                      {nft.collection || 'Unknown'}
                    </div>
                    
                    {isFavorite(nft) && (
                      <div className="absolute top-2 right-2">
                        <Star size={18} className="fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                      </div>
                    )}

                    {nft.rarity && (
                      <div className="absolute bottom-2 right-2 text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                        {nft.rarity}
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{nft.name || `#${nft.tokenId}`}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate mt-1">{nft.collection}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/8">
                      <span className="text-xs text-gray-400">#{nft.tokenId || '—'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-300 text-xs sm:text-sm">View details</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(nft)
                          }}
                          className="p-1 rounded-full bg-white/6 hover:bg-white/10 transition-colors"
                          aria-label="toggle favorite"
                          title="Toggle favorite"
                        >
                          <Heart size={14} className={isFavorite(nft) ? 'text-yellow-300' : 'text-gray-300'} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-400">
                Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredAndSortedNfts.length)} of {filteredAndSortedNfts.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-white/6 border border-white/8 disabled:opacity-40 hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm transition-all ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/6 border border-white/8 hover:bg-white/10'
                        }`}
                        aria-current={page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-white/6 border border-white/8 disabled:opacity-40 hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {!loading && nfts.length === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <button
                onClick={handleConnectWallet}
                className="bg-white/4 rounded-2xl p-6 sm:p-8 border border-white/8 hover:bg-white/10 hover:border-indigo-500/30 transition-all flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-indigo-400 group"
              >
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform">🔗</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Connect Wallet</h3>
                <p className="text-gray-400 text-xs sm:text-sm text-center">View your NFTs instantly</p>
              </button>

              <button
                onClick={() => document.getElementById('wallet-search')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/4 rounded-2xl p-6 sm:p-8 border border-white/8 hover:bg-white/10 hover:border-indigo-500/30 transition-all flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-indigo-400 group"
              >
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Explore Wallets</h3>
                <p className="text-gray-400 text-xs sm:text-sm text-center">Discover any NFT collection</p>
              </button>

              <button
                onClick={() => showToast('Multi-Chain support coming soon!', 'info')}
                className="bg-white/4 rounded-2xl p-6 sm:p-8 border border-white/8 hover:bg-white/10 hover:border-indigo-500/30 transition-all flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-indigo-400 group sm:col-span-2 lg:col-span-1"
              >
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform">🌐</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Multi-Chain</h3>
                <p className="text-gray-400 text-xs sm:text-sm text-center">Ethereum, Polygon & more</p>
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 rounded-2xl p-4 sm:p-6 border border-indigo-500/20 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-300">
                  {collections.length > 1 ? `${collections.length - 1}` : '10K+'}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Collections Available</div>
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-4 sm:p-6 border border-blue-500/20 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-300">
                  {recentSearches.length > 0 ? `${recentSearches.length}` : '0'}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Wallets Explored</div>
              </div>
              <div className="bg-gradient-to-br from-pink-600/20 to-indigo-600/20 rounded-2xl p-4 sm:p-6 border border-pink-500/20 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-pink-300">1</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Blockchain (ETH)</div>
              </div>
              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-4 sm:p-6 border border-green-500/20 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-300">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">Last Updated</div>
              </div>
            </div>
          </div>
        )}

        {!loading && nfts.length > 0 && filteredAndSortedNfts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSortBy('default')
                setFilterCollection('all')
                setPage(1)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-indigo-500/25 mt-12 sm:mt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm">2025 @winsznx</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-gray-400 hover:text-indigo-300 transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-indigo-300 transition-colors">Docs</a>
              <a href="#" className="text-gray-400 hover:text-indigo-300 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed left-4 bottom-6 z-40">
        <button
          onClick={() => setShowFavoritesModal(true)}
          className="bg-gradient-to-br from-pink-600 to-indigo-600 text-white p-3 rounded-full shadow-2xl hover:scale-105 transition-transform relative"
          aria-label="Favorites"
          title="View Favorites"
        >
          <Star size={18} />
          {favorites.size > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {favorites.size}
            </span>
          )}
        </button>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-40 animate-fade-in"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {isModalOpen && (
        <NFTModal
          nft={selectedNft}
          walletAddress={walletAddress}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedNft(null)
          }}
          onToggleFavorite={() => toggleFavorite(selectedNft)}
          isFavorite={isFavorite(selectedNft)}
        />
      )}

      {showFavoritesModal && (
        <FavoritesModal
          nfts={nfts}
          favorites={favorites}
          onClose={() => setShowFavoritesModal(false)}
          onViewNFT={(nft) => {
            setShowFavoritesModal(false)
            openNftDetails(nft)
          }}
          onRemoveFavorite={toggleFavorite}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-in-right { animation: slide-in-right 0.28s ease-out; }
        .animate-slide-down { animation: slide-down 0.28s ease-out; }
        .animate-fade-in { animation: fade-in 0.28s ease-out; }

        .overflow-auto::-webkit-scrollbar { height: 8px; width: 8px; }
        .overflow-auto::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 8px; }
        .overflow-auto::-webkit-scrollbar-track { background: transparent; }

        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  )
}

export default App