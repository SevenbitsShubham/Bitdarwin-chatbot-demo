import React,{useState,useEffect} from 'react';
import Modal from 'react-bootstrap/Modal';
import { useWeb3React } from '@web3-react/core'
import Button from 'react-bootstrap/Button';
import { AiOutlineMail } from "react-icons/ai";
import './index.css'
import { injected } from '../../utils/connectionHelper';

export default function WalletConnectionModal(props){

    const {active,activate,deactivate,account,chainId} = useWeb3React()

    useEffect(()=>{

    },[])

    //function is used to connect the metamask wallet 
    const handleWalletConnection = async() =>{
        try{
            await activate(injected)
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
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className='modal-header-schema'>
        <Modal.Title id="contained-modal-title-vcenter" className='text-white'>
          Connect Wallet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
           <div className='row'>
               <div className='d-flex justify-content-center col pointerCursor' onClick={handleWalletConnection}>
                    <img src={'https://logowik.com/content/uploads/images/metamask-fox-icon-in-flat-style2194.logowik.com.webp'} height={150}/>
               </div> 
               <div className='d-flex justify-content-center pt-4 col '>
                    <AiOutlineMail size={110}/>
               </div> 
           </div>  
           <div className='row'>
                <div className='col text-center'><h5 onClick={handleWalletConnection} className='pointerCursor'>Metamask</h5></div>
                <div className='col text-center'><h5 >Connect With Email</h5></div>
           </div>  
        </div>
      </Modal.Body>
    </Modal>
        </>
    )
}


