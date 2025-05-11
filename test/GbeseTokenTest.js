// test/gbeseToken.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("GbeseToken", function () {
  let kycVerifier, gbeseToken;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockKYCVerifier
    const MockKYC = await ethers.getContractFactory("MockKYCVerifier");
    kycVerifier = await MockKYC.deploy();
    await kycVerifier.waitForDeployment();

    // Deploy GbeseToken
    const Gbese = await ethers.getContractFactory("GbeseToken");
    gbeseToken = await Gbese.deploy(kycVerifier.target);
    await gbeseToken.waitForDeployment();
  });

  it("assigns the initial supply to the owner", async function () {
    const ownerBalance = await gbeseToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("owner can mint to a verified user", async function () {
    await kycVerifier.setVerified(user1.address, true);
    const amount = ethers.parseUnits("10", 18);

    await expect(gbeseToken.mint(user1.address, amount))
      .to.emit(gbeseToken, "TokensMinted")
      .withArgs(user1.address, amount);

    expect(await gbeseToken.balanceOf(user1.address)).to.equal(amount);
  });

  it("owner cannot mint to an unverified user", async function () {
    const amount = ethers.parseUnits("10", 18);
    await expect(
      gbeseToken.mint(user2.address, amount)
    ).to.be.revertedWith("on-chaine KYC: This wallet is not verified");
  });

  it("allows transfer between verified users and logs the transfer", async function () {
    await kycVerifier.setVerified(user1.address, true);
    await kycVerifier.setVerified(user2.address, true);

    const mintAmount = ethers.parseUnits("100", 18);
    const transferAmount = ethers.parseUnits("20", 18);

    await gbeseToken.mint(user1.address, mintAmount);

    await expect(
      gbeseToken.connect(user1).transfer(user2.address, transferAmount)
    )
      .to.emit(gbeseToken, "TransferLogged")
      .withArgs(
        1, // first logged transfer
        user1.address,
        user2.address,
        transferAmount,
        anyValue
      );

    expect(await gbeseToken.balanceOf(user2.address)).to.equal(transferAmount);
  });

  it("reverts transfers to unverified users", async function () {
    await kycVerifier.setVerified(user1.address, true);
    const mintAmount = ethers.parseUnits("50", 18);
    const transferAmount = ethers.parseUnits("10", 18);

    await gbeseToken.mint(user1.address, mintAmount);

    await expect(
      gbeseToken.connect(user1).transfer(user2.address, transferAmount)
    ).to.be.revertedWith("KYC: recipient not verified");
  });
});
