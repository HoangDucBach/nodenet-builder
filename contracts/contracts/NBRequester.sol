// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {NBAccessControl} from "./NBAccessControl.sol";
import {INBRequester} from "./interfaces/INBRequester.sol";
import {RrpRequesterV0} from "@api3/airnode-protocol/contracts/rrp/requesters/RrpRequesterV0.sol";

contract NBRequester is INBRequester, NBAccessControl, RrpRequesterV0 {
    mapping(bytes32 => bool) public pendingRequests;
    mapping(bytes32 => address) public requestToAddress; // Lưu trữ địa chỉ liên kết với mỗi request
    mapping(address => uint256) public addressToDelta; // Lưu trữ giá trị delta cho mỗi địa chỉ

    // Event để thông báo khi delta được cập nhật
    event DeltaUpdated(address indexed targetAddress, uint256 newDelta);

    constructor(
        address _airnodeRrpAddress
    ) RrpRequesterV0(_airnodeRrpAddress) {}

    function makeRequest(
        address airnode,
        bytes32 endpointId,
        address sponsor,
        address sponsorWallet,
        bytes calldata parameters,
        address targetAddress // Địa chỉ cần tính delta
    ) external {
        bytes32 requestId = airnodeRrp.makeFullRequest(
            airnode,
            endpointId,
            sponsor,
            sponsorWallet,
            address(this),
            this.fulfill.selector,
            parameters
        );
        pendingRequests[requestId] = true;
        requestToAddress[requestId] = targetAddress; // Lưu địa chỉ liên kết với request
    }

    function fulfill(
        bytes32 requestId,
        bytes calldata data
    ) external onlyAirnodeRrp {
        require(pendingRequests[requestId], "Request not found");
        pendingRequests[requestId] = false;

        // Lấy địa chỉ liên kết với request
        address targetAddress = requestToAddress[requestId];

        // Giải mã dữ liệu nhận được từ Airnode (giả sử là uint256)
        uint256 delta = abi.decode(data, (uint256));

        // Lưu giá trị delta cho địa chỉ
        addressToDelta[targetAddress] = delta;

        // Phát ra sự kiện
        emit DeltaUpdated(targetAddress, delta);
    }

    function request(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external override {
        // Triển khai logic của INBRequester interface
        // Ví dụ: bạn có thể sử dụng giá trị delta đã lưu cho địa chỉ _to
        uint256 delta = addressToDelta[_to];

        // Thực hiện các hành động cần thiết với giá trị delta
        // (Ví dụ: tính toán, cập nhật trạng thái, v.v.)

        // Gửi transaction tới _to nếu cần
        if (_value > 0) {
            // Thực hiện chuyển tiền
            // Lưu ý: Cần cẩn thận với các vấn đề bảo mật khi chuyển tiền
        }

        if (_data.length > 0) {
            // Gọi hàm với _data
            (bool success, ) = _to.call{value: _value}(_data);
            require(success, "External call failed");
        }
    }

    function getDelta(address _address) external view returns (uint256) {
        return addressToDelta[_address];
    }
}
