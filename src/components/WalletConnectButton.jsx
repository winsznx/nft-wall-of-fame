import { appKit } from '../config/walletConnect'

export default function WalletConnectButton({ onConnect }) {
  return (
    <button 
      onClick={() => appKit.open()}
      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
    >
      Connect Wallet
    </button>
  )
}