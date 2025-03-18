// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INBRequester {
    function request(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external;
}
