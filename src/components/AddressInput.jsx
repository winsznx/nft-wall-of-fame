import { useState } from 'react'

export default function AddressInput({ onSubmit }) {
  const [address, setAddress] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(address)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter wallet address or ENS"
        className="bg-gray-800 px-4 py-2 rounded"
      />
      <button type="submit">Search</button>
    </form>
  )
}