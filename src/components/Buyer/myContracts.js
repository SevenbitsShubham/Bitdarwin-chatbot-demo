import React from 'react'


export default function MyContracts(props){
    
    return(
        <>
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
                                props.myContractsList.map((contractDetails,i)=>{
                                        return(
                                        <tr key={contractDetails.contractAddress}>
                                        <th scope="row">{i+1}</th>
                                        <td>{contractDetails.strikePrice}</td>
                                        <td>{contractDetails.premium}</td>
                                        <td>{contractDetails.openInterest}</td>
                                        <td>{contractDetails.contractAddress}</td>
                                        <td>{contractDetails.expirationDate}</td>
                                        {/* <td><button className='btn btn-danger' >Buy</button></td>  */}
                                        {/* //onClick={()=>setupModal(contractDetails)} */}
                                        </tr>
                                        )
                                    })
                            }
                            
                        </tbody>
                        
                        </table>      
        </>
    )
}