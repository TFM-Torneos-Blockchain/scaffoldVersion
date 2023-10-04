// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./TB.sol";
import "./LeaderBoard.sol";

contract MajorHashGame is LeaderBoard {

	constructor(address _tournamentContractAddress) {
		tournamentContract = TournamentContract(_tournamentContractAddress);
	}


	function play(uint _IDtournament, bytes calldata _results) public {
		require(
			tournamentContract.tournaments[_IDtournament].participants[
				_player
			] == tournamentContract.tournaments[_IDtournament].enrolment_amount,
			"You're not participating in this tournament."
		);
		// Create Player score and generate it's new_result Result
		bytes32 memory score = keccak256(
			abi.encodePacked(msg.sender, block.timestamp)
		);
		uint256 memory score_number = uint256(score);
        setResult(_IDtournament, _results, msg.sender,score_number);
	}

}
