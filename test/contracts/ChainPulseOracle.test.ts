import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainPulseOracle } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ChainPulseOracle", function () {
  let oracle: ChainPulseOracle;
  let owner: SignerWithAddress;
  let agent: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  beforeEach(async function () {
    [owner, agent, unauthorized] = await ethers.getSigners();
    const Oracle = await ethers.getContractFactory("ChainPulseOracle");
    oracle = await Oracle.deploy(agent.address);
    await oracle.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct owner", async function () {
      expect(await oracle.owner()).to.equal(owner.address);
    });

    it("should set correct agent address", async function () {
      expect(await oracle.agentAddress()).to.equal(agent.address);
    });
  });

  describe("storePrediction", function () {
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test prediction content"));
    const category = 0; // TREND
    const sentiment = 50;
    const summary = "BSC TVL rising steadily";

    it("should store prediction from agent and emit event", async function () {
      const tx = await oracle.connect(agent).storePrediction(
        contentHash, category, sentiment, summary
      );
      const receipt = await tx.wait();

      expect(await oracle.predictionCount()).to.equal(1);

      const prediction = await oracle.getPrediction(0);
      expect(prediction.contentHash).to.equal(contentHash);
      expect(prediction.category).to.equal(category);
      expect(prediction.sentimentScore).to.equal(sentiment);
      expect(prediction.summary).to.equal(summary);
    });

    it("should store prediction from owner", async function () {
      await oracle.connect(owner).storePrediction(
        contentHash, category, sentiment, summary
      );
      expect(await oracle.predictionCount()).to.equal(1);
    });

    it("should reject from unauthorized address", async function () {
      await expect(
        oracle.connect(unauthorized).storePrediction(
          contentHash, category, sentiment, summary
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject sentiment score out of range", async function () {
      await expect(
        oracle.connect(agent).storePrediction(contentHash, category, 101, summary)
      ).to.be.revertedWith("Score out of range");

      await expect(
        oracle.connect(agent).storePrediction(contentHash, category, -101, summary)
      ).to.be.revertedWith("Score out of range");
    });

    it("should reject summary over 200 chars", async function () {
      const longSummary = "x".repeat(201);
      await expect(
        oracle.connect(agent).storePrediction(contentHash, category, sentiment, longSummary)
      ).to.be.revertedWith("Summary too long");
    });
  });

  describe("storePredictionBatch", function () {
    it("should store multiple predictions in one tx", async function () {
      const hashes = [
        ethers.keccak256(ethers.toUtf8Bytes("pred1")),
        ethers.keccak256(ethers.toUtf8Bytes("pred2")),
      ];
      const categories = [0, 1];
      const sentiments = [60, -30];
      const summaries = ["Bull trend", "Risk alert"];

      await oracle.connect(agent).storePredictionBatch(
        hashes, categories, sentiments, summaries
      );

      expect(await oracle.predictionCount()).to.equal(2);
    });

    it("should reject mismatched array lengths", async function () {
      await expect(
        oracle.connect(agent).storePredictionBatch(
          [ethers.keccak256(ethers.toUtf8Bytes("a"))],
          [0, 1], // mismatched
          [50],
          ["test"]
        )
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("verifyPrediction", function () {
    it("should return true for matching content", async function () {
      const content = "test prediction content";
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes(content));

      await oracle.connect(agent).storePrediction(contentHash, 0, 50, "test");

      expect(await oracle.verifyPrediction(0, content)).to.be.true;
    });

    it("should return false for non-matching content", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("original"));
      await oracle.connect(agent).storePrediction(contentHash, 0, 50, "test");

      expect(await oracle.verifyPrediction(0, "tampered")).to.be.false;
    });
  });

  describe("getLatestPredictions", function () {
    it("should return latest N predictions in reverse order", async function () {
      for (let i = 0; i < 5; i++) {
        await oracle.connect(agent).storePrediction(
          ethers.keccak256(ethers.toUtf8Bytes(`pred${i}`)),
          0, i * 10, `Summary ${i}`
        );
      }

      const latest = await oracle.getLatestPredictions(3);
      expect(latest.length).to.equal(3);
      expect(latest[0].summary).to.equal("Summary 4");
      expect(latest[2].summary).to.equal("Summary 2");
    });
  });

  describe("setAgentAddress", function () {
    it("should update agent address from owner", async function () {
      await oracle.connect(owner).setAgentAddress(unauthorized.address);
      expect(await oracle.agentAddress()).to.equal(unauthorized.address);
    });

    it("should reject from non-owner", async function () {
      await expect(
        oracle.connect(agent).setAgentAddress(unauthorized.address)
      ).to.be.reverted;
    });
  });
});
