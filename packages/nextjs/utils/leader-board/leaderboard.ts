import { keccak256 } from "@ethersproject/keccak256";
import { ethers } from "ethers";
import { keccak256 } from "@ethersproject/keccak256";


// Define a function to process the events and generate the leaderboard
type PlayerData = {
  player: string;
  score_number: number;
};

// Define a type for the outer nested array
type NestedPlayerData = PlayerData[];
export function getLeaderboard(tournament_id: bigint, events: NestedPlayerData) {
  // Usage
  // const {
  //   data: events,
  //   isLoading: isLoadingEvents,
  //   error: errorReadingEvents,
  // } = useScaffoldEventHistory({
  //   contractName: "LeaderBoard",
  //   eventName: "ResultCreated",
  //   fromBlock: 0n,
  //   filters: { tournamentId: tournament_id },
  // });
  // console.log(events);
  // console.log("ELS player", events[0].args.player, typeof events[0].args.player); // 0x11DfADcd62593325Bcf82Ed1f55d87840E93A977 string
  // console.log("ELS score", events[0].args.score_number, typeof events[0].args.score_number); // 2222n bigint

  const scores: number[] = [];
  let concatenatedStringBytes = "0x";
  let spongeHash = ethers.constants.HashZero;
  // Process events to generate the leaderboard and scores
  for (const event of events) {
    // Concatenate address and score bytes
    concatenatedStringBytes = ethers.utils.solidityPack(
      ["bytes", "address", "uint256"],
      [concatenatedStringBytes, event.player, event.score_number],
    );
    spongeHash = keccak256(
      ethers.utils.solidityPack(
        ["bytes32", "address", "uint256"],
        [spongeHash, event.player, event.score_number],
      ),
    );
    scores.push(Number(event.score_number));
  }

  // Create an array of positions
  const positions = Array.from(scores.keys());

  // Sort the positions based on the values in scores in descending order
  positions.sort((a, b) => scores[b] - scores[a]);

  // Return both arrays
  return { concatenatedStringBytes, positions , spongeHash};
}
