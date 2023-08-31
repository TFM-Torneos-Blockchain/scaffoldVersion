// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/Erc20.sol"; 

contract TournamentContract {
    mapping(address => uint256) private _deposits;

    // Function for users to record the deposited tokens into the tournamentContract
    // and send them to the DefiBridgeContract
    function enroll(address _tokenAddress, address _to, uint256 _amount) external {
        // Transfer tokens from the user to the tournamentContract
        ERC20(_tokenAddress).transferFrom(msg.sender, _to, _amount);
        // Add the deposited amount to the user's deposit balance
        _deposits[msg.sender] += _amount;
    }

    // Function to send tokens to ProtocolContract
    // function sendTokensToProtocol(
    //     address _tokenAddress,
    //     uint256 _amount,
    //     address _to
    // ) external {
    //     // Transfer the tokens from this smart contract to the ProtocolContract
    //     ERC20(_tokenAddress).transfer(_to, _amount);
    // }

    // Function to check the total collected tokens
    function getTotalCollectedTokens(
        address _tokenAddress
    ) public view returns (uint256) {
        return ERC20(_tokenAddress).balanceOf(address(this));
    }
}
