// Import required libraries and artifacts
import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentContract } from "../typechain-types";
import type { Signer } from "ethers";

describe("TournamentContract", function () {
  let tournamentContract: TournamentContract;
  let owner: Signer, admin: Signer, participant1: Signer, participant2: Signer;

  beforeEach(async () => {
    const [owner, admin, participant1, participant2] = await ethers.getSigners();

    // Deploy the contract
    const TournamentContractFactory = await ethers.getContractFactory("TournamentContract");
    tournamentContract = (await TournamentContractFactory.deploy(owner.address)) as TournamentContract;
    await tournamentContract.deployed();

    // Add admin
    await tournamentContract.addAdmin(admin.address);
  });

  describe("Deployment", function () {
    it("should set the owner and admin correctly", async () => {
      expect(await tournamentContract.admins(owner.getAddress)).to.equal(true);
      expect(await tournamentContract.admins(admin.getAddress)).to.equal(true);
    });
  });

  describe("Admin Management", function () {
    it("should allow adding a new admin", async () => {
      const newAdmin = ethers.Wallet.createRandom().address;
      await tournamentContract.addAdmin(newAdmin);
      expect(await tournamentContract.admins(newAdmin)).to.equal(true);
    });

    it("should only allow admins to add new admins", async () => {
      //   const nonAdmin = participant1.address;
      await expect(tournamentContract.connect(participant1).addAdmin(nonAdmin)).to.be.revertedWith(
        "Restricted to admins",
      );
    });
  });

  describe("Create Tournament", function () {
    it("should allow admins to create a tournament", async () => {
      expect(tournamentContract.tournaments).to.be.an("array").that.is.empty;
      await tournamentContract
        .connect(admin)
        .createTournament(
          10000,
          250,
          10,
          ["0x4DAFE12E1293D889221B1980672FE260Ac9dDd28"],
          30,
          30,
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
          "0xF09F0369aB0a875254fB565E52226c88f10Bc839",
        );
      const newTournament = await tournamentContract.tournaments
      expect(newTournament).to.have.length.above(0);
      expect(newTournament[0]).to.exist;
      expect(newTournament[0].ID).to.equal(0);
      expect(newTournament[0].max_participants).to.equal(10000);
      expect(newTournament[0].min_participants).to.equal(250);
      expect(newTournament[0].enrollment_amount).to.equal(10);
      expect(newTournament[0].accepted_tokens).to.deep.equal(["0x4DAFE12E1293D889221B1980672FE260Ac9dDd28","0x4DAFE12E1293D889221B1980672FE260Ac9dDd28"]);
      expect(newTournament[0].init_date).to.equal(30);
      expect(newTournament[0].end_date).to.equal(30);
      expect(newTournament[0].DeFiBridge_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");
      expect(newTournament[0].DeFiProtocol_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");
      expect(newTournament[0].participants(0)).to.equal(10000);
      expect(newTournament[0].reward_amount).to.equal(0);
      expect(newTournament[0].aborted).to.equal(false);
      expect(newTournament[0].number_participants).to.equal(0);
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
          ),
      ).to.be.revertedWith("Restricted to admins");
    });
  });

  describe("Enroll ERC20 tournament", function () {
    it("should allow participants to enroll with ERC20 tokens", async () => {
      await tournamentContract.enrollWithERC20(0);
      expect(await tournamentContract.admins(newAdmin)).to.equal(true);
    });

    it("should only allow admins to add new admins", async () => {
      //   const nonAdmin = participant1.address;
      await expect(tournamentContract.connect(participant1).enrollWithERC20(nonAdmin)).to.be.revertedWith(
        "Restricted to admins",
      );
    });
  });

  // Add more test cases for other contract functions as needed
});
