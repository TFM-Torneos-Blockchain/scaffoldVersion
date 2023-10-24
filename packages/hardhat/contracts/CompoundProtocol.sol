// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./interfaces/InterfaceComet.sol";
import "./interfaces/Erc20.sol";
import "./RoleControl.sol";


contract CompoundProtocol is RoleControl{

	event Approval(
		address indexed token,
		address indexed spender,
		uint256 value
	);
	event Supply(address indexed token, uint256 value);

	// maybe should also have the defi address as parameter??
	function start(uint128 _amount_of_tokens, address[] calldata _0xERC20Addresses) external onlyAdmin{
		startDeFiBridge(
			_amount_of_tokens,
			_0xERC20Addresses,
			0xF09F0369aB0a875254fB565E52226c88f10Bc839
		);
	}

	// supply uses contract holded tokens
	function startDeFiBridge(
		uint128 _amount,
		address[] calldata _0xERC20Addresses,
		address _0xCometAddress
	) private  onlyAdmin{
		// Approve the Compound protocol contract to spend tokens
		ERC20(_0xERC20Addresses[0]).approve(_0xCometAddress, _amount);

		// Emit event for approval
		emit Approval(_0xERC20Addresses[0], address(this), _amount);

		Comet comet = Comet(_0xCometAddress);

		// Supply tokens to Compound
		comet.supply(_0xERC20Addresses[0], _amount);

		// Emit event for supply
		emit Supply(_0xERC20Addresses[0], _amount);
	}

	function end(uint128 _amount_of_tokens, address _0xERC20Addresses) external onlyAdmin{
		withdraw(
			0xF09F0369aB0a875254fB565E52226c88f10Bc839,
			_0xERC20Addresses,
			_amount_of_tokens
		);
		claimReward(
			0xF09F0369aB0a875254fB565E52226c88f10Bc839,
			0x0785f2AC0dCBEDEE4b8D62c25A34098E9A0dF4bB
		);
		// transferERC20Token()  TODO this should have the amount of tokens that was supplied from the users, + the amount of reard tokens
		// so we need a way to know the amount of reward tokens.
		// TODO it also should actualize a REWARD variable in tournamentManager so it can handle the reward distribution.
		// TargetContract target = TargetContract(_0xtournamentManager);
		// target.end(_amount_of_reward_tokens);
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
		address _to,
		uint256 _amount
	) private returns (bool) {
		ERC20 token = ERC20(_tokenAddress);
		bool succeed = token.transfer(_to, _amount);
		require(succeed, "Transfer failed.");
		return true;
	}

	function tournamentAccoumulatedReward(
		address _0xCometAddress,
		address _0xRewardsAddress,
		address _0xAccount
	) public returns (uint) {
		return
			CometRewards(_0xRewardsAddress)
				.getRewardOwed(_0xCometAddress, _0xAccount)
				.owed;
	}

	/**
	 * @dev Calculates the reward accrued for an account on a Comet deployment
	 */
	function tournamentCalculatedReward(
		address _0xCometAddress,
		address _account
	) external view returns (uint) {
		Comet comet = Comet(_0xCometAddress);
		uint accrued = comet.baseTrackingAccrued(_account);

		return accrued;
	}
}
