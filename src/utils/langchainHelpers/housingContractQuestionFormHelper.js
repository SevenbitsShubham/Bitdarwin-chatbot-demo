import { createTaggingChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain,LLMChain } from "langchain/chains";

import { PromptTemplate,ChatPromptTemplate,HumanMessagePromptTemplate } from 'langchain/prompts'; 


//declared the schema
const schema={
    type:"object",
    properties:{
        titleOfContract:{type:"string",description:"This is the title of the housing contract which user want to create."},
        sellerName :{type:"string",description:"This is the name of the seller who owns the property in the housing contract."},
        buyerName:{type:"string",description:"This is name of the person with whom seller is interested to create a housing contract."},
        propertyAddress:{type:"string",description:"This is a address of the property for which seller want to create the housing contract."},
        sellingPriceOrRentPrice:{type:"integer",description:"This is the selling or rent price of the property to create the housing contract.."},
        closingDateForContractItShouldBeInYYMMDDFormat:{type:"string",description:"This is the date at which contract validity will expire to create the housing contract.."}, 
        governingLaw:{type:"string",description:"This is the governing law for the property mentioned in the housing contract to create the housing contract.."}, 
        termsForContract:{type:"string",description:"This is the governing law for the property mentioned in the housing contract to create the housing contract.."} 
    }
}

//initialized openAI instance
const chatModel = new ChatOpenAI({temperature: 0,
    modelName: "gpt-3.5-turbo",
    openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY})

 //creates question based on the given input field
 export async function askHousingContractReqFields(ask_for='name'){
    console.log("input",ask_for)
    const systemTemplate ="We are creating housing contract for user, for which we need to ask questions to user.Ask the user about {ask_for} for requested housing contract in one sentence. Only ask about {ask_for} to the user.Don't greet the user! Don't say Hi.Only if user asks the reason behind the question then explain your need to get some info for crating housing contract."


    let humanMsg =  HumanMessagePromptTemplate.fromTemplate(systemTemplate)
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        humanMsg
    ]);
let gatheringChain = new LLMChain({llm:chatModel,prompt:chatPrompt})
let chat = await gatheringChain.call({ask_for})

return chat    
}

export async function filterHousingContractFormResponse(textInput,currentDetails){
    console.log("log19.5",textInput.length)
    let chain = createTaggingChain(schema,chatModel)
    let res = await chain.run(textInput)
    console.log("log20",currentDetails,res)
    let updatedDetails =  addNonEmptyDetails(currentDetails,res)
    let remianingDetails =  checkWhatIsEmpty(updatedDetails)
    console.log("log21",updatedDetails,remianingDetails)
    return {remianingDetails,updatedDetails}
}    

  //function to check empty paramters
  function checkWhatIsEmpty(contractDetails){
    let requiredEmptyFields = []
    for (const key in contractDetails){
        if(contractDetails[key] === null || contractDetails[key] === '' || contractDetails[key] === 0){
            requiredEmptyFields.push(key)
            console.log(`Field ${key} is empty.`)
        }
    }
    return requiredEmptyFields
}


//function to fill the no empty fields in the result
function addNonEmptyDetails(currentDetails,newDetails){
    console.log("log19.5",currentDetails,newDetails)
    let reqDetails = {}
    for(let key in newDetails){
        if(newDetails[key] !== null && newDetails[key] !== '' && newDetails[key] !== 0){
            reqDetails[key] = newDetails[key] 
        }   
    }

    for(let key in reqDetails){
        if(currentDetails[key] === null || currentDetails[key] === '' || currentDetails[key] === 0){
            currentDetails[key] = reqDetails[key]
        }   
    }
    console.log("log21",currentDetails)
    return currentDetails
}  
