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
		uint256 total_reward_amount; 
        uint256[] position_winners; // [8,2,5]
        mapping(address => uint256) positions_enroll; // Guardado durante el setLeaderBoard
		uint256 init_date;
		uint256 end_date;
		address DeFiBridge_address;
		address DeFiProtocol_address;
		bool aborted;
	}
    mapping(uint256 => bytes32) results_hash;
    mapping(uint256 => bytes32) merkle_root;

	// Tournament tournament;
	// Array tournaments
	Tournament[] public tournaments;
	// ID IDcounter para el ID del torneo
	uint16 IDcounter;

	//--------------------------------------------Events------------------------------------------------------
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
		// TODO require/accept/manage more than one participation per player/address
		Tournament storage enrolling = tournaments[idTournament];
		require(
			enrolling.num_participants < enrolling.max_participants,
			"Tournament full"
		);

		for (uint8 i = 0; i < enrolling.accepted_tokens.length; i++) {
			require(
				ERC20(enrolling.accepted_tokens[i]).balanceOf(msg.sender) >=
					enrolling.enrollment_amount ,
				"Insufficient balance."
			);
			ERC20(enrolling.accepted_tokens[i]).transferFrom(
				msg.sender,
				address(this),
				enrolling.enrollment_amount
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
		// TODO require/accept/manage more than one participation per player/address
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
		for (uint8 i = 0; i < abortedTournament.accepted_tokens.length; i++) {
			ERC20(abortedTournament.accepted_tokens[i]).transfer(
				address(msg.sender),
				abortedTournament.enrollment_amount * 1 ether
			);
		}
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

	//llamar desde front--> llamar a la función de transfer del defi bridge para devolver el dinero + premio - coste de los admin - beneficio empresa
    function endETHTournament(uint256 idTournament) public onlyAdmin { 
        // 1- Recuperar dinero del defi bridge y conocer
       uint rewardReceived = 1 ether;
        // 2- Calculo de restar fees al premio
            // restar al reward las fees pagadas por los admin
            uint256 total_gas = tournaments[idTournament].gasTotalAdmin + tx.gas;
            uint256 costeAdmin = tx.gasprice * total_gas;
            rewardReceived -= costeAdmin;
            // Sumamos al balance los gastos de los admin y la tarifa
            contractBalance += costeAdmin + 0.1 * rewardReceived;
            // porcentaje del premio que va a los participantes
            uint256 premio = rewardReceived * 0.9;
            tournaments[idTournament].total_reward_amount = premio;
            
        // 3- transferir dinero + premio - coste de los admin - beneficio empresa
       
    }
    
	// inputs IDTournament, (msg.sender), position, _merkleproof (esto no creo q os funcione proof[i].left, yo la merkle proof me la arreglaria para q el 
	// primer byte sea 1 o 0 equivalente a left right, tampoco se si se pueden hacer slice de bytes[]) si no, podeis arreglaros para q la merkle proof
	// ya sea una bytes32[] (hasheamos cada parte de la proof ya en backend) y os mandais tambien una isLeft[] con 1 y 0 para recrear el proof[i].left
	// la hoja yo creo que mejor la recreamos aqui con keccak256(abi.encodePacked(msg.sender,position))
	// https://github.com/0xPolygonHermez/zkevm-contracts/blob/main/contracts/lib/DepositContract.sol
    function getRewardAndVerify(uint256 _IDtourn, bytes _merkleLeaf, bytes[] calldata _merkleProof) public view returns(uint256) {
       bytes data = _merkleLeaf;
       for (uint256 i = 0; i < _merkleProof.length; i++) 
       {
        if (proof[i].left) {
            data = keccak256(abi.encodePacked(_merkleProof[i].data,data));
        }
        else { data = keccak256(abi.encodePacked(data,_merkleProof[i].data))}
       };
       require(data == merkle_root(_IDtourn));

       // 3. Devolver valor del reward
	   // Tened en cuenta que el primer ganador es el 0 no el 1
       uint256 position = positions_enroll(msg.sender);
       uint256 numWinners = position_winners.length;
       int256 user_winer_position = -1;
       uint256 amount = 0;
       uint256 premio = tournaments[_IDtourn].total_reward_amount;
        for (uint256 i = 0; i < numWinners; i++) 
        {
            if (position == position_winners[i]) {
                user_winer_position = i;
                break;
            }
        };
       
        if (user_winer_position >= 0) {
            if (numWinners == 2) {
                amount = user_winer_position == 0 ? premio*0.7 : premio * 0.3;
            }
            else if(numWinners == 3){
                amount = user_winer_position == 0 ? premio*0.6 : user_winer_position == 1 ? premio*0.3 : premio*0.1;
            }
            else if (numWinners == 4){
                amount = user_winer_position == 0 ? premio*0.5 : user_winer_position == 1 ?  premio*0.25 : user_winer_position == 2 ? premio*0.15 : premio *0.10;
            }
            else if (numWinners == 6){
                amount = user_winer_position == 0 
                ? premio*0.45 : user_winer_position == 1 
                ? premio*0.25 : user_winer_position == 2 
                ? premio*0.14 : user_winer_position == 3
                ? premio*0.10 : user_winer_position == 4
                ? premio*0.03 : premio * 0.03;
            }
            else {
                amount = user_winer_position == 0 
                ? premio*0.44 : user_winer_position == 1 
                ? premio*0.22 : user_winer_position == 2 
                ? premio*0.12 : user_winer_position == 3
                ? premio*0.08 : user_winer_position == 4
                ? premio*0.05 : user_winer_position == 5 
                ? premio*0.05 : user_winer_position == 6 
                ? premio*0.02 : premio*0.02;
            }
        }
        return amount;
    }
  
  
    function claimETHReward(uint256 _IDtourn, bytes _merkleLeaf, bytes[] calldata _merkleProof) public {
        uint256 value = getRewardAndVerify( _IDtourn,  _merkleLeaf,  _merkleProof);
        require(value > 0);
        (bool sent, bytes memory data) = msg.sender.call{value: value}("");
        require(sent,"Failed to send Ether");
    }

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