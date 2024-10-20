// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

interface IERCTournament {
	function initialize(address tournamentManagerAddress) external;

	function startERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddresses
	) external;

	function endERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddresses
	) external returns (uint256[] memory);
}

interface IETHTournament {
	function initialize(address tournamentManagerAddress) external;

	function startETH(
		uint amountOfETH,
		address[] calldata defiProtocolAddresses
	) external payable;

	function endETH(
		uint amountOfETH,
		address[] calldata defiProtocolAddresses
	) external payable returns (uint256);
}
