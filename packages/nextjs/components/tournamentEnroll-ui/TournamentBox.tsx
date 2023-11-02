import React, { useEffect, useState } from "react";
import EnrollButtonERC20 from "./EnrollButtonERC20";
import EnrollButtonETH from "./EnrollButtonETH";
import { Abi } from "abitype";
import { useAccount, useContractRead } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { Contract } from "~~/utils/scaffold-eth/contract";
import TournamentPopUp from "./TournamentPopUp";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import PlayButton from "./PlayButton";
import { ethers } from "ethers";
import EndButton from "./EndButton";
import ClaimButton from "./ClaimButton";

type TReadOnlyFunctionFormProps = {
  tournament_id: number;
  contract: Contract<"TournamentManager">;
  is_ETH: boolean;
};

export default function TournamentBox({ tournament_id, contract, is_ETH }: TReadOnlyFunctionFormProps) {
  const [tournamentInfo, setTournamentInfo] = useState<any>({});
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const tournamentsFunction = "tournaments";
  const { address } = useAccount();

    const { isFetching, refetch } = useContractRead({
    address: contract.address,
    functionName: tournamentsFunction,
    abi: contract.abi as Abi,
    enabled: false,
    args: [tournament_id],
    onSuccess: (data: any) => {
      console.log(data)
      const tournament = {
        id: data[0],
        min_participants: data[1],
        max_participants: data[2],
        num_participants: data[3],
        enrollment_amount: data[4].toString(),
        init_date: new Date(Number(data[5]*1000n)).toLocaleString(),
        end_date: new Date(Number(data[6]*1000n)).toLocaleString(),
        DeFiBridge_address: data[7],
        DeFiProtocol_address: data[8],
        aborted: data[9].toString(),
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

      console.log(new Date(tournamentInfo));
  
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo('MajorHashGame');



  return (
    <div className="bg-slate-900 w-fit p-4 rounded-md shadow-md shadow-black ">
      <div >
        <h2 className="font-bold">TOURNAMENT #{tournamentInfo.id}</h2>
        <div className="flex flex-col mb-4">
          <span>Enroll amount: {tournamentInfo.enrollment_amount/10**18}</span>
          <span>Reward amount: {tournamentInfo.reward_amount}</span>
          <span>Participants: {tournamentInfo.num_participants}</span>
        </div>
        <EnrollButtonETH
              key={`boxETH-${contract}-${tournament_id}}`}
              contract={contract}
              tournament_id={tournament_id}
              txAmount={tournamentInfo.enrollment_amount}
              setEnrolled={setEnrolled}
            />
        <PlayButton
              key={`boxETH-${contract}-${tournament_id}}`}
              contract={deployedContractData}
              id={tournamentInfo.id}
              txAmount={tournamentInfo.enrollment_amount}
            />
        {address === process.env.NEXT_PUBLIC_ADMIN1 || address === process.env.NEXT_PUBLIC_ADMIN2 ? (<EndButton tournament_id={tournamentInfo.id}></EndButton>) : (<></>)}
      </div>
        {new Date(tournamentInfo.init_date) > new Date(Date.now()) &&  new Date(Date.now())  < new Date(tournamentInfo.end_date)  ? 
        <div className="mb-2">
          {is_ETH ? (
            <EnrollButtonETH
              key={`boxETH-${contract}-${tournament_id}}`}
              contract={contract}
              tournament_id={tournament_id}
              txAmount={tournamentInfo.enrollment_amount}
              setEnrolled={setEnrolled}
            />
          ) : (
            <EnrollButtonERC20
              key={`boxERC20-${contract}-${tournament_id}}`}
              contract={contract}
              tournament_id={tournament_id}
              txAmount={tournamentInfo.enrollment_amount}
              setEnrolled={setEnrolled}
            />
          )}
        </div> : (<div>{new Date(tournamentInfo.init_date) < new Date(Date.now()) &&  new Date(Date.now()) < new Date(tournamentInfo.end_date) ? 
        (<div className="mb-2 flex items-center justify-center">
          {deployedContractData && (
            <PlayButton
              key={`boxETH-${contract}-${tournament_id}}`}
              contract={deployedContractData}
              id={tournamentInfo.id}
              txAmount={tournamentInfo.enrollment_amount}
            />
          )}
        </div>) : 
        <div>
          <ClaimButton tournament_id={tournamentInfo.id} />
        </div>} 
      </div>)}
    <div className="flex justify-center">
      <TournamentPopUp tournamentInfo={tournamentInfo}  />
    </div>
  </div>
  );
}
