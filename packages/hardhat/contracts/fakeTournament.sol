// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/Erc20.sol"; 

contract TournamentContract2 {
    mapping(address => uint256) public _deposits;

    // Event emitted when a user enrolls with an ERC20 token
    event Enroll(address indexed user, address indexed tokenAddress, uint256 amount);

    // Function for users to record the deposited tokens into the tournamentContract
    // and send them to the DefiBridgeContract
    function enroll(address _tokenAddress, address _to, uint256 _amount) external {
        // Transfer tokens from the user to the tournamentContract
        ERC20(_tokenAddress).transferFrom(msg.sender, _to, _amount);
        // Add the deposited amount to the user's deposit balance
        _deposits[msg.sender] += _amount;
        
        // Emit the Enroll event
        emit Enroll(msg.sender, _tokenAddress, _amount);
    }

    function start () external {

    }

    function end () external {

    }
    // Function to check the total collected tokens
    function getTotalCollectedTokens(
        address _tokenAddress
    ) public view returns (uint256) {
        return ERC20(_tokenAddress).balanceOf(address(this));
    }
}
