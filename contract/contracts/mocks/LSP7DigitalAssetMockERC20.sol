pragma solidity ^0.8.0;

import {LSP7CompatibleERC20} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/extensions/LSP7CompatibleERC20.sol";

contract LSP7DigitalAssetMockERC20 is LSP7CompatibleERC20 {

    constructor(address[] memory owners) LSP7CompatibleERC20("My DAO Token", "MDT", msg.sender) {
        _mint(msg.sender, 10 ether, true, "");
        for(uint i=0; i<owners.length; i++) {
            _mint(owners[i], 4 ether, true, "");
        }
    }
}
