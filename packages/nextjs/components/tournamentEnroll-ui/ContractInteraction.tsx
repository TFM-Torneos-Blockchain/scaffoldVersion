import { useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { parseUnits } from "viem";
import { ArrowSmallRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const [visible, setVisible] = useState(true);
  const [new_amount, setNew_amount] = useState("");

  const [new_cometAddress, setNew_cometAddress] = useState("");

  const { data: CompoundProtocol } = useScaffoldContract({ contractName: "CompoundProtocol" });
  const { data: TournamentContract } = useScaffoldContract({ contractName: "TournamentContract" });
  const { data: CompoundDaiMumbai } = useScaffoldContract({ contractName: "CompoundDaiMumbai" });

  const { isLoading:loadingapprove, isSuccess, writeAsync: approve } = useScaffoldContractWrite({
    contractName: "CompoundDaiMumbai",
    functionName: "approve",
    args: [TournamentContract?.address, parseUnits(new_amount, 18)],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 approve Transaction blockHash", txnReceipt.blockHash);
      console.log("Amount for Approval:", parseUnits(new_amount, 18).toString());
      enroll();
    },
  });

  const { writeAsync: enroll, isLoading } = useScaffoldContractWrite({
    contractName: "TournamentContract",
    functionName: "enroll",
    args: [CompoundDaiMumbai?.address, CompoundProtocol?.address, parseUnits(new_amount, 18)],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 transferTo DeFi Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { data: tokensToSupply } = useScaffoldContractRead({
    contractName: "CompoundProtocol",
    functionName: "getERC20TokenBalance",
    args: [CompoundDaiMumbai?.address],
  });

  const { isLoading: isLoadingApprove, writeAsync: compApprove } = useScaffoldContractWrite({
    contractName: "CompoundProtocol",
    functionName: "approveAndSupply",
    args: [tokensToSupply, CompoundDaiMumbai?.address, new_cometAddress],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });


  return (
    <div className="flex bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className={`mt-10 flex gap-2 ${visible ? "" : "invisible"} max-w-2xl`}>
          <div className="flex gap-5 bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
            <span className="text-3xl">👋🏻</span>
            <div>
              <div>
                In this page I'll have to make the users enroll to the tournament, by clicking an enroll button. When
                enrolling, they'll be approving us to use an specific amount of tokens, and then we're automatically
                gonna move their tokens to our contracts.
              </div>
              <div className="mt-2">
                Check out{" "}
                <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem]">
                  packages / nextjs/pages / tournamentEnroll-ui.tsx
                </code>{" "}
                and its underlying components.
              </div>
            </div>
          </div>
          <button
            className="btn btn-circle btn-ghost h-6 w-6 bg-base-200 bg-opacity-80 z-0 min-h-0 drop-shadow-md"
            onClick={() => setVisible(false)}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Enroll comp Tournament</span>

          <div className="mt-8">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Amount of tokens to approve"
                className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white"
                onChange={e => setNew_amount(e.target.value)}
              />
            </div>
            <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
              <div className="flex rounded-full border-2 border-primary p-1">
                <button
                  className="btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
                  onClick={() => approve()}
                  disabled={isLoadingApprove}
                >
                  {isLoadingApprove ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      Enroll <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Supply ERC20 to comp Protocol</span>

          <div className="mt-8">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Comet address"
                className="input font-bai-jamjuree w-full px-5 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-white"
                onChange={e => setNew_cometAddress(e.target.value)}
              />
            </div>
            <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
              <div className="flex rounded-full border-2 border-primary p-1">
                <button
                  className="btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
                  onClick={() => compApprove()}
                  disabled={isLoadingApprove}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      Supply to Compound <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 items-start">
          <span className="text-sm leading-tight">Price :</span>
          <div className="badge badge-warning">0.01 ETH + Gas</div>
        </div>
      </div>
    </div>
  );
};
