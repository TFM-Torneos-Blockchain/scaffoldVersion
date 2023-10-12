import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useContractRead } from "wagmi";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
} from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import TournamentBox from "~~/components/tournamentEnroll-ui/TournamentBox";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  contract: Contract<ContractName>;
};

export const GetTournaments = ({ contract }: TReadOnlyFunctionFormProps) => {
  const [tournaments, setTournaments] = useState<any>([]);

  const countTournamentsFunction = "getIDSArray"
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("TournamentContract");

  const { isFetching, refetch } = useContractRead({
    address: contract.address,
    functionName: countTournamentsFunction,
    abi: contract.abi as Abi,
    enabled: false,
    onSuccess: (data: any) => {
        setTournaments(data);
    },
    onError: (error: any) => {
      notification.error(error.message);
    },
  });

useEffect(() => {
    const fetchData = async () => {
        const data = await refetch();
        setTournaments(data);
    };
    fetchData();
}, [])

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
  
      <div className="flex justify-between gap-2 flex-wrap">
        <div className="flex-grow w-4/5">
          
        </div>

        {tournaments[0] /* ETH */ && tournaments[0].map((id: any) => {
            return (
                <TournamentBox id={id}  contract={contract}  />
    
            )})}
      </div>
    </div>
  );
};
