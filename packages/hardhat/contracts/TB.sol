// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./interfaces/Erc20.sol";
import "./interfaces/DeFiBridge.sol";

contract TournamentContract {
	//------------------------------------------Storage-------------------------------------------------------------
	// Struct tournament
	struct Tournament {
		uint256 ID; // como obtener ID único --> ¿keccak de algo? ¿random number oracle? ¿counter?
		uint256 max_participants;
		uint256 min_participants;
		address[] participants;
		// uint256 num_participants;
		uint256 enrollment_amount;
		// Campos necesarios para algún protocolo DeFi en concreto: pools
		//uint256 max_tokens;??
		//uint256 min_tokens;??
		address[] accepted_tokens; // DeFi pools o stake de varios tokens
		// IDEA i think i won't add this mapping... why would we want this information??
		// We could just have an array with all the participants, so we could have the .length which will
		// help us avoiding to have the num_participants and collected_amount variables
		// mapping(address => mapping(address => uint256)) deposits; // participant => address ERC20 token => amount token
		// uint256 collected_amount;

		uint256 reward_amount; // IDEA
		uint256 init_date;
		uint256 end_date;
		address DeFiBridge_address; // estan los triggers de los protocolos DeFi
		address DefiProtocol_address; //
		bool aborted;
	}
	Tournament tournament;
	// Mapping admins
	mapping(address => bool) public admins;
	// Array tournaments
	Tournament[] public tournaments;
	// ID counter para el ID del torneo
	uint256 counter;

	// DUDA --> array tournaments VS mapping de ID->Struct ¿Lo mas barato?
	//----------------------------------------------Constructor--------------------------------------------------
	constructor() {
		admins[msg.sender] = true;
	}

	//--------------------------------------------Events------------------------------------------------------
	event AdminAdded(address indexed admin);
	event TournamentCreated(uint256 indexed tournamentID);
	event Enroll(
		uint indexed tournament_id,
		address indexed user,
		uint num_participants,
		uint collected_amount
	);
	//------------------------------------------Functions-----------------------------------------------------
	modifier onlyAdmin() {
		require(admins[msg.sender], "Restricted to admins");
		_;
	}

	// Read-only functions

	// Change-state functions
	// addAdmin -> añade un admin al mapping de admins del storage
	function addAdmin(address _newAdmin) external onlyAdmin {
		require(!admins[_newAdmin], "This account is already an Admin");
		admins[_newAdmin] = true;
		emit AdminAdded(_newAdmin);
	}

	// createTournament --> añade un torneo al array tournament o mapping tournament (falta por discutir que utilizar en storage)
	function createTournament(
		uint256 _max_participants,
		uint256 _min_participants,
		uint256 _enrollment_amount,
		address[] calldata accepted_tokens,
		uint256 _init_date,
		uint256 _end_date,
		address _DeFiBridge_address
	) external onlyAdmin {
		tournaments.push();
		Tournament storage newTournament = tournaments[counter];
		newTournament.ID = counter;
		newTournament.max_participants = _max_participants;
		newTournament.min_participants = _min_participants;
		newTournament.enrollment_amount = _enrollment_amount;
		newTournament.accepted_tokens = accepted_tokens;
		newTournament.init_date = _init_date;
		newTournament.end_date = _end_date;
		newTournament.DeFiBridge_address = _DeFiBridge_address;

		counter++;

		emit TournamentCreated(newTournament.ID);
	}

	// enroll--> apuntarse al torneo: reunir todo el dinero en el contrato VS ir mandando el dinero al defi bridge
	function enrollWithERC20(uint256 idTournament) external {
		Tournament storage enrolling = tournaments[idTournament];
		require(
			enrolling.participants.length <= enrolling.max_participants,
			"Tournament full"
		);
		require(
			ERC20(enrolling.accepted_tokens[0]).balanceOf(msg.sender) >=
				enrolling.enrollment_amount,
			"Insufficient balance"
		);
		enrolling.participants.push(msg.sender);
		ERC20(enrolling.accepted_tokens[0]).transferFrom(
			msg.sender,
			address(this),
			enrolling.enrollment_amount
		);
		if (enrolling.accepted_tokens.length > 1) {
			uint i;
			for (i = 1; i == enrolling.accepted_tokens.length; i++) {
				ERC20(enrolling.accepted_tokens[i]).transferFrom(
					msg.sender,
					address(this),
					enrolling.enrollment_amount
				);
			}
		}
		uint collected_amount = enrolling.participants.length *
			enrolling.enrollment_amount;
		emit Enroll(
			enrolling.ID,
			msg.sender,
			enrolling.participants.length,
			collected_amount
		);
	}


	function enrollWithETH(uint idTournament) external payable {
		Tournament storage enrolling = tournaments[idTournament];
		require(
			enrolling.participants.length <= enrolling.max_participants,
			"Tournament full"
		);
		require(
			msg.value == enrolling.enrollment_amount,
			"Insufficient balance"
		);
		enrolling.participants.push(msg.sender);
		uint collected_amount = enrolling.participants.length *
			enrolling.enrollment_amount;
		emit Enroll(
			enrolling.ID,
			msg.sender,
			enrolling.participants.length,
			collected_amount
		);
	}

	// startTournament -->llamar desde front empezar el torneo: mandar el dinero al protocolo y empezar el defi VS comenzar el defi
	function startERC20Tournament(uint idTournament) external onlyAdmin {
		Tournament storage tournamentToStart = tournaments[idTournament];
		// If the condition is not met, trigger another function
		if (
			tournamentToStart.participants.length <
			tournamentToStart.min_participants
		) {
			// Call another function here
			abort();
		} else {
			ERC20(tournamentToStart.accepted_tokens[0]).transfer(
				tournamentToStart.DeFiBridge_address,
				tournamentToStart.enrollment_amount *
					tournamentToStart.participants.length
			);
			if (tournamentToStart.accepted_tokens.length > 1) {
				uint i;
				for (
					i = 1;
					i == tournamentToStart.accepted_tokens.length;
					i++
				) {
					ERC20(tournamentToStart.accepted_tokens[i]).transfer(
						tournamentToStart.DeFiBridge_address,
						tournamentToStart.enrollment_amount *
							tournamentToStart.participants.length
					);
				}
			}
			DEFIBRIDGE(tournamentToStart.DeFiBridge_address).start(
				tournamentToStart.participants.length *
					tournamentToStart.enrollment_amount,
				tournamentToStart.accepted_tokens
			);
		}
	}

	// startTournament -->llamar desde front empezar el torneo: mandar el dinero al protocolo y empezar el defi VS comenzar el defi
	function startETHTournament(uint idTournament) external payable onlyAdmin {
		Tournament storage tournamentToStart = tournaments[idTournament];
		// If the condition is not met, trigger another function
		if (
			tournamentToStart.participants.length <
			tournamentToStart.min_participants
		) {
			// Call another function here
			abort();
		} else {
			// require(
			// 	msg.value ==
			// 		tournamentToStart.enrollment_amount *
			// 			tournamentToStart.participants.length
			// );
			(bool success, ) = tournamentToStart
				.DeFiBridge_address
				.call{
				value: tournamentToStart.participants.length *
					tournamentToStart.enrollment_amount * 1 ether
			}(
				abi.encodeWithSignature(
					"startETH(uint256)",
					tournamentToStart.participants.length *
						tournamentToStart.enrollment_amount
				)
			);
			require(success, "Call failed");
		}
	}

	//llamar desde front--> llamar a la función de transfer del defi bridge para devolver el dinero + premio - coste de los admin - beneficio empresa
	function endTournament(uint256 idTournament) public onlyAdmin {}

	// abort --> se aborta el torneo porque no se cumplen los requisitos minimos
	function abort() public onlyAdmin {}
}
