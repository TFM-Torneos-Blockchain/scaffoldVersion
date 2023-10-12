import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { NewTournament } from "~~/components/CreateTournament-ui/ContractInteraction";

const CreateTournaments: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="Create Tournament | Scaffold-ETH 2"
        description="This page will enable Administrators to create new tournaments."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-1 flex-grow" data-theme="CreateTournaments">
        <NewTournament /> 
      </div>
    </>
  );
};

export default CreateTournaments;