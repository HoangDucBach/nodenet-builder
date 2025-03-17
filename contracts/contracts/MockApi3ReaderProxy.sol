// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IApi3ReaderProxy} from "@api3/contracts/interfaces/IApi3ReaderProxy.sol";

contract MockApi3ReaderProxy is IApi3ReaderProxy {
    int224 private delta;
    uint32 private timestamp;

    function setDelta(int224 _delta) external {
        delta = _delta;
        timestamp = uint32(block.timestamp);
    }

    function read() external view override returns (int224, uint32) {
        return (delta, timestamp);
    }
}
