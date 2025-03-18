import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const v = ethers.Wallet.createRandom();
const NB_PRIVATE_KEY = v.privateKey;
const NB_PUBLIC_KEY = v.address;

describe("NBStakingReward", function () {
    let owner, user1, user2;
    let stakingContract;

    async function deployFixture() {
        [owner, user1, user2] = await ethers.getSigners();

        const NBUtilityNFT = await ethers.getContractFactory("NBUtilityNFT");
        const nbUtilityNFT = await NBUtilityNFT.deploy();
        await nbUtilityNFT.waitForDeployment();
        const nbUtilityNFTAddress = await nbUtilityNFT.getAddress();

        const NBStakingReward = await ethers.getContractFactory("NBStakingReward");
        stakingContract = await NBStakingReward.deploy(NB_PUBLIC_KEY, nbUtilityNFTAddress);
        await stakingContract.waitForDeployment();

        const stakingContractAddress = await stakingContract.getAddress();

        await owner.sendTransaction({
            to: stakingContractAddress,
            value: ethers.parseEther("100"),
        });

        await nbUtilityNFT.connect(owner).setUp(stakingContractAddress);
        return { stakingContract, nbUtilityNFT, owner, user1, user2, stakingContractAddress, nbUtilityNFTAddress };
    }
    async function signMessage(account: string, delta: bigint, timestamp: bigint) {
        const signer = new ethers.Wallet(NB_PRIVATE_KEY);
        const messageHash = ethers.solidityPackedKeccak256(["address", "int224", "uint256"], [account, delta, timestamp]);
        const signature = await signer.signMessage(ethers.getBytes(messageHash));
        return signature;
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
            const { stakingContract, user1 } = await loadFixture(deployFixture);
            await stakingContract.connect(user1).stake({ value: ethers.parseEther("50") });

            const delta = ethers.parseEther("10");
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = await signMessage(user1.address, delta, BigInt(timestamp));

            const reward = await stakingContract.calculateReward(user1.address, delta, timestamp, signature);
            expect(reward).to.equal(ethers.parseEther("60"));
        });

        it("✅ Calculates rewards with penalty", async function () {
            const { stakingContract, user1 } = await loadFixture(deployFixture);
            await stakingContract.connect(user1).stake({ value: ethers.parseEther("50") });

            const delta = ethers.parseEther("-10");
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = await signMessage(user1.address, delta, BigInt(timestamp));

            const reward = await stakingContract.calculateReward(user1.address, delta, timestamp, signature);
            expect(reward).to.equal(ethers.parseEther("40"));
        });
    });
    describe("🎁 Utility NFT", function () {
        it("✅ User has boost utility NFT", async function () {
            const { stakingContract, user1, nbUtilityNFT } = await loadFixture(deployFixture);
            await nbUtilityNFT.mint(user1.address, 2, 1);
            await stakingContract.connect(user1).applyUtility(user1.address, [2]);
            await stakingContract.connect(user1).stake({ value: ethers.parseEther("50") });

            const delta = ethers.parseEther("0");
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = await signMessage(user1.address, delta, BigInt(timestamp));

            const reward = await stakingContract.calculateReward(user1.address, delta, timestamp, signature);
            expect(reward).to.equal(ethers.parseEther("50.05"));
        })
    });
    describe("🔹 Claim Rewards", function () {
        it("✅ User can claim rewards", async function () {
            const { stakingContract, user1 } = await loadFixture(deployFixture);
            await stakingContract.connect(user1).stake({ value: ethers.parseEther("50") });

            const delta = ethers.parseEther("10");
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = await signMessage(user1.address, delta, BigInt(timestamp));

            await expect(() =>
                stakingContract.connect(user1).claim(delta, timestamp, signature)
            ).to.changeEtherBalances([stakingContract, user1], [-ethers.parseEther("60"), ethers.parseEther("60")]);
        });

        it("⛔ User cannot claim twice with same signature", async function () {
            const { stakingContract, user1 } = await loadFixture(deployFixture);
            await stakingContract.connect(user1).stake({ value: ethers.parseEther("50") });

            const delta = ethers.parseEther("10");
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = await signMessage(user1.address, delta, BigInt(timestamp));

            await stakingContract.connect(user1).claim(delta, timestamp, signature);
            await expect(stakingContract.connect(user1).claim(delta, timestamp, signature)).to.be.revertedWith(
                "NBStakingReward: already claimed"
            );
        });
    });
});