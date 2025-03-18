// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {INBStakingReward} from "./interfaces/INBStakingReward.sol";
import {INBUtilityNFT} from "./interfaces/INBUtilityNFT.sol";
import {NBAccessControl} from "./NBAccessControl.sol";
import {NBRewardVerifier} from "./NBRewardVerifier.sol";

contract NBStakingReward is
    INBStakingReward,
    NBAccessControl,
    NBRewardVerifier
{
    INBUtilityNFT public utilityNFT;

    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public rewards;

    mapping(address => uint256) public multiplierUtilities;
    mapping(address => uint256) public insuranceUtilities;
    mapping(address => uint256) public boostUtilities;

    mapping(address => uint256) public lastClaimTimestamp;

    constructor(address _nbPublicKey,
        address _utilityNFT
    ) NBRewardVerifier(_nbPublicKey) {
        utilityNFT = INBUtilityNFT(_utilityNFT);
    }

    receive() external payable {}

    fallback() external payable {}

    modifier onlyStaker() {
        require(stakes[msg.sender].amount > 0, "NBStakingReward: not staker");
        _;
    }

    function setUtilityNFT(address _utilityNFT) external onlyRole(ADMIN_ROLE) {
        utilityNFT = INBUtilityNFT(_utilityNFT);
    }

    function stake() external payable override {
        require(msg.value > 0, "NBStakingReward: must send CORE to stake");

        if (stakes[msg.sender].amount == 0) {
            stakes[msg.sender].timestamp = block.timestamp;
        }

        uint256 boost = 0;

        if (boostUtilities[msg.sender] != 0) {
            uint256 id = boostUtilities[msg.sender];
            boost = utilityNFT.getUtility(id).value;
            utilityNFT.burn(msg.sender, id, 1);
        }

        stakes[msg.sender].amount += msg.value + boost;

        emit Stake(msg.sender, msg.value);
    }

    function unstake(uint256 amount) external payable override onlyStaker {
        require(
            stakes[msg.sender].amount >= amount,
            "NBStakingReward: not enough staked amount"
        );

        payable(msg.sender).transfer(amount);
        stakes[msg.sender].amount -= amount;

        emit Unstake(msg.sender, amount);
    }

    function _calculateReward(
        uint256 amount,
        int224 delta,
        uint256 multiplier,
        uint256 insurance
    ) internal pure returns (uint256) {
        if (amount == 0) {
            return 0;
        }

        if (delta < 0) {
            uint256 penalty = uint256(uint224(delta * -1));
            uint256 cover = (penalty * insurance) / 100;

            penalty -= cover;

            return (amount > penalty) ? (amount - penalty) : 0;
        } else {
            return (amount + uint256(uint224(delta))) * multiplier;
        }
    }

    function calculateReward(
        address account,
        int224 delta,
        uint256 timestamp,
        bytes calldata signature
    ) external view override returns (uint256) {
        uint256 multiplier = multiplierUtilities[account] != 0
            ? utilityNFT.getUtility(multiplierUtilities[account]).value
            : 1;

        uint256 insurance = insuranceUtilities[account] != 0
            ? utilityNFT.getUtility(insuranceUtilities[account]).value
            : 0;

        require(
            verifyReward(account, delta, timestamp, signature),
            "NBStakingReward: invalid signature"
        );

        uint256 reward = _calculateReward(
            stakes[account].amount,
            delta,
            multiplier,
            insurance
        );

        return reward;
    }

    function claim(
        int224 delta,
        uint256 timestamp,
        bytes calldata signature
    ) external payable override onlyStaker {
        uint256 multiplier = multiplierUtilities[msg.sender] != 0
            ? utilityNFT.getUtility(multiplierUtilities[msg.sender]).value
            : 1;

        uint256 insurance = insuranceUtilities[msg.sender] != 0
            ? utilityNFT.getUtility(insuranceUtilities[msg.sender]).value
            : 0;

        require(
            verifyReward(msg.sender, delta, timestamp, signature),
            "NBStakingReward: invalid signature"
        );

        require(
            lastClaimTimestamp[msg.sender] < timestamp,
            "NBStakingReward: already claimed"
        );

        lastClaimTimestamp[msg.sender] = timestamp;

        uint256 reward = _calculateReward(
            stakes[msg.sender].amount,
            delta,
            multiplier,
            insurance
        );

        require(reward > 0, "NBStakingReward: no reward");
        require(
            address(this).balance >= reward,
            "NBStakingReward: not enough balance"
        );

        if (multiplierUtilities[msg.sender] != 0) {
            utilityNFT.burn(msg.sender, multiplierUtilities[msg.sender], 1);
            multiplierUtilities[msg.sender] = 0;
        }

        if (insuranceUtilities[msg.sender] != 0) {
            utilityNFT.burn(msg.sender, insuranceUtilities[msg.sender], 1);
            insuranceUtilities[msg.sender] = 0;
        }

        rewards[msg.sender] = 0;
        stakes[msg.sender].amount = reward;

        payable(msg.sender).transfer(reward);

        emit Claim(msg.sender, reward);
    }

    function applyUtility(
        address account,
        uint256[] calldata ids
    ) external override {
        for (uint256 i = 0; i < ids.length; i++) {
            require(
                utilityNFT.balanceOf(account, ids[i]) > 0,
                "NBStakingReward: not own utility"
            );

            INBUtilityNFT.NBUtility memory utility = utilityNFT.getUtility(
                ids[i]
            );

            if (utility.utilityType == INBUtilityNFT.NBUtilityType.Multiplier) {
                require(
                    multiplierUtilities[account] == 0,
                    "NBStakingReward: already have Multiplier utility"
                );
                multiplierUtilities[account] = ids[i];
            } else if (
                utility.utilityType == INBUtilityNFT.NBUtilityType.Insurance
            ) {
                require(
                    insuranceUtilities[account] == 0,
                    "NBStakingReward: already have Insurance utility"
                );
                insuranceUtilities[account] = ids[i];
            } else if (
                utility.utilityType == INBUtilityNFT.NBUtilityType.Boost
            ) {
                require(
                    boostUtilities[account] == 0,
                    "NBStakingReward: already have Boost utility"
                );
                boostUtilities[account] = ids[i];
            }
        }
    }

    function getStakeInfo(
        address account
    ) external view override returns (StakeInfo memory) {
        return stakes[account];
    }

    function getReward(
        address account
    ) external view override returns (uint256) {
        return rewards[account];
    }
}
