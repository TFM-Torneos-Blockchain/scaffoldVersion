// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./interfaces/ITournamentManager.sol";

contract MajorHashGame {
	ITournamentManager public TournamentManager;
	mapping(address => bool) hasPlayed;

	constructor(address tournamentManagerAddress) {
		TournamentManager = ITournamentManager(tournamentManagerAddress);
	}

	// "_results" is a bytes array of the concatenation of (player_address, player_score) for each play in the tournament. For example, "_results" = bytes(add1, score1, add2, score2, ...)
	function play(uint16 idTournament) public {
		require(
			TournamentManager.getParticipants(idTournament, msg.sender),
			"You're not participating in this tournament."
		);
		require(
			hasPlayed[msg.sender] == false,
			"You have already played this tournament"
		);

		// Create player score and generate its new result
		bytes32 score = keccak256(
			abi.encodePacked(msg.sender, block.timestamp)
		);
		uint256 scoreNumber = uint256(score);
		TournamentManager.setResult(idTournament, msg.sender, scoreNumber);
		hasPlayed[msg.sender] = true;
	}
}
