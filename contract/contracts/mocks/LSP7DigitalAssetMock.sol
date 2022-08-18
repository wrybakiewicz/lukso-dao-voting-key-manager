pragma solidity ^0.8.0;

import {LSP7DigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";

contract LSP7DigitalAssetMock is LSP7DigitalAsset {

    constructor() LSP7DigitalAsset("Mock", "M", msg.sender, false) {
        _mint(msg.sender, 10 ether, true, "");
    }
}
