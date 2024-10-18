import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentManager, TournamentManagerOpt, FunToken, CompoundProtocol } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("TournamentManager - createTournament", function () {
  let tournamentManager: TournamentManager | TournamentManagerOpt;
  let funToken: FunToken;
  let compoundProtocol: CompoundProtocol;
  let owner: SignerWithAddress,
    nonOwner: SignerWithAddress,
    participant1: SignerWithAddress,
    participant2: SignerWithAddress;
  let initDate: number, endDate: number;
  const enrollmentAmount = ethers.utils.parseEther("1");

  // Names of the contract versions to deploy
  const contractsToTest = [
    { name: "TournamentManager", contractFactory: "TournamentManager" },
    { name: "TournamentManagerOpt", contractFactory: "TournamentManagerOpt" },
  ];

  contractsToTest.forEach(({ name, contractFactory }) => {
    describe(`Testing with ${name}`, function () {
      beforeEach(async function () {
        [owner, nonOwner, participant1, participant2] = await ethers.getSigners();

        // Deploy the current contract version (original or optimized)
        const TournamentManagerFactory = await ethers.getContractFactory(contractFactory);
        tournamentManager = (await TournamentManagerFactory.deploy()) as TournamentManager;
        await tournamentManager.deployed();

        // Deploy a mock token for testing
        const FunTokenFactory = await ethers.getContractFactory("FunToken");
        funToken = (await FunTokenFactory.deploy()) as FunToken;
        await funToken.deployed();

        // Deploy a mock DeFi protocol (CompoundProtocol)
        const CompoundProtocolFactory = await ethers.getContractFactory("CompoundProtocol");
        compoundProtocol = (await CompoundProtocolFactory.deploy()) as CompoundProtocol;
        await compoundProtocol.deployed();

        // Set initial dates
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        initDate = currentTime + 3600; // 1 hour from now
        endDate = currentTime + 7200; // 2 hours from now
      });

      // Test: Valid tournament creation
      it("Should allow the owner to create a tournament with valid inputs", async function () {
        await tournamentManager.createTournament(
          100, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [funToken.address], // acceptedTokens
          initDate,
          endDate,
          compoundProtocol.address, // DeFi bridge to clone
          [compoundProtocol.address], // DeFi protocols
        );

        const tournament = await tournamentManager.tournaments(0);
        expect(tournament.ID).to.equal(0);
        expect(tournament.maxParticipants).to.equal(100);
        expect(tournament.minParticipants).to.equal(1);
        expect(tournament.enrollmentAmount).to.equal(enrollmentAmount);
        expect(tournament.initDate).to.equal(initDate);
        expect(tournament.endDate).to.equal(endDate);
        expect(tournament.deFiBridgeAddress).to.exist;
        expect(await tournamentManager.getAcceptedTokens(0)).to.deep.equal([funToken.address]);
        expect(await tournamentManager.getDeFiProtocolAddresses(0)).to.deep.equal([compoundProtocol.address]);
      });

      // Test: Should revert if called by a non-owner
      it("Should revert if called by non-owner", async function () {
        await expect(
          tournamentManager.connect(nonOwner).createTournament(
            100, // maxParticipants
            1, // minParticipants
            enrollmentAmount,
            [funToken.address],
            initDate,
            endDate,
            compoundProtocol.address,
            [compoundProtocol.address],
          ),
        )
          .revertedWithCustomError(tournamentManager, "OwnableUnauthorizedAccount")
          .withArgs(nonOwner.address);
      });

      // Test: Should allow creating a tournament with an empty acceptedTokens arrayTournamentData
      it("Should allow creating a tournament with an empty acceptedTokens array", async function () {
        await tournamentManager.createTournament(
          100, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [], // Empty acceptedTokens array
          initDate,
          endDate,
          compoundProtocol.address,
          [compoundProtocol.address], // DeFi protocols
        );

        const tournament = await tournamentManager.tournaments(0);
        expect(tournament.ID).to.equal(0);
        expect(await tournamentManager.getAcceptedTokens(0)).to.deep.equal([]);
      });

      // Test: Should allow creating a tournament with multiple DeFi protocol addresses
      it("Should allow creating a tournament with multiple DeFi protocol addresses", async function () {
        const deFiProtocolAddresses = [
          compoundProtocol.address,
          participant1.address, // Using participant addresses for testing
          participant2.address,
        ];

        await tournamentManager.createTournament(
          100, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [funToken.address], // acceptedTokens array
          initDate,
          endDate,
          compoundProtocol.address, // DeFi bridge to clone
          deFiProtocolAddresses, // Multiple DeFi protocol addresses
        );

        // Fetch the DeFi protocol addresses using the getter function
        const storedDeFiProtocolAddresses = await tournamentManager.getDeFiProtocolAddresses(0);

        expect(storedDeFiProtocolAddresses.length).to.equal(3);
        expect(storedDeFiProtocolAddresses).to.deep.equal(deFiProtocolAddresses);
      });

      // Test: Should allow creating a tournament with an empty deFiProtocolAddresses array
      it("Should allow creating a tournament with an empty deFiProtocolAddresses array", async function () {
        await tournamentManager.createTournament(
          100, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [funToken.address], // acceptedTokens
          initDate,
          endDate,
          compoundProtocol.address, // DeFi bridge to clone
          [], // Empty deFiProtocolAddresses array
        );

        // Use the getter function to access the deFiProtocolAddresses array
        const deFiProtocols = await tournamentManager.getDeFiProtocolAddresses(0);
        expect(deFiProtocols.length).to.equal(0);
      });

      // Test: Ensure each tournament gets a new clone
      it("Should create a new clone for each tournament", async function () {
        // Create the first tournament
        await tournamentManager.createTournament(
          100, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [], // Empty acceptedTokens array
          initDate,
          endDate,
          compoundProtocol.address, // DeFi bridge to clone
          [], // Empty deFiProtocolAddresses array
        );

        const firstTournament = await tournamentManager.tournaments(0);
        const firstCloneAddress = firstTournament.deFiBridgeAddress;

        // Create the second tournament
        await tournamentManager.createTournament(
          200, // maxParticipants
          2, // minParticipants
          enrollmentAmount,
          [], // Empty acceptedTokens array
          initDate + 3600, // 1 hour later
          endDate + 3600,
          compoundProtocol.address, // DeFi bridge to clone
          [], // Empty deFiProtocolAddresses array
        );

        const secondTournament = await tournamentManager.tournaments(1);
        const secondCloneAddress = secondTournament.deFiBridgeAddress;

        // Ensure that the clones are different contracts
        expect(firstCloneAddress).to.not.equal(secondCloneAddress);
      });

      it("Should clone and initialize DeFiBridge properly (owner is TournamentManager)", async function () {
        const DeFiBridgeFactory = await ethers.getContractFactory("CompoundProtocol"); // Example DeFi bridge contract
        const deFiBridge = await DeFiBridgeFactory.deploy();
        await deFiBridge.deployed();

        // Create a tournament and clone the DeFiBridge
        await tournamentManager.createTournament(
          100, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [funToken.address], // acceptedTokens array
          initDate,
          endDate,
          deFiBridge.address, // DeFi bridge to clone
          [], // deFiProtocolAddresses array
        );

        // Get the cloned DeFiBridge address from the tournament
        const tournament = await tournamentManager.tournaments(0);
        const clonedDeFiBridgeAddress = tournament.deFiBridgeAddress;

        // Connect to the cloned contract using the IDeFiBridge interface
        const clonedDeFiBridge = (await ethers.getContractAt(
          "CompoundProtocol",
          clonedDeFiBridgeAddress,
        )) as CompoundProtocol;

        // Verify that the owner of the cloned contract is the tournamentManager (indicating proper initialization)
        const clonedDeFiBridgeOwner = await clonedDeFiBridge.owner();
        expect(clonedDeFiBridgeOwner).to.equal(tournamentManager.address); // The TournamentManager should be the owner
      });

      // Test: the "TournamentCreated" event is emitted correctly
      it("Should emit TournamentCreated event with correct data", async function () {
        await expect(
          tournamentManager.createTournament(
            100, // maxParticipants
            1, // minParticipants
            enrollmentAmount,
            [], // Empty acceptedTokens array
            initDate,
            endDate,
            compoundProtocol.address, // DeFi bridge to clone
            [], // Empty deFiProtocolAddresses array
          ),
        )
          .to.emit(tournamentManager, "TournamentCreated")
          .withArgs(
            0, // Tournament ID
            initDate,
            endDate,
            await tournamentManager.tournaments(0).then((t: any) => t.deFiBridgeAddress), // Ensure correct clone address is passed
          );
      });
    });
  });
});

// MISSING CHECKS !!!
// Test: Should revert if _maxParticipants is 0
//   it("Should revert if _maxParticipants is 0", async function () {
//     await expect(
//       tournamentManager.createTournament(
//         0, // Invalid maxParticipants
//         1,
//         enrollmentAmount,
//         [funToken.address],
//         initDate,
//         endDate,
//         compoundProtocol.address,
//         [compoundProtocol.address],
//       ),
//     ).to.be.revertedWith("Invalid maxParticipants");
//   });

//   // Test: Should revert if _minParticipants is greater than _maxParticipants
//   it("Should revert if _minParticipants is greater than _maxParticipants", async function () {
//     await expect(
//       tournamentManager.createTournament(
//         10, // maxParticipants
//         20, // minParticipants is greater
//         enrollmentAmount,
//         [funToken.address],
//         initDate,
//         endDate,
//         compoundProtocol.address,
//         [compoundProtocol.address],
//       ),
//     ).to.be.revertedWith("minParticipants cannot exceed maxParticipants");
//   });

//   // Test: Should revert if _enrollmentAmount is 0
//   it("Should revert if _enrollmentAmount is 0", async function () {
//     await expect(
//       tournamentManager.createTournament(
//         100,
//         1,
//         0, // Invalid enrollmentAmount
//         [funToken.address],
//         initDate,
//         endDate,
//         compoundProtocol.address,
//         [compoundProtocol.address],
//       ),
//     ).to.be.revertedWith("Invalid enrollment amount");
//   });

//   // Test: Should revert if _initDate is greater than _endDate
//   it("Should revert if _initDate is greater than _endDate", async function () {
//     await expect(
//       tournamentManager.createTournament(
//         100,
//         1,
//         enrollmentAmount,
//         [funToken.address],
//         endDate, // Init date is later than end date
//         initDate,
//         compoundProtocol.address,
//         [compoundProtocol.address],
//       ),
//     ).to.be.revertedWith("Invalid date range");
//   });
