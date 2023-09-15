import React,{useState,useEffect} from 'react'
import { useWeb3React } from '@web3-react/core'
import Api from '../../utils/Api';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';


export default function BuyerPortal(){
    const [contractList,setContractList] = useState([])
    const [reqcontractAddress,setreqcontractAddress] = useState(null)
    const [modalShow,setModalShow] = useState(false)
    const {active,account,chainId,library} = useWeb3React()


    useEffect(()=>{
        getContractList()
    },[])
    
    useEffect(()=>{

    },[contractList.length])


    const getContractList = async() =>{
        try{    
            let reqContractList = await Api.get('/buyer/contract/list')
            setContractList(reqContractList.data.contractLists)
        }
        catch(error){
            console.log(error)
        }
    }

    const setupModal = (contractAddress) =>{
        setModalShow(true)
        setreqcontractAddress(contractAddress)
    }

    const handleTransaction = async() =>{
        try{

            let payload = {
                contractId:reqcontractAddress.id,
                txAmount:200,
                userWalletAddress:account
            }
           await Api.post('buyer/buy',payload) 
           setModalShow(false)
           getContractList()
           alert("Congratulations!! Transaction is successful.")
           
        }
        catch(error){
            console.log("error",error)
        }
    }

    return(
        <>
           <div className='container'> 
            <h3 className='text-center mt-3'>Buyer Portal</h3>

            {
                    !active ?
                      <h4 className='text-center text-danger mt-2'>Please Connect your wallet!</h4>
                    :
                    <table class="table">
                        <thead>
                            <tr>
                            <th scope="col">Sr. No.</th>
                            <th scope="col">Strike Price</th>
                            <th scope="col">Premium</th>
                            <th scope="col">Open Interest</th>
                            <th scope="col">Contract Addr.</th>
                            <th scope="col">Expiration Date</th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                contractList.length ?
                                    contractList.map((contractDetails,i)=>{
                                        return(
                                        <tr key={contractDetails.contractAddress}>
                                        <th scope="row">{i+1}</th>
                                        <td>{contractDetails.strikePrice}</td>
                                        <td>{contractDetails.premium}</td>
                                        <td>{contractDetails.openInterest}</td>
                                        <td>{contractDetails.contractAddress}</td>
                                        <td>{contractDetails.expirationDate}</td>
                                        <td><button className='btn btn-danger' onClick={()=>setupModal(contractDetails)}>Buy</button></td>
                                        </tr>
                                        )
                                    })
                                    :
                               null   
                            }
                            
                        </tbody>
                        
                        </table>
                       
            }    
            {
                            !contractList.length &&
                            <h5 className='text-center'>Currently No contract is available for sell.</h5> 
                        }
                <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Buy Contract
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* <h4>Centered Modal</h4> */}
                    <p className='text-center text-dark'>
                        To complete the process please pay the required amount mentioned below.
                    </p>
                    <p className='text-center text-dark'>
                        Contract Address: <i>{reqcontractAddress?.contractAddress}</i>
                    </p>
                    <div className='d-flex justify-content-center'>
                        <button className="m-2 btn btn-success" onClick={handleTransaction}>Pay $200</button>
                        <button className="m-2 btn btn-danger" onClick={() => setModalShow(false)}>Cancel</button>
                    </div>
                </Modal.Body>
                </Modal>
            </div>    
        </>
    )
}