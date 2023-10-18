import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { useContractRead } from "wagmi";
import TournamentBox from "~~/components/tournamentEnroll-ui/TournamentBox";
import { notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  contract: Contract<ContractName>;
};

export const GetTournaments = ({ contract }: TReadOnlyFunctionFormProps) => {
  const [tournaments, setTournaments] = useState<any>([]);

  const countTournamentsFunction = "getIDSArray";

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
  }, []);

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <div className="flex justify-between gap-2 flex-wrap">
        <div className="flex-grow w-4/5"></div>
        <h1>ETH tournaments</h1>

        {tournaments[0] /* ETH */ &&
          tournaments[0].map((tournament_id: any) => {
            return <TournamentBox tournament_id={tournament_id} contract={contract} is_ETH={true} />;
          })}
      </div>

      <div className="flex justify-between gap-2 flex-wrap">
        <div className="flex-grow w-4/5"></div>
        <h1>ERC20 tournaments</h1>

        {tournaments[1] /* ERC20 */ &&
          tournaments[1].map((tournament_id: any) => {
            return <TournamentBox tournament_id={tournament_id} contract={contract} is_ETH={false} />;
          })}
      </div>
    </div>
  );
};
