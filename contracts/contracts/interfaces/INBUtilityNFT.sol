// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface INBUtilityNFT is IERC1155 {
    enum NBUtilityType {
        Multiplier,
        Insurance,
        Boost
    }

    struct NBUtility {
        NBUtilityType utilityType;
        /// @dev Value of utility
        /// @dev Multiplier: Value present as multiplier coefficient
        /// @dev Insurance: Value present as percentage
        /// @dev Boost: Value present as additional number
        uint256 value;
    }

    /// @notice Mint new NBUtilityNFT
    /// @param to Address to mint
    /// @param utilityType Utility type
    /// @param amount Amount to mint
    function mint(
        address to,
        NBUtilityType utilityType,
        uint256 amount
    ) external;

    /// @notice Burn NBUtilityNFT
    /// @param from Address to burn
    /// @param id Token ID to burn
    /// @param amount Amount to burn
    function burn(address from, uint256 id, uint256 amount) external;

    /// @notice Set utility value
    /// @param utilityType Utility type
    /// @param value Value to set
    function setUtilityValue(NBUtilityType utilityType, uint256 value) external;

    /// @notice Get utility value
    /// @param utilityType Utility type
    /// @return Utility value
    function getUtilityValue(
        NBUtilityType utilityType
    ) external view returns (uint256);

    /// @notice Get utility info
    /// @param id Token ID to get utility info
    /// @return Utility info
    function getUtility(uint256 id) external view returns (NBUtility memory);

    /// @notice Event emitted when mint
    event Mint(address indexed to, uint256 id, uint256 amount);

    /// @notice Event emitted when burn
    event Burn(address indexed account, uint256 id, uint256 amount);
}
