import React,{useState,useEffect,useRef} from 'react'
import Form from 'react-bootstrap/Form';
import { OpenAI } from "langchain/llms/openai";
import { ConversationChain,LLMChain } from "langchain/chains";
import { PromptTemplate,ChatPromptTemplate,HumanMessagePromptTemplate } from 'langchain/prompts'; 
import {BufferMemory} from 'langchain/memory';
import {Chroma} from "langchain/vectorstores/chroma"
import {QRCodeCanvas} from 'qrcode.react';
import {OpenAIEmbeddings} from "langchain/embeddings/openai"
import {StructuredOutputParser} from "langchain/output_parsers";
import './index.css';
import Api from '../../utils/Api';
import { ethers } from "ethers";
import { useWeb3React } from '@web3-react/core';
import table1 from '../../utils/moneytMakers.json';
import table2 from '../../utils/housingContract.json';
import Emitter from '../../utils/Emitter';
import {askForReqFields,filterResponse} from '../../utils/langchainHelpers/moneyMakerQuestionFormHelper'
import {askHousingContractReqFields,filterHousingContractFormResponse} from '../../utils/langchainHelpers/housingContractQuestionFormHelper'
import {formatDateToDdMmYy,handleUserRegistration} from '../../utils/helper'
import AccountSection from './AccountSection'

/////////////////////// enable strictmode in react ///////////////////////////
export default function Home(){
    const [userInput,setUserInput] = useState('')
    const [chats,setChats] = useState([])
    const [promptManageMode,setPromptManageMode] = useState(false)
    const [contractCurrency,setContractCurrency] = useState()
    const [contractMode,setContractMode] = useState(false)
    const [postContractMode,setPostContractMode] = useState(false)
    const [questions,setQuestions] = useState([{que:"For how many months you want to create the contract?",params:[]} ,{que:"Please provide the desired strike price of the contract?",params:[]},{que:"Do you need assistance in Price prediction using ARIMA?.",params:[]},{que:`How much quantity of ${contractCurrency} you want to lock?`,params:[]},{que:"How much contract options you want to create?",params:[]}])
    const [promptFormatterCount,setPromptFormatterCount] = useState(0)
    const [contractCreationPropmptInputs,setPromptInputs] = useState([])
    const [loading,setLoading] = useState(false)
    const [processing,setProcessing] = useState(false)
    const [provider,setProvider] = useState()
    const [sqlQuery,setSqlQuery] = useState('')
    const [signature,setSignature] = useState()
    const [initPhase,setInitphase] = useState(false)
    const [userBalance,setBalance] = useState(0)
    const [messageCount,setmessageCount] = useState(0)
    const [isPricePlotIsrequested,setIsPricePlotIsrequested] = useState(false)
    const [contractParams,setcontractParams] = useState({strikePrice:null,premium:null,openInterest:null,expirationDate:null})
    const [lockBalanceMode,setLockBalanceMode] = useState(false)
    const [loackAssetsQuantity,setLoackAssetsQuantity] = useState(0)
    const [lockPoolAddresss,setLockPoolAddresss] = useState(null)
    const [verifyLockBalanceMode,setVerifyLockBalanceMode] = useState(false)
    const [poolTxHash,setPoolTxHash] =useState(null)
    const [tempQuantity,setTempQuantity] = useState(0)
    // const [currentContractParams,setcurrentContractParams]= useState({
    //     "currency": "BTC",
    //     "periodInMonth": 4,
    //     "needForstrikePriceAssistanceUsingARIMA": "yes",
    //     "strikePriceInUsd": 32000,
    //     "tokenQuantity": null,
    //     "noOfContracts": 3
    // })
    const [currentContractParams,setcurrentContractParams] = useState({currency:null,periodInMonth:null,needForstrikePriceAssistanceUsingARIMA:null,strikePriceInUsd:null,tokenQuantity:null,noOfContracts:null})
    const [housingContractParams,setHousingContractParams] = useState({titleOfContract:null,sellerName:null,buyerName:null,propertyAddress:null,sellingPriceOrRentPrice:null,closingDate:null,governingLaw:null,termsForContract:null})
    // const [housingContractParams,setHousingContractParams] = useState({
    //     "titleOfContract": "House Sale Contract",
    //     "sellerName": "Jim Carrey",
    //     "buyerName": "BuyerSam Altman",
    //     "propertyAddress": "House no. 56, New Jersey,USA",
    //     "sellingPriceOrRentPrice": 5000000,
    //     "closingDate": "2023-12-05",
    //     "governingLaw": "USA",
    //     "termsForContract": "Payment should be in Check."
    // })
    const [offTxForm,setOffTxForm] = useState({userWalletAddress:null,userTxHash:null,userAssetQuantity:null})
    const [moneymakerMode,setMoneyMakerMode] = useState(0)
    const [housingContractMode,setHousingContractMode] = useState(0)
    const [accountSectionMode,setAccountSectionMode] = useState(false)

    const inputRef = useRef()
    let convoChain 

    const {active,account,library} = useWeb3React()

    let memory = new BufferMemory({inputKey:'predictionMonths',memoryKey:'contractHistory'})
    let memeory1 = new BufferMemory()
    let chain
    let vectorStore

    console.log("debug123",active)
    useEffect(()=>{
        setupInitConvoChain()
        let potentialQueries1= generateSqlQueries(table1,"MoneyMakerContract")
        let potentialQueries2= generateSqlQueries(table2,"HousingContract")
        manageVectorSTorage([...potentialQueries1,...potentialQueries2])
        initBot()
        // handleOptionGeneration()
    },[])

    useEffect(()=>{
        Emitter.on('updateUserBalance',(data)=>{
            setBalance(data.latestBalance)
        })
        Emitter.on('setAccountSection',(data)=>{
            console.log("log30",data)
            setAccountSectionMode(data.status)
        })
    },[loading])

    useEffect(()=>{
        if(library){
            setProvider(new ethers.BrowserProvider(library._provider))
        }
    },[active])

    const handleContractFormConversation = async(inputText='No data available.',tempChats=[...chats]) =>{
        try{
            setLoading(true)
            //initialized tagging chain
            if(chats.length){
                if(chats[chats.length-1].text.includes('period')){
                    inputText = inputText + 'months'
                }

                if(chats[chats.length-1].text.includes('strike price') && chats[chats.length-1].text.includes('USD')){
                    inputText = 'Strike Price: $'+inputText 
                }

                if((chats[chats.length-1].text.includes('quantity') && chats[chats.length-1].text.includes('token'))){                   
                        alert("Platform fees of 0.0002BTC will be additionally charged from the wallet.We are transferring the funds to the pool wallet this may take some time.Thanks")
                        let txData = await handleAssetQuantityTransfer(inputText)   
                        console.log("debug21",txData)            
                        setLoading(false)
                        if(txData.status === "failed"){
                            handleExtPoolTxValidation(inputText,txData.poolAddress)

                            setTempQuantity(inputText)
                            return
                        }   
                        
                        setLoading(true)

                    inputText = 'quantity: '+inputText 
                }

                if(chats[chats.length-1].text.includes('ARIMA') ){
                    inputText = 'needForstrikePriceAssistanceUsingARIMA: '+inputText.toLowerCase() 
                }

                if(chats[chats.length-1].text.includes('number') && chats[chats.length-1].text.includes('call option contracts')){
                    inputText = 'number of call option contract: '+inputText 
                }
            }
            console.log("log23",inputText)
            let {remianingDetails,updatedDetails} = await filterResponse(inputText,currentContractParams)
            setcurrentContractParams(updatedDetails)
            console.log("remianingDetails",remianingDetails,"updatedDetails",updatedDetails)
            console.log("log21", isPricePlotIsrequested,updatedDetails.needForstrikePriceAssistanceUsingARIMA)
            if(isPricePlotIsrequested && (updatedDetails.needForstrikePriceAssistanceUsingARIMA=== "yes" || updatedDetails.needForstrikePriceAssistanceUsingARIMA=== "required")){
                let plotUrl= await handlePricePrediction()
                tempChats= [...tempChats,{text:plotUrl,role:'assistant',property:'plot',params:null }]
                setIsPricePlotIsrequested(false)
            }
            if(remianingDetails.length){
                setLoading(true)
                let requestedChat = await askForReqFields(remianingDetails[0])
                setLoading(false)
                console.log("log22",requestedChat)
                setChats(()=>[...tempChats,{text:requestedChat.text,role:'assistant',property:'' }])    
            }
            else{
                setIsPricePlotIsrequested(false)
                setPromptManageMode(false)
                setContractMode(true)
                // tempChats= [...tempChats,{text:inputText,role:'user',property:'',params:null }]
                handleOptionGeneration(tempChats)    
            }
            
        }
        catch(error){
            setLoading(false)
            console.log('error',error)
        }
    }

    const handleHousingContractFormConversation = async(inputText='No data available.',tempChats=[...chats]) =>{
        try{
            setLoading(true)
            //initialized tagging chain
            if(chats.length){
                console.log("log19",chats)
                if(chats[chats.length-1].text.includes('name') && (chats[chats.length-1].text.includes('selling')||chats[chats.length-1].text.includes('seller'))){
                    inputText =  'Seller' + inputText 
                }

                if(chats[chats.length-1].text.includes('buyer')){
                    inputText = 'Buyer'+inputText 
                }

                if(chats[chats.length-1].text.includes('quantity') && chats[chats.length-1].text.includes('token')){
                    inputText = 'quantity: '+inputText 
                }
            }
            console.log("log23",inputText)
            let {remianingDetails,updatedDetails} = await filterHousingContractFormResponse(inputText,housingContractParams)
            setHousingContractParams(updatedDetails)
            console.log("remianingDetails",remianingDetails,"updatedDetails",updatedDetails)

            if(remianingDetails.length){
                setLoading(true)
                let requestedChat = await askHousingContractReqFields(remianingDetails[0])
                setLoading(false)
                console.log("log22",requestedChat)
                setChats(()=>[...tempChats,{text:requestedChat.text,role:'assistant',property:'' }])    
            }
            else{
                console.log("inQuery")
                setPromptManageMode(false)
                setContractMode(true)
                setLoading(true)
                handleGenerateSqlqueryHousingContract(updatedDetails.titleOfContract,updatedDetails.buyerName,updatedDetails.sellerName,updatedDetails.governingLaw,updatedDetails.propertyAddress,updatedDetails.sellingPriceOrRentPrice,updatedDetails.termsForContract,updatedDetails.closingDate,tempChats)    
                setLoading(false)
            }
            
        }
        catch(error){
            setLoading(false)
            console.log('error',error)
        }
    }

    const handleAssetQuantityTransfer = async(quantity) =>{
        try{
            setProcessing(true)
            setLoackAssetsQuantity(quantity)
            setLockBalanceMode(true)
            let payload = {
                "walletAddress":account,
                "currency":currentContractParams.currency,
                "quantity":parseFloat(quantity) 
            }    
            let result= await Api.post('/moneyMaker/lockAssets',payload)
            alert(`${quantity} ${payload.currency} has been locked to pool wallet successfully.\nTransaction Hash: ${result.data.TransactionHash}`)
            setPoolTxHash(result.data.TransactionHash)    
            Emitter.emit('callBalanceApi',null)  
            setProcessing(false)
            return {status:"success",poolAddress:null}
        }
        catch(error){
            setProcessing(false)
            console.log("error",error)
            if(error.response?.data === 'Low wallet balance.'){
                return {status:"failed",poolAddress:error.response.data.poolwalletAddress}
                // handleExtPoolTxValidation(quantity,error.response.data.poolwalletAddress)
            }
        }
    }

    const handleExtPoolTxValidation = (quantity,poolAddress) =>{
        try{
           setChats(()=>[...chats,{text:quantity,role:'user',property:'' } ,{text:'Your wallet has lower balance than the entered amount,please go to Account Settings and transfer and validate the transaction from there.',role:'assistant',property:'' },{text:'',role:'assistant',property:'offTxMode' } ])    
           setLockPoolAddresss(poolAddress)
           setLockBalanceMode(false)
           setVerifyLockBalanceMode(true)
        }
        catch(error){
            console.log("error",error)
        }
    }

    const initBot = async(usermessage) =>{
        try{
            setLoading(true)
            let doc =[
                {
                  pageContent: `Human:Hi Bot: Welcome!.I am Ainstein, How can I help you.`,
                  metadata: {
                    speaker: "Human",
                  },
                },
                {
                    pageContent:`Human: Create call option contract. Bot:moneymakerBot.`,
                    metadata: {
                        speaker: "Human",
                      },
                },
                {
                    pageContent: `Human: Creat a housing contract. Bot:housingContract.`,
                    metadata: {
                      speaker: "Human",
                    },
                  },
                  
        ]

        vectorStore = await Chroma.fromDocuments( 
            doc,
            new OpenAIEmbeddings({openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY}), 
            {
            collectionName: "test-collection-10",
            url: "http://localhost:8080/http://localhost:8000", // Optional, will default to this value
            collectionMetadata: {
              "hnsw:space": "cosine",
            }, // Optional, can be used to  specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
         });

         let matching_result
            let tempChats 
            let result
            if(usermessage){
                matching_result = await vectorStore.similaritySearch(`Predict the next conversation from Bot when human question is given.Consider compilance ,risk and protection are taken under consideration.  Human:${matching_result}`,1)
                console.log("log11",matching_result)
                result = await handleInitChat(usermessage,matching_result)
                tempChats=[...chats,{text:userInput,role:'user',property:''},{text:result.response,role:'assistant',property:'' }]

            } 
            else{
                matching_result = await vectorStore.similaritySearch(`Predict the next conversation from Bot when human question is given.Consider compilance ,risk and protection are taken under consideration.Greet the user in friendly manner. Do not mention that assistance is a moneymaker bot or any bot.  Human:Hi`,1)
                result = await handleInitChat("Hi",matching_result)
                console.log("log11",matching_result,result)
                tempChats=[...chats,{text:result.response,role:'assistant',property:'' }]
            }
            setChats(tempChats)
            setLoading(false)
        }
        catch(error){
            setLoading(false)
            console.log(error)
        }
    }

    //setups Conversation chain with the buffer memory for initial conversation
    const setupInitConvoChain = async() =>{
        setInitphase(true)
        //if user wants to create a money maker contract first ask below questions simultanieosly: 1.To create the contract options provide the time period of prediction in months. 2.Do you need assistance in price prediction? 3.Provide the prediction price. 4.How much quantity of assets you are having? 5.How much contracts you want to create?
        let template = "You are a Crypto moneymaker contract creator bot named AInstein, greet the user in a friendly manner and ask how can you help him.  Human:Create a BTC moneymaker contract.  Human:{input} AI Bot:"   
        let reqPrompt = PromptTemplate.fromTemplate(template)
        convoChain = new ConversationChain({llm,prompt:reqPrompt,memeory:memeory1})
        // let initconvoChain = await convoChain.call({input:"Hi"})
        
    }

    const manageVectorSTorage = async (queries) =>{
        vectorStore = await Chroma.fromDocuments( 
            queries,
            new OpenAIEmbeddings({openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY}), 
            {
            collectionName: "sql-queries-v1",
            url: "http://localhost:8080/http://localhost:8000", // Optional, will default to this value
            collectionMetadata: {
              "hnsw:space": "cosine",
            }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
         });
         console.log()

    }

    //generates sql queries from a json data for storing it in chroma db
    const generateSqlQueries = (tableData,tableName) =>{
        let queries=[]
        let columns= Object.keys(tableData[0])
        let sampleValues = Object.keys(tableData[0])

            //select queries
            queries.push( {pageContent:`SELECT * FROM ${tableName};`, metadata: {type: "select",}})
            for (let column of columns){
                queries.push( {pageContent:`SELECT ${column} FROM ${tableName};`, metadata: {type: "select",}})
            }

            queries.push({pageContent:`INSERT INTO ${tableName} VALUES (${sampleValues});`,metadata: {type: "insert",}})
            return queries 
    }

    //initializing llm instance
    const llm = new OpenAI({
        // organization: "org-cRDHZiDZZml2OhFTMeIqHr6c",
        // apiKey: ,
        temperature: 0,
        modelName: "gpt-3.5-turbo",
        openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY
    });  

    const handlePricePrediction = async() =>{
        try{
        setLoading(true)    
        let result= await Api.get('/prediction/btcPrice')
        setLoading(false)
        console.log("log8",result)
        return result.data.url
        }
        catch(error){
            console.log("error",error)
        }    
    } 

    const handleInitChat = async(input,matching_result) =>{
        try{
            // let template = "You are a Crypto moneymaker contract creator bot and your name is AInstein, greet the user in a friendly manner.  Human:Hii  AI bot:Hello! Welcome to Money Maker Bot. I'm here to help you create your contract. Please provide valid answers to the questions below.  Human:yes,I want to create the contract. AI bot:Please provide valid answers to below questions. Human:{input} AI Bot:"   
            if(matching_result){
                // console.log("log13",matching_result[0].pageContent)
                let template = `You are a contract creator bot and your name is AInstein,do not mention that you are a bot, ask the user what you can do today for him and after that give answers to the user question in friendly manner. ${matching_result[0].pageContent}   Human:{input} Bot:`                   
            let reqPrompt = PromptTemplate.fromTemplate(template)
            convoChain = new ConversationChain({llm,prompt:reqPrompt,memeory:memeory1})
                return await convoChain.call({input})
            }   
            else{
            let template = "You are a Crypto moneymaker contract creator bot and your name is AInstein, ask the user what you can do today for him and after that give answers to the user question in friendly manner.  Human:Hii  AI bot: Welcome to Money Maker Bot. I'm AInstein, how can I help you.  Human:Creat a BTC moneymaker contract.  AI bot:Sure. Human:{input} AI Bot:"   
            let reqPrompt = PromptTemplate.fromTemplate(template)
            convoChain = new ConversationChain({llm,prompt:reqPrompt,memeory:memeory1})
            return await convoChain.call({input})
            }
        }
        catch(error){

        }
    }

    const handleUserInput = async(e)=>{
        //  setChats(()=>[...chats,{text:userInput,role:'user'} ] )
        e.preventDefault()
        console.log("debug1",messageCount,moneymakerMode,housingContractMode)
        setLoading(true)
        inputRef.current.value=''
        let tempChats = [...chats,{text:userInput,role:'user',property:''}]        
        setChats(tempChats)
        setmessageCount(messageCount+1)
          console.log("log",promptManageMode,moneymakerMode)  
         if(promptManageMode){
                console.log("log14",isPricePlotIsrequested)
                if(moneymakerMode){
                    handleContractFormConversation(userInput,tempChats)
                }
                else{
                    handleHousingContractFormConversation(userInput,tempChats)
                }
         } 
         else if(initPhase){
            let givenInput = userInput.toLocaleLowerCase()
                if((givenInput.includes('call option') || givenInput.includes('callOption')) && (givenInput.includes('create') || givenInput.includes('generate')) ){
                    if(givenInput.includes('eth') || givenInput.includes('ethereum') || givenInput.includes('eth')){
                        setContractCurrency('ETH')
                    }
                    else{
                        setContractCurrency('BTC')
                    }
                    tempChats.push({text:"Sure",role:'assistant',property:'',params:null})
                    setChats(tempChats)   
                    handleContractFormConversation('No data available.',tempChats)
                    setIsPricePlotIsrequested(true)
                    setInitphase(false)
                    setMoneyMakerMode(true)
                    setPromptManageMode(true)    
                }
                else if(givenInput.includes('housing') || givenInput.includes('contract')){
                    tempChats.push({text:"Sure",role:'assistant',property:'',params:null})
                    setChats(tempChats)   
                    handleHousingContractFormConversation('No data available.',tempChats)
                    setInitphase(false)
                    setHousingContractMode(true)
                    setPromptManageMode(true)
                }
                else{
                    initBot(userInput) 
                }
         }
         else{
            //handles conversation after contract creation process
            // if(postContractMode){
            //     let result = await handleInitChat(userInput)
            //     console.log("log7.5",result)
            //    tempChats.push({text:result.response,role:'assistant',property:'' })
            // }
            // else{
                // setPromptManageMode(false)
                // setContractMode(true)
                // handleOptionGeneration()
            // }
         }

         setLoading(false)
    }

    const handleHousingContractGeneration = async()=>{
        try{

            let parser = StructuredOutputParser.fromNamesAndDescriptions({
                description:"Gives context and description about the housing contract.",
                contract:"This contains actual housing contract."
            })

            let formatInstructions = parser.getFormatInstructions()

            let mainQuery = `Answer the user's question as best you can:\n{format_instructions}\n Create a housing contract with the following parameters : titleOfContract={titleOfContract}, sellerName={sellerName}, buyerName={buyerName}, propertyAddress={propertyAddress}, sellingPriceOrRentPrice={sellingPriceOrRentPrice}, closingDate={closingDate}, governingLaw={governingLaw}, termsForContract={termsForContract}`        

            let reqPrompt = new PromptTemplate({
                  template:mainQuery,
                  inputVariables:['titleOfContract','sellerName','buyerName','propertyAddress','sellingPriceOrRentPrice','closingDate','governingLaw','termsForContract'
                ],
                  partialVariables:{format_instructions:formatInstructions}                  
            })   

            let reqChain = new LLMChain({llm,prompt:reqPrompt})
            
            let result = await reqChain.call({'titleOfContract':`${housingContractParams.titleOfContract}` ,'sellerName':`${housingContractParams.sellerName}`,'buyerName':`${housingContractParams.buyerName}`,'propertyAddress':`${housingContractParams.propertyAddress}`,'sellingPriceOrRentPrice':`${housingContractParams.sellingPriceOrRentPrice}`,'closingDate':`${housingContractParams.closingDate}`,'governingLaw':`${housingContractParams.governingLaw}`,'termsForContract':`${housingContractParams.termsForContract}`})
            let tempHousingContract = JSON.parse(result.text)
            console.log("housingContractRes",tempHousingContract)
            return tempHousingContract.contract
        }
        catch(error){
            console.log("error",error)
        }
    }


    const handleOptionGeneration = async(promtInputs) =>{
       try{
        setLoading(true)
        let parser = StructuredOutputParser.fromNamesAndDescriptions({
            description:"Gives context of the answer",
            contracts:[{
                strikePrice:"strikePrice in the each contract answer",
                premium:"premium in the each contract answer",
                openInterest:"openInterest in the each contract answer",
                expirationDate:"expirationDate in the each contract answer"
            }
            ]
        })

        let formatInstructions = parser.getFormatInstructions()

        // let mainQuery = `Answer the user's question as best you can:\n{format_instructions}\n If bitcoin price is $10000 , the prediction for bitcoin price in the next {predictionMonths} months to hit $ {predictionPrice} . Please generate call option data for me strike , premium , open int, expiration date so I can create contracts.Also generate {contractCounts} contracts data for this scenario and think about me as the money maker and I have {userBalance} Bitcoins in total.`        
        let mainQuery = `Answer the user's question as best you can:\n{format_instructions}\n The call options for bitcoin price in the next {predictionMonths} months from today:{todayDate} to hit $ {predictionPrice} . Please generate call option data for me strike , premium , open interest, expiration date so I can create contracts.Also generate {contractCounts} contracts options data for this scenario and consider me as the money maker and I have {userBalance} Bitcoins in total.\nAlso expiration date of call options should be {predictionMonths} months from {todayDate}, if it is in next years then also provide it in respective year.And please provide expiration date in call option in YYYY-MM-DD format.Premium value should be a nearest higher whole number near decimal value..`        


    //prompt initialization    
    let reqPrompt = new PromptTemplate({
        template:mainQuery,
        inputVariables:["predictionMonths","todayDate","predictionPrice","contractCounts","userBalance"],
        partialVariables:{format_instructions:formatInstructions}
       })

    // let samplePrompt = await reqPrompt.format({
    //     predictionMonths:currentContractParams.periodInMonth,
    //     todayDate:formatDateToDdMmYy(),
    //     predictionPrice:currentContractParams.strikePriceInUsd,
    //     contractCounts:currentContractParams.noOfContracts,
    //     userBalance:currentContractParams.tokenQuantity
    // })  

    // console.log("log60",samplePrompt)

    chain = new LLMChain({llm,prompt:reqPrompt,memory})

       let result = await chain.call({'predictionMonths':`${currentContractParams.periodInMonth}`,'todayDate':formatDateToDdMmYy(),'predictionPrice':`${currentContractParams.strikePriceInUsd}`,'contractCounts':`${currentContractParams.noOfContracts}`,'userBalance':`${currentContractParams.tokenQuantity}`})
    //    console.log("result",result)
       let finalResult = JSON.parse(result.text)
       console.log(JSON.parse(result.text))
       formatResponseUsingOptions(finalResult.contracts,promtInputs)
       setLoading(false)
    // console.log("result",result)
       }
       catch(error){
        console.log("log",error)
        setLoading(false)
       }
    }

    const formatResponseUsingOptions = (results,promtInputs) =>{

        let tempChats = promtInputs
        results.map((chat,i)=>{
            tempChats.push({text:`${chat.strikePrice},${chat.premium},${chat.openInterest},${chat.expirationDate}`,role:'assistant',property:'contract'})
        })
        setChats(tempChats)
    }

    const handleGenerateSqlqueryForMoneyMaker = async(strikePrice,premium,openInterest,expirationDate) =>{
        try{
            setLoading(true)
            let  chromaInstance = new Chroma( new OpenAIEmbeddings({openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY}), 
            {
            collectionName: "sql-queries-v1",
            url: "http://localhost:8080/http://localhost:8000", // Optional, will default to this value
            collectionMetadata: {
              "hnsw:space": "cosine",
            }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
         })
            let parser = StructuredOutputParser.fromNamesAndDescriptions({
                description:"Gives description of the answer",
                query:"sql query in the answer"
            })

            let formatInstructions = parser.getFormatInstructions()
            let template = "Answer the user's question as best you can:\n{format_instructions}\n Create a sql query for adding entry to MoneyMakerContract Table for column and their values as: strikePrice={strikePrice} premium={premium} openInterest={openInterest} expirationDate={expirationDate}"
            // let reqPrompt = PromptTemplate.fromTemplate(template)
            let reqPrompt = new PromptTemplate({
                template,
                inputVariables:["strikePrice","premium","openInterest","expirationDate"],
                partialVariables: {format_instructions:formatInstructions}
            })
            chain = new LLMChain({llm,prompt:reqPrompt})
         let matching_result = await chromaInstance.similaritySearch("Create a sql query for adding entry to MarketMakerContract Table for column and their values as: strikePrice=45000 premium=400 openInterest=16 expirationDate=10/02/2023",1)
           let result = await chain.call({'strikePrice':`${strikePrice}`,'premium':`${premium}`,'openInterest':`${openInterest}`,'expirationDate':`${expirationDate}`},{input_documents:matching_result})
            // console.log("log5",result,matching_result)
            let formattedResult = JSON.parse(result.text)
            setSqlQuery(formattedResult.query)
            let tempChats = chats
            tempChats.push({text:`${formattedResult.query}`,role:'assistant',property:'sqlQuery'})
            setChats(tempChats)
            setcontractParams({strikePrice,premium,openInterest,expirationDate})
            setLoading(false)
        }
        catch(error){
            console.log("error",error)
        }
    }

    const handleGenerateSqlqueryHousingContract = async(title,buyer,seller,governingLaw,propertyAddress,sellingPrice,terms,expirationDate,tempChats) =>{
        try{
            setLoading(true)
            let  chromaInstance = new Chroma( new OpenAIEmbeddings({openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY}), 
            {
            collectionName: "sql-queries-v1",
            url: "http://localhost:8080/http://localhost:8000", // Optional, will default to this value
            collectionMetadata: {
              "hnsw:space": "cosine",
            }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
         })
            let parser = StructuredOutputParser.fromNamesAndDescriptions({
                description:"Gives description of the answer",
                query:"sql query in the answer"
            })

            let formatInstructions = parser.getFormatInstructions()
            let template = "Answer the user's question as best you can:\n{format_instructions}\n Create a sql query for adding entry to HousingContract Table for column and their values as: title={title} buyer={buyer} seller={seller} governingLaw={governingLaw} propertyAddress={propertyAddress} sellingPrice={sellingPrice} terms={terms} expirationDate={expirationDate}"
            // let reqPrompt = PromptTemplate.fromTemplate(template)
            let reqPrompt = new PromptTemplate({
                template,
                inputVariables:["title","buyer","seller","governingLaw","propertyAddress","sellingPrice","terms","expirationDate"],
                partialVariables: {format_instructions:formatInstructions}
            })
            chain = new LLMChain({llm,prompt:reqPrompt})
         let matching_result = await chromaInstance.similaritySearch("Create a sql query for adding entry to HousingContract Table for column and their values as: title='Rental Contract' buyer='Jessy Pinkman' seller='Walter White' governingLaw='State of Florida' propertyAddress='House No 23, Florida,USA' sellingPrice=500000 terms='Timely payemnt is required.' expirationDate=2022-01-01 00:00:00",1)
            let result = await chain.call({'title':`${title}`,'buyer':`${buyer}`,'seller':`${seller}`,'governingLaw':`${governingLaw}`,'propertyAddress':`${propertyAddress}`,'sellingPrice':`${sellingPrice}`,'terms':`${terms}`,'expirationDate':`${expirationDate}`},{input_documents:matching_result})
 
            let formattedResult = JSON.parse(result.text)
            setSqlQuery(formattedResult.query)
            tempChats.push({text:`${formattedResult.query}`,role:'assistant',property:'sqlQuery'})
            setChats(tempChats)
            setLoading(false)
        }
        catch(error){
            console.log("error",error)
        }
    }

    const handleCreateContract = async(query,deploymentModethod) =>{
        try{
        console.log("queryLog",query)
        let sqlQueryHex=  Buffer.from(sqlQuery, 'utf-8').toString('hex')
        let signer = await provider.getSigner(account) 
        let message = {query:sqlQuery,hex:sqlQueryHex}
        let reqSignature = await signer.signMessage(JSON.stringify(message)) 
        setSignature(reqSignature)
        let payload
        if(!housingContractMode){
             payload = {
                walletAddress:account,
                strikePrice:contractParams.strikePrice,
                premium:contractParams.premium,
                openInterest:contractParams.openInterest,
                expirationDate:contractParams.expirationDate,
                query:sqlQuery,
                hex:sqlQueryHex,
                quantity:currentContractParams.tokenQuantity,
                currency:currentContractParams.currency,
                deployment:deploymentModethod,
                signature:reqSignature,
                txHash:poolTxHash,
                contractType:"MoneyMaker"
                
            }
        }
        else{
            let reqhousingContract = await handleHousingContractGeneration()
            payload = {
                walletAddress:account,
                title:housingContractParams.titleOfContract,
                buyer:housingContractParams.buyerName,
                seller:housingContractParams.sellerName,
                governingLaw:housingContractParams.governingLaw,
                propertyAddress:housingContractParams.propertyAddress,
                sellingPrice:housingContractParams.sellingPriceOrRentPrice,
                terms:housingContractParams.termsForContract,
                expirationDate:housingContractParams.closingDate,
                query:sqlQuery.slice(0,20),
                hex:sqlQueryHex.slice(0,25),
                deployment:deploymentModethod,
                signature:reqSignature,
                contractType:"HousingContract",
                contract:reqhousingContract
            }
        }
        await Api.post('/moneyMaker/createContract',payload)
        //addChange
        // setcontractParams({strikePrice:null,premium:null,openInterest:null,expirationDate:null})
        setSignature(null)
        setSqlQuery(null)
        setContractMode(false)
        let tempChats
        if(moneymakerMode){
            tempChats = [...chats,{text:"Your asset is transferred to the pool.Contract creation is in progress, Thanks!!",role:'assistant',property:''}]        
        }
        else{
            tempChats = [...chats,{text:"Contract creation is in progress, Thanks!!",role:'assistant',property:''}]        
        }
        setChats(tempChats)     
        resetContractMode()
        Emitter.emit('callBalanceApi',null)
        // alert(`Amount of ${currentContractParams.tokenQuantity}${currentContractParams.currency} has been transferred to the pool account for contract creation.`)
        }
        catch(error){
            console.log("error",error)
        }
    }

    const resetContractMode = () =>{
        setPoolTxHash(null)
        setHousingContractMode(false)
        setMoneyMakerMode(false)
        setContractMode(false)
        setcurrentContractParams({currency:null,periodInMonth:null,needForstrikePriceAssistanceUsingARIMA:null,strikePriceInUsd:null,tokenQuantity:null,noOfContracts:null})
        setHousingContractParams({titleOfContract:null,sellerName:null,buyerName:null,propertyAddress:null,sellingPriceOrRentPrice:null,closingDate:null,governingLaw:null,termsForContract:null})
        setInitphase(true)  
        setPromptFormatterCount(0)
        setPromptInputs([])
        setSqlQuery('')
    }

    const handleTxForm = async(e) =>{
       try{ 
        e.preventDefault()
        setProcessing(true)
           if(!offTxForm.userTxHash){
               return alert("Please enter transaction hash.")
           }

           let payload = {
            userWalletAddress:account,
            txHash:offTxForm.userTxHash,
           }

           console.log("debug22",payload)

           let response = await Api.post('/moneyMaker/confirmUserTx', {
            userWalletAddress:account,
            txHash:offTxForm.userTxHash,
           })
           console.log("debug20",response)
           setPoolTxHash(offTxForm.userTxHash)
           setVerifyLockBalanceMode(false)
           
           alert("Your transaction is validated successfully.Currently we are despositing the platform fee 0.0002 BTC.Please Wait till transaction is processing.")
           await Api.post('/moneyMaker/transferFees', {
            userWalletAddress:account,
           })   
           alert("0.0002 BTC fee is successfully deducted from your wallet as a platform fee.")
           setProcessing(false)         
           handleContractFormConversation(`quantity: ${tempQuantity}`)

       }
       catch(error){
         console.log("error",error,account)
         if(error.response.data){
            if(error.response.data.includes('validate the tx')){
                  setChats(()=>[...chats,{text:'Please first validate the transaction from Account Settings.And Try Again ',role:'assistant',property:''}])  
            }    
         }
             setProcessing(false)
        //  alert(error.message)
       } 
    }

    return(
        <>
        <div className='mainDiv'>
        {
          !accountSectionMode ?  
        <div className='container py-5 '>
            {
                !active &&
                  <h3 className='text-center text-danger '>Ainstein wants you to Connect your wallet!</h3>
            }
            <div className='offset-3 '>
                <div className='col-8 chatHistory'>
                     <div className='chatHistoryInterface'>
                     <div class="fix"></div>
                        {
                           chats.map((chat,i)=>{
                            return(
                                chat.role === 'assistant'?
                                    // chat.property === "contract" || chat.property === "sqlQuery" ?                                        
                                                
                                                chat.property === "contract" ? 
                                                    <div className='chatSection-assistance-contractOp ' key={i}>
                                                        <div className=' chat-text-modifier p-4'> 
                                                            <span className=' p-2'>Strike Price :{chat.text.split(',')[0]}</span> <br/>
                                                            <span className=' p-2'>Premium :{chat.text.split(',')[1]}</span> <br/>
                                                            <span className=' p-2'>Open Interest :{chat.text.split(',')[2]}</span> <br/>
                                                            <span className=' p-2'>Expiration Date :{chat.text.split(',')[3]}</span><br/>
                                                            <button className='btn btn-primary btn-sm mt-1' onClick={()=>handleGenerateSqlqueryForMoneyMaker(chat.text.split(',')[0],chat.text.split(',')[1],chat.text.split(',')[2],chat.text.split(',')[3])}>Generate A Query To Deploy Contract</button>
                                                        </div>
                                                    </div>
                                                :
                                                    chat.property === "sqlQuery" ?
                                                    <div className='chatSection-assistance-contractOp ' key={i}>
                                                        <div className=' chat-text-modifier p-4'>     
                                                                <span className=' p-2'>SQL Query : <span className='font-weight-bold'>{chat.text}</span> </span><br/>
                                                                <button className=' m-2 btn btn-primary btn-sm mt-1' onClick={()=>handleCreateContract(chat.text,'BitGo')}>Create Contract With BitGo</button>
                                                                    <button className=' m-2 btn btn-primary btn-sm mt-1' onClick={()=>handleCreateContract(chat.text,'ICP')}>Create Contract With ICP</button>
                                                                <button className=' m-2 btn btn-primary btn-sm mt-1' onClick={()=>resetContractMode()}>Cancel</button>

                                                        </div>
                                                    </div>    
                                                    :
                                                    
                                                        chat.property === "plot" ?
                                                            <div className='plotSection' key={i}>
                                                                <p >
                                                                      <img src={chat.text} alt='' height={280}/>
                                                                    {/* <span className='chat-text-modifier p-2'>{chat.text}</span>  */}
                                                                </p>
                                                            </div>
                                                        :
                                                        chat.property === "offTxMode" ?
                                                        <>   
                                                        <div className='chatSection-assistance-contractOp '>
                                                                <div className=' chat-text-modifier-cover'> 
                                                                <div className='chat-text-modifier'>
                                                                    <p>Kindly provide transaction hash of the tranaction after completing the validating transaction from Account Settings:</p>   
                                                                    <div >
                                                                    <form>
                                                                        <Form.Control size="lg" className='mt-3' type="text" placeholder="Enter transaction hash." onChange={(e)=>setOffTxForm((data)=>({...data,userTxHash:e.target.value}))}  />  
                                                                        <button className='btn btn-primary mt-3' onClick={(e)=>handleTxForm(e)}>Proceed</button>        
                                                                    </form>
                                                                    </div>
                                                                </div> 
                                                                </div>
                                                        </div>
                                                    </> 
                                                            :
                                                            <div className='chatSection-assistance' key={i}>
                                                                <div className=' chat-text-modifier-cover'> <div className='chat-text-modifier'>{chat.text}</div> </div>
                                                            </div>
                                :
                                    <div className='chatSection-assistance ' key={i}>
                                        <p className='p-4 userInterface'> <span className='chat-text-modifier p-2 justify-content-right'>{chat.text}</span> </p>
                                    </div>
                            )
                           }) 
                        }

                        {
                            loading &&
                            <div className='chatSection-assistance'>
                                            <p className='p-4 text-white'> <span className='p-2'>...Loading...</span> </p>
                            </div>
                        }

                        {
                            processing &&
                            <div className='chatSection-assistance'>
                                            <p className='p-4 text-white'> <span className='p-2'>...Processing...</span> </p>
                            </div>
                        }

                       
                     </div>   
                </div>    
                <div className='row mt-4 inputClass align-items-center'>    
                    <form onSubmit={(event)=>!loading?handleUserInput(event):''}>
                    <div className='col-8'>
                        {/* <Form.Control size="lg" type="text" disabled={!active} placeholder="Welcome ! Type here..." onChange={(e)=>setUserInput(e.target.value)}  ref={inputRef}/>    */}
                        <Form.Control size="lg" type="text" placeholder="Welcome ! Type here..." disabled={contractMode|| !active} onChange={(e)=>setUserInput(e.target.value)}  ref={inputRef}/>   
                    </div>   
                    {/* <div className='col-3'>
                        <button className='btn btn-schema' onClick={()=>!loading?handleUserInput():''} disabled={contractMode|| !active} >Enter</button>
                    </div> */}
                    </form>
                </div>
            </div>
        </div>
        :
           <AccountSection account={account}/>             
        }
        </div>
        </>
    )
}