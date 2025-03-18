// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {INBRewardVerifier} from "./interfaces/INBRewardVerifier.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

abstract contract NBRewardVerifier is INBRewardVerifier {
    using ECDSA for bytes32;

    address public nbPublicKey;

    constructor(address _nbPublicKey) {
        nbPublicKey = _nbPublicKey;
    }

    function verifyReward(
        address _player,
        int224 _delta,
        uint256 _timestamp,
        bytes calldata _signature
    ) public view override returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(_player, _delta, _timestamp)
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        address signer = ethSignedMessageHash.recover(_signature);

        return signer == nbPublicKey;
    }
}
