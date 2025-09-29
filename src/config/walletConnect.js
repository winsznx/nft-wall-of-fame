import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, polygon, arbitrum, base } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, polygon, arbitrum, base],
  projectId,
  features: {
    analytics: true
  }
})