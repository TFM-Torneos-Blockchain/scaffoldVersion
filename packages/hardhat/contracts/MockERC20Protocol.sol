// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/Erc20.sol";

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
		uint256 totalCollected = transferERC20Token(
			erc20Addresses[0],
			msg.sender
		);

		uint256[] memory deFiBridgeRewards = new uint256[](1);
		deFiBridgeRewards[0] = totalCollected - amountOfTokens;

		return deFiBridgeRewards;
	}

	function transferERC20Token(
		address tokenAddress,
		address to
	) private returns (uint256) {
		ERC20 token = ERC20(tokenAddress);
		uint256 amount = token.balanceOf(address(this));
		bool succeed = token.transfer(to, amount);
		require(succeed, "Transfer failed.");
		return amount;
	}
}
