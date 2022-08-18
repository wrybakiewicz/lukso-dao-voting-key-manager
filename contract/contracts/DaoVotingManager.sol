pragma solidity ^0.8.0;

import {ILSP7DigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DaoVotingManager {
    using Counters for Counters.Counter;

    enum Vote {PENDING, YES, NO}

    struct Proposal {
        uint id;
        address createdBy;
        uint createdAt;

        uint256 operation;
        address to;
        uint value;
        bytes payload;

        uint yesVotes;
        uint noVotes;
    }

    LSP0ERC725Account public account;
    ILSP7DigitalAsset public daoGovernanceToken;
    string public daoName;
    uint public tokensToCreateProposal;
    uint public minTokensToExecuteProposal;
    uint public proposalTimeToVoteInSeconds;
    mapping(address => uint) public depositorsBalances;
    Counters.Counter internal proposalIdCounter = Counters.Counter(1);
    uint public lastExecutedProposalId;
    mapping(address => mapping(uint => Vote)) internal addressToProposalIdToVote;
    mapping(uint => Proposal) internal proposalIdToProposal;

    constructor(address _daoGovernanceTokenAddress, string memory _daoName,
        uint _tokensToCreateProposal, uint _minTokensToExecuteProposal, uint _proposalTimeToVoteInSeconds) {
        daoGovernanceToken = ILSP7DigitalAsset(_daoGovernanceTokenAddress);
        uint _totalSupply = daoGovernanceToken.totalSupply();
        require(_tokensToCreateProposal <= _totalSupply, "Tokens to create proposal must be <= total supply");
        require(_minTokensToExecuteProposal <= _totalSupply, "Min tokens to create proposal must be <= total supply");

        account = new LSP0ERC725Account(address(this));
        daoName = _daoName;
        tokensToCreateProposal = _tokensToCreateProposal;
        minTokensToExecuteProposal = _minTokensToExecuteProposal;
        proposalTimeToVoteInSeconds = _proposalTimeToVoteInSeconds;
    }

    function deposit(uint _amount) public {
        daoGovernanceToken.transfer(msg.sender, address(this), _amount, true, "");
        depositorsBalances[msg.sender] = _amount;
    }

    function createProposal(uint256 _operation, address _to, uint256 _value, bytes calldata _data) public {
        require(depositorsBalances[msg.sender] >= tokensToCreateProposal, "Not enough deposited tokens");
        uint proposalId = proposalIdCounter.current();

        proposalIdToProposal[proposalId] = Proposal(proposalId, msg.sender, block.timestamp, _operation, _to, _value, _data, 0, 0);
        proposalIdCounter.increment();
    }

    function getProposals() public view returns (Proposal[] memory) {
        uint proposalCount = proposalIdCounter.current() - 1;
        Proposal[] memory result = new Proposal[](proposalCount);
        for (uint i = 1; i <= proposalCount; i++) {
            result[i - 1] = proposalIdToProposal[i];
        }
        return result;
    }
}
