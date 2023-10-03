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

type TReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
};

export const GetTournaments = ({ contractAddress, abiFunction }: TReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [result, setResult] = useState<any>([]);

  const countTournamentsFunction = "getIDSArray"
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("TournamentContract");

  const { isFetching, refetch } = useContractRead({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: [abiFunction] as Abi,
    enabled: false,
    onSuccess: (data: any) => {
        setResult(data);
    },
    onError: (error: any) => {
      notification.error(error.message);
    },
  });

useEffect(() => {
    const fetchData = async () => {
        const data = await refetch();
        setResult(data);
    };
    fetchData();
}, [])



  const inputElements = abiFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    console.log(abiFunction)
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
    console.log(result)
  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="font-medium my-0 break-words">{abiFunction.name}</p>
      {inputElements}
      <div className="flex justify-between gap-2 flex-wrap">
        <div className="flex-grow w-4/5">
          {result !== null && result !== undefined && (
            <div className="bg-secondary rounded-3xl text-sm px-4 py-1.5 break-words">
              <p className="font-bold m-0 mb-1">Result:</p>
              <pre className="whitespace-pre-wrap break-words">{displayTxResult(result)}</pre>
            </div>
          )}
        </div>

        {result[0] && result[0].map((tournament: any) => {
            return (
                <div className="bg-black" id={tournament} onClick={() => getContractInfo(tournament)}>
                    <p>tournament</p>
                </div>
            )})}
      </div>
    </div>
  );
};
