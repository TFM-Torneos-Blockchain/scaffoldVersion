import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentManager, FunToken, MockERC20Protocol, MockETHProtocol } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("TournamentManager - Start Tournament", function () {
  let tournamentManager: TournamentManager;
  let funToken: FunToken;
  let mockETHProtocol: MockETHProtocol;
  let mockERC20Protocol: MockERC20Protocol;

  let owner: SignerWithAddress, participant1: SignerWithAddress, participant2: SignerWithAddress;
  let initDate: number, endDate: number;
  let snapshotId: string;
  const enrollmentAmount = ethers.utils.parseEther("1");

  // Names of the contract versions to deploy
  const contractsToTest = [
    { name: "TournamentManager", contractFactory: "TournamentManager" },
    { name: "TournamentManagerOpt", contractFactory: "TournamentManagerOpt" },
  ];

  contractsToTest.forEach(({ name, contractFactory }) => {
    describe(`Testing with ${name}`, function () {
      beforeEach(async function () {
        [owner, participant1, participant2] = await ethers.getSigners();

        // Take a snapshot of the blockchain state before each test
        snapshotId = await ethers.provider.send("evm_snapshot", []);

        // Deploy TournamentManager
        const TournamentManagerFactory = await ethers.getContractFactory(contractFactory);
        tournamentManager = (await TournamentManagerFactory.deploy()) as TournamentManager;
        await tournamentManager.deployed();

        // Deploy ERC20Protocol
        const MockERC20ProtocolFactory = await ethers.getContractFactory("MockERC20Protocol");
        mockERC20Protocol = (await MockERC20ProtocolFactory.deploy()) as MockERC20Protocol;
        await mockERC20Protocol.deployed();

        // Deploy ETHProtocol
        const MockETHProtocolFactory = await ethers.getContractFactory("MockETHProtocol");
        mockETHProtocol = (await MockETHProtocolFactory.deploy()) as MockETHProtocol;
        await mockETHProtocol.deployed();

        // Deploy a mock ERC20 token (FunToken)
        const FunTokenFactory = await ethers.getContractFactory("FunToken");
        funToken = (await FunTokenFactory.deploy()) as FunToken;
        await funToken.deployed();

        // Set initial dates
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        initDate = currentTime + 3600 * 2; // 2 hours from now
        endDate = currentTime + 3600 * 5; // 5 hours from now

        // Transfer tokens to participants
        await funToken.transfer(participant1.address, ethers.utils.parseEther("10"));
        await funToken.transfer(participant2.address, ethers.utils.parseEther("10"));

        // Create a tournament for ERC20 and ETH testing
        await tournamentManager.createTournament(
          5, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [funToken.address], // acceptedTokens array
          initDate,
          endDate,
          mockERC20Protocol.address,
          [participant1.address, participant2.address], // deFiProtocolAddresses array
        );

        await tournamentManager.createTournament(
          5, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [], // acceptedTokens array
          initDate,
          endDate,
          mockETHProtocol.address,
          [participant1.address, participant2.address], // deFiProtocolAddresses array
        );

        // Enroll participants in the ERC20 tournament
        await funToken.connect(participant1).approve(tournamentManager.address, enrollmentAmount);
        await tournamentManager.connect(participant1).enrollWithERC20(0);
        await funToken.connect(participant2).approve(tournamentManager.address, enrollmentAmount);
        await tournamentManager.connect(participant2).enrollWithERC20(0);

        // Enroll participants in the ETH tournament
        await tournamentManager.connect(participant1).enrollWithETH(1, { value: enrollmentAmount });
        await tournamentManager.connect(participant2).enrollWithETH(1, { value: enrollmentAmount });
      });

      afterEach(async function () {
        // Revert to the snapshot after each test
        await ethers.provider.send("evm_revert", [snapshotId]);
      });

      // Test: Starting ERC20 Tournament
      it("Should allow owner to start an ERC20 tournament", async function () {
        // Fast-forward time to after the initDate
        await ethers.provider.send("evm_increaseTime", [3600 * 3]); // Fast forward 3 hours
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        await expect(tournamentManager.connect(owner).startERC20Tournament(0)).to.emit(tournamentManager, "Enroll").and // Optional event check if emitted
          .not.to.be.reverted;
      });

      // Test: Starting ETH Tournament
      it("Should allow owner to start an ETH tournament", async function () {
        // Fast-forward time to after the initDate
        await ethers.provider.send("evm_increaseTime", [3600 * 3]); // Fast forward 3 hours
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        await expect(tournamentManager.connect(owner).startETHTournament(1)).to.not.be.reverted;
      });

      // Test: Tournament cannot start before initDate
      it("Should revert if trying to start tournament before initDate", async function () {
        // Do not fast-forward time, should still be before initDate
        await expect(tournamentManager.connect(owner).startERC20Tournament(0)).to.be.revertedWith(
          "Tournament cannot start before the initiation date.",
        );
        await expect(tournamentManager.connect(owner).startETHTournament(1)).to.be.revertedWith(
          "Tournament cannot start before the initiation date.",
        );
      });

      // Test: Aborting ERC20 Tournament due to insufficient participants
      it("Should abort tournaments if participants are below minParticipants", async function () {
        // Create a tournament for ERC20 and ETH testing
        await tournamentManager.createTournament(
          5, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [funToken.address], // acceptedTokens array
          initDate,
          endDate,
          mockERC20Protocol.address,
          [participant1.address, participant2.address], // deFiProtocolAddresses array
        );

        await tournamentManager.createTournament(
          5, // maxParticipants
          1, // minParticipants
          enrollmentAmount,
          [], // acceptedTokens array
          initDate,
          endDate,
          mockETHProtocol.address,
          [participant1.address, participant2.address], // deFiProtocolAddresses array
        );
        // Fast-forward time to after the initDate
        await ethers.provider.send("evm_increaseTime", [3600 * 3]); // Fast forward 3 hours
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        // Since no one is enrolled, the tournaments should be aborted
        await tournamentManager.connect(owner).startERC20Tournament(2);
        const tournamentERC = await tournamentManager.tournaments(2);
        expect(tournamentERC.aborted).to.equal(true);
        await tournamentManager.connect(owner).startETHTournament(3);
        const tournamentETH = await tournamentManager.tournaments(3);
        expect(tournamentETH.aborted).to.equal(true);
      });

      // Test: Check FunToken balance after tournament starts
      it("Should transfer FunToken balance to the DeFi bridge contract after starting ERC20 tournament", async function () {
        // Fast-forward time to after the initDate
        await ethers.provider.send("evm_increaseTime", [3600 * 3]); // Fast forward 3 hours
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        // Get the tournament details to retrieve the cloned contract's address
        const tournament = await tournamentManager.tournaments(0);
        const clonedDeFiBridgeAddress = tournament.deFiBridgeAddress;

        // Get the token balance of the cloned contract before starting the tournament
        const balanceBefore = await funToken.balanceOf(clonedDeFiBridgeAddress);

        // Start the tournament
        await tournamentManager.connect(owner).startERC20Tournament(0);

        // Get the token balance of the cloned contract after starting the tournament
        const balanceAfter = await funToken.balanceOf(clonedDeFiBridgeAddress);

        // Calculate the expected amount (enrollmentAmount * number of participants)
        const expectedAmount = enrollmentAmount.mul(tournament.numParticipants);

        // Ensure that the difference matches the expected amount
        expect(balanceAfter.sub(balanceBefore)).to.equal(expectedAmount);
      });

      // Test: Check ETH balance after tournament starts
      it("Should transfer ETH balance to the DeFi bridge contract after starting ETH tournament", async function () {
        // Fast-forward time to after the initDate
        await ethers.provider.send("evm_increaseTime", [3600 * 3]); // Fast forward 3 hours
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        // Get the tournament details to retrieve the cloned contract's address
        const tournament = await tournamentManager.tournaments(1); // Tournament 1 is the ETH tournament
        const clonedDeFiBridgeAddress = tournament.deFiBridgeAddress;

        // Get the ETH balance of the cloned contract before starting the tournament
        const balanceBefore = await ethers.provider.getBalance(clonedDeFiBridgeAddress);

        // Start the ETH tournament
        await tournamentManager.connect(owner).startETHTournament(1, {
          value: enrollmentAmount.mul(tournament.numParticipants),
        });

        // Get the ETH balance of the cloned contract after starting the tournament
        const balanceAfter = await ethers.provider.getBalance(clonedDeFiBridgeAddress);

        // Calculate the expected amount (enrollmentAmount * number of participants)
        const expectedAmount = enrollmentAmount.mul(tournament.numParticipants);

        // Ensure that the difference matches the expected amount
        expect(balanceAfter.sub(balanceBefore)).to.equal(expectedAmount);
      });

      // Test: Start Tournaments (ERC20 and ETH) and verify Mock DeFi Bridge state for the cloned contracts
      it("Should start ERC20 and ETH tournaments and update cloned DeFi Bridge contracts", async function () {
        // Fast-forward time to after the initDate for both tournaments
        await ethers.provider.send("evm_increaseTime", [3600 * 3]); // Fast forward 3 hours
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        // Test: Start ERC20 Tournament
        const tournamentERC20 = await tournamentManager.tournaments(0); // Tournament 0 is the ERC20 tournament
        const clonedDeFiBridgeAddressERC20 = tournamentERC20.deFiBridgeAddress;

        // Start ERC20 tournament
        await tournamentManager.connect(owner).startERC20Tournament(0);

        // Check that the ERC20 tournament is marked as started in the cloned DeFi Bridge
        const clonedDeFiBridgeERC20 = await ethers.getContractAt("MockERC20Protocol", clonedDeFiBridgeAddressERC20);

        const startedERC20 = await clonedDeFiBridgeERC20.started();
        const amountSuppliedERC20 = await clonedDeFiBridgeERC20.amountSupplied();
        const lastErc20AddressERC20 = await clonedDeFiBridgeERC20.lastErc20Address();
        const lastDeFiProtocolAddressERC20 = await clonedDeFiBridgeERC20.lastDeFiProtocolAddress();

        expect(startedERC20).to.equal(true);
        expect(amountSuppliedERC20).to.equal(enrollmentAmount.mul(tournamentERC20.numParticipants));
        expect(lastErc20AddressERC20).to.equal(funToken.address);
        expect(lastDeFiProtocolAddressERC20).to.equal(participant1.address); // The first protocol in the array

        // Test: Start ETH Tournament
        const tournamentETH = await tournamentManager.tournaments(1); // Tournament 1 is the ETH tournament
        const clonedDeFiBridgeAddressETH = tournamentETH.deFiBridgeAddress;

        // Start ETH tournament with the required amount of ETH
        await tournamentManager.connect(owner).startETHTournament(1, {
          value: enrollmentAmount.mul(tournamentETH.numParticipants),
        });

        // Check that the ETH tournament is marked as started in the cloned DeFi Bridge
        const clonedDeFiBridgeETH = await ethers.getContractAt("MockERC20Protocol", clonedDeFiBridgeAddressETH);

        const startedETH = await clonedDeFiBridgeETH.started();
        const amountSuppliedETH = await clonedDeFiBridgeETH.amountSupplied();
        const lastDeFiProtocolAddressETH = await clonedDeFiBridgeETH.lastDeFiProtocolAddress();

        expect(startedETH).to.equal(true);
        expect(amountSuppliedETH).to.equal(enrollmentAmount.mul(tournamentETH.numParticipants));
        expect(lastDeFiProtocolAddressETH).to.equal(participant1.address); // The first protocol in the array
      });
    });
  });
});
