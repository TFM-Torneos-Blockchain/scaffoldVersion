import React, { useEffect, useState } from "react";
import { getParsedError } from "../scaffold-eth";
import { getAccount } from "@wagmi/core";
import { Abi, Address } from "abitype";
import { TransactionReceipt } from "viem";
import { erc20ABI, useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

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
  const writeApproveTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const enrollFunction = fn || "enrollWithERC20";
  const [ERC20addresses, setERC20addresses] = useState<any>([]);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [isApproving, setIsApproving] = useState(true);
  const [currentAllowance, setCurrentAllowance] = useState<any>(0n);
  const [playerAddress, setPlayerAddress] = useState<any>("");
  const [contractAddress, setContractAddress] = useState<any>("");

  const { data: deployedContractData } = useDeployedContractInfo("TournamentContract");
  const { address: player_address } = getAccount();

  const { data:dataAcceptedTokens,isFetching: isFetchingAcceptedTokens, refetch: refetchAcceptedTokens } = useContractRead({
    address: contract.address,
    functionName: "getAcceptedTokens",
    abi: contract.abi as Abi,
    args: [tournament_id],
    enabled: false,
  });

  const { data:dataAllowance,refetch: refetchAllowance } = useContractRead({
    address: ERC20addresses[currentTokenIndex],
    functionName: "allowance",
    abi: erc20ABI,
    args: [playerAddress, contractAddress],
    enabled: false,
  });

  const moveToNextToken = () => {
    if (currentTokenIndex < ERC20addresses.length - 1) {
      setCurrentTokenIndex(currentTokenIndex + 1);
      setCurrentAllowance(0n);
      // refetchAllowance();
    } else {
      // All tokens have been approved, switch to enroll
      setIsApproving(false);
    }
  };

  useEffect(() => {
      setPlayerAddress(player_address);
      setContractAddress(deployedContractData?.address);
      // const acceptedTokens = await refetchAcceptedTokens();
      setERC20addresses(dataAcceptedTokens);
      // const allowance = await refetchAllowance();
      setCurrentAllowance(dataAllowance);
      console.log("allowance", currentAllowance);
      console.log("acceptedTokens.data", ERC20addresses);
      console.log("player_address", playerAddress);
      console.log("deployedContractData", contractAddress);
      if (currentAllowance?currentAllowance:0n > (txAmount?BigInt(txAmount):100n)) {
        moveToNextToken();
      }
  });

  const {
    data: approve_result,
    isLoading: isLoadingApprove,
    writeAsync: writeApprove,
  } = useContractWrite({
    address: ERC20addresses[currentTokenIndex],
    abi: erc20ABI,
    functionName: "approve",
    args: [contractAddress, txAmount ? BigInt(txAmount) : BigInt(0)],
    onSuccess: moveToNextToken,
    onError: (error: any) => {
      notification.error(error.message);
      console.log(error.message);
    },
  });

  const {
    data: enroll_result,
    isLoading: isLoadingEnroll,
    writeAsync: writeEnroll,
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
        const makeWriteApproveWithParams = () => writeApprove();
        await writeApproveTxn(makeWriteApproveWithParams);
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
    if (isApproving ) {
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
