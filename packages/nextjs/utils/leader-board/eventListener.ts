
import {ethers} from 'ethers';


let contractAbi;
let contractAddress;
let provider;
let CONTRACT;

export const listenOnQuoteUploadedEvent = (_contractAbi: any, _contractAddress: string, 
websocketProviderURL: string) => {
    console.log("Listening on QuoteUploaded Event")
    contractAbi = _contractAbi;
    contractAddress = _contractAddress;
    provider = new ethers.providers.WebSocketProvider(websocketProviderURL);
    CONTRACT = new ethers.Contract(contractAddress, contractAbi, provider);
    CONTRACT.on("ResultCreated",(newQuote: any)=>{
    console.info(newQuote);
    })
}





