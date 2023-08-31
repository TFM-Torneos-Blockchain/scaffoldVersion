// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./interfaces/InterfaceComet.sol";
import "./interfaces/Erc20.sol"; 

contract CompoundProtocol {

    // Add events for logging
    event Approval(
        address indexed token,
        address indexed spender,
        uint256 value
    );
    event Supply(address indexed token, uint256 value);

    // supply uses contract holded tokens
    function approveAndSupply(
        uint256 _amount,
        address _0xERC20Address,
        address _0xCometAddress
    ) external {
        // Approve the Compound protocol contract to spend tokens
        ERC20(_0xERC20Address).approve(_0xCometAddress, _amount);

        // Emit event for approval
        emit Approval(_0xERC20Address, address(this), _amount);

        Comet comet = Comet(_0xCometAddress);

        // Supply tokens to Compound
        comet.supply(_0xERC20Address, _amount);

        // Emit event for supply
        emit Supply(_0xERC20Address, _amount);
    }

    function withdraw(
        address _0xCometAddress,
        address _0xERC20Address,
        uint256 _amount
    ) external {
        Comet comet = Comet(_0xCometAddress);
        comet.withdraw(_0xERC20Address, _amount);
        // comet.withdrawTo( tournamentAccount,  _0xERC20Address,  _amount);
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

    // claim function: https://docs.compound.finance/protocol-rewards/
    function claimReward(
        address _0xCometAddress,
        address _0xRewardsAddress,
        address _0xAccount
    ) external // address tournamentAccount
    {
        CometRewards rewards = CometRewards(_0xRewardsAddress);
        //Returns the amount of reward token accrued but not yet claimed,
        // rewards.claimTo(_0xCometAddress, _0xBridgeAccount, tournamentAccount, true);
        rewards.claim(_0xCometAddress, _0xAccount, true);
    }

    // Function to get the balance of an ERC20 token
    function getERC20TokenBalance(
        address _0xERC20Address
    ) public view returns (uint256) {
        return ERC20(_0xERC20Address).balanceOf(address(this));
    }

    // Function to transfer an amount of ERC20 token
    function transferERC20Token(
        address _tokenAddress,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        // Create an instance of the ERC20 token contract
        ERC20 token = ERC20(_tokenAddress);

        // Transfer the tokens from the sender to the recipient
        bool succeed = token.transfer(_to, _amount);

        // Check if the transfer succeeded
        require(succeed, "Transfer failed.");

        return true;
    }
}
