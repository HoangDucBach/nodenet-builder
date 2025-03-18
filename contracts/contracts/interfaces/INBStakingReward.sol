// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INBStakingReward {
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    }

    /// @notice Stake to play Nodenet Builder
    function stake() external payable;

    /// @notice Unstake to stop playing Nodenet Builder
    /// @param amount Amount of NB to unstake
    function unstake(uint256 amount) external payable;

    /// @notice Claim reward
    /// @param delta Delta of reward
    /// @param timestamp Timestamp of reward
    /// @param signature Signature of reward
    function claim(
        int224 delta,
        uint256 timestamp,
        bytes calldata signature
    ) external payable;

    /// @notice Apply utility
    /// @param account Account to apply utility
    /// @param id Token ID to apply utility
    function applyUtility(address account, uint256[] calldata id) external;

    /// @notice Get stake info
    /// @param account Account to get stake info
    /// @return Stake info
    function getStakeInfo(
        address account
    ) external view returns (StakeInfo memory);

    /// @notice Calculate reward
    /// @param account Account to calculate reward
    /// @param delta Delta of reward
    /// @param timestamp Timestamp of reward
    /// @param signature Signature of reward
    /// @return Reward amount
    function calculateReward(
        address account,
        int224 delta,
        uint256 timestamp,
        bytes calldata signature
    ) external view returns (uint256);

    /// @notice Get reward
    /// @param account Account to get reward
    /// @return Reward amount
    function getReward(address account) external view returns (uint256);

    /// @notice Event emitted when stake
    event Stake(address indexed account, uint256 amount);

    /// @notice Event emitted when unstake
    event Unstake(address indexed account, uint256 amount);

    /// @notice Event emitted when claim
    event Claim(address indexed account, uint256 amount);
}
