import React,{useState,useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Api from '../../utils/Api';
import { useWeb3React } from '@web3-react/core';
import './index.css'

export default function ContractResellModal(props){
    
    const {account} = useWeb3React()

    useEffect(()=>{

    },[])

    const handleResellApi = async() =>{
        try{
            let payload = {
                contractAddress:props.viewContractDetails.contractAddress,
                walletAddress: account
            }
            await Api.post('/buyer/resellContract',payload) 
            alert("Contract is now available for sell.")
            props.setResellModal(false)
            props.getUserContracts()
        }
        catch(error){
            console.log("error",error)
        }
    }

    return(
        <>
          <Modal
                show={props.resellModal}
                onHide={() => props.setResellModal(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className='modal-schema'
                >
                <Modal.Header closeButton className='modal-header-schema'>
                    <Modal.Title id="contained-modal-title-vcenter" className='text-white'> 
                    Re-Sell Contract
                    </Modal.Title>
                </Modal.Header> 
                <Modal.Body>
                    <h5 className='text-center'>By reselling, the contract will be available for purchase by other buyers.</h5>
                    <h6 className='text-center'>To confirm the contract re-sell please click on below button.</h6>
                    <div className='d-flex justify-content-center'>
                        <button className='btn btn-danger' onClick={handleResellApi}>Confirm</button>    
                    </div>
                </Modal.Body> 
            </Modal>    
        </>
    )
}

