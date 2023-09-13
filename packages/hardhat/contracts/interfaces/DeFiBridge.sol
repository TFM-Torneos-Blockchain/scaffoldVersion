// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8;

interface DEFIBRIDGE {
	/**
	 * @notice Starts the process to start the DeFi protocol
	 * @param _amount_of_tokens The amount of tokens which will be invested in the protocol
	 * @param _0xERC20Addresses The ERC20 token address which will be used for the protocol
	 */
	function start(uint _amount_of_tokens, address[] calldata _0xERC20Addresses) external;
	function startETH(uint _amount_of_tokens) external payable;
}
