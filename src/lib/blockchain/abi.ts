export const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_agentAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAgent",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAgent",
        type: "address",
      },
    ],
    name: "AgentAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "predictionId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "enum ChainPulseOracle.PredictionCategory",
        name: "category",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "int8",
        name: "sentimentScore",
        type: "int8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "summary",
        type: "string",
      },
    ],
    name: "PredictionStored",
    type: "event",
  },
  {
    inputs: [],
    name: "agentAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_count",
        type: "uint256",
      },
    ],
    name: "getLatestPredictions",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "contentHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "enum ChainPulseOracle.PredictionCategory",
            name: "category",
            type: "uint8",
          },
          {
            internalType: "int8",
            name: "sentimentScore",
            type: "int8",
          },
          {
            internalType: "string",
            name: "summary",
            type: "string",
          },
        ],
        internalType: "struct ChainPulseOracle.Prediction[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_predictionId",
        type: "uint256",
      },
    ],
    name: "getPrediction",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "contentHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "enum ChainPulseOracle.PredictionCategory",
            name: "category",
            type: "uint8",
          },
          {
            internalType: "int8",
            name: "sentimentScore",
            type: "int8",
          },
          {
            internalType: "string",
            name: "summary",
            type: "string",
          },
        ],
        internalType: "struct ChainPulseOracle.Prediction",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "predictionCount",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "predictions",
    outputs: [
      {
        internalType: "bytes32",
        name: "contentHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "enum ChainPulseOracle.PredictionCategory",
        name: "category",
        type: "uint8",
      },
      {
        internalType: "int8",
        name: "sentimentScore",
        type: "int8",
      },
      {
        internalType: "string",
        name: "summary",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newAgent",
        type: "address",
      },
    ],
    name: "setAgentAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_contentHash",
        type: "bytes32",
      },
      {
        internalType: "enum ChainPulseOracle.PredictionCategory",
        name: "_category",
        type: "uint8",
      },
      {
        internalType: "int8",
        name: "_sentimentScore",
        type: "int8",
      },
      {
        internalType: "string",
        name: "_summary",
        type: "string",
      },
    ],
    name: "storePrediction",
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
        internalType: "bytes32[]",
        name: "_contentHashes",
        type: "bytes32[]",
      },
      {
        internalType: "enum ChainPulseOracle.PredictionCategory[]",
        name: "_categories",
        type: "uint8[]",
      },
      {
        internalType: "int8[]",
        name: "_sentimentScores",
        type: "int8[]",
      },
      {
        internalType: "string[]",
        name: "_summaries",
        type: "string[]",
      },
    ],
    name: "storePredictionBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_predictionId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_content",
        type: "string",
      },
    ],
    name: "verifyPrediction",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
