import React,{useState,useEffect} from 'react';
import {injected} from '../../utils/connectionHelper'
import {Link} from 'react-router-dom'
import {formatAddress} from '../../utils/connectionHelper'
import WalletConnectionModal from './WalletConnectionModal'
import { useWeb3React } from '@web3-react/core'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Api from '../../utils/Api';
import Emitter from '../../utils/Emitter';
import Nav from 'react-bootstrap/Nav';
import {usdcAbi,usdcAddress} from '../../utils/usdcContract'
import { ethers } from "ethers";
import {hooks, walletConnectV2} from '../../utils/connectors/walletConnectConnector'
import {Buffer} from 'buffer';
// const bitcoin = require('bitcoinjs-lib');
import btc from "bitcoinjs-lib";
import * as bitcoin from '../../utils/bitcoinjs-lib';

window.Buffer = window.Buffer || require("buffer").Buffer; 
const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks


export default function NavbarComponent(){
    // const {active,deactivate,library,chainId} = useWeb3React()
    const { connector } = useWeb3React()
    const [showModal,setShowModal] = useState(false)
    const [buyerMode,setBuyerMode] = useState(false)
    const [userBalance,setUserBalance] = useState()
    const [usdcBalance,setUsdcBalance] = useState(0)
    // const ethers = require("ethers") 
    // let chainId = useChainId()
    let account = useAccounts()
    // let isActivating = useIsActivating()
    let active = useIsActive()
    let provider = useProvider()
    // let ensName = useENSNames(provider)
    console.log("connectCheck",active,account,active)
    useEffect(()=>{
        console.log("log1",bitcoin,bitcoin.Transaction)                
        const currentRoute = window.location.pathname;
        console.log("currentRouter",currentRoute)
        if(currentRoute.includes('/buyer')){
            getUsdcBalance()
            setBuyerMode(true)
        }
        else{
            if(active){
                getmoneymakerBalance()
            }
        }
        Emitter.on('callBalanceApi',()=>{
            getmoneymakerBalance()
        })
    },[active])

    useEffect(()=>{
        Emitter.on('updateUsdcBalance',()=>{
            console.log("fired")
            getUsdcBalance()    
        })
    },[usdcBalance])

    // useEffect(()=>{
    //     console.log("walletParams",chainId,
    //     account,
    //     isActivating,
    //     isActive,
    //     provider,
    //     ensName)
    //   },[isActive])


    const getUsdcBalance = async(reqLibrary)=>{
        try{
        console.log("debug8",provider)    
        let web3provider = new ethers.BrowserProvider(provider)
        let contractInstance = new ethers.Contract(usdcAddress,usdcAbi,web3provider)
        let reqBalance = await contractInstance.balanceOf(account[0].toString())
        setUsdcBalance(reqBalance.toString()/10**6)    
        }
        catch(error){
            console.log("error",error)
        }
    }

    const getmoneymakerBalance = async() =>{
        try{
            let payload = {
                walletAddress: account[0]
            }
            console.log("payload",payload)
        let balance = await Api.post('/moneyMaker/walletBalance',payload)
        console.log("balance",balance.data)
        setUserBalance(balance.data.walletBalance)

        // let bitcoinJsProvider = new bitcoin.BitcoinJSProvider(provider)
                // console.log("log2",bitcoin.networks.bitcoin)
                // console.log("log3",await bitcoinJsProvider.getWalletAddress())

        //event emitter to update balance in the Home component
        Emitter.emit('updateUserBalance',{latestBalance:balance.data.walletBalance})
        }
        catch(error){
            console.log("error",error)
        }
    }

    return(
        <>
        <Navbar bg="dark">
            <Container>
                {/* <Navbar.Brand href="#home">Navbar with text</Navbar.Brand> */}
                <Navbar.Toggle />
                
                {
                    buyerMode && active ?
                        <>
                            <Navbar.Collapse className="justify-content-start">
                                {/* <Navbar.Text className='text-white'>
                                    Marketplace
                                </Navbar.Text>
                                <Navbar.Text className='text-white myCOntractClass'>
                                        
                                </Navbar.Text> */}
                                <Nav.Link className='text-white' onClick={()=>Emitter.emit('changeToMarketplace',null)}>Explorer</Nav.Link>
                                <Nav.Link className='text-white myCOntractClass' onClick={()=>Emitter.emit('changeToMyContracts',null)}>MyContracts</Nav.Link>
                            </Navbar.Collapse>
                        </>
                        :
                        null
                }
                    <Navbar.Collapse className="justify-content-end"> 
                    {
                        active ?
                            <>
                                <span className='addressClass'>{formatAddress(account[0])} <button className='btn btn-danger ml-2' onClick={()=>connector.deactivate()}>Disconnect</button></span>
                                {/* <span className='addressClass'>{formatAddress(account[0])} <button className='btn btn-danger ml-2' onClick={()=>console.log("fejkfeb")}>Disconnect</button></span> */}
                                {
                                    buyerMode?
                                    <span className='balanceClass'>Balance: {usdcBalance} USDC</span>                                    
                                    :
                                    <span className='balanceClass'>Balance: {userBalance} BTC</span>                                    
                                }
                            </>
                                :
                            <button className='btn btn-primary' onClick={()=>setShowModal(true)}>Connect Wallet</button>
                    }
                    </Navbar.Collapse>        
                
            </Container>
            <WalletConnectionModal show={showModal} onHide={()=>setShowModal(false)} />
        </Navbar>
        </>
    )
}