const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_KEY

export async function fetchNFTs(walletAddress) {
  if (!ALCHEMY_KEY) {
    console.error('Alchemy API key missing!')
    return []
  }

  try {
    const baseURL = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/getNFTsForOwner`
    const url = `${baseURL}?owner=${walletAddress}&withMetadata=true&pageSize=100`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.ownedNfts) {
      return []
    }

    // Transform to our format
    return data.ownedNfts.map(nft => ({
      name: nft.name || nft.contract.name || 'Unnamed NFT',
      collection: nft.contract.name || 'Unknown Collection',
      image: getImageUrl(nft),
      tokenId: nft.tokenId,
      contractAddress: nft.contract.address
    }))
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return []
  }
}

// Helper to get the best image URL
function getImageUrl(nft) {
  // Try different image sources
  if (nft.image?.cachedUrl) return nft.image.cachedUrl
  if (nft.image?.thumbnailUrl) return nft.image.thumbnailUrl
  if (nft.image?.originalUrl) return nft.image.originalUrl
  if (nft.contract?.openSeaMetadata?.imageUrl) return nft.contract.openSeaMetadata.imageUrl
  
  // Fallback placeholder
  return `https://via.placeholder.com/300x300/1a1a1a/666666?text=No+Image`
}