// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./interfaces/Erc20.sol";
import "./interfaces/DeFiBridge.sol";
import "./RoleControl.sol";

contract TournamentContract is RoleControl {
	//------------------------------------------Storage-------------------------------------------------------------
	// Struct tournament
	struct Tournament {
		uint16 ID;
		uint8 min_participants;
		uint16 max_participants;
		mapping(address => uint16) participants;
		uint16 num_participants;
		uint16 enrollment_amount;
		address[] accepted_tokens;
		uint256 reward_amount; // IDEA
		uint256 init_date;
		uint256 end_date;
		address DeFiBridge_address;
		address DeFiProtocol_address;
		bool aborted;
	}

	// Tournament tournament;
	// Array tournaments
	Tournament[] public tournaments;
	// ID IDcounter para el ID del torneo
	uint16 IDcounter;

	//--------------------------------------------Events------------------------------------------------------
	event AdminAdded(address indexed admin);
	event TournamentCreated(uint16 indexed tournamentID);
	event Enroll(
		uint16 indexed tournament_id,
		address indexed user,
		uint256 num_participants,
		uint256 collected_amount
	);

	//------------------------------------------Functions-----------------------------------------------------

	function createTournament(
		uint16 _max_participants,
		uint8 _min_participants,
		uint8 _enrollment_amount,
		address[] calldata _accepted_tokens,
		uint8 _enrollment_time,
		uint8 _tournament_duration,
		address _DeFiBridge_address,
		address _DeFiProtocol_address
	) external onlyAdmin {
		tournaments.push();
		Tournament storage newTournament = tournaments[IDcounter];

		newTournament.ID = IDcounter;

		newTournament.min_participants = _min_participants;
		newTournament.max_participants = _max_participants;

		newTournament.enrollment_amount = _enrollment_amount;
		for (uint8 i = 0; i < _accepted_tokens.length; i++) {
			newTournament.accepted_tokens.push(_accepted_tokens[i]);
		}

		newTournament.init_date = block.timestamp + _enrollment_time * 1 days;
		newTournament.end_date =
			block.timestamp +
			newTournament.init_date +
			_tournament_duration *
			1 days;

		newTournament.DeFiBridge_address = _DeFiBridge_address;
		newTournament.DeFiProtocol_address = _DeFiProtocol_address;

		IDcounter++;

		emit TournamentCreated(newTournament.ID);
	}

	function enrollWithERC20(uint16 idTournament) external {
		Tournament storage enrolling = tournaments[idTournament];
		require(
			enrolling.num_participants < enrolling.max_participants,
			"Tournament full"
		);

		for (uint8 i = 0; i < enrolling.accepted_tokens.length; i++) {
			require(
				ERC20(enrolling.accepted_tokens[i]).balanceOf(msg.sender) >=
					enrolling.enrollment_amount * 1 ether,
				"Insufficient balance"
			);
			ERC20(enrolling.accepted_tokens[i]).transferFrom(
				msg.sender,
				address(this),
				enrolling.enrollment_amount * 1 ether
			);
		}

		enrolling.participants[msg.sender] = enrolling.enrollment_amount;

		enrolling.num_participants++;

		uint collected_amount = enrolling.num_participants *
			enrolling.enrollment_amount;
		emit Enroll(
			enrolling.ID,
			msg.sender,
			enrolling.num_participants,
			collected_amount
		);
	}

	function enrollWithETH(uint16 idTournament) external payable {
		Tournament storage enrolling = tournaments[idTournament];
		require(
			enrolling.num_participants < enrolling.max_participants,
			"Tournament full"
		);
		require(
			msg.value == enrolling.enrollment_amount * 1 ether,
			"Insufficient balance"
		);

		// enrolling.enrollment_amount = enrolling.participants[msg.sender];
		enrolling.participants[msg.sender] = enrolling.enrollment_amount;

		uint collected_amount = enrolling.num_participants *
			enrolling.enrollment_amount;
		enrolling.num_participants++;
		emit Enroll(
			enrolling.ID,
			msg.sender,
			enrolling.num_participants,
			collected_amount
		);
	}

	function startERC20Tournament(uint16 idTournament) external onlyAdmin {
		Tournament storage tournamentToStart = tournaments[idTournament];
		require(block.timestamp > tournamentToStart.init_date);
		if (
			tournamentToStart.num_participants <
			tournamentToStart.min_participants
		) {
			tournamentToStart.aborted = true;
			return;
		}
		for (uint8 i = 0; i < tournamentToStart.accepted_tokens.length; i++) {
			ERC20(tournamentToStart.accepted_tokens[i]).transfer(
				tournamentToStart.DeFiBridge_address,
				tournamentToStart.enrollment_amount *
					tournamentToStart.num_participants *
					1 ether
			);
		}
		DEFIBRIDGE(tournamentToStart.DeFiBridge_address).start(
			tournamentToStart.num_participants *
				tournamentToStart.enrollment_amount,
			tournamentToStart.accepted_tokens
		);
	}

	function startETHTournament(
		uint16 idTournament
	) external payable onlyAdmin {
		Tournament storage tournamentToStart = tournaments[idTournament];
		require(block.timestamp > tournamentToStart.init_date);
		if (
			tournamentToStart.num_participants <
			tournamentToStart.min_participants
		) {
			tournamentToStart.aborted = true;
		} else {
			(bool success, ) = tournamentToStart.DeFiBridge_address.call{
				value: tournamentToStart.num_participants *
					tournamentToStart.enrollment_amount *
					1 ether
			}(
				abi.encodeWithSignature(
					"startETH(uint256)",
					tournamentToStart.num_participants *
						tournamentToStart.enrollment_amount
				)
			);
			require(success, "Call failed");
		}
	}

	function abortERC20(uint16 idTournament) external {
		Tournament storage abortedTournament = tournaments[idTournament];
		require(abortedTournament.aborted == true);
		// require(block.timestamp > abortedTournament.end_date); TODO falta require
		// if (abortedTournament.accepted_tokens.length > 1) {
		for (uint8 i = 0; i < abortedTournament.accepted_tokens.length; i++) {
			ERC20(abortedTournament.accepted_tokens[i]).transfer(
				address(msg.sender),
				abortedTournament.enrollment_amount * 1 ether
			);
		}
		// } else {
		// 	ERC20(abortedTournament.accepted_tokens[0]).transfer(
		// 		address(msg.sender),
		// 		abortedTournament.enrollment_amount * 1 ether
		// 	);
		// }
		abortedTournament.participants[msg.sender] = 0;
	}

	function abortETH(uint16 idTournament) external payable {
		Tournament storage abortedTournament = tournaments[idTournament];
		require(abortedTournament.aborted == true);
		require(block.timestamp > abortedTournament.end_date);
		(bool os, ) = payable(msg.sender).call{
			value: abortedTournament.enrollment_amount * 1 ether
		}("");
		require(os);
		abortedTournament.participants[msg.sender] = 0;
	}

	function endTournament(uint256 idTournament) public onlyAdmin {}

	// Getter function for participants of a tournament
	function getParticipants(
		uint16 tournamentId,
		address participantAddress
	) public view returns (uint16) {
		require(tournamentId < tournaments.length, "Invalid tournament ID");
		return tournaments[tournamentId].participants[participantAddress];
	}

	// Getter function for accepted tokens of a tournament
	function getAcceptedTokens(
		uint16 tournamentId
	) public view returns (address[] memory) {
		require(tournamentId < tournaments.length, "Invalid tournament ID");
		return tournaments[tournamentId].accepted_tokens;
	}

	// Getter function for retrieve the Positions of the structs for ERC20 and ETH tournaments
	function getIDSArray()
		public
		view
		returns (uint[] memory ETHArray, uint[] memory ERC20Array)
	{
		uint[] memory tempETHArray = new uint[](tournaments.length);
		uint[] memory tempERC20Array = new uint[](tournaments.length);
		uint ethArrayCount = 0;
		uint erc20ArrayCount = 0;

		for (uint16 i = 0; i < tournaments.length; i++) {
			if (tournaments[i].accepted_tokens.length == 0) {
				tempETHArray[ethArrayCount] = tournaments[i].ID;
				ethArrayCount++;
			} else {
				tempERC20Array[erc20ArrayCount] = tournaments[i].ID;
				erc20ArrayCount++;
			}
		}

		// Resize the arrays to their actual size
		ETHArray = new uint[](ethArrayCount);
		ERC20Array = new uint[](erc20ArrayCount);

		for (uint i = 0; i < ethArrayCount; i++) {
			ETHArray[i] = tempETHArray[i];
		}

		for (uint i = 0; i < erc20ArrayCount; i++) {
			ERC20Array[i] = tempERC20Array[i];
		}

		return (ETHArray, ERC20Array);
	}
}
