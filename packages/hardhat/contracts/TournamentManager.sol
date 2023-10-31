// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./interfaces/Erc20.sol";
import "./interfaces/IDeFiBridge.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TournamentManager is Ownable(msg.sender) {
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
		uint128[] total_reward_amount; // IDEA
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
		address _DeFiBridge_to_clone,
		address[] calldata _DeFiProtocol_addresses
	) external onlyOwner {
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

		newTournament.DeFiBridge_address = Clones.clone(_DeFiBridge_to_clone);
		IDefiBridge(newTournament.DeFiBridge_address).initialize(address(this));

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

	function startERC20Tournament(uint16 idTournament) external onlyOwner {
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
	) external payable onlyOwner {
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
					"startETH(uint256,address[] calldata)",
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

	function endERC20Tournament(uint16 idTournament) public onlyOwner {
		Tournament storage tournamentToEnd = tournaments[idTournament];

		uint128[] memory DeFiBridgeReward = IDefiBridge(
			tournamentToEnd.DeFiBridge_address
		).endERC20(
				tournamentToEnd.num_participants *
					tournamentToEnd.enrollment_amount,
				tournamentToEnd.accepted_tokens,
				tournamentToEnd.DeFiProtocol_addresses
			);
		for (uint i = 0; i < tournamentToEnd.accepted_tokens.length; i++) {
			uint128 playersReward = (DeFiBridgeReward[i] * 8) / 10;
			tournamentToEnd.total_reward_amount[i] = playersReward;
			ERC20(tournamentToEnd.accepted_tokens[i]).transfer(
				msg.sender,
				(DeFiBridgeReward[i] * 2) / 10
			);
		}
	}

	function endETHTournament(uint16 idTournament) public onlyOwner {
		// 1- Recuperar dinero del defi bridge y conocer
		Tournament storage tournamentToEnd = tournaments[idTournament];

		uint128 DeFiBridgeReward = IDefiBridge(
			tournamentToEnd.DeFiBridge_address
		).endETH(
				tournamentToEnd.num_participants *
					tournamentToEnd.enrollment_amount,
				tournamentToEnd.DeFiProtocol_addresses
			);

		tournamentToEnd.total_reward_amount[0] = (DeFiBridgeReward * 8) / 10;
		(bool os, ) = payable(msg.sender).call{
			value: (DeFiBridgeReward * 2) / 10
		}("");
		require(os);
	}

	function verifyAndClaim(
		uint16 _IDtourn,
		bool[] calldata isLeft,
		uint16 position,
		bytes32[] calldata _merkleProof /* hashes merkle proof */
	) public {
		Tournament storage endedTournament = tournaments[_IDtourn];

		require(
			endedTournament.participants[msg.sender] != 0,
			"You already claimed your award!!!"
		);

		if (position == 2 ** 16 - 1) {
			if (endedTournament.accepted_tokens.length == 0) {
				(bool success, ) = msg.sender.call{
					value: endedTournament.enrollment_amount
				}("");
				require(success, "Failed to claim Ether");
				endedTournament.participants[msg.sender] = 0;
				return;
			}
			for (uint i = 0; endedTournament.accepted_tokens.length < i; i++) {
				ERC20(endedTournament.accepted_tokens[i]).transfer(
					msg.sender,
					endedTournament.enrollment_amount
				);
			}
			endedTournament.participants[msg.sender] = 0;

			return;
		}

		bytes32 merkleLeaf = keccak256(abi.encodePacked(msg.sender, position));
		for (uint256 i = 0; i < isLeft.length; i++) {
			if (isLeft[i]) {
				merkleLeaf = keccak256(
					abi.encodePacked(_merkleProof[i], merkleLeaf)
				);
			} else {
				merkleLeaf = keccak256(
					abi.encodePacked(merkleLeaf, _merkleProof[i])
				);
			}
		}

		require(
			merkleLeaf == endedTournament.merkle_root,
			"You are not participating in this tournament!"
		);

		if (endedTournament.accepted_tokens.length == 0) {
			uint256[] memory payouts = getPayoutStructure(
				endedTournament.num_participants
			);
			uint256 reward = (endedTournament.total_reward_amount[0] *
				payouts[position]) / 100;

			(bool success, ) = msg.sender.call{
				value: reward + endedTournament.enrollment_amount
			}("");
			require(success, "Failed to send Ether");
			endedTournament.participants[msg.sender] = 0;
			return;
		}
		for (uint i = 0; endedTournament.accepted_tokens.length < i; i++) {
			uint256[] memory payouts = getPayoutStructure(
				endedTournament.num_participants
			);
			uint256 reward = (endedTournament.total_reward_amount[i] *
				payouts[position]) / 100;

			ERC20(endedTournament.accepted_tokens[i]).transfer(
				msg.sender,
				reward + endedTournament.enrollment_amount
			);
		}
		endedTournament.participants[msg.sender] = 0;
	}

	function getPayoutStructure(
		uint16 numParticipants
	) internal pure returns (uint256[] memory) {
		if (numParticipants <= 10) {
			uint256[] memory payout = new uint256[](numParticipants);
			payout[0] = 70;
			if (numParticipants == 2) {
				payout[1] = 30;
			}
			return payout;
		} else if (numParticipants <= 31) {
			uint256[] memory payout = new uint256[](numParticipants);
			payout[0] = 60;
			payout[1] = 30;
			payout[2] = 10;
			return payout;
		} else if (numParticipants <= 63) {
			uint256[] memory payout = new uint256[](numParticipants);
			payout[0] = 50;
			payout[1] = 25;
			payout[2] = 15;
			payout[3] = 10;
			return payout;
		} else if (numParticipants <= 80) {
			uint256[] memory payout = new uint256[](numParticipants);
			payout[0] = 45;
			payout[1] = 25;
			payout[2] = 14;
			payout[3] = 10;
			payout[4] = 3;
			payout[5] = 3;
			return payout;
		} else {
			uint256[] memory payout = new uint256[](numParticipants);
			payout[0] = 44;
			payout[1] = 22;
			payout[2] = 12;
			payout[3] = 8;
			payout[4] = 5;
			payout[5] = 5;
			payout[6] = 2;
			payout[7] = 2;
			return payout;
		}
	}

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
