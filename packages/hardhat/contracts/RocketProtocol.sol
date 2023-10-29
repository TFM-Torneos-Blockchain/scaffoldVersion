// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >0.5.0 <0.9.0;

import "./interfaces/IRocketDepositPool.sol";
import "./interfaces/IRocketTokenRETH.sol";

contract RocketProtocol {
	bool private initialized;
	address public admin;

	// Change-State functions

	function initialize(address set_admin) public {
		require(!initialized, "Contract instance has already been initialized");
		admin = set_admin;
	}

	function startETH(
		uint256 _amount_of_ETH,
		address[] calldata _defiProtocolAddress
	) external payable {
		// Check deposit amount
		address ROCKET_TOKEN_RETH = _defiProtocolAddress[0];
		address ROCKET_DEPOSIT_POOL = _defiProtocolAddress[1];
		require(
			msg.value > 0.01 ether,
			"Invalid deposit amount, minimum deposit it's 0.01 ETH"
		);
		require(
			_amount_of_ETH == msg.value,
			"The amount of sended tokens is different from the amount to stack"
		);

		IRocketDepositPool(ROCKET_DEPOSIT_POOL).deposit{ value: msg.value }();
	}

	function endETH(
		uint256 _amount,
		address[] calldata _defiProtocolAddress
	) external {
		address ROCKET_TOKEN_RETH = _defiProtocolAddress[0];
		uint256 balance1 = address(this).balance;
		claimReward(_amount, ROCKET_TOKEN_RETH);
		uint256 balance2 = address(this).balance;
		// Transfer ETH to the sender
		uint256 amountETH = balance2 - balance1;
		payable(msg.sender).transfer(amountETH);
	}

	function claimReward(uint256 _amount, address ROCKET_TOKEN_RETH) private {
		// Burn rETH for ETH
		IRocketTokenRETH(ROCKET_TOKEN_RETH).burn(_amount);
	}
}
