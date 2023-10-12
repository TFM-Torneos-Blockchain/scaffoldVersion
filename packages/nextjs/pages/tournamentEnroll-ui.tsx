import { useReducer } from "react";
import { Spinner } from "~~/components/Spinner";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import {DisplayETHTournaments} from "../components/tournamentEnroll-ui/DisplayETHTournaments"
import {DisplayERC20Tournaments} from "../components/tournamentEnroll-ui/DisplayERC20Tournaments"
import { DisplayETH2Tournaments } from "~~/components/tournamentEnroll-ui/DisplayETH2Tournaments";

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

/**
 * UI component to interface with deployed contracts.
 **/
const ContractUI = () => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const configuredNetwork = getTargetNetwork();
  const contractName = "TournamentContract";

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const networkColor = useNetworkColor();

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

  return (
      <div className="flex bg-base-100 h-screen">
        <h1>Tournaments</h1>
          <DisplayETH2Tournaments deployedContractData={deployedContractData} />
      </div> 
  );
};

export default ContractUI