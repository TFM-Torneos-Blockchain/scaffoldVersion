import { useState } from "react";
import { CopyIcon } from "./assets/CopyIcon";
import { DiamondIcon } from "./assets/DiamondIcon";
import { HareIcon } from "./assets/HareIcon";
import { ArrowSmallRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScaffoldContract, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const NewTournament = () => {
  const [max_participants, set_max_participants] = useState(0);
  const [min_participants, set_min_participants] = useState(0);
  const [enrollment_amount, set_enrollment_amount] = useState(0);
  const [accepted_tokens, set_accepted_tokens] = useState<string[]>([]);

  const [init_date, set_init_date] = useState("");
  const [end_date, set_end_date] = useState("");
  const [DeFiBridge_address, set_DeFiBridge_address] = useState("");



  const handleFormSubmit = () => {
    const { isLoading:loadingapprove, isSuccess, writeAsync: approve } = useScaffoldContractWrite({
      contractName: "TournamentContract",
      functionName: "createTournament",
      args: [
         max_participants,
         min_participants,
         enrollment_amount,
         accepted_tokens,
         init_date,
         end_date,
         DeFiBridge_address],
      onBlockConfirmation: txnReceipt => {
        console.log("📦 approve Transaction blockHash", txnReceipt.blockHash);
      },
    });
  };

  return (
    <div className="flex justify-center bg-base-300 relative pb-10">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className="flex flex-col items-center mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-2xl shadow-lg border-2 border-primary">
          <span className="text-4xl sm:text-6xl text-black">Enter Tournament Variables</span>

          <div className="mt-8">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Maximum participants"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_max_participants(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Minimum participants"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_min_participants(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Required Enrollment Tokens"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_enrollment_amount(parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Accepted Tokens (address[])"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_accepted_tokens(e.target.value.split(','))}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="The date of the start of the tournament"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_init_date(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="The date of the end of the tournament"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_end_date(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                placeholder="DeFi Protocol Address"
                className="input font-bai-jamjuree w-full px-5 py-2 h-12 bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] border border-primary text-lg sm:text-2xl placeholder-gray-600"
                onChange={e => set_DeFiBridge_address(e.target.value)}
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
