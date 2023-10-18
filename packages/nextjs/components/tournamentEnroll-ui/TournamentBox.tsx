import React, { useEffect, useState } from "react";
import EnrollButtonERC20 from "./EnrollButtonERC20";
import EnrollButtonETH from "./EnrollButtonETH";
import { Abi } from "abitype";
import { useContractRead } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

type TReadOnlyFunctionFormProps = {
  tournament_id: number;
  contract: Contract<ContractName>;
  is_ETH: boolean;
};

export default function TournamentBox({ tournament_id, contract, is_ETH }: TReadOnlyFunctionFormProps) {
  const [result, setResult] = useState<any>([]);

  const tournamentsFunction = "tournaments";

  console.log(tournament_id);

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
        reward_amount: data[5].toString(),
        init_date: data[6].toString(),
        end_date: data[7].toString(),
        DeFiBridge_address: data[8],
        DeFiProtocol_address: data[9],
        aborted: data[10].toString(),
      };
      console.log(tournament);
      setResult(tournament);
    },
    onError: (error: any) => {
      notification.error(error.message);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await refetch();
    };
    fetchData();
  }, []);

  return (
    <div className="bg-black">
      {result &&
        Object.values(result).map((text: string) => {
          return <h1 key={text}>{text}</h1>;
        })}

      <div className="d-flex justify-between w-5/6">
        {/* Call Enroll ETH or ERC20 depending on is_ETH variable */}
        {is_ETH ? (
          <EnrollButtonETH contract={contract} tournament_id={tournament_id} txAmount={result.enrollment_amount}>
            Enroll
          </EnrollButtonETH>
        ) : (
          <EnrollButtonERC20 contract={contract} tournament_id={tournament_id} txAmount={result.enrollment_amount} spender={result.DeFiBridge_address}>
            Enroll
          </EnrollButtonERC20>
        )}
      </div>
    </div>
  );
}
