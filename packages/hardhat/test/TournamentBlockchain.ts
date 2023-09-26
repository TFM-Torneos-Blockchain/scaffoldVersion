// Import required libraries and artifacts
import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentContract, RoleControl } from "../typechain-types";
import type { Signer } from "ethers";

describe("TournamentContract", function () {
  let tournamentContract: TournamentContract;
  let adminContract: RoleControl;
  let owner: Signer, admin: Signer, participant1: Signer, participant2: Signer;

  beforeEach(async () => {
    [owner, admin, participant1, participant2] = await ethers.getSigners();

    // Deploy the contract
    const AdminContractFactory = await ethers.getContractFactory("RoleControl");
    const TournamentContractFactory = await ethers.getContractFactory("TournamentContract");
    tournamentContract = (await TournamentContractFactory.deploy(owner.getAddress())) as TournamentContract;
    adminContract = (await AdminContractFactory.deploy(owner.getAddress())) as RoleControl;
    await tournamentContract.deployed();
    await adminContract.deployed();

    // Add admin
    await tournamentContract.addAdmin(admin.getAddress());
  });

  describe("Deployment", function () {
    it("should set the owner and admin correctly", async () => {
      expect(await tournamentContract.isAdmin(owner.getAddress())).to.equal(true);
      expect(await tournamentContract.isAdmin(admin.getAddress())).to.equal(true);
    });
  });

  describe("Admin Management", function () {
    it("should allow adding a new admin", async () => {
      const newAdmin = ethers.Wallet.createRandom().address;
      await tournamentContract.addAdmin(newAdmin);
      expect(await tournamentContract.isAdmin(newAdmin)).to.equal(true);
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
      // expect(newTournament.accepted_tokens).to.deep.equal(["0x4DAFE12E1293D889221B1980672FE260Ac9dDd28","0x4DAFE12E1293D889221B1980672FE260Ac9dDd28"]);
      const currentDate = new Date();
      // Add 30 days to the current date
      currentDate.setDate(currentDate.getDate() + 30);
      // Get the timestamp in milliseconds and convert to seconds
      const futureTimestamp = Math.floor(currentDate.getTime() / 1000);

      // currentDate.setDate(currentDate.getDate() + 60);
      // const futureTimestamp2 = Math.floor(currentDate.getTime() / 1000);

      const toleranceInSeconds = 5 * 60 * 5; // Adjust this based on your tolerance for time differences

      // Assuming newTournament.init_date and newTournament.end_date are in seconds
      expect(newTournament.init_date).to.be.closeTo(futureTimestamp, toleranceInSeconds);
      // expect(newTournament.end_date).to.be.closeTo(futureTimestamp2, toleranceInSeconds);
      expect(newTournament.DeFiBridge_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");
      expect(newTournament.DeFiProtocol_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");
      // expect(await newTournament.participants(ethers.utils.getAddress("0x0"))).to.equal(0);
      expect(newTournament.reward_amount).to.equal(0);
      expect(newTournament.aborted).to.equal(false);
      expect(newTournament.num_participants).to.equal(0);
      expect(await tournamentContract.getAcceptedTokens(0)).to.deep.equal([
        "0x4DAFE12E1293D889221B1980672FE260Ac9dDd28",
        "0x4DAFE12E1293D889221B1980672FE260Ac9dDd28",
      ]);
    });

    it("should only allow admins to create a tournament", async () => {
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
        ["0x4DAFE12E1293D889221B1980672FE260Ac9dDd28", "0x4DAFE12E1293D889221B1980672FE260Ac9dDd28"],
        30,
        30,
        "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
        "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
      );
      // Assuming `enrollment_amount` is in Ether (e.g., 1 Ether)
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

  
  // Add more test cases for other contract functions as needed
});
