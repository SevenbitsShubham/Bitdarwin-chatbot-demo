import React,{useState,useEffect} from 'react'
import Api from '../../utils/Api';
import {QRCodeCanvas} from 'qrcode.react';
import Emitter from '../../utils/Emitter';
import Form from 'react-bootstrap/Form';
import Loader from '../Loader';


export default function AccountSection(props){
    const [poolAddress,setPoolWalletAddres] = useState()
    const [loading,setLoading] = useState(false)
    const [offTxForm,setOffTxForm] = useState({userTxHash:null})
    const [processing,setProcessing] = useState(false)

    useEffect(()=>{
        getPoolWalletAddress()
    },[])
    
    //function is used hit /moneyMaker/getUserPoolAddress api to get pool wallet address
    const getPoolWalletAddress = async() =>{
        try{
            setLoading(true)
            let response = await Api.get('/moneyMaker/getUserPoolAddress') 
            setPoolWalletAddres(response.data.poolAddress)
            setLoading(false)
        }
        catch(error){
            console.log("error",error)
            setLoading(false)
        }
    }

    //function is used to hit /moneyMaker/validateOffPortalLockTx api for transaction validation
    const handleTxForm = async(e) =>{
        try{ 
         e.preventDefault()
         setProcessing(true) 
            if(!offTxForm.userTxHash){
                 alert("Please enter transaction hash.")
            }

 
            let payload = {
             walletAddress:props.account,
             txHash:offTxForm.userTxHash,
            }
 
            let response = await Api.post('/moneyMaker/validateOffPortalLockTx',payload)
            setProcessing(false)
            alert("Your transaction is validated successfully.")
            Emitter.emit('callBalanceApi',null)
        }
        catch(error){
          console.log("error",error)
          setProcessing(false)
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
                                        <Form.Control size="lg" className='mt-3' type="text" placeholder="Enter transaction hash." onChange={(e)=>setOffTxForm((data)=>({...data,userTxHash:e.target.value}))}  />  
                                        <button className='btn btn-primary mt-3 btn-schema' onClick={(e)=>handleTxForm(e)}>Proceed</button>   
                                    </form>
                                </div>
                        </div>     
                    </div>
           </div>
            :
            <p>...loading...</p>
           }   
           {
            processing ?
                <Loader/>
            :
            null                        
            }
       </div>
       </>        
    )
}