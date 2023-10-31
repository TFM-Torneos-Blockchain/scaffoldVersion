// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

interface ITournamentManager {
	/**
	 * @notice Starts the process to start the DeFi protocol
	 * @param _amount_of_tokens The amount of tokens which will be invested in the protocol
	 * @param _0xERC20Addresses The ERC20 token address which will be used for the protocol
	 */

	struct Tournament {
		uint16 ID;
		uint8 min_participants;
		uint16 max_participants;
		mapping(address => uint128) participants;
		uint16 num_participants;
		uint128 enrollment_amount;
		address[] accepted_tokens;
		uint128 reward_amount;
		uint64 init_date;
		uint64 end_date;
		address DeFiBridge_address;
		address[] DeFiProtocol_addresses;
		bytes32 results_sponge_hash;
		bytes32 merkle_root;
		bool aborted;
	}

	function setResult(
		uint16 _IDtournament,
		address _player,
		uint _new_score
	) external;

	function getParticipants(
		uint16 tournamentId,
		address participantAddress
	) external view returns (uint128);
}
