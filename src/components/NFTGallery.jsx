import NFTCard from './NFTCard'

export default function NFTGallery({ nfts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft, index) => (
        <NFTCard key={index} nft={nft} />
      ))}
    </div>
  )
}