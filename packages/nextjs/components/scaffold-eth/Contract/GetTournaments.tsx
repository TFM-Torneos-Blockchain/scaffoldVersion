import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { useContractRead } from "wagmi";
import TournamentBox from "~~/components/tournamentEnroll-ui/TournamentBox";
import { notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  contract: Contract<"TournamentContract">;
};

export const GetTournaments = ({ contract }: TReadOnlyFunctionFormProps) => {
  const [tournaments, setTournaments] = useState<any>([]);

  const countTournamentsFunction = "getIDSArray";

  const { isFetching, refetch } = useContractRead({
    address: contract.address,
    functionName: countTournamentsFunction,
    abi: contract.abi as Abi,
    enabled: false,
    // onSuccess: (data: any) => {
    //   setTournaments(data);
    //   console.log("asaber get tournament",data); // TODO no està loggegan aixo
    // },
    // onError: (error: any) => {
    //   notification.error(error.message);
    // },
  });
  // refetch();  // TODO així looggeja massa (executa massa cops)

  useEffect(() => {
    const fetchData = async () => {
      const data = await refetch();
      setTournaments(data.data);
      console.log("asaber get tournament useEffect"); // TODO no està loggegan aixo
    };
    fetchData();
  }, []);

  return (
    <div className="py-8 w-screen">
      <div className="text-2xl font-bold mb-4">ETH Tournaments</div>
      <div className=" grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tournaments[0] /* ETH */ &&
          tournaments[0].map((tournament_id: any) => {
            return (
              <TournamentBox
                key={`getTourseth-${contract}-${tournament_id}-${true}`}
                tournament_id={tournament_id}
                contract={contract}
                is_ETH={true}
              />
            );
          })}
      </div>
      <div className="text-2xl font-bold">ERC20 Tournaments</div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {tournaments[1] /* ERC20 */ &&
          tournaments[1].map((tournament_id: any) => {
            return (
              <TournamentBox
                key={`getTourserc20-${contract}-${tournament_id}-${false}`}
                tournament_id={tournament_id}
                contract={contract}
                is_ETH={false}
              />
            );
          })}
      </div>
    </div>
  );
};
