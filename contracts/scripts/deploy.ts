import hre from "hardhat";

var NB_STAKING_REWARD_ADDRESS = "0x0CfAe8A1f3D56439bBa4733BB16D8A96b4eA74E6";
var NB_UTILITY_NFT_ADDRESS = "0xa34d09E2Cfc3F22CB77a9e4E81593Bb2b85c3002";

async function deploy() {
    const NBUtilityNFT = await hre.ethers.getContractFactory("NBUtilityNFT");
    const nbUtilityNFT = await NBUtilityNFT.deploy();
    await nbUtilityNFT.waitForDeployment();
    NB_UTILITY_NFT_ADDRESS = await nbUtilityNFT.getAddress();
    console.log("NBUtilityNFT deployed to:", NB_UTILITY_NFT_ADDRESS);

    const NBStakingReward = await hre.ethers.getContractFactory("NBStakingReward");
    const nbStakingReward = await NBStakingReward.deploy(NB_STAKING_REWARD_ADDRESS, NB_UTILITY_NFT_ADDRESS);
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