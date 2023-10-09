import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { keccak256 } from "viem";

// Define a function to process the events and generate the leaderboard
export function getLeaderboard(tournament_id: number) {
  const leaderboard: string[] = [];
  const positions: number[] = [];

  // Usage
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "TournamentContract",
    eventName: "Enroll",
    // Specify the starting block number from which to read events, this is a bigint.
    fromBlock: 31231n,
    blockData: true,
    // Apply filters to the event based on parameter names and values { [parameterName]: value },
    filters: { tournament_id: tournament_id },
    // If set to true it will return the transaction data for each event (default: false),
    transactionData: true,
    // If set to true it will return the receipt data for each event (default: false),
    receiptData: true,
  });
  console.log(events);

  // Process events to generate the leaderboard and positions
  for (const event of events) {
    // Assuming your event structure has an 'address' and 'position' field
    const { address, position } = event;

    // Encode address and position to bytes using TextEncoder
    const encoder = new TextEncoder();
    const addressBytes = encoder.encode(address);
    const positionBytes = encoder.encode(position.toString());

    // Concatenate address and position bytes
    const leaderboardEntry = Buffer.concat([addressBytes, positionBytes]).toString();
    leaderboard.push(leaderboardEntry);
  }

  console.log("Leaderboard:", leaderboard);
  console.log("Positions:", positions);

  // Return both arrays
  return { leaderboard, positions };
}
