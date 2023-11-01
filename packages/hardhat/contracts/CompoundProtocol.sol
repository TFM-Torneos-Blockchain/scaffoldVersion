// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/InterfaceComet.sol";
import "./interfaces/Erc20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CompoundProtocol is OwnableUpgradeable {
	event Approval(
		address indexed token,
		address indexed spender,
		uint256 value
	);
	event Supply(address indexed token, uint256 value);

	function initialize(address tournamentManagerAddress) public initializer {
		__Ownable_init(tournamentManagerAddress);
	}

	function startERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddresses
	) external onlyOwner {
		// Approve the Compound protocol contract to spend tokens
		ERC20(erc20Addresses[0]).approve(
			defiProtocolAddresses[0],
			amountOfTokens
		);

		// Emit event for approval
		emit Approval(erc20Addresses[0], address(this), amountOfTokens);

		Comet comet = Comet(defiProtocolAddresses[0]);
		comet.supply(erc20Addresses[0], amountOfTokens);

		// Emit event for supply
		emit Supply(erc20Addresses[0], amountOfTokens);
	}

	function endERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddresses
	) external onlyOwner returns (uint256[] memory) {
		withdraw(defiProtocolAddresses[0], erc20Addresses[0], amountOfTokens);
		claimReward(defiProtocolAddresses[0], defiProtocolAddresses[1]);
		uint256 totalCollected = transferERC20Token(
			erc20Addresses[0],
			msg.sender
		);
		uint256[] memory deFiBridgeRewards = new uint256[](1);
		deFiBridgeRewards[0] = totalCollected - amountOfTokens;
		return deFiBridgeRewards;
	}

	function withdraw(
		address cometAddress,
		address erc20Address,
		uint256 amount
	) private {
		Comet comet = Comet(cometAddress);
		comet.withdraw(erc20Address, amount);
	}

	function claimReward(address cometAddress, address rewardsAddress) private {
		CometRewards rewards = CometRewards(rewardsAddress);
		rewards.claim(cometAddress, address(this), true);
	}

	// Function to transfer an amount of ERC20 token
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
