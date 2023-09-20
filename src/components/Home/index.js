import React,{useState,useEffect,useRef} from 'react'
import { Button } from 'bootstrap';
import Form from 'react-bootstrap/Form';
import { OpenAI } from "langchain/llms/openai";
import { ConversationChain,LLMChain } from "langchain/chains";
import { PromptTemplate } from 'langchain/prompts'; 
import {BufferMemory,ConversationBufferMemory} from 'langchain/memory';
import {Chroma} from "langchain/vectorstores/chroma"
import {OpenAIEmbeddings} from "langchain/embeddings/openai"
import {StructuredOutputParser} from "langchain/output_parsers";
import './index.css';
import Api from '../../utils/Api';
import { ethers } from "ethers";
import { useWeb3React } from '@web3-react/core';
import table from '../../utils/marketMakers.json';
import Emitter from '../../utils/Emitter';

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
    const [provider,setProvider] = useState()
    const [sqlQuery,setSqlQuery] = useState('')
    const [signature,setSignature] = useState()
    const [initPhase,setInitphase] = useState(false)
    const [messageCount,setmessageCount] = useState(0)
    const [isPricePlotIsrequested,setIsPricePlotIsrequested] = useState(false)
    const [contractParams,setcontractParams] = useState({strikePrice:null,premium:null,openInterest:null,expirationDate:null})
    const inputRef = useRef()
    let convoChain 

    const {active,account,chainId,library} = useWeb3React()

    let memory = new BufferMemory({inputKey:'predictionMonths',memoryKey:'contractHistory'})
    let memeory1 = new BufferMemory()
    let chain
    let vectorStore

    useEffect(()=>{
        // console.log("tableLog",table)
        setupInitConvoChain()
        // handleInitChat1()
        //  testUsingChromaMemory()
        let potentialQueries= generateSqlQueries(table)
        initBot()
        // console.log("log5.5",potentialQueries)
        // manageVectorSTorage(potentialQueries)
        // setChats([{text:"Hii",role:'assistant',property:''}]) 
        // handleChat1()
    },[])

    useEffect(()=>{
        
    },[loading])

    useEffect(()=>{
        if(library){
            setProvider(new ethers.BrowserProvider(library._provider))
        }
    },[active])

    const initBot = async(usermessage) =>{
        try{
            setLoading(true)
            let doc =[
                {
                  pageContent: `Human:Hi Bot: Welcome to Money Maker Bot. I'm AInstein, how can I help you.`,
                  metadata: {
                    speaker: "Human",
                  },
                },
                {
                    pageContent:`Human: Create a BTC market maker contract Bot:present the questions.`,
                    metadata: {
                        speaker: "Human",
                      },
                }
        ]

        console.log("log",usermessage)
        vectorStore = await Chroma.fromDocuments( 
            doc,
            new OpenAIEmbeddings({openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY}), 
            {
            collectionName: "test-collection-4",
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
                matching_result = await vectorStore.similaritySearch(`Predict the next conversation from Bot when human question is given.Consider compilance ,risk and protection are taken under consideration.  Human:Hi`,1)
                result = await handleInitChat("Hi",matching_result)
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
            collectionName: "test-collection-1",
            url: "http://localhost:8080/http://localhost:8000", // Optional, will default to this value
            collectionMetadata: {
              "hnsw:space": "cosine",
            }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
         });
         console.log()

    }

    // const testUsingChromaMemory = async() =>{
        
    //      let reqPrompt =  PromptTemplate.fromTemplate('Create a Bot output based on the given chat history.Consider compilance ,risk and protection are taken under consideration. Human:{humanConvo} Bot:')
    //      let chain = new LLMChain({llm,prompt:reqPrompt,memory:memeory1})
    //      console.log("log11.5",chain)
    //      let result = await chain.call({'humanConvo':`Hi`},{input_documents:matching_result})
    //      console.log("log12",result)
    //      result = await chain.call({'humanConvo':`Create a BTC moneymaker contract for me.`},{input_documents:matching_result})
    //      console.log("log12",result)

    // }

    //generates sql queries from a json data for storing it in chroma db
    const generateSqlQueries = (tableData) =>{
        let queries=[]
        let columns= Object.keys(tableData[0])
        let sampleValues = Object.keys(tableData[0])

        //select queries
        queries.push( {pageContent:`SELECT * FROM MarketMakerContract;`, metadata: {type: "select",}})
        for (let column of columns){
            queries.push( {pageContent:`SELECT ${column} FROM MarketMakerContract;`, metadata: {type: "select",}})
        }

        queries.push({pageContent:`INSERT INTO MarketMakerContract VALUES (${sampleValues});`,metadata: {type: "insert",}})
        return queries 
    }

    //initializing llm instance
    const llm = new OpenAI({
        // organization: "org-cRDHZiDZZml2OhFTMeIqHr6c",
        // apiKey: ,
        temperature: 0.6,
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
    
    // const handleInitChat1 = async() =>{
    //     try{
    //         let template = "You are a Crypto moneymaker contract creator bot, greet the user in a friendly manner.  Bot: Welcome to Market maker chatbot.I am AInstein, how can I help you today. Human: Create a BTC market maker contract Bot: For how much months you want to create contract?. Human:3 Bot:What will be the strike price of the contract?. Human:I don't know  Bot: Would you like to show us the plot using our algorithm. Human:yes Bot:Provided ARIMA plot. Human: 32000 Bot: How much BTC you want to lock?. Human: 10 Bot: How much contract options you want ?. Human: 5  Human:{input} AI Bot:"   
    //     let reqPrompt = PromptTemplate.fromTemplate(template)
    //     convoChain = new ConversationChain({llm,prompt:reqPrompt,memeory:memeory1})
    //     let result = await convoChain.call({input:"Hii"})
    //     console.log("result",result)
    //     console.log("result1",await convoChain.call({input:"Create market maker contract for BTC."}))
    //     }
    //     catch(error){

    //     }
    // }

    const handleInitChat = async(input,matching_result) =>{
        try{
            // let template = "You are a Crypto moneymaker contract creator bot and your name is AInstein, greet the user in a friendly manner.  Human:Hii  AI bot:Hello! Welcome to Money Maker Bot. I'm here to help you create your contract. Please provide valid answers to the questions below.  Human:yes,I want to create the contract. AI bot:Please provide valid answers to below questions. Human:{input} AI Bot:"   
            if(matching_result){
                console.log("log13",matching_result[0].pageContent)
                let template = `You are a Crypto moneymaker contract creator bot and your name is AInstein, ask the user what you can do today for him and after that give answers to the user question in friendly manner. ${matching_result[0].pageContent}   Human:{input} Bot:`                   
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

    const handleUserInput = async()=>{
        //  setChats(()=>[...chats,{text:userInput,role:'user'} ] )
        console.log("debug1",messageCount)
        setLoading(true)
        inputRef.current.value=''
        let tempChats = [...chats,{text:userInput,role:'user',property:''}]        
        setChats(tempChats)
        setmessageCount(messageCount+1)
          console.log("log",promptManageMode,promptFormatterCount,contractCreationPropmptInputs)  
         if(promptManageMode){
                console.log("log14",isPricePlotIsrequested)
            if(promptFormatterCount === 1 || isPricePlotIsrequested){
                let isPriceNotProvided = isNaN(userInput)
                console.log("log15",isPriceNotProvided,isPricePlotIsrequested)
                if(isPriceNotProvided && !isPricePlotIsrequested){
                    tempChats= [...tempChats,{text:questions[promptFormatterCount+1].que,role:'assistant',property:'',params:null}]
                    setIsPricePlotIsrequested(true)
                    setChats(tempChats)  
                    setPromptFormatterCount(promptFormatterCount+1)
                    setPromptFormatterCount(promptFormatterCount+1)
                }
                else if(isPricePlotIsrequested){
                    console.log("log15",isPricePlotIsrequested)
                    let plotUrl= await handlePricePrediction()
                    // console.log("log7",plotUrl)
                    tempChats= [...tempChats,{text:plotUrl,role:'assistant',property:'plot',params:null },{text:"Hope this helps you ,now please provide the strike price",role:'assistant',property:'',params:null }]
                    setIsPricePlotIsrequested(false)
                    setChats(tempChats)  
                }
                else if(!isPriceNotProvided && !isPricePlotIsrequested){
                    // setPromptInputs(()=>[...contractCreationPropmptInputs,userInput])
                    // tempChats= [...tempChats,{text:questions[promptFormatterCount+2].que,role:'assistant',property:'',params:questions[promptFormatterCount+2].params } ]
                    // setChats(tempChats) 
                    // setPromptFormatterCount(promptFormatterCount+1)

                    if(questions[promptFormatterCount+2].que.includes('How much quantity')){
                        tempChats= [...tempChats,{text:`How much quantity of ${contractCurrency} you want to lock?`,role:'assistant',property:'',params:questions[promptFormatterCount+1].params}]
                    }
                    else{
                        tempChats= [...tempChats,{text:questions[promptFormatterCount+1].que,role:'assistant',property:'',params:questions[promptFormatterCount+1].params}]
                    }
                    setChats(tempChats)  
                    setPromptFormatterCount(promptFormatterCount+2)
                    setPromptInputs(()=>[...contractCreationPropmptInputs,userInput])
                }
                else{
                    setPromptInputs(()=>[...contractCreationPropmptInputs,userInput])
                    tempChats= [...tempChats,{text:questions[promptFormatterCount+1].que,role:'assistant',property:'',params:questions[promptFormatterCount+1].params } ]
                    setChats(tempChats) 
                    setPromptFormatterCount(promptFormatterCount+1)
                }
                // if(givenInput === 'yes'){
                //    let plotUrl= await handlePricePrediction()
                //    console.log("log7",plotUrl)
                //    tempChats= [...tempChats,{text:plotUrl,role:'assistant',property:'plot',params:null },{text:questions[promptFormatterCount+1],role:'assistant',property:'',params:null }]
                //    setChats(tempChats)  
                // }else{
                //    tempChats= [...tempChats,{text:questions[promptFormatterCount+1].que,role:'assistant',property:'',params:questions[promptFormatterCount+1].params } ]
                //    setChats(tempChats)  
                // }
                
            }
            else{

                if(questions[promptFormatterCount+1].que.includes('How much quantity')){
                    tempChats= [...tempChats,{text:`How much quantity of ${contractCurrency} you want to lock?`,role:'assistant',property:'',params:questions[promptFormatterCount+1].params}]
                }
                else{
                    tempChats= [...tempChats,{text:questions[promptFormatterCount+1].que,role:'assistant',property:'',params:questions[promptFormatterCount+1].params}]
                }
                setChats(tempChats)  
                setPromptFormatterCount(promptFormatterCount+1)
                setPromptInputs(()=>[...contractCreationPropmptInputs,userInput])
                if(promptFormatterCount+1 === questions.length-1){
                    setPromptManageMode(false)
                    setPromptInputs(()=>[...contractCreationPropmptInputs,userInput])
                }   
            }

         } 
         else if(initPhase){
            // let result = await handleInitChat(userInput)
            // console.log("log7.5",result)
            // tempChats.push({text:result.response,role:'assistant',property:'' })
            // setChats(tempChats)
            let givenInput = userInput.toLocaleLowerCase()
                if((givenInput.includes('money maker') || givenInput.includes('moneymaker')) && givenInput.includes('create')){
                    if(givenInput.includes('eth') || givenInput.includes('ethereum') || givenInput.includes('eth')){
                        setContractCurrency('ETH')
                    }
                    else{
                        setContractCurrency('BTC')
                    }
                    tempChats.push({text:"Sure",role:'assistant',property:'',params:null},{text:questions[promptFormatterCount].que,role:'assistant',property:'',params:null})
                    setChats(tempChats)   
                    setInitphase(false)
                    setPromptManageMode(true)    
                }
                else{
                    initBot(userInput) 
                }
         }
         else{
            //handles conversation after contract creation process
            if(postContractMode){
                let result = await handleInitChat(userInput)
                console.log("log7.5",result)
               tempChats.push({text:result.response,role:'assistant',property:'' })
            }
            else{
                setPromptManageMode(false)
                let reqPromptInputs = [...contractCreationPropmptInputs,userInput]
                setPromptInputs(reqPromptInputs)
                setContractMode(true)
                handleChat(reqPromptInputs)
            }
         }

         setLoading(false)
    }

    //function appends required question for contract creation in chat
    const handleContractQuestions = async() =>{
        
    }

    const handleChat = async(promtInputs) =>{
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
        let mainQuery = `Answer the user's question as best you can:\n{format_instructions}\n If bitcoin price is $10000 , the prediction for bitcoin price in the next {predictionMonths} months from today:{todayDate} to hit $ {predictionPrice} . Please generate call option data for me strike , premium , open int, expiration date so I can create contracts.Also generate {contractCounts} contracts data for this scenario and think about me as the money maker and I have {userBalance} Bitcoins in total.`        


    //prompt initialization    
    let reqPrompt = new PromptTemplate({
        template:mainQuery,
        inputVariables:["predictionMonths","todayDate","predictionPrice","contractCounts","userBalance"],
        partialVariables:{format_instructions:formatInstructions}
       })

    chain = new LLMChain({llm,prompt:reqPrompt,memory})
    //    chain = new LLMChain({llm,prompt:reqPrompt,outputKey: "records",outputParser: outputFixingParser})
    //    console.log("log2",chain)
    //    let result = await chain.call({input:formattedPrompt})

       let result = await chain.call({'predictionMonths':`${promtInputs[0]}`,'todayDate':formatDateToDdMmYy(),'predictionPrice':`${promtInputs[1]}`,'contractCounts':`${promtInputs[3]}`,'userBalance':`${promtInputs[2]}`})
    //    console.log("result",result)
       let finalResult = JSON.parse(result.text)
       console.log(JSON.parse(result.text))
       formatResponse(finalResult.contracts,promtInputs)
       setLoading(false)
    // console.log("result",result)
       }
       catch(error){
        console.log("log",error)
        setLoading(false)
       }
    }

    function formatDateToDdMmYy() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0'); // Get day and pad with leading zero if needed
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Get month (0-11) and add 1, then pad with leading zero if needed
        const year = String(today.getFullYear()).slice(-2); // Get the last two digits of the year
      
        return `${year}-${month}-${day}`;
      }
      

    // const handleChat1 = async(promtInputs) =>{
    //     try{
    //      setLoading(true)
    //      let parser = StructuredOutputParser.fromNamesAndDescriptions({
    //          description:"Gives context of the answer",
    //          contracts:[{
    //              strikePrice:"strikePrice in the each contract answer",
    //              premium:"premium in the each contract answer",
    //              openInterest:"openInterest in the each contract answer",
    //              expirationDate:"expirationDate in the each contract answer"
    //          }
    //          ]
    //      })
 
    //      let formatInstructions = parser.getFormatInstructions()
 
    //      let mainQuery = `Answer the user's question as best you can:\n{format_instructions}\n If bitcoin price is $10000 , the prediction for bitcoin price in the next {predictionMonths} months from today:{todayDate} to hit $ {predictionPrice} . Please generate call option data for me strike , premium , open int, expiration date so I can create contracts.Also generate {contractCounts} contracts data for this scenario and think about me as the money maker and I have {userBalance} Bitcoins in total.`        
 
 
    //  //prompt initialization    
    //  let reqPrompt = new PromptTemplate({
    //      template:mainQuery,
    //      inputVariables:["predictionMonths","todayDate", "predictionPrice","contractCounts","userBalance"],
    //      partialVariables:{format_instructions:formatInstructions}
    //     })
 
    //  chain = new LLMChain({llm,prompt:reqPrompt,memory})
    //  //    chain = new LLMChain({llm,prompt:reqPrompt,outputKey: "records",outputParser: outputFixingParser})
    //  //    console.log("log2",chain)
    //  //    let result = await chain.call({input:formattedPrompt})
 
    //     let result = await chain.call({'predictionMonths':`3`,'todayDate':formatDateToDdMmYy(),'predictionPrice':`40000`,'contractCounts':`5`,'userBalance':`10`})
    //  //    console.log("result",result)
    //     let finalResult = JSON.parse(result.text)
    //     console.log(JSON.parse(result.text))
    //     // formatResponse(finalResult.contracts,promtInputs)
    //     // setLoading(false)
    //  // console.log("result",result)
    //     }
    //     catch(error){
    //      console.log("log",error)
    //      setLoading(false)
    //     }
    //  }

    const formatResponse = (results,promtInputs) =>{

        let tempChats = chats
        tempChats.push({text:`${promtInputs[3]}`,role:'user',property:''})
        results.map((chat,i)=>{
            tempChats.push({text:`${chat.strikePrice},${chat.premium},${chat.openInterest},${chat.expirationDate}`,role:'assistant',property:'contract'})
        })
        setChats(tempChats)
    }

    const handleGenerateSqlquery = async(strikePrice,premium,openInterest,expirationDate) =>{
        try{

            setLoading(true)
            let  chromaInstance = new Chroma( new OpenAIEmbeddings({openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY}), 
            {
            collectionName: "test-collection-1",
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
            let template = "Answer the user's question as best you can:\n{format_instructions}\n Create a sql query for adding entry to MarketMakerContract Table for column and their values as: strikePrice={strikePrice} premium={premium} openInterest={openInterest} expirationDate={expirationDate}"
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

    const handleCreateContract = async(query,deploymentModethod) =>{
        try{
        console.log("queryLog",query)
        let sqlQueryHex=  Buffer.from(sqlQuery, 'utf-8').toString('hex')
        let signer = await provider.getSigner(account) 
        let message = {query:sqlQuery,hex:sqlQueryHex}
        let reqSignature = await signer.signMessage(JSON.stringify(message)) 
        setSignature(reqSignature)
        console.log("lobraryLog",signer,reqSignature)
        let payload = {
            walletAddress:account,
            strikePrice:contractParams.strikePrice,
            premium:contractParams.premium,
            openInterest:contractParams.openInterest,
            expirationDate:contractParams.expirationDate,
            query:sqlQuery,
            hex:sqlQueryHex,
            quantity:contractCreationPropmptInputs[2],
            currency:contractCurrency,
            deployment:deploymentModethod,
            signature:reqSignature
        }
        await Api.post('/moneyMaker/createContract',payload)
        setcontractParams({strikePrice:null,premium:null,openInterest:null,expirationDate:null})
        setSignature(null)
        setSqlQuery(null)
        setContractMode(false)
        let tempChats = [...chats,{text:"Contract creation is in progress, Thanks!!",role:'assistant',property:''}]        
        setChats(tempChats)     
        resetContractMode()
        Emitter.emit('callBalanceApi',null)
        }
        catch(error){
            console.log("error",error)
        }
    }

    const resetContractMode = () =>{
        setContractMode(false)
        setInitphase(true)  
        setPromptFormatterCount(0)
        setPromptInputs([])
        setSqlQuery('')
    }

    return(
        <>
        <div className='container py-5'>
            {
                !active &&
                  <h4 className='text-center text-danger mt-2'>AInstein wants you to Connect your wallet!</h4>
            }
            <div className='offset-3 mainDiv'>
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
                                                            <button className='btn btn-primary btn-sm mt-1' onClick={()=>handleGenerateSqlquery(chat.text.split(',')[0],chat.text.split(',')[1],chat.text.split(',')[2],chat.text.split(',')[3])}>Generate Query</button>
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
                                            <p className='p-4'> <span className='p-2'>...Loading...</span> </p>
                            </div>
                        }
                     </div>   
                </div>    
                <div className='row mt-4 inputClass align-items-center'>    
                    <div className='col-8'>
                        {/* <Form.Control size="lg" type="text" disabled={!active} placeholder="Welcome ! Type here..." onChange={(e)=>setUserInput(e.target.value)}  ref={inputRef}/>    */}
                        <Form.Control size="lg" type="text" placeholder="Welcome ! Type here..." onChange={(e)=>setUserInput(e.target.value)}  ref={inputRef}/>   
                    </div>   
                    <div className='col-3'>
                        {/* <Button variant="primary">Enter</Button> */}
                        {/* <button className='btn btn-primary' onClick={handleUserInput} disabled={!active}>Enter</button> */}
                        <button className='btn btn-primary' onClick={()=>!loading?handleUserInput():''} disabled={contractMode} >Enter</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}