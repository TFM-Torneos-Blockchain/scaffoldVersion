// contracts/FunToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FunToken2 is ERC20 {

    // Define the supply of FunToken: 1,000,000 
    uint256 constant initialSupply = 1000000 * (10**18);

    // Constructor will be called on contract creation
    constructor() ERC20("FunToken2", "FUN2") {
        _mint(address(0x99DFADCD62593325BcF82ED1f55d87840E93a966), initialSupply);
        _mint(msg.sender, initialSupply);
    }
}