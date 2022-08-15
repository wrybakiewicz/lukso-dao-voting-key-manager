// SPDX-License-Identifier: mit
pragma solidity ^0.8.9;

contract DAOVotingManager {

    uint public minimumOwnersToExecute;
    string public daoName;
    address[] internal owners;

    constructor(uint _minimumOwnersToExecute, string memory _daoName, address[] memory _owners) {
        minimumOwnersToExecute = _minimumOwnersToExecute;
        daoName = _daoName;
        owners = _owners;
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

}
