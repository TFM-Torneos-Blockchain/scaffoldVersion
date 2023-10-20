import React, { useEffect, useState } from "react";
import EnrollButtonERC20 from "./EnrollButtonERC20";
import EnrollButtonETH from "./EnrollButtonETH";
import { Abi } from "abitype";
import { useContractRead } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  tournament_id: number;
  contract: Contract<"TournamentContract">;
  is_ETH: boolean;
};

export default function TournamentBox({ tournament_id, contract, is_ETH }: TReadOnlyFunctionFormProps) {
  const [tournamentInfo, setTournamentInfo] = useState<any>([]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const tournamentsFunction = "tournaments";

  // console.log(tournament_id);

  const { isFetching, refetch } = useContractRead({
    address: contract.address,
    functionName: tournamentsFunction,
    abi: contract.abi as Abi,
    enabled: false,
    args: [tournament_id],
    onSuccess: (data: any) => {
      // console.log(data);
      const tournament = {
        id: data[0],
        min_participants: data[1],
        max_participants: data[2],
        num_participants: data[3],
        enrollment_amount: data[4].toString(),
        reward_amount: data[5].toString(),
        init_date: new Date(Number(data[6])).toLocaleString(),
        end_date: new Date(Number(data[7])).toLocaleString(),
        DeFiBridge_address: data[8],
        DeFiProtocol_address: data[9],
        aborted: data[10].toString(),
      };
      // console.log(tournament);
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
    // <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0`}>
    //   <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
    //     <div className="col-span-1 flex flex-col">
    //       <div className="bg-blue-800 p-4 rounded-md">
    //         <div className="mb-4">
    //           {showMoreInfo ? (
    //             <div className="text-white overflow-y-auto max-h-40">
    //               {" "}
    //               {/* Adjust max height as needed */}
    //               {Object.entries(tournamentInfo).map(([key, value]: [any, any]) => (
    //                 <p key={key} className="text-base">
    //                   {key}: {value}
    //                 </p>
    //               ))}
    //             </div>
    //           ) : (
    //             <h1 className="text-white text-2xl font-bold">Tournament: {tournamentInfo.id}</h1>
    //           )}
    //         </div>
    //         <div className="flex justify-center">
    //           <button onClick={() => setShowMoreInfo(!showMoreInfo)} className="text-black hover:bg-yellow-400">
    //             {showMoreInfo ? "Hide More Information" : "Show More Information"}
    //           </button>
    //         </div>
    //         <div className="mt-4">
    //           {/* Call Enroll ETH or ERC20 depending on is_ETH variable */}
    //           {is_ETH ? (
    //             <EnrollButtonETH
    //               key={`boxETH-${contract}-${tournament_id}}`}
    //               contract={contract}
    //               tournament_id={tournament_id}
    //               txAmount={tournamentInfo.enrollment_amount}
    //             ></EnrollButtonETH>
    //           ) : (
    //             <EnrollButtonERC20
    //               key={`boxERC20-${contract}-${tournament_id}}`}
    //               contract={contract}
    //               tournament_id={tournament_id}
    //               txAmount={tournamentInfo.enrollment_amount}
    //             ></EnrollButtonERC20>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="bg-blue-800 p-4 rounded-md">
    {showMoreInfo ? (
      <div className="text-white overflow-y-auto max-h-40">
        {Object.entries(tournamentInfo).map(([key, value]:[any,any]) => (
          <p key={key} className="text-base">
            {key}: {value}
          </p>
        ))}
      </div>
    ) : (
      <h1 className="text-white text-2xl font-bold">
        Tournament: {tournamentInfo.id}
      </h1>
    )}
    <div className="flex justify-center">
      <button
        onClick={() => setShowMoreInfo(!showMoreInfo)}
        className="text-black hover:bg-yellow-400"
      >
        {showMoreInfo ? 'Hide More Information' : 'Show More Information'}
      </button>
    </div>
    <div className="mt-4">
      {(
        <div className="mb-4">
          {is_ETH ? (
            <EnrollButtonETH
              key={`boxETH-${contract}-${tournament_id}}`}
              contract={contract}
              tournament_id={tournament_id}
              txAmount={tournamentInfo.enrollment_amount}
            />
          ) : (
            <EnrollButtonERC20
              key={`boxERC20-${contract}-${tournament_id}}`}
              contract={contract}
              tournament_id={tournament_id}
              txAmount={tournamentInfo.enrollment_amount}
            />
          )}
        </div>
      )}
    </div>
  </div>
  );
}
