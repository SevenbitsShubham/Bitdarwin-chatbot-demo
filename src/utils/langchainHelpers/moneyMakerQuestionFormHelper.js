import { createTaggingChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";

import { ChatPromptTemplate,HumanMessagePromptTemplate } from 'langchain/prompts'; 


//declared the schema
const schema={
    type:"object",
    properties:{
        currency:{type:"string",description:"To create a money maker contract this is a crypto currency for which we will create the contract."},
        periodInMonth:{type:"number",description:"This is the prediction period in months for money maker contract."},
        wouldYouLikeToSeePricePredictionBasedOnHistoricalDailyPricesUsingTimeSeriesModelAlsoKeepInMindThisinformationShouldNotBeConsideredAsFinancialAdvice:{type:"string",description:"This is confirmation from the user for getting strike price attention",enum:["yes","no","YES","NO","required"]},
        strikePriceInUsd:{type:"integer",description:"This is a strikePrice for which user will predict price of the currency in given time period in USD for creating money maker contract."},
        tokenQuantity:{type:"integer",description:"This is the quantity of token to lock in money maker smart contract"},
        noOfContracts:{type:"number",description:"This is the number of contract option parameters for creating money maker smart contract."}                   
    }
}

//initialized openAI instance
const chatModel = new ChatOpenAI({temperature: 0,
    modelName: "gpt-3.5-turbo",
    openAIApiKey:process.env.REACT_APP_OPENAI_API_KEY})

 //creates question based on the given input field
 export async function askForReqFields(ask_for='name'){
    // console.log("input",ask_for)
    const systemTemplate ="We are creating call option contract for user, for which we need to ask questions to user.Ask the user about {ask_for} for call options in one sentence. Only ask about {ask_for} to the user.Don't greet the user! Don't say Hi.Only if user asks the reason behind the question then explain your need to get some info for crating money maker contract ."


    let humanMsg =  HumanMessagePromptTemplate.fromTemplate(systemTemplate)
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        humanMsg
    ]);
let gatheringChain = new LLMChain({llm:chatModel,prompt:chatPrompt})
let chat = await gatheringChain.call({ask_for})

return chat    
}

export async function filterResponse(textInput,currentDetails){
    // console.log("log19.5",textInput)
    let chain = createTaggingChain(schema,chatModel)
    let res = await chain.run(textInput)
    // console.log("log20",currentDetails,res)
    let updatedDetails =  addNonEmptyDetails(currentDetails,res)
    let remianingDetails =  checkWhatIsEmpty(updatedDetails)
    // console.log("log21",updatedDetails,remianingDetails)
    return {remianingDetails,updatedDetails}
}    

  //function to check empty paramters
  function checkWhatIsEmpty(contractDetails){
    let requiredEmptyFields = []
    for (const key in contractDetails){
        if(contractDetails[key] === null || contractDetails[key] === '' || contractDetails[key] === 0){
            requiredEmptyFields.push(key)
            // console.log(`Field ${key} is empty.`)
        }
    }
    return requiredEmptyFields
}


//function to fill the no empty fields in the result
function addNonEmptyDetails(currentDetails,newDetails){
    // console.log("log19.5",currentDetails,newDetails)
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
    // console.log("log21",currentDetails)
    return currentDetails
}  
