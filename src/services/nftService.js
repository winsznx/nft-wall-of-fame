const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_KEY

// Helper to get the best image URL
function getImageUrl(nft) {
  if (nft.image?.cachedUrl) return nft.image.cachedUrl
  if (nft.image?.thumbnailUrl) return nft.image.thumbnailUrl
  if (nft.image?.originalUrl) return nft.image.originalUrl
  if (nft.contract?.openSeaMetadata?.imageUrl) return nft.contract.openSeaMetadata.imageUrl
  
  return `https://via.placeholder.com/300x300/1a1a1a/666666?text=No+Image`
}

// Fetch ALL NFTs with pagination
export async function fetchNFTs(walletAddress) {
  if (!ALCHEMY_KEY) {
    console.error('Alchemy API key missing!')
    return []
  }

  try {
    let allNFTs = []
    let pageKey = null
    let hasMore = true

    // Keep fetching until we have all NFTs
    while (hasMore) {
      const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/getNFTsForOwner`
      const url = pageKey 
        ? `${baseURL}?owner=${walletAddress}&withMetadata=true&pageSize=100&pageKey=${pageKey}`
        : `${baseURL}?owner=${walletAddress}&withMetadata=true&pageSize=100`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!data.ownedNfts || data.ownedNfts.length === 0) {
        break
      }

      // Transform and add to our collection
      const transformedNFTs = data.ownedNfts.map(nft => ({
        name: nft.name || nft.contract.name || 'Unnamed NFT',
        collection: nft.contract.name || 'Unknown Collection',
        image: getImageUrl(nft),
        tokenId: nft.tokenId,
        contractAddress: nft.contract.address,
        description: nft.description || nft.contract?.openSeaMetadata?.description || '',
        rarity: nft.rarity || null
      }))

      allNFTs = [...allNFTs, ...transformedNFTs]

      // Check if there are more pages
      if (data.pageKey) {
        pageKey = data.pageKey
        console.log(`📦 Loaded ${allNFTs.length} NFTs so far...`)
      } else {
        hasMore = false
      }
    }

    console.log(`✅ Fetched ${allNFTs.length} total NFTs`)
    return allNFTs
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return []
  }
}

// Optional: Keep this for backward compatibility
export async function fetchNFTsPage(walletAddress, pageKey = null) {
  if (!ALCHEMY_KEY) {
    console.error('Alchemy API key missing!')
    return { nfts: [], pageKey: null, totalCount: 0 }
  }

  try {
    const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/getNFTsForOwner`
    const url = pageKey 
      ? `${baseURL}?owner=${walletAddress}&withMetadata=true&pageSize=100&pageKey=${pageKey}`
      : `${baseURL}?owner=${walletAddress}&withMetadata=true&pageSize=100`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.ownedNfts) {
      return { nfts: [], pageKey: null, totalCount: 0 }
    }

    const transformedNFTs = data.ownedNfts.map(nft => ({
      name: nft.name || nft.contract.name || 'Unnamed NFT',
      collection: nft.contract.name || 'Unknown Collection',
      image: getImageUrl(nft),
      tokenId: nft.tokenId,
      contractAddress: nft.contract.address,
      description: nft.description || nft.contract?.openSeaMetadata?.description || '',
      rarity: nft.rarity || null
    }))

    return {
      nfts: transformedNFTs,
      pageKey: data.pageKey || null,
      totalCount: data.totalCount || transformedNFTs.length
    }
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return { nfts: [], pageKey: null, totalCount: 0 }
  }
}