// SPDX-License-Identifier: mit
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

contract DAOVotingManager2 {
    using Counters for Counters.Counter;

    enum Vote {PENDING, YES, NO}
    enum OperationType {ADD_OWNER, REMOVE_OWNER, EXECUTE}

    enum Status {PENDING, ACCEPTED, DECLINED}

    struct Data {
        OperationType operation;

        //for EXECUTE
        bytes payload;
        address to;
        uint value;

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

    modifier isVotingPending(uint _transactionId) {
        require(transactionIdToStatus[_transactionId] == Status.PENDING, "Vote must be in PENDING status");
        _;
    }

    LSP0ERC725Account public account;
    uint public minimumOwnersToExecute;
    string public daoName;
    address[] internal owners;
    Counters.Counter internal transactionIdCounter;
    mapping(uint => Data) internal transactionIdToData;
    mapping(uint => Status) internal transactionIdToStatus;
    mapping(uint => mapping(address => Vote)) transactionIdToOwnerToVote;

    constructor(uint _minimumOwnersToExecute, string memory _daoName, address[] memory _owners) {
        require(_minimumOwnersToExecute <= _owners.length, "Minimum owners to execute < owners count");
        minimumOwnersToExecute = _minimumOwnersToExecute;
        daoName = _daoName;
        owners = _owners;
        account = new LSP0ERC725Account(address(this));
    }

    function addOwnerPropose(address _newOwner, uint _newMinimumOwnersToExecute) public onlyDaoOwners notAnOwner(_newOwner) {
        uint ownersLength = owners.length;
        require(_newMinimumOwnersToExecute <= ownersLength + 1, "New minimum owners to execute must be < owners count");

        uint transactionId = transactionIdCounter.current();
        Data memory data = Data(OperationType.ADD_OWNER, "", address(0), 0, _newMinimumOwnersToExecute, _newOwner);

        transactionIdCounter.increment();
        transactionIdToData[transactionId] = data;
        transactionIdToOwnerToVote[transactionId][msg.sender] = Vote.YES;
        if (minimumOwnersToExecute == 1) {
            addOwner(_newOwner, _newMinimumOwnersToExecute);
            transactionIdToStatus[transactionId] = Status.ACCEPTED;
        }
    }

    function executePropose(bytes calldata _payload, address _address, uint _value) public onlyDaoOwners {
        uint transactionId = transactionIdCounter.current();
        Data memory data = Data(OperationType.EXECUTE, _payload, _address, _value, 0, address(0));

        transactionIdCounter.increment();
        transactionIdToData[transactionId] = data;
        transactionIdToOwnerToVote[transactionId][msg.sender] = Vote.YES;
        if (minimumOwnersToExecute == 1) {
            execute(_payload, _address, _value);
            transactionIdToStatus[transactionId] = Status.ACCEPTED;
        }
    }

    function execute(uint _transactionId, Vote _vote) public onlyDaoOwners isVotingPending(_transactionId) {
        transactionIdToOwnerToVote[_transactionId][msg.sender] = _vote;

        if (_vote != Vote.PENDING) {
            uint _minimumOwnersToExecute = minimumOwnersToExecute;
            uint votes;
            uint ownersLength = owners.length;

            for (uint i = 0; i < ownersLength; i++) {
                if (transactionIdToOwnerToVote[_transactionId][owners[i]] == _vote) {
                    votes += 1;
                    if (votes >= _minimumOwnersToExecute) {
                        Data memory _data = transactionIdToData[_transactionId];
                        if(_vote == Vote.YES) {
                            execute(_data.payload, _data.to, _data.value);
                            transactionIdToStatus[_transactionId] = Status.ACCEPTED;
                        } else {
                            transactionIdToStatus[_transactionId] = Status.DECLINED;
                        }
                        break;
                    }
                }

            }
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

    function addOwner(address _newOwner, uint _newMinimumOwnersToExecute) internal {
        owners.push(_newOwner);
        minimumOwnersToExecute = _newMinimumOwnersToExecute;
    }

    function execute(bytes memory _payload, address _address, uint _value) internal {
        account.execute(0, _address, _value, _payload);
    }
}
