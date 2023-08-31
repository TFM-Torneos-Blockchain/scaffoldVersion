const contracts = {
  80001: [
    {
      chainId: "80001",
      name: "polygonMumbai",
      contracts: {
        CompoundProtocol: {
          address: "0xb2aD95B7dfe9fdeC2cA021b4cffE51566eEB6506",
          abi: [
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "spender",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "Approval",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "Supply",
              type: "event",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "_0xERC20Address",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_0xCometAddress",
                  type: "address",
                },
              ],
              name: "approveAndSupply",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_0xCometAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_0xRewardsAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_0xAccount",
                  type: "address",
                },
              ],
              name: "claimReward",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_0xERC20Address",
                  type: "address",
                },
              ],
              name: "getERC20TokenBalance",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_0xCometAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_0xRewardsAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_0xAccount",
                  type: "address",
                },
              ],
              name: "tournamentAccoumulatedReward",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_0xCometAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_account",
                  type: "address",
                },
              ],
              name: "tournamentCalculatedReward",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_tokenAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
              ],
              name: "transferERC20Token",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_0xCometAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_0xERC20Address",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
              ],
              name: "withdraw",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
        },
        TournamentContract: {
          address: "0xFc28FE8B826F98c4B769eAA417Afca93f3eB0475",
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_tokenAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "_to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "_amount",
                  type: "uint256",
                },
              ],
              name: "enroll",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_tokenAddress",
                  type: "address",
                },
              ],
              name: "getTotalCollectedTokens",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
