// Import required libraries and artifacts
import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentManager, RoleControl, RocketProtocol, FunToken, FunToken2, CompoundProtocol, UniswapV2Protocol } from "../typechain-types";
import type { Signer, Contract } from "ethers";
 
describe("Tournament Management", function () {
  let tournamentManager: TournamentManager;
  let adminContract: RoleControl;
  let rocketProtocol: RocketProtocol;
  let compoundProtocol: CompoundProtocol;
  let uniswapProtocol: UniswapV2Protocol;
  let funToken: FunToken;
  let funToken2: FunToken2;
  let clone : CompoundProtocol;
  let owner: Signer, admin: Signer, participant1: Signer, participant2: Signer;

  const currentDate = new Date();
  const init_date_UnixTimestampInSeconds = 2;
  const end_date = new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000);
  const end_date_UnixTimestampInSeconds = Math.floor(end_date.getTime() / 1000);

  const enrollmentAmount = ethers.utils.parseEther("1");
  let compoundAbi: Contract;

  beforeEach(async () => {
    // Initialize some signers
    [owner, admin, participant1, participant2] = await ethers.getSigners();

    // Deploy the contracts
    // TournamentManager
    const TournamentManagerFactory = await ethers.getContractFactory("TournamentManager");
    tournamentManager = (await TournamentManagerFactory.deploy(owner.getAddress())) as TournamentManager;
    await tournamentManager.deployed();
    // Control role contract
    const AdminContractFactory = await ethers.getContractFactory("RoleControl");
    adminContract = (await AdminContractFactory.deploy(owner.getAddress())) as RoleControl;
    await adminContract.deployed();
    // Rocket protocol contract
    const RocketContractFactory = await ethers.getContractFactory("RocketProtocol");
    rocketProtocol = (await RocketContractFactory.deploy(owner.getAddress())) as RocketProtocol;
    await rocketProtocol.deployed();
    // Uniswap protocol contract
    const UniswapContractFactory = await ethers.getContractFactory("UniswapV2Protocol");
    uniswapProtocol = (await UniswapContractFactory.deploy(owner.getAddress())) as UniswapV2Protocol;
    await uniswapProtocol.deployed();
    // Rocket protocol contract
    const CompoundProtocolFactory = await ethers.getContractFactory("CompoundProtocol");
    compoundProtocol = (await CompoundProtocolFactory.deploy(owner.getAddress())) as CompoundProtocol;
    await compoundProtocol.deployed();
    // FunToken contract
    const FunTokenFactory = await ethers.getContractFactory("FunToken");
    funToken = (await FunTokenFactory.deploy(owner.getAddress())) as FunToken;
    await funToken.deployed();
    // FunToken2 contract
    const FunToken2Factory = await ethers.getContractFactory("FunToken2");
    funToken2 = (await FunToken2Factory.deploy(owner.getAddress())) as FunToken2;
    await funToken2.deployed();

    // Add admin, deployer (owner) is already admin
    await tournamentManager.addAdmin(admin.getAddress());
    await tournamentManager.addAdmin(tournamentManager.address);

    await funToken.transfer(participant1.getAddress(), ethers.utils.parseEther("15"));
    await funToken2.transfer(participant1.getAddress(), ethers.utils.parseEther("15"));

    await tournamentManager
    .connect(admin)
    .createTournament(
      10000,
      1,
      enrollmentAmount,
      [funToken.address],
      init_date_UnixTimestampInSeconds,
      end_date_UnixTimestampInSeconds,
      0,
      compoundProtocol.address,
      ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
    );

    await tournamentManager
    .connect(admin)
    .createTournament(
      10000,
      1,
      enrollmentAmount,
      [],
      init_date_UnixTimestampInSeconds,
      end_date_UnixTimestampInSeconds,
      1,
      rocketProtocol.address,
      ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
    );
    const newTournament = await tournamentManager.tournaments(0);

    clone = new ethers.Contract(newTournament.DeFiBridge_address, compoundProtocol.interface, owner) as CompoundProtocol;
      await clone.deployed();

  });

    it("should set the owner and admin correctly", async () => {
      expect(await tournamentManager.isAdmin(owner.getAddress())).to.equal(true);
      expect(await tournamentManager.isAdmin(admin.getAddress())).to.equal(true);
    });

    it("should allow adding and deleting a new admin", async () => {
      const newAdmin = ethers.Wallet.createRandom().address;
      await tournamentManager.connect(admin).addAdmin(newAdmin);
      expect(await tournamentManager.isAdmin(newAdmin)).to.equal(true);
      await tournamentManager.deleteAdmin(newAdmin)
      expect(await tournamentManager.isAdmin(newAdmin)).to.equal(false);
    });

    it("should only allow admins to add new admins", async () => {
      //   const nonAdmin = participant1.address;
      await expect(tournamentManager.connect(participant1).addAdmin(participant2.getAddress())).to.be.revertedWith(
        "Restricted to admins.",
      );
    });

    it("should allow admins to create a tournament, check all input parameters", async () => {
      const newTournament = await tournamentManager.tournaments(0);
      expect(newTournament).to.exist;
      expect(newTournament.ID).to.equal(0);
      expect(newTournament.max_participants).to.equal(10000);
      expect(newTournament.min_participants).to.equal(1);
      expect(newTournament.enrollment_amount).to.equal(enrollmentAmount);

      expect(newTournament.init_date).to.equal(init_date_UnixTimestampInSeconds);
      expect(newTournament.end_date).to.equal(end_date_UnixTimestampInSeconds);

      // expect(newTournament.DeFiBridge_address).to.equal(compoundProtocol.address);
      // expect(newTournament.DeFiProtocol_address).to.equal("0xF09F0369aB0a875254fB565E52226c88f10Bc839");

      expect(newTournament.reward_amount).to.equal(0);
      expect(newTournament.aborted).to.equal(false);
      expect(newTournament.num_participants).to.equal(0);

      expect(await tournamentManager.getAcceptedTokens(0)).to.deep.equal([
        funToken.address,
      ]);

    it("should not allow non-admins to create a tournament", async () => {
      await expect(
        tournamentManager
          .connect(participant1)
          .createTournament(
            10000,
            250,
            enrollmentAmount,
            [funToken.address],
            init_date_UnixTimestampInSeconds,
            end_date_UnixTimestampInSeconds,
            0,
            compoundProtocol.address,
            ["0xF09F0369aB0a875254fB565E52226c88f10Bc839"],
          ),
      ).to.be.revertedWith("Restricted to admins.");
    });
  });

    it("should allow participants to enroll with ETH tokens", async () => {
      // Enroll the first participant
      await tournamentManager.enrollWithETH(1, { value: enrollmentAmount });
      // Get the updated tournament data
      const newTournament = await tournamentManager.tournaments(1);
      // Check if the number of participants increased
      expect(newTournament.num_participants).to.equal(1);
      // Enroll the second participant
      await tournamentManager.connect(participant1).enrollWithETH(1, { value: enrollmentAmount });
      // Get the updated tournament data
      const updatedTournament = await tournamentManager.tournaments(1);
      // Check if the number of participants increased
      expect(updatedTournament.num_participants).to.equal(2);
      // Check if the first participant's enrollment amount is set correctly
      const participant1Enrollment = await tournamentManager.getParticipants(1, participant1.getAddress());
      expect(participant1Enrollment).to.equal((await tournamentManager.tournaments(1)).enrollment_amount);
    });

    it("should allow Admins to start an ETH tournament", async () => {
      const newTournament = await tournamentManager.tournaments(1);

      // Enroll participants
      await tournamentManager.enrollWithETH(1, { value: enrollmentAmount });
      await tournamentManager.connect(participant1).enrollWithETH(1, { value: enrollmentAmount });
      await tournamentManager.connect(participant2).enrollWithETH(1, { value: enrollmentAmount });

      const tx = await tournamentManager.connect(admin).startETHTournament(1);
      // Wait for the transaction to be mined
      await tx.wait();

      // Check if the transaction receipt status is success
      const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
      expect(txReceipt.status).to.equal(1); // 1 indicates success

      const stackedETH = newTournament.num_participants*(newTournament.enrollment_amount).toNumber();
    });

    it("should allow participants to enroll with ERC20 tokens", async () => {
      // Enroll the first participant
      await funToken.connect(owner).approve(tournamentManager.address,enrollmentAmount);
      await tournamentManager.enrollWithERC20(0);
      // Get the updated tournament data
      const newTournament = await tournamentManager.tournaments(0);
      // Check if the number of participants increased
      expect(newTournament.num_participants).to.equal(1);
      // Enroll the second participant
      await funToken.connect(participant1).approve(tournamentManager.address,enrollmentAmount);
      await tournamentManager.connect(participant1).enrollWithERC20(0);
      // Get the updated tournament data
      const updatedTournament = await tournamentManager.tournaments(0);
      // Check if the number of participants increased
      expect(updatedTournament.num_participants).to.equal(2);
      // Check if the first participant's enrollment amount is set correctly
      const participant1Enrollment = await tournamentManager.getParticipants(0, participant1.getAddress());
      expect(participant1Enrollment).to.equal((await tournamentManager.tournaments(0)).enrollment_amount);
    });

    it("should allow Admins to start an ERC20 tournament", async () => {
      const enrollmentAmount = ethers.utils.parseEther("1");

      // Enroll participants
      await funToken.connect(owner).approve(tournamentManager.address,enrollmentAmount);
      await tournamentManager.enrollWithERC20(0);
      await funToken.connect(participant1).approve(tournamentManager.address,enrollmentAmount);
      await tournamentManager.connect(participant1).enrollWithERC20(0);

      const tx = await tournamentManager.connect(owner).startERC20Tournament(0);
      
      await tx.wait(); 
      const txReceipt = await ethers.provider.getTransactionReceipt(tx.hash);
      expect(txReceipt.status).to.equal(1); // 1 indicates success
    });
  // Add more test cases for other contract functions as needed
});
