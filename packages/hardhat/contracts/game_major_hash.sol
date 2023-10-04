// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./TB.sol";

contract MajorHashGame {
	TournamentContract tournamentContract;

	address[] public winners;

	constructor(address _tournamentContractAddress) {
		tournamentContract = TournamentContract(_tournamentContractAddress);
	}

	function getPlayers(uint _IDtournament) public view {
		require(
			tournamentContract.tournaments[_IDtournament].participants[
				msg.sender
			] == tournamentContract.tournaments[_IDtournament].enrolment_amount,
			"You're not participating in this tournament."
		);
	}
}
