// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./interfaces/InterfaceComet.sol";
import "./interfaces/Erc20.sol";

contract CompoundProtocol {
	event Approval(
		address indexed token,
		address indexed spender,
		uint256 value
	);
	event Supply(address indexed token, uint256 value);
	bool private initialized;
	address public admin;

	function initialize(address set_admin) public {
		require(!initialized, "Contract instance has already been initialized");
		admin = set_admin;
	}

	// supply uses contract holded tokens
	function startERC20(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external {
		require(msg.sender == admin, "Restricted to admins.");

		// Approve the Compound protocol contract to spend tokens
		ERC20(_0xERC20Addresses[0]).approve(
			_defiProtocolAddress[0],
			_amount_of_tokens
		); 

		// Emit event for approval
		emit Approval(_0xERC20Addresses[0], address(this), _amount_of_tokens);

		Comet comet = Comet(_defiProtocolAddress[0]);
		comet.supply(_0xERC20Addresses[0], _amount_of_tokens);

		// Emit event for supply
		emit Supply(_0xERC20Addresses[0], _amount_of_tokens);
	}

	function end(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external {
		require(msg.sender == admin, "Restricted to admins.");
		withdraw(
			_defiProtocolAddress[0],
			_0xERC20Addresses[0],
			_amount_of_tokens
		);
		claimReward(
			_defiProtocolAddress[0],
			_defiProtocolAddress[1]
		);
		transferERC20Token(_0xERC20Addresses[0],admin);
	}

	function withdraw(
		address _0xCometAddress,
		address _0xERC20Addresses,
		uint256 _amount
	) private {
		Comet comet = Comet(_0xCometAddress);
		comet.withdraw(_0xERC20Addresses, _amount);
	}

	function claimReward(
		address _0xCometAddress,
		address _0xRewardsAddress
	) private {
		CometRewards rewards = CometRewards(_0xRewardsAddress);
		rewards.claim(_0xCometAddress, address(this), true);
	}

	// Function to transfer an amount of ERC20 token
	function transferERC20Token(
		address _tokenAddress,
		address _to
	) private returns (bool) {
		ERC20 token = ERC20(_tokenAddress);
		uint _amount = token.balanceOf(address(this));
		bool succeed = token.transfer(_to, _amount);
		require(succeed, "Transfer failed.");
		return true;
	}

}
