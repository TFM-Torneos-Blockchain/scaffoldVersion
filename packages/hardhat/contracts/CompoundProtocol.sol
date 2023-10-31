// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/InterfaceComet.sol";
import "./interfaces/Erc20.sol";

// Open Zeppelin libraries for controlling upgradability and access.
// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Initializable
contract CompoundProtocol is OwnableUpgradeable {
	event Approval(
		address indexed token,
		address indexed spender,
		uint256 value
	);
	event Supply(address indexed token, uint256 value);

	function initialize(address tournament_manager_address) public initializer {
		__Ownable_init(tournament_manager_address);
	}

	// TODO SI NO EM FUNCIONA PROVAR AIXÍ
	// function initialize(address owner) external initializer {
	//   __Ownable_init();
	//   transferOwnership(owner);

	// supply uses contract holded tokens
	function startERC20(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external onlyOwner {
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

	function endERC20(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external onlyOwner {
		withdraw(
			_defiProtocolAddress[0],
			_0xERC20Addresses[0],
			_amount_of_tokens
		);
		claimReward(_defiProtocolAddress[0], _defiProtocolAddress[1]);
		transferERC20Token(_0xERC20Addresses[0], msg.sender);
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
