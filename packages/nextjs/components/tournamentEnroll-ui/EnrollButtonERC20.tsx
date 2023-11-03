import React, { useEffect, useState } from "react";
import { getParsedError } from "../scaffold-eth";
import { getAccount } from "@wagmi/core";
import { Abi } from "abitype";
import { ethers } from "ethers";
import { TransactionReceipt } from "viem";
import { erc20ABI, useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { Contract } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  tournament_id: number;
  contract: Contract<"TournamentManager">;
  txAmount: string;
  setEnrolled: any;
};
// import  TokensApprove  from "../scaffold-eth/Contract/TokensApprove";
export default function EnrollButtonERC20({
  tournament_id,
  contract,
  txAmount,
  setEnrolled,
}: TReadOnlyFunctionFormProps) {
  const { chain } = useNetwork();
  const writeEnrollTxn = useTransactor();
  const writeApproveTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;
  const enrollFunction = "enrollWithERC20";
  
  const [ERC20addresses, setERC20addresses] = useState<any>([]);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [isApproving, setIsApproving] = useState(true);
  const [currentAllowance, setCurrentAllowance] = useState<any>(0n);
  const [playerAddress, setPlayerAddress] = useState<any>("");
  // const [infoReaded, setInfoReaded] = useState(false);
  const { address: player_address } = getAccount();

  const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_LINK); // Sustituye 'URL_DE_TU_RED_ETHEREUM' por la URL de la red Ethereum que estás utilizando
  // listenOnQuoteUploadedEvent(deployedContractData?.abi, deployedContractData?.address as string, "wss://eth-mainnet.g.alchemy.com/v2/vWBspZ6zScCc8dGnEhMBggT3gKXnMzrv");
  console.log("provider:", provider);
  const contract2 = new ethers.Contract(contract.address, contract.abi, provider);
  console.log(contract2);
  contract2.on("Enroll", (param: any, param2: any, param3: any, param4: any) => {
    //useScaffoldEventHistory
    // Maneja el evento
    console.log("enroll creado");
    handleWriteJson({ id: param, name: param2, amount: param3, date: param4 });
  });
  console.log("index.js");

  const handleWriteJson = async (datatoWrtie: {}) => {
    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datatoWrtie),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.log("Error al escribir en el archivo JSON.");
    }
  };

  const {
    data: dataAcceptedTokens,
    // isFetching: isFetchingAcceptedTokens,
    // refetch: refetchAcceptedTokens,
  } = useContractRead({
    address: contract.address,
    functionName: "getAcceptedTokens",
    abi: contract.abi as Abi,
    args: [tournament_id],
    enabled: false,
  });

  const {
    data: dataAllowance,
    // refetch: refetchAllowance
  } = useContractRead({
    address: ERC20addresses[currentTokenIndex],
    functionName: "allowance",
    abi: erc20ABI,
    args: [playerAddress, contract.address],
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
    console.log("USEEFFECT start ERC20");
    setPlayerAddress(player_address);
    if (dataAcceptedTokens) setERC20addresses(dataAcceptedTokens);
    setCurrentAllowance(dataAllowance);
    console.log("allowance", currentAllowance);
    console.log("acceptedTokens.data", ERC20addresses);
    console.log("player_address", playerAddress);
    console.log("deployedContractData", contract.address);
    if (currentAllowance ? currentAllowance : 0n > (txAmount ? BigInt(txAmount) : 100n)) {
      moveToNextToken();
    }
    console.log("USEEFFECT end ERC20");
  });

  const {
    data: approve_result,
    isLoading: isLoadingApprove,
    writeAsync: writeApprove,
  } = useContractWrite({
    address: ERC20addresses[currentTokenIndex],
    abi: erc20ABI,
    functionName: "approve",
    args: [contract.address, txAmount ? BigInt(txAmount) : BigInt(0)],
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
        setEnrolled(true);
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
    <button
      className="w-56 bg-green-700 text-white active:bg-slate-800 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
      type="button"
      onClick={handleClick}
      disabled={isLoadingApprove}
    >
      {buttonText}
    </button>
  );
}
