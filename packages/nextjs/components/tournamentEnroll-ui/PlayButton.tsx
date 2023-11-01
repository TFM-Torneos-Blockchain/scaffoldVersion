import React, { useEffect, useState } from 'react'
import { useContractWrite, useNetwork, useWaitForTransaction } from 'wagmi';
import { useDeployedContractInfo, useScaffoldEventHistory, useTransactor } from '~~/hooks/scaffold-eth';
import { getTargetNetwork, notification } from '~~/utils/scaffold-eth';
import { Contract, ContractName } from '~~/utils/scaffold-eth/contract'
import { Abi, AbiFunction, Address } from "abitype";
import { getParsedContractFunctionArgs, getParsedError } from '../scaffold-eth';
import { TransactionReceipt } from 'viem';
import {ethers} from "ethers";



export default function PlayButton({contract, id, txAmount, fn}: {contract: Contract<ContractName>, id: number,  txAmount: string,fn?: string}) {
    const [txValue, setTxValue] = useState<string | bigint>("");
    const { chain } = useNetwork();
    const writeTxn = useTransactor();
    const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
    const enrollFunction = fn || "enrollWithETH"
    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("TournamentContract");
    // const provider = new ethers.providers.Web3Provider(window.ethereum); // Web3Provider o proveedor similar
    
     const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/'); // Sustituye 'URL_DE_TU_RED_ETHEREUM' por la URL de la red Ethereum que estás utilizando
   // listenOnQuoteUploadedEvent(deployedContractData?.abi, deployedContractData?.address as string, "wss://eth-mainnet.g.alchemy.com/v2/vWBspZ6zScCc8dGnEhMBggT3gKXnMzrv");
   console.log("provider:", provider);
    const contract2 = new ethers.Contract(contract.address,contract.abi, provider);
    console.log(contract2);
    contract2.on('Enroll', (param:any,param2:any, param3: any, param4: any) => {
      //useScaffoldEventHistory
      // Maneja el evento
      console.log("enroll creado");
      handleWriteJson({id: param, name: param2, amount: param3, date: param4})
    });
    console.log("index.js")  

    const handleWriteJson = async (datatoWrtie: {}) => {
      try {
        const response = await fetch('/api/tournaments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datatoWrtie)
        });
        const data = await response.json();
        console.log(data.message);
      } catch (error) {
        console.log('Error al escribir en el archivo JSON.');
      }
    };
   
    const {
      data: result,
      isLoading,
      writeAsync,
    } = useContractWrite({
      chainId: getTargetNetwork().id,
      address: contract.address,
      functionName: enrollFunction,
      abi: contract.abi as Abi,
      args: [id],
    });
  
    const handleWrite = async () => {
      if (writeAsync) {
        try {
            console.log
          const makeWriteWithParams = () => writeAsync({ value: BigInt(txAmount * 1000000000000000000) }); // en WEIS
          await writeTxn(makeWriteWithParams);
          
        } catch (e: any) {
          const message = getParsedError(e);
          notification.error(message);
        }
      }
    };
  
    const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
    const { data: txResult } = useWaitForTransaction({
      hash: result?.hash,
    });
    useEffect(() => {
      setDisplayedTxResult(txResult);
    }, [txResult]);
  
  return (
    <button onClick={handleWrite}>Play</button>
  )
}
