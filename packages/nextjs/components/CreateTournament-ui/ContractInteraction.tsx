import { useState } from "react";
import { parseEther } from "viem";
import { ArrowSmallRightIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { getLeaderboard } from "~~/utils/leader-board/leaderboard";
import { useContractWrite } from "wagmi";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { getParsedError } from "../scaffold-eth";

export const NewTournament = () => {
  const [max_participants, set_max_participants] = useState(0);
  const [min_participants, set_min_participants] = useState(0);
  const [enrollment_amount, set_enrollment_amount] = useState(0n);
  const [accepted_tokens, set_accepted_tokens] = useState<string>("");

  const [init_date, set_init_date] = useState(0);
  const [end_date, set_end_date] = useState(0);
  const [DeFiBridge_address, set_DeFiBridge_address] = useState("");
  const [DeFiProtocol_address, set_DeFiProtocol_address] = useState("");


  const { isLoading:loadingapprove, isSuccess, writeAsync: approve } = useScaffoldContractWrite({
    contractName: "TournamentManager",
    functionName: "createTournament",
    args: [
       max_participants,
       min_participants,
       enrollment_amount,
       accepted_tokens ? accepted_tokens.split(',') : [],
       init_date ? BigInt(Math.floor((new Date(init_date)).getTime()/1000)) : BigInt(0),
       end_date ? BigInt(Math.floor((new Date(end_date)).getTime()/1000)) : BigInt(0),
       DeFiBridge_address,
       DeFiProtocol_address.split(',')],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 approve Transaction blockHash", txnReceipt.blockHash);
    },
  });


  const handleFormSubmit = () => {
    approve();
  };

  return (
    <div className="flex justify-center relative pb-10 bg-slate-800">

      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className="flex flex-col items-center mt-6 px-7 py-8 bg-slate-700 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-white">Enter Tournament Variables</span>

          <div className="mt-8 ">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Maximum participants"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_max_participants(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Minimum participants"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_min_participants(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Required Enrollment Tokens"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_enrollment_amount(parseEther(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Accepted Tokens (address[])"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_accepted_tokens(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="The date of the start of the tournament"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_init_date(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="The date of the end of the tournament"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_end_date(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="DeFi Bridge Address"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_DeFiBridge_address(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="DeFi Protocol Address"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-white bg-[length:100%_100%] border border-primary text-black text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_DeFiProtocol_address(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary rounded-full capitalize font-normal font-white w-24 flex items-center gap-1 hover:gap-2 transition-all tracking-widest"
              onClick={handleFormSubmit}
            >
              Enter
              <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
