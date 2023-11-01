// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IUniswapV2ERC20.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/Erc20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract UniswapV2Protocol is OwnableUpgradeable {
	// Events
	event AddLiquidityPair(
		uint256 amountToken1,
		uint256 amountToken2,
		uint256 liquidity
	);
	event RemoveLiquidity(uint256 amountToken1, uint256 amountToken2);

	function initialize(address tournamentManagerAddress) public initializer {
		__Ownable_init(tournamentManagerAddress);
	}

	function startERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddress
	) external onlyOwner {
		address token1 = erc20Addresses[0];
		address token2 = erc20Addresses[1];
		address uniswapV2Router02 = defiProtocolAddress[0];
		addLiquidityPair(
			amountOfTokens,
			amountOfTokens,
			token1,
			token2,
			uniswapV2Router02
		);
	}

	// addLiquidityPair --> Adds liquidity to ERC-20⇄ERC-20 pool
	function addLiquidityPair(
		uint256 _amountToken1,
		uint256 _amountToken2,
		address token1,
		address token2,
		address uniswapRouter
	) private {
		uint256 deadline = block.timestamp + 15;
		// Give the router allowance of tokens
		IUniswapV2ERC20(token1).approve(uniswapRouter, _amountToken1);
		IUniswapV2ERC20(token2).approve(uniswapRouter, _amountToken2);
		// Call to the function addLiquidity from smart contract UniswapV2Router02
		(
			uint256 amountToken1, // The amount of Token1 sent to the pool.
			uint256 amountToken2, // The amount of Token2 sent to the pool.
			uint256 liquidity // The amount of liquidity tokens minted.
		) = IUniswapV2Router02(uniswapRouter).addLiquidity(
				token1,
				token2,
				_amountToken1,
				_amountToken2,
				0,
				0,
				address(this),
				deadline
			);

		require(liquidity > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED");

		emit AddLiquidityPair(amountToken1, amountToken2, liquidity);
	}

	function endERC20(
		uint256 amountOfTokens,
		address[] calldata erc20Addresses,
		address[] calldata defiProtocolAddress
	) external onlyOwner returns (uint256[] memory) {
		address token1 = erc20Addresses[0];
		address token2 = erc20Addresses[1];
		address uniswapV2Router02 = defiProtocolAddress[0];
		address pair = defiProtocolAddress[1];
		removeLiquidity(
			amountOfTokens,
			token1,
			token2,
			uniswapV2Router02,
			pair
		);
		uint256 totalCollected1 = transferERC20Token(
			erc20Addresses[0],
			msg.sender
		);
		uint256 totalCollected2 = transferERC20Token(
			erc20Addresses[1],
			msg.sender
		);
		uint256[] memory deFiBridgeRewards = new uint256[](2);
		deFiBridgeRewards[0] = totalCollected1 - amountOfTokens;
		deFiBridgeRewards[1] = totalCollected2 - amountOfTokens;
		return deFiBridgeRewards;
	}

	// removeLiquidity --> Removes liquidity from an USDT⇄DAI pool (ERC-20)
	function removeLiquidity(
		uint256 liquidity,
		address token1,
		address token2,
		address uniswapRouter,
		address pair
	) private {
		uint256 deadline = block.timestamp + 15;
		// Approve router to burn the liquidity tokens
		IUniswapV2Pair(pair).approve(uniswapRouter, liquidity);
		// Call the functions removeLiquidity from smart contract UniswapV2Router02
		(
			uint256 amountToken1, // The amount of Token1 received.
			uint256 amountToken2 // The amount of Token2 received.
		) = IUniswapV2Router02(uniswapRouter).removeLiquidity(
				token1,
				token2,
				liquidity,
				0,
				0,
				msg.sender,
				deadline
			);

		emit RemoveLiquidity(amountToken1, amountToken2);
	}

	function transferERC20Token(
		address tokenAddress,
		address to
	) private returns (uint256) {
		ERC20 token = ERC20(tokenAddress);
		uint amount = token.balanceOf(address(this));
		bool succeed = token.transfer(to, amount);
		require(succeed, "Transfer failed.");
		return amount;
	}
}
