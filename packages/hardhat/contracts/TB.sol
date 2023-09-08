// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

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
    event Enroll(uint indexed tournament_id, address indexed user, uint num_participants, uint collected_amount);
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

		// Initialize to 0 the deposits mapping for this tournament
        // newTournament.deposits[address(0x0)][address(0x0)] = 0;
        
		counter++;

		emit TournamentCreated(newTournament.ID);
	}

	// enroll--> apuntarse al torneo: reunir todo el dinero en el contrato VS ir mandando el dinero al defi bridge
	function enroll(uint256 idTournament) external {
        Tournament storage enrolling = tournaments[idTournament];
        enrolling.participants.push(msg.sender);
        // ERC20(enrolling.accepted_tokens[0])transferfrom ????
        // enrolling.deposits[msg.sender][enrolling.accepted_tokens[0]] = enrolling.enrollment_amount;
        // enrolling.num_participants++;
        // enrolling.collected_amount += enrolling.enrollment_amount;
        uint collected_amount = enrolling.participants.length*enrolling.enrollment_amount;
        emit Enroll(enrolling.ID, msg.sender, enrolling.participants.length, collected_amount);
    }

	// startTournament -->llamar desde front empezar el torneo: mandar el dinero al protocolo y empezar el defi VS comenzar el defi
	function startTournament() external onlyAdmin {}

	//llamar desde front--> llamar a la función de transfer del defi bridge para devolver el dinero + premio - coste de los admin - beneficio empresa
	function endTournament(uint256 idTournament) public onlyAdmin {}

	// abort --> se aborta el torneo porque no se cumplen los requisitos minimos
	function abort() public onlyAdmin {}
}
