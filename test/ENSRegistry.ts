import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import namehash from "eth-ens-namehash";
import { keccak256 } from '@ethersproject/solidity'

describe("ENS", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployENSRegisterFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
    const ensRegistry = await ENSRegistry.deploy();
    const tx = await ensRegistry.setSubnodeOwner(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      keccak256(['string'], ['eth']),
      owner.address
    );
    await tx.wait();

    const ENSRegistrar = await ethers.getContractFactory("contracts/vendors/BaseRegistrarImplementation.sol:BaseRegistrarImplementation");
    const ensRegistrar = await ENSRegistrar.deploy(ensRegistry.address, namehash.hash("eth"));

    const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
    const ethRegistrarController = await ETHRegistrarController.deploy(ensRegistrar.address, )

    return { ensRegistry, owner, otherAccount, ensRegistrar };
  }

  describe("Deployment", function () {
    it("set eth root domain", async function () {
      const { ensRegistry, owner } = await loadFixture(
        deployENSRegisterFixture
      );
      // .eth
      const ethOwner = await ensRegistry.owner(namehash.hash("eth"));

      expect(ethOwner).to.equal(owner.address);
    });

    it("set test.eth root domain", async function () {
      const { ensRegistry, otherAccount } = await loadFixture(
        deployENSRegisterFixture
      );
      ensRegistry.setSubnodeOwner(
        namehash.hash("eth"),
        keccak256(['string'], ['test']),
        otherAccount.address
      );
      const ethOwner = await ensRegistry.owner(
        namehash.hash('test.eth') // test.eth
      );
      expect(ethOwner).to.equal(otherAccount.address);
    });

    it("namehash", async function () {
      console.log(namehash.hash("eth"));
      console.log(keccak256(['string'], ['eth']))
      console.log(keccak256(['string'], ['test']))
    });
  });
});
