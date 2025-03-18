// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INBRewardVerifier {
    function verifyReward(
        address _player,
        int224 _delta,
        uint256 _timestamp,
        bytes calldata _signature
    ) external view returns (bool);
}
