import React,{useState,useEffect} from 'react';
import {injected} from '../../utils/connectionHelper'
import {formatAddress} from '../../utils/connectionHelper'
import WalletConnectionModal from './WalletConnectionModal'
import { useWeb3React } from '@web3-react/core'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';


export default function NavbarComponent(){
    const {active,account,deactivate,library,chainId} = useWeb3React()
    const [showModal,setShowModal] = useState(false)
    // const ethers = require("ethers") 

    useEffect(()=>{
   
    },[active])

    return(
        <>
        <Navbar bg="dark">
            <Container>
                {/* <Navbar.Brand href="#home">Navbar with text</Navbar.Brand> */}
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                {
                    active ?
                        <>
                            <span className='addressClass'>{formatAddress(account)} <button className='btn btn-danger ml-2' onClick={()=>deactivate()}>Disconnect</button></span>
                            
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