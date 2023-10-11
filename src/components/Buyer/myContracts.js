import React,{useState} from 'react'
import ContractDetailModal from './ContractDetailModal'
import ContractResellModal from './ContractResellModal'


export default function MyContracts(props){
    const [viewDetailsModalShow,setViewDetailsModalShow] = useState(false)
    const [resellModal,setResellModal] = useState(false)
    const [viewContractDetails,setViewContractDetails]= useState(false)
    

    const handleViewContractDetails = (reqContractDetails) =>{
        setViewDetailsModalShow(true)
        setViewContractDetails(reqContractDetails)
    }

    const handleResell = (reqContractDetails) =>{
        setResellModal(true)   
        setViewContractDetails(reqContractDetails)
    }
    
    return(
        <>
        <table class="table">
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
                                            contractDetails.status === "inprocess" ?
                                                <td><button className='btn btn-danger' onClick={()=>handleResell(contractDetails)}>Sell</button></td>
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

            </table>    
            <ContractDetailModal viewDetailsModalShow={viewDetailsModalShow} setViewDetailsModalShow={setViewDetailsModalShow} viewContractDetails={viewContractDetails}/>
            <ContractResellModal resellModal={resellModal} setResellModal={setResellModal} viewContractDetails={viewContractDetails} getUserContracts={props.getUserContracts}/>

        </>
    )
}