import { expect } from "chai";
import { ethers } from "hardhat";
import { TournamentManager, FunToken, MockERC20Protocol, MockETHProtocol } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getLeaderboard } from "../../../nextjs/utils/leader-board/leaderboard";

// Helper function to process events into PlayerData structure
type PlayerData = {
  address: string;
  score: bigint;
};

function mapEventsToPlayerData(events: any[]): PlayerData[] {
  return events.map(event => ({
    address: event.args.player,
    score: event.args.scoreNumber.toBigInt(),
  }));
}

describe("TournamentManager - Start Tournament", function () {
  let tournamentManager: TournamentManager;
  let funToken: FunToken;
  let mockETHProtocol: MockETHProtocol;
  let mockERC20Protocol: MockERC20Protocol;

  let owner: SignerWithAddress,
    participant1: SignerWithAddress,
    participant2: SignerWithAddress,
    participant3: SignerWithAddress,
    participant4: SignerWithAddress,
    participant5: SignerWithAddress;
  let initDate: number, endDate: number;
  let snapshotId: string;
  const enrollmentAmount = ethers.utils.parseEther("1");
  const fakeRewards = ethers.utils.parseEther("5");

  // Declare result variables so they are accessible throughout the test
  let concatenatedStringBytesERC: string;
  let positionsERC: number[];
  let concatenatedStringBytesETH: string;
  let positionsETH: number[];

  async function enrollParticipants() {
    // Enroll participants in ERC20 Tournament
    for (const participant of [participant1, participant2, participant3, participant4, participant5]) {
      await funToken.connect(participant).approve(tournamentManager.address, enrollmentAmount);
      await tournamentManager.connect(participant).enrollWithERC20(0); // Tournament 0 is ERC20
    }

    // Enroll participants in ETH Tournament
    for (const participant of [participant1, participant2, participant3, participant4, participant5]) {
      await tournamentManager.connect(participant).enrollWithETH(1, { value: enrollmentAmount }); // Tournament 1 is ETH
    }
  }

  async function sendRewardsToClones() {
    // Send extra FunTokens to the ERC20 DeFi Bridge (simulating rewards)
    const tournamentERC20 = await tournamentManager.tournaments(0);
    const deFiBridgeAddressERC20 = tournamentERC20.deFiBridgeAddress;
    await funToken.transfer(deFiBridgeAddressERC20, fakeRewards); // Simulating 5 tokens as rewards
    // console.log("AAAAAAAAAAa", await funToken.balanceOf(deFiBridgeAddressERC20));

    // Send extra ETH to the ETH DeFi Bridge (simulating rewards)
    const tournamentETH = await tournamentManager.tournaments(1);
    const deFiBridgeAddressETH = tournamentETH.deFiBridgeAddress;
    await owner.sendTransaction({
      to: deFiBridgeAddressETH,
      value: fakeRewards, // Simulating 5 ETH as rewards
    });
  }

  // Names of the contract versions to deploy
  const contractsToTest = [
    { name: "TournamentManager", contractFactory: "TournamentManager" },
    { name: "TournamentManagerOpt", contractFactory: "TournamentManagerOpt" },
  ];

  contractsToTest.forEach(({ name, contractFactory }) => {
    describe(`Testing with ${name}`, function () {
      beforeEach(async function () {
        [owner, participant1, participant2, participant3, participant4, participant5] = await ethers.getSigners();

        // Set initial dates for tournaments
        const currentTime = Math.floor(Date.now() / 1000);
        initDate = currentTime + 3600 * 24; // Tournament starts in 24 hours
        endDate = currentTime + 3600 * 48; // Tournament ends in 48 hours

        // Deploy the current contract version (original or optimized)
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

        // Deploy FunToken (ERC20)
        const FunTokenFactory = await ethers.getContractFactory("FunToken");
        funToken = (await FunTokenFactory.deploy()) as FunToken;
        await funToken.deployed();

        // Transfer tokens to participants
        await funToken.transfer(participant1.address, ethers.utils.parseEther("10"));
        await funToken.transfer(participant2.address, ethers.utils.parseEther("10"));
        await funToken.transfer(participant3.address, ethers.utils.parseEther("10"));
        await funToken.transfer(participant4.address, ethers.utils.parseEther("10"));
        await funToken.transfer(participant5.address, ethers.utils.parseEther("10"));

        // Create ERC20 Tournament
        await tournamentManager.createTournament(
          5, // maxParticipants
          1, // minParticipants
          enrollmentAmount, // enrollment amount
          [funToken.address], // ERC20 tokens accepted
          initDate,
          endDate,
          mockERC20Protocol.address, // DeFi bridge mock
          [participant1.address, participant2.address], // Protocol addresses
        );

        // Create ETH Tournament
        await tournamentManager.createTournament(
          5, // maxParticipants
          1, // minParticipants
          enrollmentAmount, // Enrollment amount in ETH
          [], // No ERC20 tokens accepted for ETH tournament
          initDate,
          endDate,
          mockETHProtocol.address, // DeFi bridge mock for ETH
          [participant1.address, participant2.address], // Protocol addresses
        );

        // Enroll participants in both tournaments
        await enrollParticipants();

        // Take a snapshot of the current state before each test (before end_date)
        snapshotId = await ethers.provider.send("evm_snapshot", []);

        // 4. Fast-forward to the `initDate` and start the tournament
        await ethers.provider.send("evm_increaseTime", [3600 * 24 + 10]); // Fast forward to after the `initDate`
        await ethers.provider.send("evm_mine", []); // Mine a block

        // Start ERC20 tournament
        await tournamentManager.connect(owner).startERC20Tournament(0);

        // Start ETH tournament
        await tournamentManager.connect(owner).startETHTournament(1);
        // Send rewards to the cloned DeFi bridges (mocked rewards)

        // Set valid results for participants        // Set valid results for ERC and ETH tournaments
        await tournamentManager.connect(owner).setResult(0, participant1.address, 1000);
        await tournamentManager.connect(owner).setResult(0, participant2.address, 500);
        await tournamentManager.connect(owner).setResult(1, participant1.address, 1000);
        await tournamentManager.connect(owner).setResult(1, participant2.address, 500);

        // Fast-forward time to after the end date
        await ethers.provider.send("evm_increaseTime", [3600 * 50]); // Fast forward beyond the end date
        await ethers.provider.send("evm_mine", []); // Mine a block to move forward in time

        await sendRewardsToClones();

        // Capture the events emitted during result setting
        const filterERC = tournamentManager.filters.ResultCreated(0);
        const eventsERC = await tournamentManager.queryFilter(filterERC);
        const filterETH = tournamentManager.filters.ResultCreated(1);
        const eventsETH = await tournamentManager.queryFilter(filterETH);

        // Map the events into PlayerData structure
        const playerDataERC = mapEventsToPlayerData(eventsERC);
        const playerDataETH = mapEventsToPlayerData(eventsETH);

        // Use the mapped player data to generate spongeHash and leaderboard
        const leaderboardERC = getLeaderboard(BigInt(0), playerDataERC);
        concatenatedStringBytesERC = leaderboardERC.concatenatedStringBytes;
        positionsERC = leaderboardERC.positions;

        const leaderboardETH = getLeaderboard(BigInt(1), playerDataETH);
        concatenatedStringBytesETH = leaderboardETH.concatenatedStringBytes;
        positionsETH = leaderboardETH.positions;
      });

      afterEach(async function () {
        // Revert to the snapshot after each test
        await ethers.provider.send("evm_revert", [snapshotId]);
      });

      it("Should revert endERC20Tournament if called before the end date", async function () {
        // Revert to the snapshot, effectively going "back in time" to before the end date
        await ethers.provider.send("evm_revert", [snapshotId]);

        // Try to end the tournament before the end date (should revert)
        await expect(tournamentManager.connect(owner).endERC20Tournament(0, [], [])).to.be.revertedWith(
          "Tournament cannot be finished before the end date.",
        );
      });

      // Test: Ensure endETHTournament reverts if called before the end date
      it("Should revert endETHTournament if called before the end date", async function () {
        // Revert to the snapshot, effectively going "back in time" to before the end date
        await ethers.provider.send("evm_revert", [snapshotId]);

        await expect(tournamentManager.connect(owner).endETHTournament(1, [], [])).to.be.revertedWith(
          "Tournament cannot be finished before the end date.",
        );
      });

      // Test: Ensure endERC20Tournament passes after the end date
      it("Should allow endERC20Tournament after setting valid results", async function () {
        // Call endERC20Tournament with the generated result data
        await expect(tournamentManager.connect(owner).endERC20Tournament(0, concatenatedStringBytesERC, positionsERC))
          .to.not.be.reverted; // Should pass
      });

      // Test: Ensure endETHTournament passes after the end date
      it("Should allow endETHTournament after the end date", async function () {
        // Call endETHTournament with the generated result data
        await expect(tournamentManager.connect(owner).endETHTournament(1, concatenatedStringBytesETH, positionsETH)).to
          .not.be.reverted; // Should pass
      });

      // Test: End ERC20 Tournament and verify reward distribution
      it("Should end ERC20 tournament and return tokens to TournamentManager", async function () {
        const participantsERC20 = (await tournamentManager.tournaments(0)).numParticipants;
        const enrollmentTotal = enrollmentAmount.mul(participantsERC20);

        // Get balances before tournament end
        const contractBalanceBefore = await funToken.balanceOf(tournamentManager.address);
        const ownerBalanceBefore = await funToken.balanceOf(owner.address);

        // End ERC20 tournament
        await tournamentManager.connect(owner).endERC20Tournament(0, concatenatedStringBytesERC, positionsERC);

        // Get balances after tournament end
        const contractBalanceAfter = await funToken.balanceOf(tournamentManager.address);
        const ownerBalanceAfter = await funToken.balanceOf(owner.address);

        // Check the total rewards stored in the tournament data
        const rewardERC20 = await tournamentManager.getTotalRewardAmount(0);
        expect(rewardERC20[0]).to.equal(fakeRewards.mul(8).div(10));

        // Check that the owner received 20% of protocol rewards (not enrollment funds)
        expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(fakeRewards.mul(2).div(10));

        // Check that the tournament contract holds the remaining rewards + enrollments
        expect(contractBalanceAfter.sub(contractBalanceBefore)).to.equal(enrollmentTotal.add(rewardERC20[0]));
      });

      // Test: End ETH Tournament and verify reward + enrollment distribution
      it("Should end ETH tournament and transfer enrollments + protocol rewards", async function () {
        const participantsETH = (await tournamentManager.tournaments(1)).numParticipants;
        const clone = (await tournamentManager.tournaments(1)).deFiBridgeAddress;
        const enrollmentTotalETH = enrollmentAmount.mul(participantsETH);

        // Get ETH balances before tournament end
        const contractBalanceBeforeETH = await ethers.provider.getBalance(tournamentManager.address);
        const ownerBalanceBeforeETH = await ethers.provider.getBalance(owner.address);

        // End ETH tournament and get the transaction details
        const tx = await tournamentManager.connect(owner).endETHTournament(1, concatenatedStringBytesETH, positionsETH);
        const receipt = await tx.wait();

        // Calculate the gas used by the endETHTournament transaction
        const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

        // Check the total rewards stored in the tournament data
        const rewardETH = await tournamentManager.getTotalRewardAmount(1);
        expect(rewardETH[0]).to.equal(fakeRewards.mul(8).div(10));

        // Check that the owner received exactly 20% of protocol rewards, minus the gas used
        const ownerBalanceAfterETH = await ethers.provider.getBalance(owner.address);
        const expectedReward = fakeRewards.mul(2).div(10);
        const ownerExpectedBalanceChange = expectedReward.sub(gasUsed);

        // Make the exact comparison, considering gas used
        expect(ownerBalanceAfterETH.sub(ownerBalanceBeforeETH)).to.equal(ownerExpectedBalanceChange);

        // Check that the tournament contract holds the remaining rewards + enrollments
        const contractBalanceAfterETH = await ethers.provider.getBalance(tournamentManager.address);
        expect(contractBalanceAfterETH.sub(contractBalanceBeforeETH)).to.be.gt(
          enrollmentTotalETH.add(rewardETH[0].mul(8).div(10)),
        );
      });
    });
  });
});
