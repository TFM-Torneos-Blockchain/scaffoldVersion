import { Abi, AbiFunction } from "abitype";
import { DisplayTournamentsForm } from "./DisplayTournamentsForm";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useContractRead } from "wagmi";
import { useEffect, useState } from 'react';
import { parseEther } from "viem";

export const DisplayETHTournaments = ({ deployedContractData }: { deployedContractData: Contract<ContractName> }) => {


  // State to store the fetched data
  const [tournamentData, setTournamentData] = useState<any>({
    ID: 0,
    min_participants: 0,
    max_participants: 0,
    num_participants: 0,
    enrollment_amount: 0,
    init_date: 0,
    end_date: 0,
    DeFiBridge_address: '',
    DeFiProtocol_address: '',
    aborted: false,
  }); // Initialize with default values

  // Function to fetch data
  const fetchData = async () => {
    const { refetch } = useContractRead({
      address: deployedContractData?.address,
      functionName: "tournaments",
      abi: deployedContractData?.abi,
      enabled: false,
      onSuccess: (data) => {
        // Update the tournamentData object with the fetched values
        setTournamentData({
          ID: data[0],
          min_participants: data[1],
          max_participants: data[2],
          num_participants: data[3],
          enrollment_amount: data[4],
          init_date: data[5],
          end_date: data[6],
          DeFiBridge_address: data[7],
          DeFiProtocol_address: data[8],
          aborted: data[9],
        });
      },
    });

    await refetch();
  };
  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);
  const { ID, min_participants, max_participants, num_participants, enrollment_amount, init_date, end_date, DeFiBridge_address, DeFiProtocol_address, aborted } = tournamentData;



  if (!deployedContractData || !tournamentData) {
    return null;
  }

  
  const enrollFunction = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  ).find(fn => fn.name === "enrollWithETH" && fn.stateMutability !== "view" && fn.stateMutability !== "pure") as
    | AbiFunction
    | undefined;

  if (!enrollFunction) {
    return <>No enroll function found</>;
  }
  const arrayy = [0,1,2,3,4,5,6]
  return (
    <>
      {arrayy.map((fn, index) => (
        <DisplayTournamentsForm
          key={`enroll-${index}`}
          abiFunction={enrollFunction}
          onChange={onChange}
          contractAddress={deployedContractData.address}
          tournamentID = {BigInt(index)}
          value = {parseEther(enrollment_amount).toString()}
        />
      ))}
    </>
  );
};
