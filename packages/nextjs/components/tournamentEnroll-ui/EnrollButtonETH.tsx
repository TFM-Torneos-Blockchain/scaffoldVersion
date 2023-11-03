import React, { useEffect, useState } from "react";
import { getParsedError } from "../scaffold-eth";
import { Abi } from "abitype";
import { TransactionReceipt } from "viem";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { ethers } from "ethers";

export default function EnrollButtonETH({
  contract,
  tournament_id,
  txAmount,
  setEnrolled
}: {
  contract: Contract<"TournamentManager">;
  tournament_id: number;
  txAmount: string;
  setEnrolled: any;
}) {
  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const enrollFunction = "enrollWithETH";

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
    args: [tournament_id],
  });

  const handleWrite = async () => {
    if (writeAsync) {
      try {
        console.log;
        const makeWriteWithParams = () => writeAsync({ value: BigInt(txAmount) }); // en WEIS
        await writeTxn(makeWriteWithParams);
        setEnrolled(true);
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
    <button
    className="w-56 bg-green-700 text-white active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
    type="button"
    onClick={handleWrite} disabled={isLoading}
  >
   Enroll
  </button>
  );
}
