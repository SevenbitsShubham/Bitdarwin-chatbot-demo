import React,{useState} from 'react'
import ContractDetailModal from './ContractDetailModal'
import ContractResellModal from './ContractResellModal'
import Table from 'react-bootstrap/Table';
import BuyLockedBTCModal from './BuyLockedBTCModal'
import { ethers } from "ethers";
import { useWeb3React } from '@web3-react/core';
import {usdcAbi,usdcAddress} from '../../utils/usdcContract'
import Api from '../../utils/Api';
import './index.css'

export default function MyContracts(props){
    const [viewDetailsModalShow,setViewDetailsModalShow] = useState(false)
    const [resellModal,setResellModal] = useState(false)
    const [viewContractDetails,setViewContractDetails]= useState(false)
    const [lockedBTCMode,setLockedBTCMode] = useState(false)
    const [buyAmount,setBuyAmount] = useState(0)

    const {account,library} = useWeb3React()

    //function is used to handle contract detail modal
    const handleViewContractDetails = (reqContractDetails) =>{
        setViewDetailsModalShow(true)
        setViewContractDetails(reqContractDetails)
    }

    //function is used to handle resell modal
    const handleResell = (reqContractDetails) =>{
        setResellModal(true)   
        setViewContractDetails(reqContractDetails)
    }

    //function is used to handle buy contract BTC modal
    const handleBuyBTC = async(contractDetails) =>{
        setLockedBTCMode(true)
        setViewContractDetails(contractDetails)
    }

    //function is used to hit /buyer/buyLockedBTC api to purchase locked btc in expired contract
    const handleBuyLockedBTC = async(e) =>{
        try{
            e.preventDefault()
            props.setProcessing(true)
            // let reqAmount = props.viewContractDetails?.quantity * props.viewContractDetails.strikePrice    
            if(props.userUsdcBalance < buyAmount){
                alert("Low usdc balance!")
                props.setLoading(false)
                return
            }      
        let provider = new ethers.BrowserProvider(library._provider)
        let signer = await provider.getSigner()
        let contractInstance1 = new ethers.Contract(usdcAddress,usdcAbi,signer)
        let tx = await contractInstance1.transfer('${process.env.REACT_APP_SYSTEM_WALLET}',buyAmount* 1000000) 
        let newUserBalance = await contractInstance1.balanceOf(account.toString())
        // setUserUsdcBalance(newUserBalance.toString()) 
        alert(`Transaction Hash:${tx.hash},further vaidation process will take some time.`)
        setLockedBTCMode(false)
            let payload = {
                contractAddress:viewContractDetails.contractAddress,
                userAddress: account,
                txHash: tx.hash
            }
            let apiResponse =  await Api.post('/buyer/buyLockedBTC',payload) 
            // console.log("apiResponse",apiResponse)
            alert(`Congratulations!! Transaction is successful. Transaction Hash:${apiResponse.data.txHash}`)
            props.getUserContracts()
            props.setProcessing(false)
        }
        catch(error){
            console.log("error",error)
            props.setProcessing(false)
        }
    }

    
    return(
        <>
        <Table responsive borderless className=" table-schema bg-dark">
                        <thead>
                            <tr>
                            <th scope="col">Sr. No.</th>
                            <th scope="col">Contract Type</th>
                            <th scope="col">Contract Addr.</th>
                            <th scope="col">Expiration Date</th>
                            <th></th>
                            <th></th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                props.myContractsList.length ?
                                 props.myContractsList.map((contractDetails,i)=>{
                                        return(
                                        <tr key={contractDetails.contractAddress}>
                                        <th scope="row">{i+1}</th>
                                        <td>{contractDetails.contractType==='MoneyMaker'?'OptionContract(c)':contractDetails.contractType }</td> 
                                        <td>{contractDetails.contractAddress}</td>
                                        <td>{contractDetails.expirationDate}</td>
                                        <td><button className='btn btn-success' onClick={()=>handleViewContractDetails(contractDetails)}>View Details</button></td>
                                        {
                                            contractDetails.status === "inprocess" && contractDetails.CreaterId.walletAddress !== props.account ?
                                            <>
                                                <td><button className='btn btn-danger' onClick={()=>handleResell(contractDetails)}>Sell</button></td>
                                                <td></td>
                                            </>
                                            :
                                            null
                                        }
                                        {
                                            contractDetails.CreaterId.walletAddress === props.account ?
                                            <>
                                            <td>Owner*</td>
                                            <td></td>
                                            </>
                                            :
                                                contractDetails.status === 'processingWithAboveStrikePrice'?
                                                <>
                                                    <td><button className='btn btn-danger' onClick={()=>handleBuyBTC(contractDetails)}>Purchase BTC</button></td>
                                                    <td></td>

                                                </>
                                                :
                                                contractDetails.status !== 'inprocess' ?
                                                    <>
                                                    <td>Expired*</td>
                                                    <td></td>
                                                    </>
                                                    :
                                                    null

                                        }
                                        
                                        </tr>
                                        )
                                    })
                                    :
                                    null
                            }
                            
                        </tbody>

            </Table>    
            <ContractDetailModal viewDetailsModalShow={viewDetailsModalShow} setViewDetailsModalShow={setViewDetailsModalShow} viewContractDetails={viewContractDetails}/>
            <ContractResellModal resellModal={resellModal} setResellModal={setResellModal} viewContractDetails={viewContractDetails} getUserContracts={props.getUserContracts}/>
            <BuyLockedBTCModal lockedBTCMode={lockedBTCMode} setLockedBTCMode={setLockedBTCMode} viewContractDetails={viewContractDetails} userUsdcBalance= {props.userUsdcBalance} buyAmount={buyAmount} setBuyAmount={setBuyAmount} handleBuyLockedBTC={handleBuyLockedBTC} processing={props.processing}/>                
        </>
    )
}