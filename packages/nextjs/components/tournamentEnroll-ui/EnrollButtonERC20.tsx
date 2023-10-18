import React, { useEffect, useState } from "react";
import { getParsedError } from "../scaffold-eth";
import { Abi, Address } from "abitype";
import { TransactionReceipt } from "viem";
import { useContractRead, useContractWrite, useNetwork, useWaitForTransaction, erc20ABI } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
// import  TokensApprove  from "../scaffold-eth/Contract/TokensApprove";

export default function EnrollButtonERC20({
  contract,
  tournament_id,
  txAmount,
  spender,
  fn,
}: {
  contract: Contract<ContractName>;
  tournament_id: number;
  txAmount: string;
  spender: string;
  fn?: string;
}) {
  const { chain } = useNetwork();
  const writeEnrollTxn = useTransactor();
  const approveTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const enrollFunction = fn || "enrollWithERC20";
  const [ERC20addresses, setERC20addresses] = useState<any>([]);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [isApproving, setIsApproving] = useState(true);

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("TournamentContract");


  const { isFetching, refetch:executeApprove } = useContractRead({
    address: contract.address,
    functionName: "getAcceptedTokens",
    abi: contract.abi as Abi,
    args: [tournament_id],
    enabled: false,
    onSuccess: (acceptedTokens: any) => {
      setERC20addresses(acceptedTokens);
      console.log("accepted tokens",acceptedTokens, typeof acceptedTokens);
      console.log("onSuccess",ERC20addresses[currentTokenIndex],typeof ERC20addresses[currentTokenIndex]);
    },
    onError: (error: any) => {
      notification.error(error.message);
    },
  });

  const moveToNextToken = () => {
    if (currentTokenIndex < ERC20addresses.length - 1) {
      setCurrentTokenIndex(currentTokenIndex + 1);
    } else {
      // All tokens have been approved, switch to enroll
      setIsApproving(false);
    }
  };

  const {
    data: approve_result,
    isLoading:isLoadingApprove, 
    writeAsync: writeApprove 
  } = useContractWrite({
      address: ERC20addresses[currentTokenIndex],
      abi: erc20ABI,
      functionName: 'approve',
      args: [deployedContractData? deployedContractData.address: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed", txAmount ? BigInt(txAmount) : BigInt(0)],
      onSuccess: moveToNextToken ,
      onError: (error: any) => {
        notification.error(error.message);
        console.log(error.message);
      },
    });

  const {
    data: enroll_result,
    isLoading:isLoadingEnroll,
    writeAsync:writeEnroll,
  } = useContractWrite({
    chainId: getTargetNetwork().id,
    address: contract.address,
    functionName: enrollFunction,
    abi: contract.abi as Abi,
    args: [tournament_id],
  });

  const handleWriteApprove = async () => {
    if (writeApprove) {
      try {
        console.log;
        await executeApprove();
        const makeApproveWithParams = () => writeApprove();
        await approveTxn(makeApproveWithParams);
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    }
  };

  const handleWriteEnroll = async () => {
    if (writeEnroll) {
      try {
        console.log;
        const makeWriteWithParams = () => writeEnroll();
        await writeEnrollTxn(makeWriteWithParams);
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txEnrollResult } = useWaitForTransaction({
    hash: enroll_result?.hash,
  });
  useEffect(() => {
    setDisplayedTxResult(txEnrollResult);
  }, [txEnrollResult]);


  const handleClick = () => {
    if (isApproving) {
      handleWriteApprove();
    } else {
      handleWriteEnroll();
    }
  };

  const buttonText = isApproving ? "Approve" : "Enroll";

  return (
    <button onClick={handleClick} disabled={isLoadingApprove}>
      {buttonText}
    </button>
  );
}
