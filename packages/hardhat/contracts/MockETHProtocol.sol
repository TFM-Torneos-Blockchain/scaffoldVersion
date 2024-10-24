// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

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
		uint256 amountOfETH,
		address[] calldata defiProtocolAddresses
	) external payable {
		started = true;
		amountSupplied = amountOfETH;
		lastDeFiProtocolAddress = defiProtocolAddresses[0];
	}

	// Simulate ending the ETH interaction and returning rewards
	function endETH(
		uint256 amountOfETH,
		address[] calldata defiProtocolAddresses
	) external payable returns (uint256) {
		uint256 balance = address(this).balance;
		ended = true;
		amountWithdrawn = amountOfETH;
		lastDeFiProtocolAddress = defiProtocolAddresses[0];

		emit RewardClaimed(defiProtocolAddresses[0], defiProtocolAddresses[1]);
		uint256 rewardETH = balance - amountOfETH;

		// Transfer ETH to the sender
		(bool success, ) = msg.sender.call{ value: balance }("");
		require(success, "Failed to send ETH to TM.");

		return rewardETH;
	}

	// Add a receive function to allow the contract to accept plain ETH transfers
	receive() external payable {}
}
