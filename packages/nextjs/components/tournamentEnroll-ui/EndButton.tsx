import React from 'react'
import { useContractWrite } from 'wagmi';
import { useDeployedContractInfo, useTransactor } from '~~/hooks/scaffold-eth';
import { getLeaderboard } from '~~/utils/leader-board/leaderboard';
import { getTargetNetwork, notification } from '~~/utils/scaffold-eth';
import { getParsedError } from '../scaffold-eth';
import { BigNumber } from 'ethers';

export default function EndButton(tournament_id:number) {
    const [leaderboardState, setLeaderboard] = React.useState({
        concatenatedStringBytes: '',
        positions: [],
    });
  
  const writeTxn = useTransactor();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo('TournamentManager');

    const {
      data: result,
      isLoading,
      writeAsync,
    } = useContractWrite({
      chainId: getTargetNetwork().id,
      address: deployedContractData?.address,
      functionName: 'endETHTournament',
      abi: deployedContractData?.abi,
      args: [Number(tournament_id.tournament_id), leaderboardState.concatenatedStringBytes ,leaderboardState.positions],
    });

  const handleWrite = async () => {
    console.log(tournament_id.tournament_id)
    if (writeAsync) {
      try {
        const tournaments = await getTournaments();
        const tournament = tournaments.filter((element: any) => Number(element.id) === Number(tournament_id.tournament_id))[0];
        console.log(tournament);
        console.log(tournaments)
        const registrations = tournament.registrations.map((element: any) => {
          console.log({address: element.address, score: BigNumber.from(element.score).toBigInt()})
            return {address: element.address, score: BigNumber.from(element.score).toBigInt()};
        });
        const leaderboard = getLeaderboard(BigInt(tournament_id.tournament_id), registrations);
        console.log('after leaderboard')
        console.log(leaderboard);
        setLeaderboard({concatenatedStringBytes: leaderboard.concatenatedStringBytes, positions: leaderboard.positions})
      tournament.finished = true;
        console.log;
        const makeWriteWithParams = () => writeAsync(); 
        await writeTxn(makeWriteWithParams);
      } catch (e: any) {
        const message = getParsedError(e);
        console.log(e)
        notification.error(message);
      }
    }
  };

  

async function getTournaments() {
  try {
    const response = await fetch('api/get_results', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error al escribir en el archivo JSON.', error);
  }
}
  return (
    <button 
    className="w-56 bg-red-700 text-white active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
    type="button"
    onClick={handleWrite}>End</button>
  )
}
