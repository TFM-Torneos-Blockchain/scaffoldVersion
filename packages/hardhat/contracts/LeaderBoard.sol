// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


import "./RoleControl.sol";

contract LeaderBoard is RoleControl {
	// struct Result {
	// 	address player_address;
	// 	uint score;
	// }

	mapping(uint => bytes32) results_hash; // id_tournament => hash of results

	event ResultCreated(
		uint indexed tournamentId,
		address indexed player,
		uint score
	);


	// TODO fer en backend passar a bytes Result[]
	// Results are the concatenation of the bytes of (address, score) for each player
	function setResult(uint _IDtournament, bytes calldata _results, address _player, uint _new_score) external {

		// Hash the concatenated data
		bytes32 memory hashResult = keccak256(_results);

		require(hashResult == results_hash[_IDtournament]);

		bytes memory updated_results = abi.encodePacked(
			_results,
			_player,
			_new_score
		);
		results_hash[_IDtournament] = keccak256(updated_results);

		emit ResultCreated(_IDtournament, _player, score_number);
	}

	function getWinners(
		uint _IDtournament,
		address[] calldata _participants
	) public onlyAdmin {}
}
