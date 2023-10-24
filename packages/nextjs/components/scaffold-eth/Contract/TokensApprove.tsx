import React, { useEffect, useState } from "react";
import { Abi, Address } from "abitype";
import { TransactionReceipt } from "viem";
import { erc20ABI, useAccount, useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { getParsedError } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

export default function TokensApprove({
  contract,
  tournament_id,
  txAmount,
}: {
  contract: Contract<ContractName>;
  tournament_id: number;
  txAmount: string;
}) {
  const approveTxn = useTransactor();
  const [ERC20addresses, setERC20addresses] = useState<any>([]);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [isApproving, setIsApproving] = useState(true);
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n);

  const { data: deployedContractData, isLoading: isLoadingContractData } =
    useDeployedContractInfo("TournamentManager");
  const { address: player_address } = useAccount();

  const { refetch: refetchAcceptedTokens, isFetching: isFetchingAcceptedTokens } = useContractRead({
    address: contract.address,
    functionName: "getAcceptedTokens",
    abi: contract.abi as Abi,
    args: [tournament_id],
    enabled: false,
    onSuccess(tokens) {
      setERC20addresses(tokens);
    },
    onError: (error: any) => {
      notification.error(error.message);
    },
  });

  const { refetch: refetchAllowance } = useContractRead({
    address: ERC20addresses[currentTokenIndex],
    functionName: "allowance",
    abi: erc20ABI,
    args: [
      player_address ? player_address : "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      deployedContractData ? deployedContractData.address : "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    ],
    enabled: false,
    onSuccess(allowance) {
      setCurrentAllowance(allowance);
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
    isLoading: isLoadingApprove,
    writeAsync: writeApprove,
  } = useContractWrite({
    address: ERC20addresses[currentTokenIndex],
    abi: erc20ABI,
    functionName: "approve",
    args: [
      deployedContractData ? deployedContractData.address : "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      txAmount ? BigInt(txAmount) : BigInt(0),
    ],
    onSuccess: moveToNextToken,
    onError: (error: any) => {
      notification.error(error.message);
      console.log(error.message);
    },
  });

  const handleWriteApprove = async () => {
    if (writeApprove) {
      try {
        console.log;
        const makeApproveWithParams = () => writeApprove();
        await approveTxn(makeApproveWithParams);
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    }
  };

  const handleClick = async () => {
    await refetchAcceptedTokens();
    await refetchAllowance();
    if (currentAllowance < BigInt(txAmount)) {
      handleWriteApprove();
    } else {
      moveToNextToken();
    }
  };

  return isApproving
  ? {
      onClick: handleClick,
      isDisabled: isFetchingAcceptedTokens,
      buttonText: isFetchingAcceptedTokens ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        "Approve"
      ),
    }
  : undefined;
}
  