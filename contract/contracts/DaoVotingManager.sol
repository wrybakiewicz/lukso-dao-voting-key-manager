pragma solidity ^0.8.0;

import {ILSP7DigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";

contract DaoVotingManager {

    LSP0ERC725Account public account;
    ILSP7DigitalAsset public daoGovernanceToken;
    string public daoName;
    uint public minTokensToCreateProposal;
    uint public minTokensToExecuteProposal;
    uint public proposalTimeToVoteInSeconds;
    mapping(address => uint) public depositorsBalances;

    constructor(address _daoGovernanceTokenAddress, string memory _daoName,
        uint _minTokensToCreateProposal, uint _minTokensToExecuteProposal, uint _proposalTimeToVoteInSeconds) {
        daoGovernanceToken = ILSP7DigitalAsset(_daoGovernanceTokenAddress);
        uint _totalSupply = daoGovernanceToken.totalSupply();
        require(_minTokensToCreateProposal <= _totalSupply, "Min tokens to create proposal must be <= total supply");
        require(_minTokensToExecuteProposal <= _totalSupply, "Min tokens to create proposal must be <= total supply");

        account = new LSP0ERC725Account(address(this));
        daoName = _daoName;
        minTokensToCreateProposal = _minTokensToCreateProposal;
        minTokensToExecuteProposal = _minTokensToExecuteProposal;
        proposalTimeToVoteInSeconds = _proposalTimeToVoteInSeconds;
    }

    function deposit(uint _amount) public {
        daoGovernanceToken.transfer(msg.sender, address(this), _amount, true, "");
    }
}
