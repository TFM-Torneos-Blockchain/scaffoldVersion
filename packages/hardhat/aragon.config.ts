import { Wallet } from "@ethersproject/wallet";
import { Context, ContextParams } from "@aragon/sdk-client";
import { SupportedNetwork } from "@aragon/sdk-client-common";

// Set up your IPFS API key. You can get one either by running a local node or by using a service like Infura or Alechmy.
// Make sure to always keep these private in a file that is not committed to your public repository.
export const IPFS_API_KEY: string = "ipfs-api-key";

// OPTION A: The simplest ContextParams you can have is this. This uses our default values and should work perfectly within your product.
const minimalContextParams: ContextParams = {
  // Choose the network you want to use. You can use "goerli" (Ethereum) or "maticmum" (Polygon) for testing, or "mainnet" (Ethereum) and "polygon" (Polygon) for mainnet.
  network: 5,
  web3Providers: process.env.ALCHEMY_API_WEB||"https://eth.llamarpc.com",
  // This is the signer account who will be signing transactions for your app. You can use also use a specific account where you have funds, through passing it `new Wallet("your-wallets-private-key")` or pass it in dynamically when someone connects their wallet to your dApp.
  signer: new Wallet(`0x${process.env.DEPLOYER_PRIVATE_KEY}`),
};


// Instantiate the Aragon SDK context
export const minimalContext: Context = new Context(minimalContextParams);