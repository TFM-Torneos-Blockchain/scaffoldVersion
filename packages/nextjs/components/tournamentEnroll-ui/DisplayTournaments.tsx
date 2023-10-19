// import { Abi, AbiFunction } from "abitype";
// import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
// import { GetTournaments } from "../scaffold-eth/Contract/GetTournaments";

// export const DisplayTournaments = ({ deployedContractData }: { deployedContractData: Contract<ContractName> }) => {
//   if (!deployedContractData) {
//     return null;
//   }

//   const functionsToDisplay = (
//     ((deployedContractData.abi || []) as Abi).filter(part => part.type === "function") as AbiFunction[]
//   ).filter(fn => {
//     const isQueryableWithParams =
//       (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0 && fn.name === "getIDSArray";
//     return isQueryableWithParams;
//   });

//   if (!functionsToDisplay.length) {
//     console.log(functionsToDisplay)
//     return <>No read methods</>;
//   }

//   return (
//     <>
      
//         <GetTournaments key={`display-${deployedContractData}`} contract={deployedContractData} />
    
//     </>
//   );
// };
