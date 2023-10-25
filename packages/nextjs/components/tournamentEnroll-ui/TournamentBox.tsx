import React, { useEffect, useState } from "react";
import EnrollButtonERC20 from "./EnrollButtonERC20";
import EnrollButtonETH from "./EnrollButtonETH";
import { Abi } from "abitype";
import { useContractRead } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { Contract } from "~~/utils/scaffold-eth/contract";
import TournamentPopUp from "./TournamentPopUp";
import { formatEther } from "viem";

type TReadOnlyFunctionFormProps = {
  tournament_id: number;
  contract: Contract<"TournamentManager">;
  is_ETH: boolean;
};

export default function TournamentBox({ tournament_id, contract, is_ETH }: TReadOnlyFunctionFormProps) {
  const [tournamentInfo, setTournamentInfo] = useState<any>([]);

  const tournamentsFunction = "tournaments";


  const { isFetching, refetch } = useContractRead({
    address: contract.address,
    functionName: tournamentsFunction,
    abi: contract.abi as Abi,
    enabled: false,
    args: [tournament_id],
    onSuccess: (data: any) => {
      const tournament = {
        id: data[0],
        min_participants: data[1],
        max_participants: data[2],
        num_participants: data[3],
        enrollment_amount: formatEther(data[4]),
        reward_amount: formatEther(data[5]),
        init_date: new Date(Number(data[6])*1000).toLocaleString(),
        end_date: new Date(Number(data[7])*1000).toLocaleString(),
        DeFiBridge_address: data[8],
        DeFiProtocol_address: data[9],
        aborted: Boolean(parseInt(data[10])).toString(),
      };
      console.log("asaber torunamentbox, read"); // TODO no està loggegan aixo
      setTournamentInfo(tournament);
    },
    onError: (error: any) => {
      notification.error(error.message);
    },
  });

  useEffect(() => {
    refetch();
    console.log("asaber torunamentbox, useeffect");
  }, []);

  return (
    <div className="bg-slate-900 w-fit p-4 rounded-md">
      <div >
        <h2 className="font-bold">TOURNAMENT #{tournamentInfo.id}</h2>
        <div className="flex flex-col mb-4">
          <span>Enroll amount: {tournamentInfo.enrollment_amount}</span>
          <span>Reward amount: {tournamentInfo.reward_amount}</span>
          <span>Participants: {tournamentInfo.num_participants}</span>
        </div>
      </div>
        <div className="mb-2">
          {is_ETH ? (
            <EnrollButtonETH
              key={`boxETH-${contract}-${tournament_id}}`}
              contract={contract}
              tournament_id={tournament_id}
              txAmount={(tournamentInfo.enrollment_amount)}
            />
          ) : (
            <EnrollButtonERC20
              key={`boxERC20-${contract}-${tournament_id}}`}
              contract={contract}
              tournament_id={tournament_id}
              txAmount={(tournamentInfo.enrollment_amount)}
            />
          )}
        </div>
    <div className="flex justify-center">
      <TournamentPopUp tournamentInfo={tournamentInfo}  />
    </div>
  </div>
  );
}
