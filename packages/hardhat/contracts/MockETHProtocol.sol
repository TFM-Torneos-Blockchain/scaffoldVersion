// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockETHProtocol {
	event Approval(
		address indexed token,
		address indexed spender,
		uint256 value
	);
	event RewardClaimed(address cometAddress, address rewardsAddress);

	// State variables to store interactions for testing
	bool public started;
	bool public ended;
	uint256 public amountSupplied;
	uint256 public amountWithdrawn;
	address public lastErc20Address;
	address public lastDeFiProtocolAddress;
	uint256[] public deFiBridgeRewards;

	function initialize(address tournamentManagerAddress) public {}
	// Simulate starting the ETH interaction with the protocol
	function startETH(
		uint256 amountOfTokens,
		address[] calldata defiProtocolAddresses
	) external payable {
		started = true;
		amountSupplied = amountOfTokens;
		lastDeFiProtocolAddress = defiProtocolAddresses[0];
	}

	// Simulate ending the ETH interaction and returning rewards
	function endETH(
		uint256 amountOfTokens,
		address[] calldata defiProtocolAddresses
	) external payable returns (uint256[] memory) {
		ended = true;
		amountWithdrawn = amountOfTokens;
		lastDeFiProtocolAddress = defiProtocolAddresses[0];

		emit RewardClaimed(defiProtocolAddresses[0], defiProtocolAddresses[1]);

		uint256[] memory rewards;
		rewards[0] = amountOfTokens + 1000;

		return rewards;
	}

	function claimReward(
		address cometAddress,
		address rewardsAddress
	) external {
		emit RewardClaimed(cometAddress, rewardsAddress);
	}
}
