// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

interface IDefiBridge {
	function initialize(address tournament_manager_address) external;

	function startERC20(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external;

	function startETH(
		uint _amount_of_ETH,
		address[] calldata _defiProtocolAddress
	) external payable;

	function endERC20(
		uint128 _amount_of_tokens,
		address[] calldata _0xERC20Addresses,
		address[] calldata _defiProtocolAddress
	) external returns(uint128[] memory);

	function endETH(
		uint _amount_of_ETH,
		address[] calldata _defiProtocolAddress
	) external payable returns(uint128);
}
