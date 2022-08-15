// SPDX-License-Identifier: mit
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";

contract DAOVotingManager {
    using Counters for Counters.Counter;

    enum Vote {PENDING, YES, NO}
    struct Transaction {
        uint id;
        bytes payload;
        Vote[] votes;
    }

    uint public minimumOwnersToExecute;
    string public daoName;
    address[] internal owners;
    Counters.Counter internal transactionIdCounter;
    mapping(uint => bytes) internal transactionIdToPayload;
    mapping(uint => mapping(address => Vote)) transactionIdToOwnerToVote;

    constructor(uint _minimumOwnersToExecute, string memory _daoName, address[] memory _owners) {
        minimumOwnersToExecute = _minimumOwnersToExecute;
        daoName = _daoName;
        owners = _owners;
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    //TODO: test with some transactions
    function getTransactions() public view returns (Transaction[] memory) {
        uint counterValue = transactionIdCounter.current();
        uint ownersLength = owners.length;
        Transaction[] memory result = new Transaction[](counterValue);
        for (uint i = 0; i < counterValue; i++) {
            Vote[] memory votes = new Vote[](ownersLength);
            for (uint j = 0; j < ownersLength; j++) {
                votes[j] = transactionIdToOwnerToVote[i][owners[j]];
            }
            result[i] = Transaction(i, transactionIdToPayload[i], votes);
        }
        return result;
    }
}
