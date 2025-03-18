// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {INBUtilityNFT} from "./interfaces/INBUtilityNFT.sol";
import {NBAccessControl} from "./NBAccessControl.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract NBUtilityNFT is INBUtilityNFT, NBAccessControl, ERC1155 {
    mapping(uint256 => NBUtility) public utilities;

    uint256 public constant INITIAL_MULTIPLIER = 2;
    uint256 public constant INITIAL_INSURANCE_PERCENTAGE = 10;
    uint256 public constant INITIAL_BOOST = 5e16;

    mapping(NBUtilityType => uint256) public utilityValues;

    constructor() ERC1155("") {
        utilityValues[NBUtilityType.Multiplier] = INITIAL_MULTIPLIER;
        utilityValues[NBUtilityType.Insurance] = INITIAL_INSURANCE_PERCENTAGE;
        utilityValues[NBUtilityType.Boost] = INITIAL_BOOST;
    }

    modifier onlyExistingUtility(uint256 id) {
        require(
            utilities[id].utilityType != NBUtilityType(0),
            "NBUtilityNFT: Utility does not exist"
        );
        _;
    }

    function setUp(
        address _nbStakingRewardAddress
    ) external onlyRole(ADMIN_ROLE) {
        setApprovalForAll(_nbStakingRewardAddress, true);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(NBAccessControl, IERC165, ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function mint(
        address to,
        NBUtilityType utilityType,
        uint256 amount
    ) external override onlyRole(ADMIN_ROLE) {
        uint256 id = uint256(utilityType);
        utilities[id] = NBUtility({
            utilityType: utilityType,
            value: utilityValues[utilityType]
        });
        _mint(to, id, amount, "");

        emit Mint(to, id, amount);
    }

    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external override onlyExistingUtility(id) {
        _burn(from, id, amount);

        emit Burn(from, id, amount);
    }

    function getUtility(
        uint256 id
    ) external view override returns (NBUtility memory) {
        return utilities[id];
    }

    function setUtilityValue(
        NBUtilityType utilityType,
        uint256 value
    ) external override onlyRole(ADMIN_ROLE) {
        utilityValues[utilityType] = value;
    }

    function getUtilityValue(
        NBUtilityType utilityType
    ) external view override returns (uint256) {
        return utilityValues[utilityType];
    }
}
