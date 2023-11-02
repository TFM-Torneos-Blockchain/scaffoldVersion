import React from 'react'
import { useContractWrite } from 'wagmi';
import { useDeployedContractInfo, useTransactor } from '~~/hooks/scaffold-eth';
import { getLeaderboard } from '~~/utils/leader-board/leaderboard';
import { getTargetNetwork, notification } from '~~/utils/scaffold-eth';
import { getParsedError } from '../scaffold-eth';
import { BigNumber } from 'ethers';

export default function EndButton({tournament_id, leaderboardState} : {tournament_id: any, leaderboardState: any}) {
 
  
  const writeTxn = useTransactor();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo('TournamentManager');
  console.log(leaderboardState)
    const {
      data: result,
      isLoading,
      writeAsync,
    } = useContractWrite({
      chainId: getTargetNetwork().id,
      address: deployedContractData?.address,
      functionName: 'endETHTournament',
      abi: deployedContractData?.abi,
      args: [Number(tournament_id), leaderboardState.concatenatedStringBytes ,leaderboardState.positions],
    });

  const handleWrite = async () => {
    if (writeAsync) {
      try {
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


  return (
    <button 
    className="w-56 bg-red-700 text-white active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
    type="button"
    onClick={handleWrite}>End</button>
  )
}
