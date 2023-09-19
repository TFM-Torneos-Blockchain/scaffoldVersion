import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { ContractData } from "~~/components/tournamentEnroll-ui/ContractData";
import { ContractInteraction } from "~~/components/tournamentEnroll-ui/ContractInteraction";

// Here the contractData and contractInteraction are imported to create the web interface.

// https://docs.scaffoldeth.io/hooks/
// useScaffoldContract: obtain a contract instance for the smart contracts. The returned object contains the contract 
// instance that can be used to call any of the smart contract methods.
// useScaffoldContractRead: retrieves the data returned by the contract functions (return values).
// useScaffoldEventHistory: retrieves the historical event logs
// useScaffoldEventSubscriber: subscribes to the events emitted by the smart contracts.

// useScaffoldContractWrite: Use this hook to send a transaction to your smart contract to write data or perform an action.

const TournamentEnrollUI: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="Tournaments | Scaffold-ETH 2"
        description="This page will display all disponible."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="tournamentEnrollUi">
        <ContractInteraction />
        <ContractData />
      </div>
    </>
  );
};

export default TournamentEnrollUI;
