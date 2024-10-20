// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockERC20Protocol {
	event Approval(
		address indexed token,
		address indexed spender,
		uint256 value
	);
	event Supply(address indexed token, uint256 value);
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
	// Simulate starting the ERC20 interaction with the protocol
	function startERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddresses
	) external {
		started = true;
		amountSupplied = amountOfTokens;
		lastErc20Address = erc20Addresses[0];
		lastDeFiProtocolAddress = defiProtocolAddresses[0];

		emit Approval(erc20Addresses[0], address(this), amountOfTokens);
		emit Supply(erc20Addresses[0], amountOfTokens);
	}

	// Simulate ending the ERC20 interaction and returning rewards
	function endERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddresses
	) external returns (uint256[] memory) {
		ended = true;
		amountWithdrawn = amountOfTokens;
		lastErc20Address = erc20Addresses[0];
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
