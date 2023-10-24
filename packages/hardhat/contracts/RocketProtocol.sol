// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >0.5.0 <0.9.0;

import "./interfaces/IRocketDepositPool.sol";
import "./interfaces/IRocketTokenRETH.sol";

contract rocketProtocol {
	// Change-State functions

	function startETH(
		uint256 _amount_of_ETH,
		address[] calldata _defiProtocolAddress
	) external payable {
		address ROCKET_TOKEN_RETH = _defiProtocolAddress[0];
		address ROCKET_DEPOSIT_POOL = _defiProtocolAddress[1];
		uint256 pass = _amount_of_ETH * 1 ether;
		require(
			pass == msg.value,
			"The amount of sended tokens is different from the amount to stack"
		);
		(bool success, ) = address(this).call{ value: pass }(
			abi.encodeWithSignature(
				"deposit(uint256,address,address)",
				_amount_of_ETH,
				ROCKET_TOKEN_RETH,
				ROCKET_DEPOSIT_POOL
			)
		);
		require(success, "Failed to send Ether");
	}

	function deposit(
		uint256 _amount_of_ETH,
		address ROCKET_TOKEN_RETH,
		address ROCKET_DEPOSIT_POOL
	) external payable {
		// Check deposit amount
		require(
			msg.value > 0.01 ether,
			"Invalid deposit amount, minimum deposit it's 0.01 ETH"
		);
		uint256 pass = _amount_of_ETH * 1 ether;
		require(
			pass == msg.value,
			"The amount of sended tokens is different from the amount to stack"
		);
		// Forward deposit to RP & get amount of rETH minted
		uint256 rethBalance1 = IRocketTokenRETH(ROCKET_TOKEN_RETH).balanceOf(
			address(this)
		);
		IRocketDepositPool(ROCKET_DEPOSIT_POOL).deposit{ value: msg.value }();
		uint256 rethBalance2 = IRocketTokenRETH(ROCKET_TOKEN_RETH).balanceOf(
			address(this)
		);
		require(rethBalance2 > rethBalance1, "No rETH was minted");
		// Transfer rETH to caller --> Sobra porque rETH se queda en el contrato
		/*
        require(
            IRocketTokenRETH(ROCKET_TOKEN_RETH).transfer(msg.sender, rethBalance2 - rethBalance1),
            "rETH was not transferred to caller"
        );
        */
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
