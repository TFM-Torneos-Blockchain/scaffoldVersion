import React, { useEffect, useState } from 'react'
import { useContractWrite, useNetwork, useWaitForTransaction } from 'wagmi';
import { useTransactor } from '~~/hooks/scaffold-eth';
import { getTargetNetwork, notification } from '~~/utils/scaffold-eth';
import { Contract, ContractName } from '~~/utils/scaffold-eth/contract'
import { Abi, AbiFunction, Address } from "abitype";
import { getParsedContractFunctionArgs, getParsedError } from '../scaffold-eth';
import { TransactionReceipt } from 'viem';


export default function EnrollButton({contract, id, txAmount, fn}: {contract: Contract<ContractName>, id: number,  txAmount: string,fn?: string}) {
    const [txValue, setTxValue] = useState<string | bigint>("");
    const { chain } = useNetwork();
    const writeTxn = useTransactor();
    const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
    const enrollFunction = fn || "enrollWithETH"
  
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
          const makeWriteWithParams = () => writeAsync({ value: BigInt(txAmount) }); // en WEIS
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
    <button onClick={handleWrite}>EnrollButton</button>
  )
}
