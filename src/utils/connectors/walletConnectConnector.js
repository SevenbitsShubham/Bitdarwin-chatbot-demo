import {initializeConnector} from '@web3-react/core'
import {WalletConnect as WalletConnectV2} from '@web3-react/walletconnect-v2'
import {MAINNET_CHAINS,TESTNET_CHAINS} from '../chains';


// const [testnet,...optionalChains] = Object.keys(TESTNET_CHAINS).map(Number)
const [mainnetnet,...optionalChains] = Object.keys(MAINNET_CHAINS).map(Number)


  export const [walletConnectV2,hooks] = initializeConnector((actions)=> new WalletConnectV2({
        actions,
        options:{
          projectId:'8033ffdf0d5f7c7adbeb02a6ff4507e5',
          chains:[mainnetnet],
          optionalChains,
          showQrModal:true
        }
    }))