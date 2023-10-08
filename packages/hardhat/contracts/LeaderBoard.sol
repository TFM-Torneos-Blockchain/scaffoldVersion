// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./RoleControl.sol";

contract LeaderBoard is RoleControl {
	// struct Result {
	// 	address player_address;
	// 	uint score;
	// }

	mapping(uint => bytes32) results_hash; // id_tournament => sponge hash of results e.j: in iteration 2 will be results_hash=(hash(hash(result1),result2))
	mapping(uint => bytes32) merkle_roots; // id_tournament => merkle root.

	event ResultCreated(
		uint indexed tournamentId,
		address indexed player,
		uint score
	);

	// TODO fer en backend passar a bytes Result[]
	// Results are the concatenation of the bytes of (address, score) for each player
	function setResult(
		uint _IDtournament,
		address _player,
		uint _new_score
	) external {
		// Sponge Hash with previous results_hash and new result (bytes(addressPlayer, scorePlayer))
		results_hash[_IDtournament] = keccak256(
			abi.encodePacked(results_hash[_IDtournament], _player, _new_score)
		);

		emit ResultCreated(_IDtournament, _player, score_number);
	}

	// Creates a leaderboard and generates its Merkle tree. This function checks if the provided input data corresponds to the stored results hash.
	function createLeaderBoardMerkleTree(
		uint _IDtournament,
		bytes calldata _results_bytes, // each element is 52 bytes: 20 for the address and 32 for the score.
		uint16[] calldata  _positions
	) public {
		// Used for ordenate the addresses, and generate all merkle hashes.
		bytes32[_positions.length] memory leaderboard_hash;

		// Check that the leaderboard ordening is correct
		bytes32 lastScore = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
		bytes32 memory spongeHash;
		for (uint i = 0; i < _positions.length; i++) {
			spongeHash = keccak256(abi.encodePacked(spongeHash,_results_bytes[i*52:(i+1)*52]));
			leaderboard_hash[i] = keccak256(_results_bytes[_positions[i]*52:(_positions[i]+1)*52]);
			require(_results_bytes[_positions[i]*20:(_positions[i]+1)*52]<= lastScore, "Data corrupted: incorrect players classification."); // if  tie caller decides order.
			lastScore = _results_bytes[_positions[i]*32:(_positions[i]+1)*52];
		}
		require(spongeHash==results_hash[_IDtournament], "Data corrupted: bad spongeHash recreation.");

		// Get Merkle Root
		uint memory count = _results_bytes.length; // number of leaves
		uint memory offset = 0;
		while (count > 0) {
			for (uint i = 0; i < count - 1; i += 2) {
				leaderboard_hash.push(
					keccak256(
						abi.encodePacked(
							leaderboard_hash[offset + i],
							leaderboard_hash[offset + i + 1]
						)
					)
				);
			}
			offset += count;
			count = count / 2;
		}
		// Store Merkle Root
		merkle_roots[_IDtournament] = merkle_hashes[offset];
	}
}
