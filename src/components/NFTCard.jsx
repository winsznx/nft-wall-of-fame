export default function NFTCard({ nft }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <img src={nft.image} alt={nft.name} />
      <div className="p-4">
        <h3>{nft.name}</h3>
        <p>{nft.collection}</p>
      </div>
    </div>
  )
}