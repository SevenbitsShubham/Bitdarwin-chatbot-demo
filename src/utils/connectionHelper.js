import { InjectedConnector } from "@web3-react/injected-connector"; 


export const injected = new InjectedConnector({
    supportedChainIds:[1,3,4,5,42]
})

export const formatAddress = (walletAddress) =>{
    return `${walletAddress.slice(0,5)}...${walletAddress.slice(-3,)}`
}