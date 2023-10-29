// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./interfaces/Erc20.sol";
import "./interfaces/DeFiBridge.sol";
import "./interfaces/Clone.sol";
import "./CompoundProtocol.sol";
import "./RocketProtocol.sol";
import "./UniswapV2Protocol.sol";
import "./RoleControl.sol";

contract TournamentManager is RoleControl, CloneFactory {
	//------------------------------------------Storage-------------------------------------------------------------
	// Struct tournament
	struct Tournament {
		uint16 ID;
		uint8 min_participants;
		uint16 max_participants;
		mapping(address => uint128) participants;
		uint16 num_participants;
		uint128 enrollment_amount; // in weis
		address[] accepted_tokens;
		uint128 reward_amount; // IDEA
		uint64 init_date;
		uint64 end_date;
		address DeFiBridge_address;
		address[] DeFiProtocol_addresses;
		bytes32 results_sponge_hash;
		bytes32 merkle_root;
		bool aborted;
	}

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
		uint16 num_participants,
		uint128 collected_amount
	);
	event ResultCreated(
		uint16 indexed tournamentId,
		address indexed player,
		uint score_number
	);

	//------------------------------------------Functions-----------------------------------------------------

	function createTournament(
		uint16 _max_participants,
		uint8 _min_participants,
		uint128 _enrollment_amount,
		address[] calldata _accepted_tokens,
		uint64 _init_date,
		uint64 _end_date,
		uint8 type_of_protocol,
		address _DeFiBridge_to_clone,
		address[] calldata _DeFiProtocol_addresses
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

		newTournament.init_date = _init_date;
		newTournament.end_date = _end_date;

		if (type_of_protocol == 0) {
			CompoundProtocol clone = CompoundProtocol(
				createClone(_DeFiBridge_to_clone)
			);
			newTournament.DeFiBridge_address = address(clone);
			clone.initialize(address(this));
		} else if (type_of_protocol == 1) {
			RocketProtocol clone1 = RocketProtocol(
				createClone(_DeFiBridge_to_clone)
			);
			newTournament.DeFiBridge_address = address(clone1);
			clone1.initialize(address(this));
		} else if (type_of_protocol == 2) {
			UniswapV2Protocol clone2 = UniswapV2Protocol(
				createClone(_DeFiBridge_to_clone)
			);
			newTournament.DeFiBridge_address = address(clone2);
			clone2.initialize(address(this));
		}

		for (uint8 i = 0; i < _DeFiProtocol_addresses.length; i++) {
			newTournament.DeFiProtocol_addresses.push(
				_DeFiProtocol_addresses[i]
			);
		}
		IDcounter++;

		emit TournamentCreated(newTournament.ID);
	}

	function enrollWithERC20(uint16 idTournament) external {
		Tournament storage enrolling = tournaments[idTournament];
		require(
			enrolling.participants[msg.sender] == 0,
			"This address is already in the tournament."
		);
		require(
			enrolling.num_participants < enrolling.max_participants,
			"Tournament full"
		);

		for (uint8 i = 0; i < enrolling.accepted_tokens.length; i++) {
			require(
				ERC20(enrolling.accepted_tokens[i]).balanceOf(msg.sender) >=
					enrolling.enrollment_amount,
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

		uint128 collected_amount = enrolling.num_participants *
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
			enrolling.participants[msg.sender] == 0,
			"This address is already in the tournament."
		);
		require(
			enrolling.num_participants < enrolling.max_participants,
			"Tournament full"
		);
		require(
			msg.value == enrolling.enrollment_amount,
			"Insufficient balance"
		);

		// enrolling.enrollment_amount = enrolling.participants[msg.sender];
		enrolling.participants[msg.sender] = enrolling.enrollment_amount;

		uint128 collected_amount = enrolling.num_participants *
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
		require(
			block.timestamp > tournamentToStart.init_date,
			"Still in enrollment period"
		);
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
					tournamentToStart.num_participants
			);
		}
		IDefiBridge(tournamentToStart.DeFiBridge_address).startERC20(
			tournamentToStart.enrollment_amount *
					tournamentToStart.num_participants,
			tournamentToStart.accepted_tokens,
			tournamentToStart.DeFiProtocol_addresses
		);
	}

	function startETHTournament(
		uint16 idTournament
	) external payable onlyAdmin {
		Tournament storage tournamentToStart = tournaments[idTournament];
		require(
			block.timestamp > tournamentToStart.init_date,
			"Still in enrollment period"
		);
		if (
			tournamentToStart.num_participants <
			tournamentToStart.min_participants
		) {
			tournamentToStart.aborted = true;
		} else {
			(bool success, ) = tournamentToStart.DeFiBridge_address.call{
				value: tournamentToStart.num_participants *
					tournamentToStart.enrollment_amount
			}(
				abi.encodeWithSignature(
					"startETH(uint256)",
					tournamentToStart.num_participants *
						tournamentToStart.enrollment_amount,
					tournamentToStart.DeFiProtocol_addresses
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
				abortedTournament.enrollment_amount
			);
		}
		abortedTournament.participants[msg.sender] = 0;
	}

	function abortETH(uint16 idTournament) external payable {
		Tournament storage abortedTournament = tournaments[idTournament];
		require(abortedTournament.aborted == true);
		require(block.timestamp > abortedTournament.end_date);
		(bool os, ) = payable(msg.sender).call{
			value: abortedTournament.enrollment_amount
		}("");
		require(os);
		abortedTournament.participants[msg.sender] = 0;
	}

	// function endETHTournament(uint256 idTournament) public onlyAdmin {
	// 	// 1- Recuperar dinero del defi bridge y conocer
	// 	address defiBridgeAddress = tournaments[idTournament]
	// 		.DeFiBridge_address;
	// 	address[] DeFiProtocol_address = tournaments[idTournament]
	// 		.DeFiProtocol_address;
	// 	amount256 amount = tournaments[idTournament].num_participants *
	// 		tournaments[idTournament].enrollment_amount;
	// 	uint256 balance1 = address(this).balance;
	// 	bool success = defiBridgeAddress.call(
	// 		abi.encodeWithSignature(
	// 			"endETH(uint256,address[] calldata)",
	// 			amount,
	// 			DeFiProtocol_address
	// 		)
	// 	);
	// 	require(success, "Call failed");
	// 	uint256 balance2 = address(this).balance;
	// 	uint rewardReceived = balance2 - balance1;
	// 	// 2- Calculo de restar fees al premio
	// 	/*
	//         // restar al reward las fees pagadas por los admin
	//         uint256 total_gas = tournaments[idTournament].gasTotalAdmin + tx.gas;
	//         uint256 costeAdmin = tx.gasprice * total_gas;
	//         rewardReceived -= costeAdmin;
	// 		*/
	// 	// porcentaje del premio que va a los participantes
	// 	uint256 premio = rewardReceived * 0.8;
	// 	tournaments[idTournament].total_reward_amount[0] = premio;
	// }

	// function endERC20Tournament(uint256 idTournament) public onlyAdmin {
	// 	// 1- Recuperar tokens del defi bridge
	// 	address defiBridgeAddress = tournaments[idTournament]
	// 		.DeFiBridge_address;
	// 	address[] DeFiProtocol_address = tournaments[idTournament]
	// 		.DeFiProtocol_address;
	// 	address[] accepted_tokens = tournaments[_IDtourn].accepted_tokens[0];
	// 	uint256[] rewardReceived;
	// 	amount256 amount = tournaments[idTournament].num_participants *
	// 		tournaments[idTournament].enrollment_amount;
	// 	uint256[] balance1;
	// 	uint256[] premio;
	// 	for (uint i = 0; i < accepted_tokens.length; i++) {
	// 		balance1[i] = ERC20(accepted_tokens[i]).balanceOf(address(this));
	// 	}
	// 	bool success = defiBridgeAddress.call(
	// 		abi.encodeWithSignature(
	// 			"endERC20(uint256,address[] calldata)",
	// 			amount,
	// 			DeFiProtocol_address
	// 		)
	// 	);
	// 	require(success, "Call failed");
	// 	for (uint i = 0; i < accepted_tokens.length; i++) {
	// 		balance2 = ERC20(accepted_tokens[i]).balanceOf(address(this));
	// 		rewardReceived[i] = balance2 - balance1[i];
	// 		premio[i] = rewardReceived[i] * 0.8;
	// 		tournaments[idTournament].total_reward_amount[i] = premio[i];
	// 	}
	// }

	// // inputs IDTournament, (msg.sender), position, _merkleproof (esto no creo q os funcione proof[i].left, yo la merkle proof me la arreglaria para q el
	// // primer byte sea 1 o 0 equivalente a left right, tampoco se si se pueden hacer slice de bytes[]) si no, podeis arreglaros para q la merkle proof
	// // ya sea una bytes32[] (hasheamos cada parte de la proof ya en backend) y os mandais tambien una isLeft[] con 1 y 0 para recrear el proof[i].left
	// // la hoja yo creo que mejor la recreamos aqui con keccak256(abi.encodePacked(msg.sender,position))
	// // https://github.com/0xPolygonHermez/zkevm-contracts/blob/main/contracts/lib/DepositContract.sol
	// function getRewardAndVerify(
	// 	uint256 _IDtourn,
	// 	bool[] calldata isLeft,
	// 	uint256 position,
	// 	bytes32[] calldata _merkleProof /* hashes merkle proof */
	// ) public view returns (uint256) {
	// 	bytes memory merkleLeaf = keccak256(
	// 		abi.encodePacked(msg.msg.sender, position)
	// 	);
	// 	for (uint256 i = 0; i < isLeft.length; i++) {
	// 		if (isLeft[i]) {
	// 			merkleLeaf = keccak256(
	// 				abi.encodePacked(_merkleProof[i], merkleLeaf)
	// 			);
	// 		} else {
	// 			merkleLeaf = keccak256(
	// 				abi.encodePacked(merkleLeaf, _merkleProof[i])
	// 			);
	// 		}
	// 	}

	// 	require(merkleLeaf == merkle_root[_IDtourn]);

	// 	// 3. Devolver valor del reward
	// 	// Tened en cuenta que el primer ganador es el 0 no el 1
	// 	uint256[] memory position_winners = tournaments[_IDtourn]
	// 		.position_winners;
	// 	uint256 numWinners = position_winners.length;
	// 	int256 user_winer_position = -1;
	// 	uint256 amount = 0;
	// 	uint256 premio = tournaments[_IDtourn].total_reward_amount;
	// 	for (uint256 i = 0; i < numWinners; i++) {
	// 		if (position == position_winners[i]) {
	// 			user_winer_position = i;
	// 			break;
	// 		}
	// 	}

	// 	if (user_winer_position >= 0) {
	// 		if (numWinners == 2) {
	// 			amount = user_winer_position == 0 ? premio * 0.7 : premio * 0.3;
	// 		} else if (numWinners == 3) {
	// 			amount = user_winer_position == 0
	// 				? premio * 0.6
	// 				: user_winer_position == 1
	// 				? premio * 0.3
	// 				: premio * 0.1;
	// 		} else if (numWinners == 4) {
	// 			amount = user_winer_position == 0
	// 				? premio * 0.5
	// 				: user_winer_position == 1
	// 				? premio * 0.25
	// 				: user_winer_position == 2
	// 				? premio * 0.15
	// 				: premio * 0.10;
	// 		} else if (numWinners == 6) {
	// 			amount = user_winer_position == 0
	// 				? premio * 0.45
	// 				: user_winer_position == 1
	// 				? premio * 0.25
	// 				: user_winer_position == 2
	// 				? premio * 0.14
	// 				: user_winer_position == 3
	// 				? premio * 0.10
	// 				: user_winer_position == 4
	// 				? premio * 0.03
	// 				: premio * 0.03;
	// 		} else {
	// 			amount = user_winer_position == 0
	// 				? premio * 0.44
	// 				: user_winer_position == 1
	// 				? premio * 0.22
	// 				: user_winer_position == 2
	// 				? premio * 0.12
	// 				: user_winer_position == 3
	// 				? premio * 0.08
	// 				: user_winer_position == 4
	// 				? premio * 0.05
	// 				: user_winer_position == 5
	// 				? premio * 0.05
	// 				: user_winer_position == 6
	// 				? premio * 0.02
	// 				: premio * 0.02;
	// 		}
	// 	}
	// 	return amount;
	// }

	// function claimETHReward(
	// 	uint256 _IDtourn,
	// 	bytes calldata _merkleLeaf,
	// 	bytes[] calldata _merkleProof
	// ) public {
	// 	uint256 value = getRewardAndVerify(_IDtourn, _merkleLeaf, _merkleProof);
	// 	require(value > 0);
	// 	bool sent = msg.sender.call{ value: value }("");
	// 	require(sent, "Failed to send Ether");
	// }

	// function claimERC20Reward(
	// 	uint256 _IDtourn,
	// 	bytes calldata _merkleLeaf,
	// 	bytes[] calldata _merkleProof
	// ) public {
	// 	uint256 amount = getRewardAndVerify(
	// 		_IDtourn,
	// 		_merkleLeaf,
	// 		_merkleProof
	// 	);
	// 	require(amount > 0);
	// 	address[] accepted_tokens = tournaments[_IDtourn].accepted_tokens;
	// 	for (uint i = 0; i < accepted_tokens.length; i++) {
	// 		ERC20(address[i]).tranfer(msg.sender, amount);
	// 	}
	// }

	// Results are the concatenation of the BYTES of (address, score) for each player
	function setResult(
		uint16 _IDtournament,
		address _player,
		uint _new_score
	) external {
		// Sponge Hash with previous results_sponge_hash and new result (bytes(addressPlayer, scorePlayer)) -> hash(historic_results,new_results)
		require(
			block.timestamp >= tournaments[_IDtournament].init_date,
			"Tournament hasn't started yet"
		);
		tournaments[_IDtournament].results_sponge_hash = keccak256(
			abi.encodePacked(
				tournaments[_IDtournament].results_sponge_hash,
				_player,
				_new_score
			)
		);

		emit ResultCreated(_IDtournament, _player, _new_score);
	}

	function createLeaderBoardMerkleTree(
		uint16 _IDtournament,
		bytes calldata _results_bytes, // each element is 52 bytes: 20 for the address and 32 for the score.
		uint16[] calldata _positions
	) public {
		require(
			block.timestamp >= tournaments[_IDtournament].end_date,
			"Tournament hasn't end yet"
		);
		uint16 initial_length = uint16(_positions.length);
		// Used to ordenate the addresses and scores, and then push all merkle hashes until root.
		bytes32[] memory leaderboard_hash = new bytes32[](initial_length);

		// Check that the leaderboard ordening is correct
		bytes32 lastScore = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF; // initialize the largest score posible
		bytes32 backendSpongeHash; // With the input data we will generate another sponge hash to verify that no corrupted data has been introduced in the backend.
		// Remember: 20 bytes for the addresses and 32 bytes for the scores.
		for (uint16 i = 0; i < initial_length; i++) {
			backendSpongeHash = keccak256(
				abi.encodePacked(
					backendSpongeHash,
					_results_bytes[i * 52:(i + 1) * 52]
				)
			);
			leaderboard_hash[i] = keccak256(
				abi.encodePacked(
					_results_bytes[_positions[i] * 52:_positions[i] * 52 + 20],
					i
				)
			);
			require(
				bytes32(
					_results_bytes[_positions[i] * 52 + 20:(_positions[i] + 1) *
						52]
				) <= lastScore,
				"Data corrupted: incorrect players classification."
			); // if  tie, caller decides order.
			lastScore = bytes32(
				_results_bytes[_positions[i] * 52 + 20:(_positions[i] + 1) * 52]
			);
		}
		require(
			backendSpongeHash == tournaments[_IDtournament].results_sponge_hash,
			"Data corrupted: bad spongeHash recreation."
		);

		// Get Merkle Root with the already onrdenated leaderboard_hash
		uint16 level_leaves = initial_length; // number of leaves per level
		while (level_leaves > 1) {
			uint16 j = 0;
			for (uint16 i = 0; i < level_leaves; i += 2) {
				if (i + 1 == level_leaves) {
					leaderboard_hash[j] = leaderboard_hash[i];
				} else {
					leaderboard_hash[j] = keccak256(
						abi.encodePacked(
							leaderboard_hash[i],
							leaderboard_hash[i + 1]
						)
					);
				}
				j++;
			}
			level_leaves = (level_leaves / 2) + (level_leaves % 2);
		}
		// Store Merkle Root (last position of the leaderboard_hash)
		tournaments[_IDtournament].merkle_root = leaderboard_hash[0];
	}

	// Getter function for participants of a tournament
	function getParticipants(
		uint16 tournamentId,
		address participantAddress
	) public view returns (uint128) {
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

	function getMerkleRoot(uint16 tournamentId) public view returns (bytes32) {
		return tournaments[tournamentId].merkle_root;
	}

	// Getter function for participants of a tournament
	function getSpongeHash(uint16 tournamentId) public view returns (bytes32) {
		return tournaments[tournamentId].results_sponge_hash;
	}
}
