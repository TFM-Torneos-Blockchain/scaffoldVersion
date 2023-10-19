// import { useReducer } from "react";
import { GetTournaments } from "../components/scaffold-eth/Contract/GetTournaments";
// import { DisplayTournaments } from "~~/components/tournamentEnroll-ui/DisplayTournaments";
import { Abi, AbiFunction } from "abitype";
import { Spinner } from "~~/components/Spinner";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

// type ContractUIProps = {
//   contractName: ContractName;
//   className?: string;
// };

/**
 * UI component to interface with deployed contracts.
 **/
const ContractUI = () => {
  // const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const configuredNetwork = getTargetNetwork();
  const contractName = "TournamentContract";

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);

  if (deployedContractLoading) {
    return (
      <div className="mt-14">
        <Spinner width="50px" height="50px" />
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="text-3xl mt-14">
        {`No contract found by the name of "${contractName}" on chain "${configuredNetwork.name}"!`}
      </p>
    );
  }

  const functionsToDisplay = (
    ((deployedContractData.abi || []) as Abi).filter(part => part.type === "function") as AbiFunction[]
  ).filter(fn => {
    const isQueryableWithParams =
      (fn.stateMutability === "view" || fn.stateMutability === "pure") &&
      fn.inputs.length === 0 &&
      fn.name === "getIDSArray";
    return isQueryableWithParams;
  });

  if (!functionsToDisplay.length) {
    console.log(functionsToDisplay);
    return <>No read methods</>;
  }

  return (
    <div className="bg-base-100 h-screen flex flex-col items-center">
      <h1 className="text-2xl font-bold">Enroll to your favorite Tournament!!!</h1>
      <GetTournaments key={`display-${deployedContractData}`} contract={deployedContractData} />
    </div>
  );
};

export default ContractUI;
