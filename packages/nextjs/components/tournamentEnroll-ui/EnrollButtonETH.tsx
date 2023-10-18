import React, { useEffect, useState } from "react";
import { getParsedError } from "../scaffold-eth";
import { Abi } from "abitype";
import { TransactionReceipt } from "viem";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

export default function EnrollButtonETH({
  contract,
  tournament_id,
  txAmount,
  fn,
}: {
  contract: Contract<ContractName>;
  tournament_id: number;
  txAmount: string;
  fn?: string;
}) {
  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const enrollFunction = fn || "enrollWithETH";

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
        const makeWriteWithParams = () => writeAsync({ value: BigInt(txAmount)*1000000000000000000n }); // en WEIS
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

  return <button onClick={handleWrite}>EnrollButton</button>;
}
