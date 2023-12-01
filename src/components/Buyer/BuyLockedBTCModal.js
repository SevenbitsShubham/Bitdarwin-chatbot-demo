import React,{useState,useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import BigNumber from "bignumber.js";
import './index.css'

export default function BuyLockedBTCModal(props){


    useEffect(()=>{
        // console.log("ltx",props.viewContractDetails?.quantity,props.viewContractDetails.strikePrice)
        let reqBuyAmountInUSDC = (new BigNumber(props.viewContractDetails?.quantity).multipliedBy(new BigNumber(props.viewContractDetails.strikePrice))).toNumber().toPrecision(2)
        props.setBuyAmount(reqBuyAmountInUSDC)
    },[props.viewContractDetails])

    useEffect(()=>{},[props.buyAmount])

    
    return(
        <>
        <Modal
                show={props.lockedBTCMode}
                onHide={() => props.setLockedBTCMode(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className='modal-schema'
                >
                <Modal.Header closeButton className='modal-header-schema'>
                    <Modal.Title id="contained-modal-title-vcenter" className='text-white'>
                    Buy Locked BTC
                    </Modal.Title>
                </Modal.Header>
                {
                    props.buyAmount ?
                        <Modal.Body>
                        {/* <h4>Centered Modal</h4> */}
                        <p className='text-center text-dark'>
                            To buy the locked BTC from the contract, please pay the required amount mentioned below.
                        </p>
                        <p className='text-center text-dark'>
                            Contract Address: <i>{props.viewContractDetails?.contractAddress}</i>
                        </p>
                        <div className='d-flex justify-content-center'>
                            <button className="m-2 btn btn-success" onClick={(event)=>props.handleBuyLockedBTC(event)} disabled={props.processing}>Pay {props.buyAmount} USDC</button>
                            <button className="m-2 btn btn-danger" onClick={() => props.setLockedBTCMode(false)}>Cancel</button>

                        </div>
                    </Modal.Body>
                    :
                    null
                }
                </Modal>    
        </>
    )
}




            