import hre from "hardhat";

var NB_STAKING_REWARD_ADDRESS = "0x0000000000000000000000000000000000000001";
var NB_UTILITY_NFT_ADDRESS = "";
var API3_READER_PROXY_ADDRESS = "";

async function deploy() {
    const NBUtilityNFT = await hre.ethers.getContractFactory("NBUtilityNFT");
    const nbUtilityNFT = await NBUtilityNFT.deploy();
    await nbUtilityNFT.waitForDeployment();
    NB_UTILITY_NFT_ADDRESS = await nbUtilityNFT.getAddress();
    console.log("NBUtilityNFT deployed to:", NB_UTILITY_NFT_ADDRESS);

    const NBStakingReward = await hre.ethers.getContractFactory("NBStakingReward");
    const nbStakingReward = await NBStakingReward.deploy();
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