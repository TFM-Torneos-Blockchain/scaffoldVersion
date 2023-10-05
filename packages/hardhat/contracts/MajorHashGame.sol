// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./TB.sol";
import "./LeaderBoard.sol";

contract MajorHashGame is LeaderBoard {

	constructor(address _tournamentContractAddress) {
		tournamentContract = TournamentContract(_tournamentContractAddress);
	}

    // _results is a bytes array of the concatenation of (player_adress, player_score) for each Play in the tournament e.j: _results = bytes(add1,score1,add2,score2,...)
	function play(uint _IDtournament) public {
		require(
			tournamentContract.tournaments[_IDtournament].participants[
				_player
			] == tournamentContract.tournaments[_IDtournament].enrolment_amount,
			"You're not participating in this tournament."
		);
		// TODO require just one play per player

		// Create Player score and generate it's new_result Result
		bytes32 memory score = keccak256(
			abi.encodePacked(msg.sender, block.timestamp)
		);
		uint256 memory score_number = uint256(score);
        setResult(_IDtournament, msg.sender, score_number);
	}

}
