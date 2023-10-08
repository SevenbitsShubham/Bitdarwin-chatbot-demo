import React,{useState,useEffect} from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './index.css'

export default function ContractDetailModal(props){

    useEffect(()=>{

    },[])

    return(
       <>
            <Modal
                show={props.viewDetailsModalShow}
                onHide={() => props.setViewDetailsModalShow(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Contract Details
                    </Modal.Title>
                </Modal.Header>
                {
                    props.viewContractDetails?
                        
                            props.viewContractDetails.contractType === "MoneyMaker" ?
                            <Modal.Body>
                            {/* <h4>Centered Modal</h4> */}
                            <div className='row modal-details-row'>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Contract Type</b>: {props.viewContractDetails.contractType}
                                    </p>
                                </div>
                                <div className='col'>    
                                    <p className='start text-dark'>
                                    <b>Contract Address</b>: {props.viewContractDetails.contractAddress}
                                    </p>
                                </div>
                            </div>
                            <div className='row modal-details-row'>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Strike Price</b>: {props.viewContractDetails.strikePrice}
                                    </p>
                                </div>
                                <div className='col'>    
                                    <p className='text-start text-dark'>
                                    <b>Open Interest</b>: {props.viewContractDetails.openInterest}
                                    </p>
                                </div>
                            </div>
                            <div className='row modal-details-row'>
                            <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Quantity</b>: {props.viewContractDetails.quantity} {props.viewContractDetails.currency}
                                    </p>
                                </div>
                                <div className='col'>    
                                    <p className='text-start text-dark'>
                                    <b>Expiration Date</b>: {props.viewContractDetails.expirationDate}
                                    </p>
                                </div>
                            </div>
                            <div className='d-flex justify-content-center'>
                                {/* <button className="m-2 btn btn-success" onClick={handleTransaction}>Pay $200</button> */}
                                <button className="m-2 btn btn-danger" onClick={() => props.setViewDetailsModalShow(false)}>Cancel</button>
                            </div>
                            </Modal.Body>
                            :
                            <Modal.Body>
                            {/* <h4>Centered Modal</h4> */}
                            <div className='row modal-details-row'>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Contract Type</b>: {props.viewContractDetails.contractType}
                                    </p>
                                </div>
                                <div className='col'>    
                                    <p className='start text-dark'>
                                    <b>Contract Address</b>: {props.viewContractDetails.contractAddress}
                                    </p>
                                </div>
                            </div>
                            <div className='row modal-details-row'>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Contract Title</b>: {props.viewContractDetails.title}
                                    </p>
                                </div>
                                <div className='col'>    
                                    <p className='text-start text-dark'>
                                    <b>Seller</b>: {props.viewContractDetails.seller}
                                    </p>
                                </div>
                            </div>
                            <div className='row modal-details-row'>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Buyer</b>: {props.viewContractDetails.buyer}
                                    </p>
                                </div>
                                <div className='col'>    
                                    <p className='text-start text-dark'>
                                    <b>Expiration Date</b>: {props.viewContractDetails.expirationDate}
                                    </p>
                                </div>
                            </div>
                            <div className='row modal-details-row'>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Address</b>: {props.viewContractDetails.propertyAddress}
                                    </p>
                                </div>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Governing Law</b>: {props.viewContractDetails.governingLaw} 
                                    </p>
                                </div>
                            </div>
                            <div className='row modal-details-row'>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Terms</b>: {props.viewContractDetails.terms}
                                    </p>
                                </div>
                                <div className='col'>
                                    <p className='text-start text-dark'>
                                    <b>Price</b>: {props.viewContractDetails.sellingPrice} 
                                    </p>
                                </div>
                            </div>
                            <div className='d-flex justify-content-center'>
                                {/* <button className="m-2 btn btn-success" onClick={handleTransaction}>Pay $200</button> */}
                                <button className="m-2 btn btn-danger" onClick={() => props.setViewDetailsModalShow(false)}>Cancel</button>
                            </div>
                            </Modal.Body>
                    :
                    null        
                            
                }
                
                </Modal>            
       </> 
    )
}