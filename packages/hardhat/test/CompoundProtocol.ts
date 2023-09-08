import { expect } from "chai";
import { ethers } from "hardhat";
import { CompoundProtocol } from "../typechain-types";

describe("CompoundProtocol", function () {
  // We define a fixture to reuse the same setup in every test.

  let CompoundProtocol: CompoundProtocol;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const CompoundProtocolFactory = await ethers.getContractFactory("CompoundProtocol");
    CompoundProtocol = (await CompoundProtocolFactory.deploy(owner.address)) as CompoundProtocol;
    await CompoundProtocol.deployed();
  });

  describe("Deployment", function () {
    it("should approve and supply tokens to Compound", async () => {
      const amountToSupply = ethers.utils.parseEther("100"); // Supply 100 tokens (adjust as needed)
  
      // Replace these addresses with the appropriate ERC20 and Comet contract addresses
      const erc20Address = "0x..."; // Address of the ERC20 token
      const cometAddress = "0x..."; // Address of the Comet contract
  
      // Call the approveAndSupply function from the contract
      await CompoundProtocol.approveAndSupply(amountToSupply, erc20Address, cometAddress);
  
      // Add assertions to check if the supply was successful or any other desired checks
      // For example, you can check the balance of the contract after supply:
      const balance = await ethers.provider.getBalance(CompoundProtocol.address);
      expect(balance).to.equal(amountToSupply);
    });
  
  });
});
