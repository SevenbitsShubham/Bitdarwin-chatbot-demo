import React,{useState,useEffect} from 'react'
import Api from '../../utils/Api';
import {QRCodeCanvas} from 'qrcode.react';
import Form from 'react-bootstrap/Form';


export default function AccountSection(props){
    const [poolAddress,setPoolWalletAddres] = useState()
    const [loading,setLoading] = useState(false)
    const [offTxForm,setOffTxForm] = useState({userWalletAddress:null,userTxHash:null,userAssetQuantity:null})
    const [processing,setProcessing] = useState(false)

    useEffect(()=>{
        getPoolWalletAddress()
    },[])
    
    const getPoolWalletAddress = async() =>{
        try{
            setLoading(true)
            let response = await Api.get('/moneyMaker/getUserPoolAddress') 
            console.log("log",response.data.poolAddress)
            setPoolWalletAddres(response.data.poolAddress)
            setLoading(false)
        }
        catch(error){
            console.log("error",error)
            setLoading(false)
        }
    }

    const handleTxForm = async(e) =>{
        try{ 
         e.preventDefault()
         setProcessing(true)
            if(!offTxForm.userWalletAddress){
                 alert("Please enter Wallet Address.")
            }         
 
            if(!offTxForm.userTxHash){
                 alert("Please enter transaction hash.")
            }
 
            if(!offTxForm.userAssetQuantity){
                 alert("Please enter quantity .")
            }
 
            let payload = {
             walletAddress:props.account,
             userWalletAddress:offTxForm.userWalletAddress,
             txHash:offTxForm.userTxHash,
             quantity:offTxForm.userAssetQuantity
            }
 
         //    console.log("checker")
            let response = await Api.post('/moneyMaker/validateOffPortalLockTx',payload)
            console.log("debug20",response)
            setProcessing(false)
            alert("Your transaction is validated successfully.")
        }
        catch(error){
          console.log("error",error)
          setProcessing(true)
          alert(error.response.data)
        } 
     }

    return(
       <>
       <div className='container py-5'>
            
           {
           !loading  ?
           <div>
                <h3 className='text-center header-schema'>Account Settings</h3>
                    <div className='d-flex justify-content-center'>
                            <QRCodeCanvas 
                                value={poolAddress}
                                size={180}
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                style={{ height: "auto", maxWidth:"20%", width:"20%", padding:"15px" }}
                                includeMargin={true}
                        />
                    </div>  
                    <h5 className='text-center header-schema'>Scan above QR code to get Pool Wallet Address.</h5>   
                    <div className='d-flex justify-content-center mt-5'>
                        <div className='validation-schema'>
                                <h6 className='header-schema'>Kindly provide transaction details below for transaction validation:</h6>   
                                    <div >
                                    <form>
                                        <Form.Control size="lg" className='mt-3' type="text" placeholder="Enter user wallet address." onChange={(e)=>setOffTxForm((data)=>({...data,userWalletAddress:e.target.value}))}  />   
                                        <Form.Control size="lg" className='mt-3' type="text" placeholder="Enter transaction hash." onChange={(e)=>setOffTxForm((data)=>({...data,userTxHash:e.target.value}))}  />  
                                        <Form.Control size="lg" className='mt-3' type="text" placeholder="Enter Quantity." onChange={(e)=>setOffTxForm((data)=>({...data,userAssetQuantity:e.target.value}))}  />   
                                        <button className='btn btn-primary mt-3 btn-schema' onClick={(e)=>handleTxForm(e)}>Proceed</button>        
                                    </form>
                                </div>
                        </div>     
                    </div>
           </div>
            :
            <p>...Loading...</p>
           }    
       </div>
       </>        
    )
}