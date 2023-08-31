// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

library CometStructs {
    struct RewardOwed {
        address token;
        uint owed;
    }
}

interface Comet {
    function supply(address asset, uint amount) external;

    function supplyTo(address dst, address asset, uint amount) external;

    function supplyFrom(
        address from,
        address dst,
        address asset,
        uint amount
    ) external;

    function withdraw(address asset, uint amount) external;

    function withdrawTo(address to, address asset, uint amount) external;

    function withdrawFrom(
        address src,
        address to,
        address asset,
        uint amount
    ) external;

    function baseTrackingAccrued(
        address account
    ) external view returns (uint64);
}

interface CometRewards {
    function getRewardOwed(
        address comet,
        address account
    ) external returns (CometStructs.RewardOwed memory);

    function claim(address comet, address src, bool shouldAccrue) external;
}
