// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >0.5.0 <0.9.0;

contract mockRocketProtocol {
	string public name = "FakeRocketToken";
	string public symbol = "fRTK";
	uint8 public decimals = 18;
	uint256 public totalSupply;

	mapping(address => uint256) public balanceOf;

	constructor(uint256 initialSupply) {
		totalSupply = initialSupply * 10 ** uint256(decimals);
		balanceOf[address(this)] = totalSupply;
	}

	function transfer(address to, uint256 value) public {
		balanceOf[address(this)] -= value;
		balanceOf[to] += value;
	}

	function deposit() external payable {
		require(msg.value > 0.01 ether);
	}

	function burn() public {
		balanceOf[msg.sender] = 0;
		//payable(msg.sender).transfer();
	}
}
