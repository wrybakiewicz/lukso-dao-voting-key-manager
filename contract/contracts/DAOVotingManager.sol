// SPDX-License-Identifier: mit
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

contract DAOVotingManager {
    using Counters for Counters.Counter;

    enum Vote {PENDING, YES, NO}
    enum OperationType {ADD_OWNER, REMOVE_OWNER, EXECUTE}

    enum Status {PENDING, ACCEPTED, DECLINED}

    struct Data {
        OperationType operation;

        //for EXECUTE
        bytes payload;
        address contractAddress;

        //for ADD_OWNER and REMOVE_OWNER
        uint newMinimumOwnersToExecute;
        address owner;
    }

    struct AddressVote {
        Vote vote;
        address owner;
    }

    struct Transaction {
        uint id;
        Data data;
        AddressVote[] addressVotes;
        Status status;
    }

    modifier onlyDaoOwners() {
        bool isOwner = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == msg.sender) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Executor must be owner of a dao");
        _;
    }

    modifier notAnOwner(address _address) {
        bool isOwner = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == _address) {
                isOwner = true;
                break;
            }
        }
        require(!isOwner, "Address cannot be an owner");
        _;
    }

    LSP0ERC725Account account;
    uint public minimumOwnersToExecute;
    string public daoName;
    address[] internal owners;
    Counters.Counter internal transactionIdCounter;
    mapping(uint => Data) internal transactionIdToData;
    mapping(uint => Status) internal transactionIdToStatus;
    mapping(uint => mapping(address => Vote)) transactionIdToOwnerToVote;

    constructor(uint _minimumOwnersToExecute, string memory _daoName, address[] memory _owners) {
        minimumOwnersToExecute = _minimumOwnersToExecute;
        daoName = _daoName;
        owners = _owners;
        account = new LSP0ERC725Account(address(this));
    }

    function addOwner(address _newOwner, uint _newMinimumOwnersToExecute) public onlyDaoOwners notAnOwner(_newOwner) {
        uint ownersLength = owners.length;
        require(_newMinimumOwnersToExecute <= ownersLength + 1, "New minimum owners to execute must be < owners count");

        uint256 transactionId = transactionIdCounter.current();
        Data memory data = Data(OperationType.ADD_OWNER, "", address(0), _newMinimumOwnersToExecute, _newOwner);

        transactionIdCounter.increment();
        transactionIdToData[transactionId] = data;
        transactionIdToOwnerToVote[transactionId][msg.sender] = Vote.YES;
        if(minimumOwnersToExecute == 1) {
            addOwnerExecute(_newOwner, _newMinimumOwnersToExecute);
            transactionIdToStatus[transactionId] = Status.ACCEPTED;
        }
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactions() public view returns (Transaction[] memory) {
        uint counterValue = transactionIdCounter.current();
        uint ownersLength = owners.length;
        Transaction[] memory result = new Transaction[](counterValue);
        for (uint i = 0; i < counterValue; i++) {
            AddressVote[] memory addressVotes = new AddressVote[](ownersLength);
            for (uint j = 0; j < ownersLength; j++) {
                address owner = owners[j];
                addressVotes[j] = AddressVote(transactionIdToOwnerToVote[i][owner], owner);
            }
            result[i] = Transaction(i, transactionIdToData[i], addressVotes, transactionIdToStatus[i]);
        }
        return result;
    }

    function addOwnerExecute(address _newOwner, uint _newMinimumOwnersToExecute) internal {
        owners.push(_newOwner);
        minimumOwnersToExecute = _newMinimumOwnersToExecute;
    }
}
