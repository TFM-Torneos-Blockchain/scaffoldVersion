// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./TournamentManager.sol";

 contract MajorHashGame {

	mapping(uint16 => mapping(address => bool)) hasPlayed;
	address tournamentManagerAddress;

	constructor(address _tournamentManagerAddress) {
		tournamentManagerAddress = _tournamentManagerAddress;
	}

	// _results is a bytes array of the concatenation of (player_adress, player_score) for each Play in the tournament e.j: _results = bytes(add1,score1,add2,score2,...)
	function play(uint16 _IDtournament) public {
		require(
			TournamentManager(tournamentManagerAddress).getParticipants(_IDtournament, msg.sender) != 0,
			"You're not participating in this tournament."
		);
		require(
			hasPlayed[_IDtournament][msg.sender] == false,
			"You have already played this tournament"
		);
		// TODO require just one play per player

		// Create Player score and generate it's new_result Result
		bytes32 score = keccak256(
			abi.encodePacked(msg.sender, block.timestamp)
		);
		uint256 score_number = uint256(score);
		TournamentManager(tournamentManagerAddress).setResult(_IDtournament, msg.sender, score_number);
		hasPlayed[_IDtournament][msg.sender] = true;
	}
}
