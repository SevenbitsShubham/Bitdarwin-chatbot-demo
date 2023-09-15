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
import { useWeb3React } from '@web3-react/core'
import table from '../../utils/marketMakers.json'



export default function Home(){
    const [userInput,setUserInput] = useState('')
    const [chats,setChats] = useState([])
    const [promptManageMode,setPromptManageMode] = useState(true)
    const [questions,setQuestions] = useState(["Provide the time period of prediction in months.","Do you need assistance in price prediction?","Provide the prediction price of Bitcoin.","How much quantity of Bitcoin you are having?","How much contracts you want to create?"])
    const [promptFormatterCount,setPromptFormatterCount] = useState(0)
    const [contractCreationPropmptInputs,setPromptInputs] = useState([])
    const [loading,setLoading] = useState(false)
    const [provider,setProvider] = useState()
    const [sqlQuery,setSqlQuery] = useState('')
    const [signature,setSignature] = useState()
    const [initPhase,setInitphase] = useState(false)
    const [messageCount,setmessageCount] = useState(0)
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
        // setupInitConvoChain()
        //  testUsingChromaMemory()
        let potentialQueries= generateSqlQueries(table)
        // console.log("log5.5",potentialQueries)
        // manageVectorSTorage(potentialQueries)
        setChats([{text:questions[0],role:'assistant',property:''}])   
    },[])

    useEffect(()=>{
        
    },[loading])

    useEffect(()=>{
        if(library){
            setProvider(new ethers.BrowserProvider(library._provider))
        }
    },[active])

    //setups Conversation chain with the buffer memory for initial conversation
    const setupInitConvoChain = async() =>{
        setInitphase(true)
        //if user wants to create a money maker contract first ask below questions simultanieosly: 1.To create the contract options provide the time period of prediction in months. 2.Do you need assistance in price prediction? 3.Provide the prediction price. 4.How much quantity of assets you are having? 5.How much contracts you want to create?
        let template = "You are a Crypto moneymaker contract creator bot, greet the user in a friendly manner.  Human:Hii  AI bot:Hii, Welcome to Money Maker Bot, Do you want to create the contract.  Human:yes,I want to create the contract. AI bot:Please provide valid answers to below questions. Human:{input} AI Bot:"   
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
    //     let doc =[
    //             {
    //               pageContent: `Bot: Hii`,
    //               metadata: {
    //                 speaker: "Bot",
    //               },
    //             },
    //             {
    //               pageContent: "Human: Welcome to Market maker chatbot. Do you want to create market maker contract?",
    //               metadata: {
    //                 speaker: "Human",
    //               },
    //             },
    //             {
    //                 pageContent: "Human: Welcome to Market maker chatbot. Do you want to create market maker contract?",
    //                 metadata: {
    //                   speaker: "Human",
    //                 },
    //               },
    //     ]
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
    
    const handleInitChat = async(input) =>{
        try{
            let template = "You are a Crypto moneymaker contract creator bot, greet the user in a friendly manner.  Human:Hii  AI bot:Hello! Welcome to Money Maker Bot. I'm here to help you create your contract. Please provide valid answers to the questions below.  Human:yes,I want to create the contract. AI bot:Please provide valid answers to below questions. Human:{input} AI Bot:"   
        let reqPrompt = PromptTemplate.fromTemplate(template)
        convoChain = new ConversationChain({llm,prompt:reqPrompt,memeory:memeory1})
            return await convoChain.call({input})
        }
        catch(error){

        }
    }

    const handleUserInput = async()=>{
        //  setChats(()=>[...chats,{text:userInput,role:'user'} ] )
        console.log("debug1")
        setmessageCount(messageCount+1)
          console.log("log",promptManageMode,promptFormatterCount,contractCreationPropmptInputs)  
         if(promptManageMode){
            if(promptFormatterCount === 1){
                   if(userInput.toLocaleLowerCase() === 'yes'){
                      let plotUrl= await handlePricePrediction()
                      console.log("log7",plotUrl)
                      setChats(()=>[...chats,{text:userInput,role:'user',property:''},{text:plotUrl,role:'assistant',property:'plot' },{text:questions[promptFormatterCount+1],role:'assistant',property:'' } ])  
                   }else{
                    setChats(()=>[...chats,{text:userInput,role:'user',property:''} ,{text:questions[promptFormatterCount+1],role:'assistant',property:'' } ])  
                   }
                   setPromptFormatterCount(promptFormatterCount+1)
            }
            else{
                setChats(()=>[...chats,{text:userInput,role:'user',property:''},{text:questions[promptFormatterCount+1],role:'assistant',property:'' }])  
                setPromptFormatterCount(promptFormatterCount+1)
                setPromptInputs(()=>[...contractCreationPropmptInputs,userInput])
                if(promptFormatterCount+1 === questions.length-1){
                    setPromptManageMode(false)
                    setPromptInputs(()=>[...contractCreationPropmptInputs,userInput])
                }   
            }
         } 
        //  else if(initPhase){
        //     // setChats(()=>[...chats,{text:userInput,role:'user',property:''} ])
        //     let result = await handleInitChat(userInput)
        //     console.log("log7.5",result)
        //     setChats(()=>[...chats,{text:userInput,role:'user',property:''},{text:result.response,role:'assistant',property:'' } ])
        //     // console.log("log8",messageCount)
        //  }
         else{
            setPromptManageMode(false)
            let reqPromptInputs = [...contractCreationPropmptInputs,userInput]
            setChats(()=>[...chats,{text:userInput,role:'user'} ] )
            handleChat(reqPromptInputs)
         }

         inputRef.current.value=''
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

        let mainQuery = `Answer the user's question as best you can:\n{format_instructions}\n If bitcoin price is $10000 , the prediction for bitcoin price in the next {predictionMonths} months to hit $ {predictionPrice} . Please generate call option data for me strike , premium , open int, expiration date so I can create contracts.Also generate {contractCounts} contracts data for this scenario and think about me as the money maker and I have {userBalance} Bitcoins in total.`        


    //prompt initialization    
    let reqPrompt = new PromptTemplate({
        template:mainQuery,
        inputVariables:["predictionMonths","predictionPrice","contractCounts","userBalance"],
        partialVariables:{format_instructions:formatInstructions}
       })

    chain = new LLMChain({llm,prompt:reqPrompt,memory})
    //    chain = new LLMChain({llm,prompt:reqPrompt,outputKey: "records",outputParser: outputFixingParser})

    //    console.log("log2",chain)
    //    let result = await chain.call({input:formattedPrompt})

       let result = await chain.call({'predictionMonths':`${promtInputs[0]}`,'predictionPrice':`${promtInputs[1]}`,'contractCounts':`${promtInputs[3]}`,'userBalance':`${promtInputs[2]}`})
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

    const handleCreateContract = async(query) =>{
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
            signature:reqSignature
        }
        await Api.post('/moneyMaker/createContract',payload)
        setcontractParams({strikePrice:null,premium:null,openInterest:null,expirationDate:null})
        setSignature(null)
        setSqlQuery(null)
        }
        catch(error){
            console.log("error",error)
        }
    }

    return(
        <>
        <div className='container py-5'>
            {
                !active &&
                  <h4 className='text-center text-danger mt-2'>Please Connect your wallet!</h4>
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
                                                                <button className='btn btn-primary btn-sm mt-1' onClick={()=>handleCreateContract(chat.text)}>Create Contract</button>
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
                        <Form.Control size="lg" type="text" disabled={!active} placeholder="Welcome ! Type here..." onChange={(e)=>setUserInput(e.target.value)}  ref={inputRef}/>   
                    </div>   
                    <div className='col-3'>
                        {/* <Button variant="primary">Enter</Button> */}
                        <button className='btn btn-primary' onClick={handleUserInput} disabled={!active}>Enter</button>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}