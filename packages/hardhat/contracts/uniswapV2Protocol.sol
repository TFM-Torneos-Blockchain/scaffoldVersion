// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "uniswap/interfaces/IUniswapV2ERC20.sol";
import "uniswap/interfaces/IUniswapV2Router02.sol";
import "uniswap/interfaces/IUniswapV2Factory.sol";
import "uniswap/interfaces/IUniswapV2Pair.sol";


contract uniswapV2Protocol {
    
    // Events

    event AddLiquidityPair(uint256 amountToken1, uint256 amountToken2, uint256 liquidity);
    event RemoveLiquidity(uint256 amountToken1, uint256 amountToken2);

    // Change-State functions
    
    function startERC20(uint256 _amount_token_1,uint256 _amount_token_2, address[] calldata _defiProtocolAddress ) external {
        address TOKEN_1 = _defiProtocolAddress[0];
        address TOKEN_2 = _defiProtocolAddress[1];
        address UNISWAP_V2_ROUTER_02 = _defiProtocolAddress[2];
        addLiquidityPair(_amount_token_1,_amount_token_2, TOKEN_1, TOKEN_2, UNISWAP_V2_ROUTER_02);
    }

    // addLiquidityPair--> Adds liquidity to ERC-20⇄ERC-20 pool
    function addLiquidityPair(uint256 _amount_token_1,uint256 _amount_token_2, address token_1,address token_2, address uniswapRouter) private {
        uint256 deadline = block.timestamp + 15;
        // Give the router allowance of tokens
        IUniswapV2ERC20(token_1).approve(uniswapRouter, _amount_token_1);
        IUniswapV2ERC20(token_2).approve(uniswapRouter, _amount_token_2);
        // Call to the function addLiquidity from smart contract UniswapV2Router02
        (
            uint256 amountToken1, // The amount of Token1 sent to the pool.
            uint256 amountToken2, // The amount of Token2 sent to the pool.
            uint256 liquidity // The amount of liquidity tokens minted.
        ) 
        =  IUniswapV2Router02(uniswapRouter).addLiquidity(token_1, token_2, _amount_token_1* 1 ether, _amount_token_2* 1 ether, 0, 0, address(this), deadline);

        require(liquidity > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED');

        emit AddLiquidityPair(amountToken1, amountToken2, liquidity);
    }

     function endERC20(uint256 _amountof_liquidity_tokens, address[] calldata _defiProtocolAddress ) external {
        address TOKEN_1 = _defiProtocolAddress[0];
        address TOKEN_2 = _defiProtocolAddress[1];
        address UNISWAP_V2_ROUTER_02 = _defiProtocolAddress[2];
        address PAIR = _defiProtocolAddress[3];
        removeLiquidity(_amountof_liquidity_tokens, TOKEN_1, TOKEN_2, UNISWAP_V2_ROUTER_02, PAIR);
    }

    // removeLiquidity --> Removes liquidity from an USDT⇄DAI pool (ERC-20)
    function removeLiquidity(uint256 liquidity, address token_1, address token_2, address uniswapRouter, address pair) private  {
        uint256 deadline = block.timestamp + 15;
        // Approve router to burn the liquidity tokens
        IUniswapV2Pair(pair).approve(uniswapRouter, liquidity);
        // Call the functions removeLiquidity from smart contract UniswapV2Router02
        (
            uint256 amountToken1, // The amount of Token1 received.
            uint256 amountToken2 // The amount of Token2 received.
        ) 
        = IUniswapV2Router02(uniswapRouter).removeLiquidity(token_1, token_2, liquidity, 0, 0, msg.sender, deadline);

        emit RemoveLiquidity(amountToken1, amountToken2);
    }
}