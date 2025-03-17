import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NBStakingReward", function () {
    let owner, user1, user2;
    let stakingContract;
    let api3Mock;

    async function deployFixture() {
        [owner, user1, user2] = await ethers.getSigners();

        const MockApi3ReaderProxy = await ethers.getContractFactory("MockApi3ReaderProxy");
        api3Mock = await MockApi3ReaderProxy.deploy();
        await api3Mock.waitForDeployment();

        const api3MockAddress = await api3Mock.getAddress();

        const NBUtilityNFT = await ethers.getContractFactory("NBUtilityNFT");
        const nbUtilityNFT = await NBUtilityNFT.deploy();
        await nbUtilityNFT.waitForDeployment();
        const nbUtilityNFTAddress = await nbUtilityNFT.getAddress();

        const NBStakingReward = await ethers.getContractFactory("NBStakingReward");
        stakingContract = await NBStakingReward.deploy(api3MockAddress, nbUtilityNFTAddress);
        await stakingContract.waitForDeployment();

        const stakingContractAddress = await stakingContract.getAddress();

        await owner.sendTransaction({
            to: stakingContractAddress,
            value: ethers.parseEther("100"),
        });

        await nbUtilityNFT.connect(owner).setUp(stakingContractAddress);
        return { stakingContract, api3Mock, nbUtilityNFT, owner, user1, user2, api3MockAddress, stakingContractAddress, nbUtilityNFTAddress };
    }

    describe("💰 Staking", function () {
        it("✅ User can stake", async function () {
            const { stakingContract, user1, stakingContractAddress } = await loadFixture(deployFixture);

            await stakingContract.connect(user1).stake({
                value: ethers.parseEther("50"),
            });

            const stakeInfo = await stakingContract.getStakeInfo(await user1.getAddress());
            expect(stakeInfo.amount).to.equal(ethers.parseEther("50"));

            const contractBalance = await ethers.provider.getBalance(stakingContractAddress);
            expect(contractBalance).to.changeEtherBalance(stakingContract, ethers.parseEther("50"));
        });
    });

    describe("📉 Unstaking", function () {
        it("✅ User can unstake", async function () {
            const { stakingContract, user1 } = await loadFixture(deployFixture);

            await stakingContract.connect(user1).stake({
                value: ethers.parseEther("50"),
            });
            await stakingContract.connect(user1).unstake(ethers.parseEther("20"));

            const stakeInfo = await stakingContract.getStakeInfo(await user1.getAddress());
            expect(stakeInfo.amount).to.equal(ethers.parseEther("30"));

            const userBalance = await ethers.provider.getBalance(await user1.getAddress());
            expect(userBalance).to.changeEtherBalance(user1, ethers.parseEther("20"));
        });

        it("⛔ User cannot unstake more than staked amount", async function () {
            const { stakingContract, user1 } = await loadFixture(deployFixture);

            await stakingContract.connect(user1).stake({
                value: ethers.parseEther("50"),
            });

            await expect(stakingContract.connect(user1).unstake(ethers.parseEther("60"))).to.be.revertedWith(
                "NBStakingReward: not enough staked amount"
            );
        });
    });

    describe("🎁 Reward Calculation", function () {
        it("✅ Calculates correct rewards", async function () {
            const { stakingContract, user1, api3Mock } = await loadFixture(deployFixture);

            await stakingContract.connect(user1).stake({
                value: ethers.parseEther("50"),
            });

            await api3Mock.setDelta(ethers.parseEther("10"));

            const reward = await stakingContract.calculateReward(await user1.getAddress());
            expect(reward).to.equal(ethers.parseEther("60"));
        });

        it("✅ Calculates rewards with penalty", async function () {
            const { stakingContract, user1, api3Mock } = await loadFixture(deployFixture);

            await stakingContract.connect(user1).stake({
                value: ethers.parseEther("50"),
            });

            await api3Mock.setDelta(-ethers.parseEther("10"));

            const reward = await stakingContract.calculateReward(await user1.getAddress());
            expect(reward).to.equal(ethers.parseEther("40"));
        });
    });
    describe("🎁 Utility NFT", function () {
        it("✅ User has boost utility NFT", async function () {
            const { stakingContract, user1, nbUtilityNFT, stakingContractAddress } = await loadFixture(deployFixture);

            await nbUtilityNFT.mint(user1.address, 2, 1);

            // await nbUtilityNFT.connect(user1).setApprovalForAll(stakingContractAddress, true);
            console.log("Staking address", await stakingContract.getAddress());
            await stakingContract.connect(user1).applyUtility(user1.address, [2]);

            await stakingContract.connect(user1).stake({
                value: ethers.parseEther("50"),
            });
            const reward = await stakingContract.calculateReward(await user1.getAddress());
            expect(reward).to.equal(ethers.parseEther("50.05"));

        })
    });
    describe("🔹 Claim Rewards", function () {
        it("✅ User can claim rewards", async function () {
            const { stakingContract, user1, api3Mock } = await loadFixture(deployFixture);

            await stakingContract.connect(user1).stake({
                value: ethers.parseEther("50"),
            });

            // Giả lập API3 trả về delta = 10
            await api3Mock.setDelta(ethers.parseEther("10"));

            // console balnce of staking contract
            const contractBalance = await ethers.provider.getBalance(await stakingContract.getAddress());
            console.log("contractBalance", ethers.formatEther(contractBalance));

            await stakingContract.connect(user1).claim();

            const userBalance = await ethers.provider.getBalance(await user1.getAddress());
            expect(userBalance).to.changeEtherBalance(user1, ethers.parseEther("60"));
        });
    });
});