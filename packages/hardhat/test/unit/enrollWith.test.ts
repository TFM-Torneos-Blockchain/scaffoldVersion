import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentManager, FunToken } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("TournamentManager - Enrollment", function () {
  let tournamentManager: TournamentManager;
  let funToken: FunToken;
  let owner: SignerWithAddress,
    participant1: SignerWithAddress,
    participant2: SignerWithAddress,
    participant3: SignerWithAddress;
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
        [owner, participant1, participant2, participant3] = await ethers.getSigners();

        // Deploy TournamentManager
        const TournamentManagerFactory = await ethers.getContractFactory(contractFactory);
        tournamentManager = (await TournamentManagerFactory.deploy()) as TournamentManager;
        const FunTokenFactory = await ethers.getContractFactory("FunToken");
        funToken = (await FunTokenFactory.deploy()) as FunToken;
        await funToken.deployed();

        // Set initial dates
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        initDate = currentTime + 3600 * 24; // 1 hour from now
        endDate = currentTime + 7200 * 24; // 2 hours from now

        // Transfer tokens to participants
        await funToken.transfer(participant1.address, ethers.utils.parseEther("10"));
        await funToken.transfer(participant2.address, ethers.utils.parseEther("10"));

        // Create a tournament
        await tournamentManager.createTournament(
          2, // maxParticipants (2 participants)
          1, // minParticipants
          enrollmentAmount, // enrollment amount
          [funToken.address], // acceptedTokens array
          initDate,
          endDate,
          owner.address, // DeFi bridge (just using owner address for simplicity)
          [], // deFiProtocolAddresses array
        );

        // Take a snapshot of the blockchain state before each test
        snapshotId = await ethers.provider.send("evm_snapshot", []);
      });

      afterEach(async function () {
        // Revert to the snapshot after each test
        await ethers.provider.send("evm_revert", [snapshotId]);
      });

      // Test: Valid enrollment with ERC20
      it("Should allow valid enrollment with ERC20", async function () {
        // Approve the tokens for enrollment
        await funToken.connect(participant1).approve(tournamentManager.address, enrollmentAmount);

        // Enroll with ERC20
        await expect(tournamentManager.connect(participant1).enrollWithERC20(0))
          .to.emit(tournamentManager, "Enroll")
          .withArgs(0, participant1.address, 1, enrollmentAmount);

        const tournament = await tournamentManager.tournaments(0);
        expect(tournament.numParticipants).to.equal(1);
        expect(await tournamentManager.getParticipants(0, participant1.address)).to.be.true;
      });

      // Test: Valid enrollment with ETH
      it("Should allow valid enrollment with ETH", async function () {
        await expect(tournamentManager.connect(participant1).enrollWithETH(0, { value: enrollmentAmount }))
          .to.emit(tournamentManager, "Enroll")
          .withArgs(0, participant1.address, 1, enrollmentAmount);

        const tournament = await tournamentManager.tournaments(0);
        expect(tournament.numParticipants).to.equal(1);
        expect(await tournamentManager.getParticipants(0, participant1.address)).to.be.true;
      });

      // Test: Address is already enrolled
      it("Should revert if the participant is already enrolled", async function () {
        await funToken.connect(participant1).approve(tournamentManager.address, enrollmentAmount);
        await tournamentManager.connect(participant1).enrollWithERC20(0);

        await expect(tournamentManager.connect(participant1).enrollWithERC20(0)).to.be.revertedWith(
          "Address is already enrolled in this tournament.",
        );

        await expect(
          tournamentManager.connect(participant1).enrollWithETH(0, { value: enrollmentAmount }),
        ).to.be.revertedWith("Address is already enrolled in this tournament.");
      });

      // Test: Tournament is full
      it("Should revert if the tournament is full", async function () {
        await funToken.connect(participant1).approve(tournamentManager.address, enrollmentAmount);
        await funToken.connect(participant2).approve(tournamentManager.address, enrollmentAmount);

        // Enroll two participants (fill the tournament)
        await tournamentManager.connect(participant1).enrollWithERC20(0);
        await tournamentManager.connect(participant2).enrollWithERC20(0);

        // Try enrolling a third participant
        await expect(
          tournamentManager.connect(participant3).enrollWithETH(0, { value: enrollmentAmount }),
        ).to.be.revertedWith("Tournament is full.");
      });

      // Test: Insufficient ERC20 balance
      it("Should revert if the participant has insufficient ERC20 balance", async function () {
        // Transfer back the participant's tokens to create insufficient balance
        await funToken.connect(participant1).transfer(owner.address, await funToken.balanceOf(participant1.address));

        await expect(tournamentManager.connect(participant1).enrollWithERC20(0)).to.be.revertedWith(
          "Insufficient balance.",
        );
      });

      // Test: Incorrect ETH value sent
      it("Should revert if incorrect ETH value is sent", async function () {
        await expect(
          tournamentManager.connect(participant1).enrollWithETH(0, { value: ethers.utils.parseEther("0.5") }),
        ).to.be.revertedWith("Incorrect or insufficient ETH value.");
      });

      // Test: Enrollment period has ended
      it("Should revert if trying to enroll after the enrollment period has ended", async function () {
        // Fast-forward time to after the initDate
        await ethers.provider.send("evm_increaseTime", [3600 * 30]); // Fast forward 2 hours
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        await funToken.connect(participant1).approve(tournamentManager.address, enrollmentAmount);

        await expect(tournamentManager.connect(participant1).enrollWithERC20(0)).to.be.revertedWith(
          "Enrollment period has ended.",
        );

        await expect(
          tournamentManager.connect(participant1).enrollWithETH(0, { value: enrollmentAmount }),
        ).to.be.revertedWith("Enrollment period has ended.");
      });
    });
  });
});

// MISSING CHECKS!!! Implement a check to see if tournament is ERC20 or ETH based, prevent to use function.
