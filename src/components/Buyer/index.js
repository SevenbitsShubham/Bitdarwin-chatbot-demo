import React,{useState,useEffect} from 'react'
import { useWeb3React } from '@web3-react/core'
import Api from '../../utils/Api';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Emitter from '../../utils/Emitter';
import Form from 'react-bootstrap/Form';
import MyContracts from './myContracts'
import ContractDetailModal from './ContractDetailModal'
import Table from 'react-bootstrap/Table';
import {usdcAbi,usdcAddress} from '../../utils/usdcContract'
import {handleUserRegistration,generateRandomString} from '../../utils/helper'
import { ethers } from "ethers";
import Loader from '../Loader';
import './index.css'

export default function BuyerPortal(){
    const [contractList,setContractList] = useState([])
    const [reqcontract,setreqcontract] = useState(null)
    const [modalShow,setModalShow] = useState(false)
    const [viewDetailsModalShow,setViewDetailsModalShow] = useState(false)
    const [myContractsList,setMyContractsList] = useState([])
    const [marketplaceMode,setMarketplaceMode] = useState(true)
    const [listContractType,setListContractType] = useState('MoneyMaker')
    const [contractType,setContractType] = useState('MoneyMaker')
    const [contractStatus,setMyContractStatus] = useState('all')
    const [viewContractDetails,setViewContractDetails]= useState()
    const [refreshCount,setRefreshCount] = useState(0)
    const [usdcInstance,setUsdcInstance] = useState()
    const [userUsdcBalance,setUserUsdcBalance] = useState(0)
    const [loading,setLoading] = useState(false)
    const [processing,setProcessing] =useState(false)

    const {active,account,chainId,library} = useWeb3React()

    useEffect(()=>{
        let provider
        if(active){
            if(marketplaceMode){
                getContractList()
            }
            else{
                getUserContracts()
            }
            initUsdcContract()
        }
    },[marketplaceMode,active])
    
    useEffect(()=>{

    },[loading,refreshCount])

    useEffect(()=>{
        Emitter.on('changeToMyContracts',()=>setMarketplaceMode(false))
 
        Emitter.on('changeToMarketplace',()=>{
            setListContractType("MoneyMaker")
            setMarketplaceMode(true)
        })

    },[])

    const initUsdcContract = async() =>{
        try{
            let provider = new ethers.BrowserProvider(library._provider)
            let signer = await provider.getSigner()
            let contractInstance1 = new ethers.Contract(usdcAddress,usdcAbi,signer)
            let reqBalance = await contractInstance1.balanceOf(account.toString())
            setUserUsdcBalance(reqBalance.toString())
            setUsdcInstance(contractInstance1)
        }
        catch(error){
            console.log("error",error)
        }
    }

    const getUserContracts = async() =>{
        try{
            setLoading(true)
            let payload={
                contractType,
                contractstatus: contractStatus,
                walletAddress: account
            }
            let userContracts = await Api.post('/buyer/ownerContractList',payload)
            console.log("log15",userContracts)
            setMyContractsList(userContracts.data.contractList)
            setContractType(userContracts.data.contractType)
            setLoading(false)
        }
        catch(error){
            setLoading(false)
            console.log("error",error)
        }
    }

    const getContractList = async() =>{
        try{  
            setLoading(true)  
            let payload = {
                walletAddress:account,
                contractType: listContractType
            }
            let reqContractList = await Api.post('/buyer/contract/list',payload)
            console.log("debug2",reqContractList.data.contractLists)
            setContractList(reqContractList.data.contractLists)
            setRefreshCount(refreshCount+1)
            setLoading(false)
        }
        catch(error){
            setLoading(false)
            console.log(error)
        }
    }

    const setupModal = (contractAddress) =>{
        setModalShow(true)
        setreqcontract(contractAddress)
    }

    const handleTransaction = async() =>{
        try{
            setProcessing(true)
        let reqAmount = reqcontract?.premium * 1000000    
        if(userUsdcBalance < reqAmount){
            alert("Low usdc balance!")
            setProcessing(false)
            return
        }  
        let provider = new ethers.BrowserProvider(library._provider)
        let signer = await provider.getSigner()
        let contractInstance1 = new ethers.Contract(usdcAddress,usdcAbi,signer)
        let tx = await contractInstance1.transfer('0x1019df527FAC955B09105c72a60C013bAC7430C5',reqAmount.toString()) 
        let newUserBalance = await contractInstance1.balanceOf(account.toString())
        setUserUsdcBalance(newUserBalance.toString()) 

        let randomString,hash,signForIcpAuth
        //if deployment is of ICP we will create random string and concatinate it with account address and pass this message for signature from the user     
        if(reqcontract.deployment === 'ICP'){ 
        randomString =  await generateRandomString() //function to create random string
        hash = account+randomString
        signForIcpAuth = await signer.signMessage(JSON.stringify(hash)) 
        }        

        console.log("log",tx.hash)
            let payload = {
                contractAddress:reqcontract.contractAddress,
                txHash:tx.hash,
                userWalletAddress:account,
                icpLoginHash:hash,
                signForIcpAuth
            }
           await Api.post('buyer/buy',payload) 
           setModalShow(false)
           getContractList()
           alert(`Congratulations!! Transaction is successful. Transaction Hash: ${tx.hash}`)
        //    setTimeout(() => {
        //     console.log("inTimer")
        //     Emitter.emit("updateUsdcBalance",library)            
        //    }, 4000);
        setProcessing(false)
        }
        catch(error){
            setProcessing(false)
            console.log("error",error)
        }
    }

    const handleViewContractDetails = (reqContractDetails) =>{
        setViewDetailsModalShow(true)
        setViewContractDetails(reqContractDetails)
    }

    return(
        <>
        <div className='main2Div'>
           <div className='container'> 
           {
            marketplaceMode ?
           <div>
            <h2 className='text-center pt-3 header-schema'>Explorer</h2>

            {
                    !active ?
                      <h4 className='text-center text-danger mt-2'>Please Connect your wallet!</h4>
                    :
                    <>
                        <div class="d-flex justify-content-center">
                        <div className='col-3'>
                      <Form.Select onChange={(e)=>setListContractType(e.target.value)}>
                            <option value='MoneyMaker'>OptionContract(c)</option>
                            <option value='HousingContract'>HousingContract</option>
                        </Form.Select>
                        </div>
                      <button type="submit" class="btn mb-2 btn-schema" onClick={()=>getContractList()}>Filter</button>
                      </div>  
                      
                      <Table responsive borderless className=" table-schema bg-dark">
                        <thead className='table-border-bottom'>
                            <tr>
                            <th scope="col">Sr. No.</th>
                            <th scope="col">Contract Type</th>
                            <th scope="col">Contract Addr.</th>
                            <th scope="col">Premium</th>
                            <th scope="col">Expiration Date</th>
                            <th></th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                !loading ?
                                 contractList.length ?
                                    contractList.map((contractDetails,i)=>{
                                        return(
                                        <tr key={contractDetails.contractAddress}>
                                        <th scope="row">{i+1}</th>
                                        <td>{contractDetails.contractType==='MoneyMaker'?'OptionContract(c)':contractDetails.contractType}</td> 
                                        <td>{contractDetails.contractAddress}</td>
                                        <td>{contractDetails.premium} USDC</td>
                                        <td>{contractDetails.expirationDate}</td>
                                        <td><button className='btn btn-success' onClick={()=>handleViewContractDetails(contractDetails)}>View Details</button></td>
                                        <td><button className='btn btn-danger' onClick={()=>setupModal(contractDetails)}>Buy</button></td>
                                        </tr>
                                        )
                                    })
                                    :
                                    null
                                    :
                                    <h5 className='text-center'>Loading...</h5>    
                            }
                            
                        </tbody>
                        
                        </Table>
                    </>         
            }    


            {
                            !contractList.length && active  ?
                            <h5 className='text-center header-schema'>Currently No contract is available for sell.</h5> 
                            :
                            null
                        }
            </div>

            :
                <div>
                    <h3 className='text-center header-schema pt-3'>My Contracts</h3>

                      <div>
                      <div class="d-flex justify-content-center">
                        <div className='col-3'>
                      <Form.Select onChange={(e)=>setMyContractStatus(e.target.value)}>
                            <option value='all'>All</option>
                            <option value='inprocess'>Active Contracts</option>
                            <option value='inactive'>Inactive Contracts</option>
                        </Form.Select>
                        </div>
                      <button type="submit" class="btn btn-schema mb-2" onClick={()=>getUserContracts()}>Filter</button>
                      </div>  
                        </div>  

                       {
                        !loading ?
                            myContractsList.length ?
                            <MyContracts myContractsList={myContractsList} getUserContracts={getUserContracts} account={account} userUsdcBalance={userUsdcBalance} processing={processing} setProcessing={setProcessing} />
                            :
                            <h5 className='text-center header-schema'>Currently requested contract is not availabel.</h5> 
                        :
                        null    
                       } 
                </div>
            }                
                <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                className='modal-schema'
                >
                <Modal.Header closeButton className='modal-header-schema'>
                    <Modal.Title id="contained-modal-title-vcenter" className='text-white'>
                    Buy Contract
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* <h4>Centered Modal</h4> */}
                    <p className='text-center text-dark'>
                        To complete the process please pay the required amount mentioned below.
                    </p>
                    <p className='text-center text-dark'>
                        Contract Address: <i>{reqcontract?.contractAddress}</i>
                    </p>
                    <div className='d-flex justify-content-center'>
                        <button className="m-2 btn btn-success" onClick={handleTransaction}>Pay {reqcontract?.premium} USDC</button>
                        <button className="m-2 btn btn-danger" onClick={() => setModalShow(false)}>Cancel</button>

                    </div>
                </Modal.Body>
                </Modal>
                <ContractDetailModal viewDetailsModalShow={viewDetailsModalShow} setViewDetailsModalShow={setViewDetailsModalShow} viewContractDetails={viewContractDetails}/>
            </div>    

            {
                processing?
                    <Loader/>
                :
                 null
            }
            </div> 
        </>
    )
}