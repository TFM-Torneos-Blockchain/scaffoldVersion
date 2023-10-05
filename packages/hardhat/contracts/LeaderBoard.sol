// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./RoleControl.sol";

contract LeaderBoard is RoleControl {
	// struct Result {
	// 	address player_address;
	// 	uint score;
	// }

	mapping(uint => bytes32) results_hash; // id_tournament => sponge hash of results e.j: in iteration 2 will be results_hash=(hash(hash(result1),result2))

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

	function setLeaderBoardMerkleTree(
		uint _IDtournament,
		bytes[] calldata _results_bytes,
		uint16[] calldata _positions
	) public {

	}
}
