import { get } from 'http';
import React from 'react'
import { useAccount, useContractWrite } from 'wagmi';
import { useDeployedContractInfo, useTransactor } from '~~/hooks/scaffold-eth';
import { getLeaderboard } from '~~/utils/leader-board/leaderboard';
import { getMerkleRoot } from '~~/utils/leader-board/merkle_tree_proof';
import { getTargetNetwork, notification } from '~~/utils/scaffold-eth';
import { getParsedError } from '../scaffold-eth';

export default function ClaimButton(tournament_id: number) {
    const [leaderboardState, setLeaderboard] = React.useState({
        concatenatedStringBytes: '',
        positions: [0],
    });
    const [merkleTreeState, setMerkleTree] = React.useState({
        isLeft: [],
        proof: [],
    });
    const [classificationPosition, setClassificationPosition] = React.useState(0);
    const {address} = useAccount();
  
  const writeTxn = useTransactor();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo('TournamentManager');


    const {
      data: result,
      isLoading,
      writeAsync,
    } = useContractWrite({
      chainId: getTargetNetwork().id,
      address: deployedContractData?.address,
      functionName: 'verifyAndClaim',
      abi: deployedContractData?.abi,
      args: [Number(tournament_id.tournament_id), merkleTreeState.isLeft , classificationPosition, merkleTreeState.proof ],
    });

  const handleWrite = async () => {
    console.log(tournament_id)
    if (writeAsync) {
      try {
        const tournaments = await getTournaments();
        const tournament = tournaments.filter((element: any) => Number(element.id) === Number(tournament_id.tournament_id))[0];
        console.log(tournament);
        console.log(tournaments)
        const entryPosition = tournament.registrations.map((element: any, i: number) => {
            if(element.address === address) {
                return i;
            }   
        });
        const leaderboard = getLeaderboard(BigInt(tournament_id.tournament_id), tournament.registrations);
        let leaf_position = 0;
        leaf_position = leaderboard.positions.findIndex((element: any) => element === entryPosition);
        setClassificationPosition(leaf_position);
        console.log('leaf position: ' + leaf_position)
        const merkle = getMerkleRoot(tournament_id, leaderboard.concatenatedStringBytes, leaderboard.positions, leaf_position);
        console.log('after leaderboard');
        console.log(leaderboard);
        setLeaderboard({concatenatedStringBytes: leaderboard.concatenatedStringBytes, positions: leaderboard.positions});
        setMerkleTree({isLeft: merkle.isLeft, proof: merkle.proof})

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
    <div>
    <button 
    className="mb-1 w-56 bg-green-700 text-white active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
    type="button"
    onClick={handleWrite}>Claim</button>

  </div>
  )
}
