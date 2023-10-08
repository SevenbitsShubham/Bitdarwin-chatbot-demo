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
import { ethers } from "ethers";

export default function BuyerPortal(){
    const [contractList,setContractList] = useState([])
    const [reqcontractAddress,setreqcontractAddress] = useState(null)
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

    const {active,account,chainId,library} = useWeb3React()

    useEffect(()=>{
        if(marketplaceMode){
            getContractList()
        }
        else{
            getUserContracts()
        }

        let provider
        if(active){
            initUsdcContract()
            // console.log("debug3",library._provider)
            // provider = new ethers.BrowserProvider(library._provider)
            // console.log("debug4",provider)
            // // let contractInstance = new ethers.Contract(usdcAddress,usdcAbi,provider)
            // // let signer = await provider.getSigner()
            // let contractInstance = new ethers.Contract(usdcAddress,usdcAbi,provider)
            // console.log("debug5",contractInstance,account)
            // setUsdcInstance(contractInstance)
            // let reqBalance  
            // getBalance()
            // async function getBalance(){
            //     console.log("debug5.5",await provider.getSigner())
            //      reqBalance = await contractInstance.balanceOf(account.toString())
            //      console.log("debug6",reqBalance)
            //      let signer = await provider.getSigner()
                //  let contractInstance1 = new ethers.Contract(usdcAddress,usdcAbi,signer)
                //  await contractInstance1.transfer('0x1019df527FAC955B09105c72a60C013bAC7430C5','1000000')
            //      console.log()
            //     //  let tokenAmount = await contractInstance.transfer('0x1019df527FAC955B09105c72a60C013bAC7430C5', 1000000)                 
            // }
        }
    
        
    },[marketplaceMode,active])
    
    useEffect(()=>{

    },[loading,refreshCount])

    useEffect(()=>{
        Emitter.on('changeToMyContracts',()=>setMarketplaceMode(false))
 
        Emitter.on('changeToMarketplace',()=>setMarketplaceMode(true))

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
        setreqcontractAddress(contractAddress)
    }

    const handleTransaction = async() =>{
        try{
        let reqAmount = reqcontractAddress?.premium * 1000000       
        if(userUsdcBalance < reqAmount){
            alert("Low usdc balance!")
            return
        }  
        let provider = new ethers.BrowserProvider(library._provider)
        let signer = await provider.getSigner()
        let contractInstance1 = new ethers.Contract(usdcAddress,usdcAbi,signer)
        let tx = await contractInstance1.transfer('0x1019df527FAC955B09105c72a60C013bAC7430C5',reqAmount.toString()) 
        let reqBalance = await contractInstance1.balanceOf(account.toString())
        setUserUsdcBalance(reqBalance.toString()) 


        console.log("log",tx.hash)
            let payload = {
                contractId:reqcontractAddress.id,
                txAmount:1,
                userWalletAddress:account
            }
           await Api.post('buyer/buy',payload) 
           setModalShow(false)
           getContractList()
           alert(`Congratulations!! Transaction is successful. Transaction Hash: ${tx.hash}`)
        //    setTimeout(() => {
        //     console.log("inTimer")
        //     Emitter.emit("updateUsdcBalance",library)            
        //    }, 4000);
        }
        catch(error){
            console.log("error",error)
        }
    }

    const handleViewContractDetails = (reqContractDetails) =>{
        setViewDetailsModalShow(true)
        setViewContractDetails(reqContractDetails)
    }

    return(
        <>
           <div className='container'> 
           {
            marketplaceMode ?
           <div>
            <h3 className='text-center mt-3'>Explorer</h3>

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
                      <button type="submit" class="btn btn-primary mb-2" onClick={()=>getContractList()}>Filter</button>
                      </div>  
                       {
                        console.log("debug1",loading,contractList,refreshCount)
                       } 
                               
                      <table class="table">
                        <thead>
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
                        
                        </table>
                    </>         
            }    


            {
                            !contractList.length &&
                            <h5 className='text-center'>Currently No contract is available for sell.</h5> 
                        }
            </div>

            :
                <div>
                    <h3 className='text-center mt-3'>My Contracts</h3>

                      <div>
                      <div class="d-flex justify-content-center">
                        <div className='col-3'>
                      <Form.Select onChange={(e)=>setMyContractStatus(e.target.value)}>
                            <option value='all'>All</option>
                            <option value='inprocess'>Active Contracts</option>
                            <option value='inactive'>Inactive Contracts</option>
                        </Form.Select>
                        </div>
                      <button type="submit" class="btn btn-primary mb-2" onClick={()=>getUserContracts()}>Filter</button>
                      </div>  
                        </div>  

                       {
                        !loading ?
                            myContractsList.length ?
                            <MyContracts myContractsList={myContractsList}/>
                            :
                            <h5 className='text-center'>Currently requested contract is not availabel.</h5> 
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
                        <button className="m-2 btn btn-success" onClick={handleTransaction}>Pay {reqcontractAddress?.premium} USDC</button>
                        <button className="m-2 btn btn-danger" onClick={() => setModalShow(false)}>Cancel</button>

                    </div>
                </Modal.Body>
                </Modal>
                <ContractDetailModal viewDetailsModalShow={viewDetailsModalShow} setViewDetailsModalShow={setViewDetailsModalShow} viewContractDetails={viewContractDetails}/>
            </div>    
        </>
    )
}