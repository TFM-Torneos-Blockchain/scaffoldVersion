import React, { useEffect, useState } from "react";
import ClaimButton from "./ClaimButton";
import EndButton from "./EndButton";
import EndERC20Button from "./EndERC20Button";
import EnrollButtonERC20 from "./EnrollButtonERC20";
import EnrollButtonETH from "./EnrollButtonETH";
import PlayButton from "./PlayButton";
import StartButton from "./StartButton";
import StartERC20Button from "./StartERC20Button";
import TournamentPopUp from "./TournamentPopUp";
import { Abi } from "abitype";
import { BigNumber, ethers } from "ethers";
import { useAccount, useContractRead } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getLeaderboard } from "~~/utils/leader-board/leaderboard";
import { notification } from "~~/utils/scaffold-eth";
import { Contract } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  tournament_id: number;
  contract: Contract<"TournamentManager">;
  is_ETH: boolean;
};

export default function TournamentBox({ tournament_id, contract, is_ETH }: TReadOnlyFunctionFormProps) {
  const [tournamentInfo, setTournamentInfo] = useState<any>({});
  const [leaderboardState, setLeaderboard] = React.useState({
    concatenatedStringBytes: "",
    positions: [],
  });
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const tournamentsFunction = "tournaments";
  const { address } = useAccount();
  const tournamentId = BigNumber.from(tournament_id).toNumber();

  const { isFetching, refetch } = useContractRead({
    address: contract.address,
    functionName: tournamentsFunction,
    abi: contract.abi as Abi,
    enabled: false,
    args: [tournament_id],
    onSuccess: (data: any) => {
      console.log(data);
      const tournament = {
        id: data[0],
        min_participants: data[1],
        max_participants: data[2],
        num_participants: data[3],
        enrollment_amount: data[4].toString(),
        init_date: new Date(Number(data[5] * 1000n)).toLocaleString(),
        end_date: new Date(Number(data[6] * 1000n)).toLocaleString(),
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

  async function getTournaments() {
    try {
      const response = await fetch("api/get_results", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error al escribir en el archivo JSON.", error);
    }
  }

  useEffect(() => {
    refetch();
    const getLeaderboardData = async () => {
      const tournaments = await getTournaments();
      console.log(tournament_id);
      const tournament = tournaments.filter((element: any) => Number(element.id) === Number(tournamentId))[0];
      console.log(tournament);
      console.log(tournaments);
      if (tournament?.registrations && leaderboardState.concatenatedStringBytes === "") {
        const registrations = tournament.registrations.map((element: any) => {
          console.log({ address: element.address, score: BigNumber.from(element.score).toBigInt() });
          return { address: element.address, score: BigNumber.from(element.score).toBigInt() };
        });
        const leaderboard = getLeaderboard(BigInt(tournamentId), registrations);
        console.log("after leaderboard");
        console.log(leaderboard);
        setLeaderboard({
          concatenatedStringBytes: leaderboard.concatenatedStringBytes,
          positions: leaderboard.positions,
        });
      }
    };

    if (!isFetching) getLeaderboardData();
    console.log("asaber torunamentbox, useeffect");
  }, []);

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("MajorHashGame");

  if (isFetching || !tournamentInfo.init_date || !tournamentInfo.end_date) return <div>Loading...</div>;

  console.log(leaderboardState);
  return (
    <div className="bg-slate-900 w-fit p-4 rounded-md shadow-md shadow-black ">
      <div>
        <h2 className="font-bold">TOURNAMENT #{tournamentInfo.id}</h2>
        <div className="flex flex-col mb-4">
          <span>Enroll amount: {tournamentInfo.enrollment_amount / 10 ** 18}</span>
          <span>Reward amount: {tournamentInfo.reward_amount}</span>
          <span>Participants: {tournamentInfo.num_participants}</span>
        </div>
        {(address === process.env.NEXT_PUBLIC_ADMIN1 || address === process.env.NEXT_PUBLIC_ADMIN2) &&
          leaderboardState.concatenatedStringBytes && (
            <div className="mb-2">
              {is_ETH ? (
                <div>
                  <StartButton tournament_id={tournamentInfo.id} />
                  <EndButton tournament_id={tournamentInfo.id} leaderboardState={leaderboardState} />
                </div>
              ) : (
                <div>
                  <StartERC20Button tournament_id={tournamentInfo.id} />
                  <EndERC20Button tournament_id={tournamentInfo.id} leaderboardState={leaderboardState} />
                </div>
              )}
            </div>
          )}
      </div>
      {new Date(tournamentInfo.init_date) > new Date(Date.now()) &&
      new Date(Date.now()) < new Date(tournamentInfo.end_date) ? (
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
        </div>
      ) : (
        <div>
          {new Date(tournamentInfo.init_date) < new Date(Date.now()) &&
          new Date(Date.now()) < new Date(tournamentInfo.end_date) ? (
            <div className="mb-2 flex items-center justify-center">
              {deployedContractData && (
                <PlayButton
                  key={`boxETH-${contract}-${tournament_id}}`}
                  contract={deployedContractData}
                  id={tournamentInfo.id}
                  txAmount={tournamentInfo.enrollment_amount}
                />
              )}
            </div>
          ) : (
            <div className="mb-2">
              <ClaimButton tournament_id={tournamentInfo.id} />
            </div>
          )}
        </div>
      )}
      <div className="flex justify-center">
        <TournamentPopUp tournamentInfo={tournamentInfo} />
      </div>
    </div>
  );
}
