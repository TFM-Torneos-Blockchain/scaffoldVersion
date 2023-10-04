import React, { useEffect, useState } from 'react'
import { Abi, AbiFunction, Address } from "abitype";
import { useContractRead } from 'wagmi';
import { notification } from '~~/utils/scaffold-eth';
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth';
import { Contract, ContractName } from '~~/utils/scaffold-eth/contract';
import EnrollButton from './EnrollButton';

type TReadOnlyFunctionFormProps = {
    contract: Contract<ContractName>;
    id: number;
  };

export default function TournamentBox({id, contract } : TReadOnlyFunctionFormProps) {
    const [result, setResult] = useState<any>([]);
  
    const tournamentsFunction = "tournaments"
    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("TournamentContract");

    console.log(id)
  
    const { isFetching, refetch } = useContractRead({
      address: contract.address,
      functionName: tournamentsFunction,
      abi: contract.abi as Abi,
      enabled: false,
      args: [id],
      onSuccess: (data: any) => {
        console.log(data)
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
        }
        console.log(tournament)
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
  }, [])

  
  return (
    <div className='bg-black'>{result && Object.values(result).map((text: string) => {
        return (
            <h1>{text}</h1>
        )
    })}
    <div className='d-flex justify-between w-5/6'>
        <EnrollButton contract={contract} id={id} txAmount={result.enrollment_amount}>Enroll</EnrollButton>
    </div>
    </div>
  )
}
