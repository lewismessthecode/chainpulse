// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainPulseOracle is Ownable {
    enum PredictionCategory { TREND, RISK, WHALE_ALERT, MARKET_INSIGHT }

    struct Prediction {
        bytes32 contentHash;
        uint256 timestamp;
        PredictionCategory category;
        int8 sentimentScore;
        string summary;
    }

    uint256 public predictionCount;
    mapping(uint256 => Prediction) public predictions;
    address public agentAddress;

    event PredictionStored(
        uint256 indexed predictionId,
        bytes32 indexed contentHash,
        PredictionCategory category,
        int8 sentimentScore,
        uint256 timestamp,
        string summary
    );

    event AgentAddressUpdated(address indexed oldAgent, address indexed newAgent);

    modifier onlyAgent() {
        require(msg.sender == agentAddress || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address _agentAddress) Ownable(msg.sender) {
        agentAddress = _agentAddress;
    }

    function storePrediction(
        bytes32 _contentHash,
        PredictionCategory _category,
        int8 _sentimentScore,
        string calldata _summary
    ) external onlyAgent returns (uint256) {
        require(_sentimentScore >= -100 && _sentimentScore <= 100, "Score out of range");
        require(bytes(_summary).length <= 200, "Summary too long");

        uint256 predictionId = predictionCount;
        predictions[predictionId] = Prediction({
            contentHash: _contentHash,
            timestamp: block.timestamp,
            category: _category,
            sentimentScore: _sentimentScore,
            summary: _summary
        });

        emit PredictionStored(predictionId, _contentHash, _category, _sentimentScore, block.timestamp, _summary);
        predictionCount++;
        return predictionId;
    }

    function storePredictionBatch(
        bytes32[] calldata _contentHashes,
        PredictionCategory[] calldata _categories,
        int8[] calldata _sentimentScores,
        string[] calldata _summaries
    ) external onlyAgent {
        require(
            _contentHashes.length == _categories.length &&
            _categories.length == _sentimentScores.length &&
            _sentimentScores.length == _summaries.length,
            "Array length mismatch"
        );
        for (uint256 i = 0; i < _contentHashes.length; i++) {
            uint256 predictionId = predictionCount;
            predictions[predictionId] = Prediction({
                contentHash: _contentHashes[i],
                timestamp: block.timestamp,
                category: _categories[i],
                sentimentScore: _sentimentScores[i],
                summary: _summaries[i]
            });
            emit PredictionStored(predictionId, _contentHashes[i], _categories[i], _sentimentScores[i], block.timestamp, _summaries[i]);
            predictionCount++;
        }
    }

    function verifyPrediction(uint256 _predictionId, string calldata _content) external view returns (bool) {
        require(_predictionId < predictionCount, "Prediction does not exist");
        return predictions[_predictionId].contentHash == keccak256(abi.encodePacked(_content));
    }

    function getPrediction(uint256 _predictionId) external view returns (Prediction memory) {
        require(_predictionId < predictionCount, "Prediction does not exist");
        return predictions[_predictionId];
    }

    function getLatestPredictions(uint256 _count) external view returns (Prediction[] memory) {
        uint256 count = _count > predictionCount ? predictionCount : _count;
        Prediction[] memory result = new Prediction[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = predictions[predictionCount - 1 - i];
        }
        return result;
    }

    function setAgentAddress(address _newAgent) external onlyOwner {
        address old = agentAddress;
        agentAddress = _newAgent;
        emit AgentAddressUpdated(old, _newAgent);
    }
}
