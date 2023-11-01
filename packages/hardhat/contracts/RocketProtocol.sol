// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.0;

import "./interfaces/IRocketDepositPool.sol";
import "./interfaces/IRocketTokenRETH.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract RocketProtocol is OwnableUpgradeable {
	function initialize(address tournamentManagerAddress) public initializer {
		__Ownable_init(tournamentManagerAddress);
	}

	function startETH(
		uint256 amountOfETH,
		address[] calldata defiProtocolAddress
	) external payable onlyOwner {
		// Check deposit amount
		address rocketDepositPool = defiProtocolAddress[1];
		require(
			msg.value > 0.01 ether,
			"Invalid deposit amount, minimum deposit is 0.01 ETH"
		);
		require(
			amountOfETH == msg.value,
			"The amount of sent tokens is different from the amount to stake"
		);

		IRocketDepositPool(rocketDepositPool).deposit{ value: msg.value }();
	}

	function endETH(
		uint256 amountOfETH,
		address[] calldata defiProtocolAddress
	) external onlyOwner returns (uint256) {
		address rocketTokenRETH = defiProtocolAddress[0];
		claimReward(amountOfETH, rocketTokenRETH);
		uint256 balance = address(this).balance;
		// Transfer ETH to the sender
		(bool success, ) = msg.sender.call{ value: balance }("");
		require(success, "Failed to send ETH to TM.");
		payable(msg.sender).transfer(balance);
		uint256 rewardETH = balance - amountOfETH;
		return rewardETH;
	}

	function claimReward(uint256 amountOfETH, address rocketTokenRETH) private {
		// Burn rETH for ETH
		IRocketTokenRETH(rocketTokenRETH).burn(amountOfETH);
	}
}
