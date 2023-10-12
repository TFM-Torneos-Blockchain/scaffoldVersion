import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt } from "viem";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import {
  TxReceipt,
  getParsedError,
} from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

type DisplayTournamentsFormProps = {
  abiFunction: AbiFunction;
  tournamentID: bigint;
  onChange: () => void;
  contractAddress: Address;
  value: string;
};

export const DisplayTournamentsForm = ({ abiFunction, tournamentID , onChange, contractAddress, value }: DisplayTournamentsFormProps) => {
  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const {
    data: result,
    isLoading,
    writeAsync,
  } = useContractWrite({
    chainId: getTargetNetwork().id,
    address: contractAddress,
    functionName: abiFunction.name,
    abi: [abiFunction] as Abi,
    args: [tournamentID],
  });

  const handleWrite = async () => {
    if (writeAsync) {
      try {
        const makeWriteWithParams = () => writeAsync({ value: BigInt(value) });
        await writeTxn(makeWriteWithParams);
        onChange();
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
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className="flex flex-col gap-3">
        <p className="font-medium my-0 break-words">{abiFunction.name}</p>
        <div className="flex justify-between gap-2">
          <div className="flex-grow basis-0">
            {displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}
          </div>
          <div
            className={`flex ${
              writeDisabled &&
              "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button className="btn btn-secondary btn-sm" disabled={writeDisabled || isLoading} onClick={handleWrite}>
              {isLoading && <span className="loading loading-spinner loading-xs"></span>}
              Send 💸
            </button>
          </div>
        </div>
      </div>
      {abiFunction.stateMutability === "payable" && txResult ? (
        <div className="flex-grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
