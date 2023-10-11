// import { InjectedConnector } from "@web3-react/injected-connector"; 
// import {WalletConnectConnector} from '@web3-react/walletconnect-connector'

// export const walletConnect = new WalletConnectConnector({
//     rpcUrl:'https://goerli.infura.io/v3/b7b70e9a24144b5aad0190ee11d0a65d',    //`https://goerli.infura.io/v3/${process.env.REACT_APP_RPCUrl}`,
//     bridge:"https://bridge.walletconnect.org",
//     qrcode:true
// })

// export const injected = new InjectedConnector({
//     supportedChainIds:[1,3,4,5,42]
// })

export const formatAddress = (walletAddress) =>{
    return `${walletAddress.slice(0,5)}...${walletAddress.slice(-3,)}`
}