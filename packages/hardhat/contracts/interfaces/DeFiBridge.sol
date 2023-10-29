// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8;

interface IDefiBridge {
	/**
	 * @notice Starts the process to start the DeFi protocol
	 * @param _amount_of_tokens The amount of tokens which will be invested in the protocol
	 * @param _0xERC20Addresses The ERC20 token address which will be used for the protocol
	 */
	function startERC20(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external ;

	function startETH(
		uint _amount_of_ETH,
		address[] calldata _defiProtocolAddress
	) external payable;

	function endERC20(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external;

	function endETH(
		uint _amount_of_ETH,
		address[] calldata _defiProtocolAddress
	) external payable;
	
}
