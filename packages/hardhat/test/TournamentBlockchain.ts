// Import required libraries and artifacts
import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentContract, RoleControl, RocketProtocol } from "../typechain-types";
import type { Signer } from "ethers";

describe("Tournament Management", function () {
  let tournamentContract: TournamentContract;
  let adminContract: RoleControl;
  let rocketContract: RocketProtocol;
  let owner: Signer, admin: Signer, participant1: Signer, participant2: Signer;

  beforeEach(async () => {
    // Initialize some signers
    [owner, admin, participant1, participant2] = await ethers.getSigners();

    // Deploy the contracts
    // TournamentContract
    const TournamentContractFactory = await ethers.getContractFactory("TournamentContract");
    tournamentContract = (await TournamentContractFactory.deploy(owner.getAddress())) as TournamentContract;
    await tournamentContract.deployed();
    // Control role contract
    const AdminContractFactory = await ethers.getContractFactory("RoleControl");
    adminContract = (await AdminContractFactory.deploy(owner.getAddress())) as RoleControl;
    await adminContract.deployed();
    // Rocket protocol contract
    const RocketContractFactory = await ethers.getContractFactory("RocketProtocol");
    rocketContract = (await RocketContractFactory.deploy(owner.getAddress())) as RocketProtocol;
    await rocketContract.deployed();

    // Add admin, deployer (owner) is already admin
    await tournamentContract.addAdmin(admin.getAddress());
    await tournamentContract.addAdmin(tournamentContract.address);
  });

  describe("Deployment", function () {
    it("should set the owner and admin correctly", async () => {
      expect(await tournamentContract.isAdmin(owner.getAddress())).to.equal(true);
      expect(await tournamentContract.isAdmin(admin.getAddress())).to.equal(true);
    });
  });

  describe("Admin Management", function () {
    it("should allow adding and deleting a new admin", async () => {
      const newAdmin = ethers.Wallet.createRandom().address;
      await tournamentContract.addAdmin(newAdmin);
      expect(await tournamentContract.isAdmin(newAdmin)).to.equal(true);
      await tournamentContract.deleteAdmin(newAdmin)
      expect(await tournamentContract.isAdmin(newAdmin)).to.equal(false);
    });

    it("should only allow admins to add new admins", async () => {
      //   const nonAdmin = participant1.address;
      await expect(tournamentContract.connect(participant1).addAdmin(participant2.getAddress())).to.be.revertedWith(
        "Restricted to admins.",
      );
    });
  });

  describe("Create Tournament", function () {
    it("should allow admins to create a tournament", async () => {
      // const tournamentss = tournamentContract.tournaments;
      // expect(tournamentss).to.be.an("array").that.is.empty;
      await tournamentContract
        .connect(admin)
        .createTournament(
          10000,
          250,
          10,
          ["0x4DAFE12E1293D889221B1980672FE260Ac9dDd28", "0x4DAFE12E1293D889221B1980672FE260Ac9dDd28"],
          30,
          30,
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
        );
      // const newTournaments = await tournamentContract.tournaments
      // expect(newTournaments).to.have.length.above(0);
      const newTournament = await tournamentContract.tournaments(0);
      expect(newTournament).to.exist;
      expect(newTournament.ID).to.equal(0);
      expect(newTournament.max_participants).to.equal(10000);
      expect(newTournament.min_participants).to.equal(250);
      expect(newTournament.enrollment_amount).to.equal(10);

      const currentDate = new Date();
      // Add 30 days to the current date
      currentDate.setDate(currentDate.getDate() + 30);
      // Get the timestamp in milliseconds and convert to seconds
      const futureTimestamp = Math.floor(currentDate.getTime() / 1000);
      const toleranceInSeconds = 5 * 60 * 5;
      // expect(newTournament.init_date).to.be.closeTo(futureTimestamp, toleranceInSeconds);
      // expect(newTournament.end_date).to.be.closeTo(futureTimestamp2, toleranceInSeconds);

      expect(newTournament.DeFiBridge_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");
      expect(newTournament.DeFiProtocol_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");

      expect(newTournament.reward_amount).to.equal(0);
      expect(newTournament.aborted).to.equal(false);
      expect(newTournament.num_participants).to.equal(0);

      expect(await tournamentContract.getAcceptedTokens(0)).to.deep.equal([
        "0x4DAFE12E1293D889221B1980672FE260Ac9dDd28",
        "0x4DAFE12E1293D889221B1980672FE260Ac9dDd28",
      ]);
    });

    it("should not allow non-admins to create a tournament", async () => {
      await expect(
        tournamentContract
          .connect(participant1)
          .createTournament(
            10000,
            250,
            10,
            ["0x4DAFE12E1293D889221B1980672FE260Ac9dDd28"],
            30,
            30,
            "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
            "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
          ),
      ).to.be.revertedWith("Restricted to admins.");
    });
  });

  describe("Enroll ETH tournament", function () {
    it("should allow participants to enroll with ETH tokens", async () => {
      await tournamentContract
        .connect(admin)
        .createTournament(
          10000,
          250,
          10,
          [],
          30,
          30,
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
        );

      const enrollmentAmount = ethers.utils.parseEther("10");
      // Enroll the first participant
      await tournamentContract.enrollWithETH(0, { value: enrollmentAmount });
      // Get the updated tournament data
      const newTournament = await tournamentContract.tournaments(0);
      // Check if the number of participants increased
      expect(newTournament.num_participants).to.equal(1);
      // Enroll the second participant
      await tournamentContract.connect(participant1).enrollWithETH(0, { value: enrollmentAmount });
      // Get the updated tournament data
      const updatedTournament = await tournamentContract.tournaments(0);
      // Check if the number of participants increased
      expect(updatedTournament.num_participants).to.equal(2);
      // Check if the first participant's enrollment amount is set correctly
      const participant1Enrollment = await tournamentContract.getParticipants(0, participant1.getAddress());
      expect(participant1Enrollment).to.equal((await tournamentContract.tournaments(0)).enrollment_amount);
    });
  });

  describe("Start ETH tournament", function () {
    it("should allow Admins to start an ETH tournament", async () => {
      await tournamentContract
        .connect(admin)
        .createTournament(
          10000,
          2,
          1,
          [],
          0,
          0,
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
        );
      const newTournament = await tournamentContract.tournaments(0);

      const enrollmentAmount = ethers.utils.parseEther("1");
      // Enroll participants
      await tournamentContract.enrollWithETH(0, { value: enrollmentAmount });
      await tournamentContract.connect(participant1).enrollWithETH(0, { value: enrollmentAmount });
      await tournamentContract.connect(participant2).enrollWithETH(0, { value: enrollmentAmount });

      const tx = await tournamentContract.connect(admin).startETHTournament(0);
      // Wait for the transaction to be mined
      await tx.wait();

      // Check if the transaction receipt status is success
      const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
      expect(txReceipt.status).to.equal(1); // 1 indicates success

      const contractrETHBalance = await rocketContract.balanceOfRethofContract();
      const stackedETH = ethers.utils.parseEther((newTournament.num_participants*newTournament.enrollment_amount).toString());
      expect(contractrETHBalance).to.equal(stackedETH);
    });
  });

  // Add more test cases for other contract functions as needed
});
