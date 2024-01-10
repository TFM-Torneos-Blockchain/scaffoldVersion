// import { expect } from "chai";
// import { ethers, network } from "hardhat";
// import { TournamentManager } from "../typechain-types";
// import type { Signer } from "ethers";
// import contracts from "../../nextjs/generated/deployedContracts";
// import {
//   Client,
//   DaoDetails,
//   AssetBalance,
//   CreateMajorityVotingProposalParams,
//   ProposalCreationSteps,
//   TokenVotingClient,
//   VoteValues,
//   VotingMode,
//   VotingSettings,
//   PermissionIds,
// } from "@aragon/sdk-client";
// import {
//   PrepareInstallationParams,
//   PrepareInstallationStep,
//   ApplyInstallationParams,
//   DaoAction,
//   PermissionOperationType,
//   MultiTargetPermission,
// } from "@aragon/sdk-client-common";
// import { minimalContext } from "../aragon.config";

// describe("DAO add executioner Admin", function () {
//   // We define a fixture to reuse the same setup in every test.

//   const enrollmentAmount = ethers.utils.parseEther("0.02");

//   let tournamentManager: TournamentManager;
//   let owner: Signer, participant1: Signer;

//   it("E2E", async () => {
//     // this.timeout(400000); // Initialize some signers
//     [owner, participant1] = await ethers.getSigners();
//     const provider = ethers.provider;
//     // console.log(await provider.getBalance(await owner.getAddress()));
//     const newAdminAddress = await owner.getAddress();

//     const client: Client = new Client(minimalContext);

//     const daoAddressOrEns: string = "0x51ba454dad4e44edc5c902e35e3e9aac17132b2d"; // test.dao.eth

//     // Get a DAO's details.
//     const dao: DaoDetails | null = await client.methods.getDao(daoAddressOrEns);
//     console.log({ dao });

//     const daoBalances: AssetBalance[] | null = await client.methods.getDaoBalances({
//       daoAddressOrEns,
//     });

//     console.log({ daoBalances });

//     const tokenVotingClient: TokenVotingClient = new TokenVotingClient(minimalContext);

//     const pluginAddress: string = "0x4cf95E7D4C50E3dd3350EC2389E73b7e34d22529";
//     const adminAddress: string = "0x6aD27533762C085c405B04bb1b58285D39E99f25";
//     const setupAdminAddress: string = "0x633845bB511DE83EA31b8717614d88fa7b569694";

//     const abiSetupAdmin = [
//       { inputs: [], stateMutability: "nonpayable", type: "constructor" },
//       {
//         inputs: [{ internalType: "address", name: "admin", type: "address" }],
//         name: "AdminAddressInvalid",
//         type: "error",
//       },
//       {
//         inputs: [],
//         name: "implementation",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         inputs: [
//           { internalType: "address", name: "_dao", type: "address" },
//           { internalType: "bytes", name: "_data", type: "bytes" },
//         ],
//         name: "prepareInstallation",
//         outputs: [
//           { internalType: "address", name: "plugin", type: "address" },
//           {
//             components: [
//               { internalType: "address[]", name: "helpers", type: "address[]" },
//               {
//                 components: [
//                   { internalType: "enum PermissionLib.Operation", name: "operation", type: "uint8" },
//                   { internalType: "address", name: "where", type: "address" },
//                   { internalType: "address", name: "who", type: "address" },
//                   { internalType: "address", name: "condition", type: "address" },
//                   { internalType: "bytes32", name: "permissionId", type: "bytes32" },
//                 ],
//                 internalType: "struct PermissionLib.MultiTargetPermission[]",
//                 name: "permissions",
//                 type: "tuple[]",
//               },
//             ],
//             internalType: "struct IPluginSetup.PreparedSetupData",
//             name: "preparedSetupData",
//             type: "tuple",
//           },
//         ],
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//       {
//         inputs: [
//           { internalType: "address", name: "_dao", type: "address" },
//           {
//             components: [
//               { internalType: "address", name: "plugin", type: "address" },
//               { internalType: "address[]", name: "currentHelpers", type: "address[]" },
//               { internalType: "bytes", name: "data", type: "bytes" },
//             ],
//             internalType: "struct IPluginSetup.SetupPayload",
//             name: "_payload",
//             type: "tuple",
//           },
//         ],
//         name: "prepareUninstallation",
//         outputs: [
//           {
//             components: [
//               { internalType: "enum PermissionLib.Operation", name: "operation", type: "uint8" },
//               { internalType: "address", name: "where", type: "address" },
//               { internalType: "address", name: "who", type: "address" },
//               { internalType: "address", name: "condition", type: "address" },
//               { internalType: "bytes32", name: "permissionId", type: "bytes32" },
//             ],
//             internalType: "struct PermissionLib.MultiTargetPermission[]",
//             name: "permissions",
//             type: "tuple[]",
//           },
//         ],
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         inputs: [
//           { internalType: "address", name: "_dao", type: "address" },
//           { internalType: "uint16", name: "_currentBuild", type: "uint16" },
//           {
//             components: [
//               { internalType: "address", name: "plugin", type: "address" },
//               { internalType: "address[]", name: "currentHelpers", type: "address[]" },
//               { internalType: "bytes", name: "data", type: "bytes" },
//             ],
//             internalType: "struct IPluginSetup.SetupPayload",
//             name: "_payload",
//             type: "tuple",
//           },
//         ],
//         name: "prepareUpdate",
//         outputs: [
//           { internalType: "bytes", name: "initData", type: "bytes" },
//           {
//             components: [
//               { internalType: "address[]", name: "helpers", type: "address[]" },
//               {
//                 components: [
//                   { internalType: "enum PermissionLib.Operation", name: "operation", type: "uint8" },
//                   { internalType: "address", name: "where", type: "address" },
//                   { internalType: "address", name: "who", type: "address" },
//                   { internalType: "address", name: "condition", type: "address" },
//                   { internalType: "bytes32", name: "permissionId", type: "bytes32" },
//                 ],
//                 internalType: "struct PermissionLib.MultiTargetPermission[]",
//                 name: "permissions",
//                 type: "tuple[]",
//               },
//             ],
//             internalType: "struct IPluginSetup.PreparedSetupData",
//             name: "preparedSetupData",
//             type: "tuple",
//           },
//         ],
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//       {
//         inputs: [{ internalType: "bytes4", name: "_interfaceId", type: "bytes4" }],
//         name: "supportsInterface",
//         outputs: [{ internalType: "bool", name: "", type: "bool" }],
//         stateMutability: "view",
//         type: "function",
//       },
//     ];

//     const abiAdmin = [
//       {
//         inputs: [
//           { internalType: "address", name: "dao", type: "address" },
//           { internalType: "address", name: "where", type: "address" },
//           { internalType: "address", name: "who", type: "address" },
//           { internalType: "bytes32", name: "permissionId", type: "bytes32" },
//         ],
//         name: "DaoUnauthorized",
//         type: "error",
//       },
//       {
//         anonymous: false,
//         inputs: [{ indexed: false, internalType: "uint8", name: "version", type: "uint8" }],
//         name: "Initialized",
//         type: "event",
//       },
//       {
//         anonymous: false,
//         inputs: [{ indexed: false, internalType: "address[]", name: "members", type: "address[]" }],
//         name: "MembersAdded",
//         type: "event",
//       },
//       {
//         anonymous: false,
//         inputs: [{ indexed: false, internalType: "address[]", name: "members", type: "address[]" }],
//         name: "MembersRemoved",
//         type: "event",
//       },
//       {
//         anonymous: false,
//         inputs: [{ indexed: true, internalType: "address", name: "definingContract", type: "address" }],
//         name: "MembershipContractAnnounced",
//         type: "event",
//       },
//       {
//         anonymous: false,
//         inputs: [
//           { indexed: true, internalType: "uint256", name: "proposalId", type: "uint256" },
//           { indexed: true, internalType: "address", name: "creator", type: "address" },
//           { indexed: false, internalType: "uint64", name: "startDate", type: "uint64" },
//           { indexed: false, internalType: "uint64", name: "endDate", type: "uint64" },
//           { indexed: false, internalType: "bytes", name: "metadata", type: "bytes" },
//           {
//             components: [
//               { internalType: "address", name: "to", type: "address" },
//               { internalType: "uint256", name: "value", type: "uint256" },
//               { internalType: "bytes", name: "data", type: "bytes" },
//             ],
//             indexed: false,
//             internalType: "struct IDAO.Action[]",
//             name: "actions",
//             type: "tuple[]",
//           },
//           { indexed: false, internalType: "uint256", name: "allowFailureMap", type: "uint256" },
//         ],
//         name: "ProposalCreated",
//         type: "event",
//       },
//       {
//         anonymous: false,
//         inputs: [{ indexed: true, internalType: "uint256", name: "proposalId", type: "uint256" }],
//         name: "ProposalExecuted",
//         type: "event",
//       },
//       {
//         inputs: [],
//         name: "EXECUTE_PROPOSAL_PERMISSION_ID",
//         outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         inputs: [],
//         name: "dao",
//         outputs: [{ internalType: "contract IDAO", name: "", type: "address" }],
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         inputs: [
//           { internalType: "bytes", name: "_metadata", type: "bytes" },
//           {
//             components: [
//               { internalType: "address", name: "to", type: "address" },
//               { internalType: "uint256", name: "value", type: "uint256" },
//               { internalType: "bytes", name: "data", type: "bytes" },
//             ],
//             internalType: "struct IDAO.Action[]",
//             name: "_actions",
//             type: "tuple[]",
//           },
//           { internalType: "uint256", name: "_allowFailureMap", type: "uint256" },
//         ],
//         name: "executeProposal",
//         outputs: [],
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//       {
//         inputs: [{ internalType: "contract IDAO", name: "_dao", type: "address" }],
//         name: "initialize",
//         outputs: [],
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//       {
//         inputs: [{ internalType: "address", name: "_account", type: "address" }],
//         name: "isMember",
//         outputs: [{ internalType: "bool", name: "", type: "bool" }],
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         inputs: [],
//         name: "pluginType",
//         outputs: [{ internalType: "enum IPlugin.PluginType", name: "", type: "uint8" }],
//         stateMutability: "pure",
//         type: "function",
//       },
//       {
//         inputs: [],
//         name: "proposalCount",
//         outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//         stateMutability: "view",
//         type: "function",
//       },
//       {
//         inputs: [{ internalType: "bytes4", name: "_interfaceId", type: "bytes4" }],
//         name: "supportsInterface",
//         outputs: [{ internalType: "bool", name: "", type: "bool" }],
//         stateMutability: "view",
//         type: "function",
//       },
//     ];

//     // We connect to the Contract using a Provider, so we will only
//     // have read-only access to the Contract
//     const contractAdmin = new ethers.Contract(adminAddress, abiAdmin, provider);
//     const contractAdminSetup = new ethers.Contract(setupAdminAddress, abiSetupAdmin, provider);

//     console.log("before prepInst");
//     const adminAddEncoded = ethers.utils.defaultAbiCoder.encode(["address"], [newAdminAddress]);
//     const prepInst = await contractAdminSetup.connect(owner).prepareInstallation(daoAddressOrEns, adminAddEncoded);
//     console.log("after prepInst");
//     // console.log(
//     //   PermissionIds.EXECUTE_PROPOSAL_PERMISSION_ID,
//     //   typeof PermissionIds.EXECUTE_PROPOSAL_PERMISSION_ID,
//     //   ethers.utils.keccak256(ethers.utils.solidityPack(["string"], ["EXECUTE_PROPOSAL_PERMISSION"])),
//     // );
//     //! why EXECUTE_PROPOSAL_PERMISSION_ID Undefined?!?!!?

//     const executeProposalPermission = ethers.utils.keccak256(ethers.utils.solidityPack(["string"], ["EXECUTE_PROPOSAL_PERMISSION"]))

//     // const actionInst: DaoAction = await client.encoding.applyInstallationAction()
//     const permissions: MultiTargetPermission[] = [
//       {
//         operation: PermissionOperationType.GRANT,
//         where: adminAddress,
//         who: newAdminAddress,
//         condition: ethers.constants.AddressZero,
//         permissionId: executeProposalPermission, // hash("EXECUTE_PERMISSION_ID")
//       },
//       {
//         operation: PermissionOperationType.GRANT,
//         where: daoAddressOrEns,
//         who: adminAddress,
//         condition: ethers.constants.AddressZero,
//         permissionId: PermissionIds.EXECUTE_PERMISSION_ID, // hash("EXECUTE_PERMISSION_ID")
//       },
//     ];
//     // console.log(
//     //   permissions[0].permissionId,
//     //   permissions[1].where,
//     //   permissions[0].condition,
//     //   permissions[1].permissionId,
//     // );
//     // This variable contains the values received on the prepareInstallation() method
//     const applyInstallationParams: ApplyInstallationParams = {
//       helpers: [adminAddress, "0xF66348E9865bb0f29B889E7c0FE1BCf4acAb5f54"],
//       permissions: permissions,
//       versionTag: {
//         build: 1,
//         release: 1,
//       },
//       pluginRepo: "0xF66348E9865bb0f29B889E7c0FE1BCf4acAb5f54",
//       pluginAddress: adminAddress,
//     };
//     console.log("before actions");
//     const actions: DaoAction[] = client.encoding.applyInstallationAction(daoAddressOrEns, applyInstallationParams);
//     console.log("after actions");

//     // const metadataUri: string = await tokenVotingClient.methods.pinMetadata({
//     //   title: "Install Admin Plugin",
//     //   summary: "This is a proposal to install the admin plugin to the DAO.",
//     //   description: "We are seting an Admin which will be the only one capable to use the execute function.",
//     //   resources: [],
//     //   media: {},
//     // });

//     let currentDate = new Date();

//     console.log("before proposal params");

//     const proposalParams: CreateMajorityVotingProposalParams = {
//       pluginAddress: pluginAddress, // the address of the TokenVoting plugin contract containing all plugin logic.
//       metadataUri:"ipfs://QmQyqYvtWiKq5C2WJ76R7EkBxsy2LNVdH2W7dGVsbyiNJ7",
//       actions: actions,
//       startDate: new Date(),
//       endDate: new Date(), // currentDate.getTime() + 24 * 60 * 60 * 1000
//       executeOnPass: true,
//       creatorVote: VoteValues.YES, // default NO, other options: ABSTAIN, YES
//     };
//     console.log("after proposal params");

//     // Creates a proposal using the token voting governance mechanism, which executes with the parameters set in the configAction object.
//     const steps = tokenVotingClient.methods.createProposal(proposalParams);

//     for await (const step of steps) {
//       try {
//         switch (step.key) {
//           case ProposalCreationSteps.CREATING:
//             console.log(step.txHash);
//             break;
//           case ProposalCreationSteps.DONE:
//             console.log(step.proposalId);
//             break;
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   });
// });
