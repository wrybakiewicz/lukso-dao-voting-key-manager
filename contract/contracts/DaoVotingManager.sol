pragma solidity ^0.8.0;

import {ILSP7DigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DaoVotingManager is ReentrancyGuard {
    using Counters for Counters.Counter;

    enum Vote {PENDING, YES, NO}

    enum Status {PENDING, EXECUTED, EXECUTION_FAILED, FAILED}

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

        Status status;
    }

    LSP0ERC725Account public account;
    ILSP7DigitalAsset public daoGovernanceToken;
    string public daoName;
    uint public tokensToCreateProposal;
    uint public minTokensToExecuteProposal;
    uint public proposalTimeToVoteInSeconds;
    mapping(address => uint) public depositorsBalances;
    mapping(address => uint) public proposalDepositorsBalances;
    Counters.Counter internal proposalIdCounter = Counters.Counter(1);
    mapping(address => mapping(uint => Vote)) public addressToProposalIdToVote;
    mapping(uint => Proposal) internal proposalIdToProposal;
    mapping(address => uint) public addressToLastVotedProposalId;

    constructor(address _daoGovernanceTokenAddress, string memory _daoName,
        uint _tokensToCreateProposal, uint _minTokensToExecuteProposal, uint _proposalTimeToVoteInSeconds) {
        daoGovernanceToken = ILSP7DigitalAsset(_daoGovernanceTokenAddress);
        uint _totalSupply = daoGovernanceToken.totalSupply();
        daoGovernanceToken.authorizeOperator(address(this), type(uint256).max);
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
        depositorsBalances[msg.sender] += _amount;
    }

    function withdraw(uint _amount) public {
        uint lastVotedProposalId = addressToLastVotedProposalId[msg.sender];
        require(proposalIdToProposal[lastVotedProposalId].createdAt + proposalTimeToVoteInSeconds < block.timestamp, "Cannot withdraw before: last voted proposal created at time + proposalTimeToVoteInSeconds");
        require(_amount <= depositorsBalances[msg.sender], "Amount must be <= deposit");
        depositorsBalances[msg.sender] -= _amount;
        daoGovernanceToken.transfer(address(this), msg.sender, _amount, true, "");
    }

    function createProposal(uint256 _operation, address _to, uint256 _value, bytes calldata _data) public {
        uint _tokensToCreateProposal = tokensToCreateProposal;
        require(depositorsBalances[msg.sender] >= _tokensToCreateProposal, "Not enough deposited tokens");
        uint proposalId = proposalIdCounter.current();

        proposalIdToProposal[proposalId] = Proposal(proposalId, msg.sender, block.timestamp, _operation, _to, _value, _data, 0, 0, Status.PENDING);
        depositorsBalances[msg.sender] -= _tokensToCreateProposal;
        proposalDepositorsBalances[msg.sender] += _tokensToCreateProposal;
        addressToLastVotedProposalId[msg.sender] = proposalId;
        proposalIdCounter.increment();
    }

    function vote(uint _proposalId, bool _vote) public {
        require(depositorsBalances[msg.sender] > 0, "Address must have some deposit");
        require(addressToProposalIdToVote[msg.sender][_proposalId] == Vote.PENDING, "Address already voted");
        Proposal memory proposal = proposalIdToProposal[_proposalId];
        require(proposal.createdAt + proposalTimeToVoteInSeconds > block.timestamp, "Too late to vote");

        if (_proposalId > addressToLastVotedProposalId[msg.sender]) {
            addressToLastVotedProposalId[msg.sender] = _proposalId;
        }
        uint senderBalance = depositorsBalances[msg.sender];
        uint _yesVotes = proposal.yesVotes;
        uint _noVotes = proposal.noVotes;
        if (_vote) {
            _yesVotes += senderBalance;
            proposal.yesVotes = _yesVotes;
            addressToProposalIdToVote[msg.sender][_proposalId] = Vote.YES;
        } else {
            _noVotes += senderBalance;
            proposal.noVotes = _noVotes;
            addressToProposalIdToVote[msg.sender][_proposalId] = Vote.NO;
        }
        proposalIdToProposal[_proposalId] = proposal;
    }

    function finalize(uint _proposalId) public nonReentrant {
        Proposal memory proposal = proposalIdToProposal[_proposalId];
        require(proposal.createdAt + proposalTimeToVoteInSeconds < block.timestamp, "Too early to execute");
        require(proposal.status == Status.PENDING, "Proposal status must be PENDING");

        uint _yesVotes = proposal.yesVotes;
        if(_yesVotes > proposal.noVotes && _yesVotes >= minTokensToExecuteProposal) {
            try account.execute(proposal.operation, proposal.to, proposal.value, proposal.payload) {
                proposal.status = Status.EXECUTED;
            } catch {
                proposal.status = Status.EXECUTION_FAILED;
            }
        } else {
            proposal.status = Status.FAILED;
        }
        proposalIdToProposal[_proposalId] = proposal;
        address _createdBy = proposal.createdBy;
        uint _tokensToCreateProposal = tokensToCreateProposal;
        depositorsBalances[_createdBy] += _tokensToCreateProposal;
        proposalDepositorsBalances[_createdBy] -= _tokensToCreateProposal;
    }

    function getProposals() public view returns (Proposal[] memory) {
        uint proposalCount = proposalIdCounter.current() - 1;
        Proposal[] memory result = new Proposal[](proposalCount);
        for (uint i = 1; i <= proposalCount; i++) {
            result[i - 1] = proposalIdToProposal[i];
        }
        return result;
    }

    function getPossibleWithdrawTime() public view returns (uint) {
        uint lastVotedProposalId = addressToLastVotedProposalId[msg.sender];
        return proposalIdToProposal[lastVotedProposalId].createdAt + proposalTimeToVoteInSeconds;
    }
}
