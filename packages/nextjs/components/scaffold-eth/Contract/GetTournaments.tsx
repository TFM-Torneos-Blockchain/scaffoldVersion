import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { useContractRead } from "wagmi";
import TournamentBox from "~~/components/tournamentEnroll-ui/TournamentBox";
import { notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  contract: Contract<"TournamentManager">;
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

  if(!tournaments) return (
    <div className="mt-8">
    <div className=" bg-slate-700 py-3 px-6 rounded mb-8 min-h-[300px]">
    <div className="text-2xl font-bold mb-4">ETH Tournaments</div>
    <div className=" grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      
    </div>
    </div>
    <div className=" bg-slate-700 py-3 px-6 rounded mb-8 min-h-[300px]">
    <div className="text-2xl font-bold">ERC20 Tournaments</div>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
      
    </div>
    </div>
  </div>
  );

  return (
    <div className="mt-8 w-full mr-8">
      <div className="mx-10 bg-slate-700 py-3 px-6 rounded mb-8 min-h-[300px]">
      <div className="text-2xl font-bold"><h1>ETH Tournaments</h1></div>
        {tournaments[0] && tournaments[0].length > 0  /* ETH */ ?
        (<div className="flex-wrap flex ">
        {
        tournaments[0].map((tournament_id: any) => {
          return (
            <div className="lg:basis-1/3 xl:basis-1/4 md:basis-1/2 basis-full flex justify-center mt-4">
            <TournamentBox
              key={`getTourseth-${contract}-${tournament_id}-${true}`}
              tournament_id={tournament_id}
              contract={contract}
              is_ETH={true}
            />
            </div>
          );
        }) }
        </div> ):
        <div className="w-full h-40 flex justify-center items-center">
          <label>No tournaments available</label>
        </div>
        } 
      </div>
      <div className="mx-10 bg-slate-700 py-3 px-6 rounded mb-8 min-h-[300px]">
      <div className="text-2xl font-bold"><h1>ERC20 Tournaments</h1></div>
      
        {tournaments[1] && tournaments[1].length > 0 ? /* ERC20 */
        (<div className="flex-wrap flex ">
        {
          tournaments[1].map((tournament_id: any) => {
            return (
              <div className="lg:basis-1/3 xl:basis-1/4 md:basis-1/2 basis-full flex justify-center mt-4">
              <TournamentBox
                key={`getTourserc20-${contract}-${tournament_id}-${false}`}
                tournament_id={tournament_id}
                contract={contract}
                is_ETH={false}
              />
              </div>
            );
          }) }
          </div> ):
          <div className="w-full h-40 flex justify-center items-center">
            <label>No tournaments available</label>
          </div>
          }
      </div>
      </div>
  );
};
