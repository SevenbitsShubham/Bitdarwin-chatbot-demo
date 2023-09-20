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



export default function NavbarComponent(){
    const {active,account,deactivate,library,chainId} = useWeb3React()
    const [showModal,setShowModal] = useState(false)
    const [buyerMode,setBuyerMode] = useState(false)
    const [userBalance,setUserBalance] = useState()
    // const ethers = require("ethers") 

    useEffect(()=>{
        const currentRoute = window.location.pathname;
        console.log("currentRouter",currentRoute)
        if(currentRoute.includes('/buyer')){
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

    const getmoneymakerBalance = async() =>{
        try{
        let balance = await Api.get('/moneyMaker/walletBalance')
        console.log("balance",balance.data)
        setUserBalance(balance.data)
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
                                <Nav.Link className='text-white' onClick={()=>Emitter.emit('changeToMarketplace',null)}>Marketplace</Nav.Link>
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
                                <span className='addressClass'>{formatAddress(account)} <button className='btn btn-danger ml-2' onClick={()=>deactivate()}>Disconnect</button></span>
                                <span className='balanceClass'>Balance: {userBalance} BTC</span>                                    
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