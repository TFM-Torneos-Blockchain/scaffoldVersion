// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

interface ITournamentManager {
	/**
	 * @notice Starts the process to start the DeFi protocol
	 * @param _amount_of_tokens The amount of tokens which will be invested in the protocol
	 * @param _0xERC20Addresses The ERC20 token address which will be used for the protocol
	 */

	struct TournamentData {
		uint16 ID;
		uint8 minParticipants;
		uint16 maxParticipants;
		mapping(address => bool) isParticipant;
		uint16 numParticipants;
		uint256 enrollmentAmount; // in Wei
		address[] acceptedTokens;
		uint256[] totalRewardAmount; // Only rewards
		uint64 initDate;
		uint64 endDate;
		address deFiBridgeAddress;
		address[] deFiProtocolAddresses;
		bytes32 resultsSpongeHash;
		bytes32 merkleRoot;
		bool aborted;
	}

	function setResult(
		uint16 idTournament,
		address player,
		uint256 newScore
	) external;

	function getParticipants(
		uint16 idTournament,
		address participantAddress
	) external view returns (bool);
}
