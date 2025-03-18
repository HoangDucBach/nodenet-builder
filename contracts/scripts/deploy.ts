import hre, { ethers } from "hardhat";

var NB_UTILITY_NFT_ADDRESS = "0xEcb8bF30e96496ab635B4Cc33343965Bc23FAaeE";
var NB_STAKING_REWARD_ADDRESS = "0x39C29DBA4A02aBfDA65d0b89717D29A6f74c72Ea";
const nbWallet = ethers.Wallet.createRandom();

var NB_PRIVATE_KEY = nbWallet.privateKey;
var NB_PUBLIC_KEY = nbWallet.address;

async function deploy() {
    const NBUtilityNFT = await hre.ethers.getContractFactory("NBUtilityNFT");
    const nbUtilityNFT = await NBUtilityNFT.deploy();
    await nbUtilityNFT.waitForDeployment();
    NB_UTILITY_NFT_ADDRESS = await nbUtilityNFT.getAddress();
    console.log("NBUtilityNFT deployed to:", NB_UTILITY_NFT_ADDRESS);

    const NBStakingReward = await hre.ethers.getContractFactory("NBStakingReward");
    const nbStakingReward = await NBStakingReward.deploy(NB_PUBLIC_KEY, NB_UTILITY_NFT_ADDRESS);
    await nbStakingReward.waitForDeployment();
    NB_STAKING_REWARD_ADDRESS = await nbStakingReward.getAddress();
    console.log("NBStakingReward deployed to:", NB_STAKING_REWARD_ADDRESS);
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });