import React,{useState,useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import { useWeb3React } from '@web3-react/core'
import Button from 'react-bootstrap/Button';
import { AiOutlineMail } from "react-icons/ai";
import './index.css'
import {hooks, walletConnectV2} from '../../utils/connectors/walletConnectConnector'

const { useChainId, useAccounts, useIsActivating, useIsActive, useProvider, useENSNames } = hooks
export default function WalletConnectionModal(props){

    // const {active,activate,deactivate,account,chainId} = useWeb3React()
    const { connector } = useWeb3React()

    let chainId = useChainId()
    let account = useAccounts()
    let isActivating = useIsActivating()
    let isActive = useIsActive()
    let provider = useProvider()
    let ensName = useENSNames(provider)


    useEffect(()=>{
      console.log("walletParams",chainId,
      account,
      isActivating,
      isActive,
      provider,
      ensName)
    },[isActive])

  // const walletlink = new WalletLinkConnector({
  //   url: `https://mainnet.infura.io/v3/b7b70e9a24144b5aad0190ee11d0a65d`,
  //   appName: "Your app name",
  // });

    const handleWalletConnection = async(e,connection) =>{
        try{
          e.preventDefault()
          // console.log("connection",connection,walletconnect)
          if(connection==='Walletconnect'){
            console.log("here")
            await connector.activate()
            // await activate(walletconnect)
          }
          else{
            await connector.activate()
            // await activate(injected)
          }  
            props.onHide()
        }
        catch(error){
            console.log("error",error)
        }
    }

    return(
        <>
             <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Connect Wallet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
           <div className='row'>
               <div className='d-flex justify-content-center col pointerCursor' onClick={(e)=>handleWalletConnection(e,'Metamask')}>
                    <img src={'https://logowik.com/content/uploads/images/metamask-fox-icon-in-flat-style2194.logowik.com.webp'} height={150}/>
               </div>
               <div className='d-flex justify-content-center col pointerCursor' onClick={(e)=>handleWalletConnection(e,'Walletconnect')}>
                    <img src={'https://api.nuget.org/v3-flatcontainer/walletconnect.auth/2.1.0/icon'} height={150}/>
               </div> 
               <div className='d-flex justify-content-center pt-4 col '>
                    <AiOutlineMail size={110}/>
               </div> 
           </div>  
           <div className='row'>
                <div className='col text-center'><h5 onClick={(e)=>handleWalletConnection(e,'Metamask')} className='pointerCursor'>Metamask</h5></div>
                <div className='col text-center'><h5 onClick={(e)=>handleWalletConnection(e,'Walletconnect')} className='pointerCursor'>WalletConnect</h5></div>
                <div className='col text-center'><h5 >Connect With Email</h5></div>
           </div>  
        </div>
      </Modal.Body>
    </Modal>
        </>
    )
}


