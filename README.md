# DAO Voting Manager

## Info

This project is submission for **Hackathon: LUKSO Build UP! #1** DAO Voting Key Manager For UP Based DAO And Interface
task.

Working dApp:  [daovotingmanager.com](https://www.daovotingmanager.com/)

Done by **Wojciech Rybakiewicz** \
wojtek.rybakiewicz@gmail.com

## Short description

DAO Voting Manager provides on chain voting mechanism being equivalent of **LSP6KeyManager** for DAOs.

It's build on top of the **LSP0ERC725Account** - used for holding DAO assets. For governance each DAO Voting Manager
contract uses its own token compliant with **LSP7DigitalAsset**.

Token holders are allowed to create and vote for DAO proposals - e.g. transferring LYXt or DAO governance token. There
is time to vote for proposals - specified during deploying contract. After time to vote the proposal can be executed -
if passed, or if failed - deposit to create proposal is returned to its creator.

**DAO Voting Manager** is designed to be easy plug and play tool for DAOs that wants to have on-chain voting.

## Project contains:

- Frontend app
- Smart Contract being equivalent of **LSP6 - Key Manager** for DAOs
- Backend aggregating data for Frontend app

## Description of Dapp

To interact with Dapp user needs to have UP Browser Extension set up.

Deploying **DAO Voting Manager** requires providing DAO governance token compliant with **LSP7DigitalAsset** which will
be used for voting in this DAO.

#### Deploy Section - allows deploying new DAO Voting Manager

User needs to provide:

- DAO name
- Governance Token Address - compliant with **LSP7DigitalAsset** that will be used for governance
- Number of tokens to create proposal - number of governance tokens to create proposal in DAO
- Minimum tokens to execute proposal - minimum number of governance tokens that are required to be voted on 'Yes' to
  proposal to pass
- Proposal time to vote - time to voters to vote on proposal - after which it's failed or can be executed

#### Manage Section - allows creating proposals and voting in existing DAOs

**DAO Voting Manager** for particular DAO can be found by address or be chosen from list of all DAO Voting Managers.

**Overview** section - shows all **DAO Voting Manager** details, governance contract details and balances of DAO
Account.

**Deposit** section - to participate in governance - DAO governance token holders needs to deposit tokens to DAO Voting
Manager contract. Those funds can be withdrawn in **Withdraw** section. The reasons for this design are described below
in **Proposal spam and double voting prevention**.

**Withdraw** section - after participating in governance, governance token holders can withdraw their tokens. Funds can
be withdrawn after ending of last proposal that user voted on or created.

**Proposals** section - contains list of ongoing and historical proposals.

DAO governance token holders can vote on proposals. For proposal to pass it needs more 'Yes' than 'No' votes and minimum
of 'Yes' votes set in 'Minimum tokens to execute proposal' property during DAO Voting Manager contract deployment.

In **Proposals** section token holders can also create new Proposals - to create one there is required a deposit of
governance tokens, which number is defined when deploying contract. Those tokens are locked until proposal end and are
returned to user after execution or if failed - creator can use 'Get deposit back' button on proposal.

Execution of successful proposal can be done after vote time if proposal passed. It can be done one time and can be
indicated by anyone by clicking 'Execute' button.

After execution proposal changes state to 'Executed' - if executed without errors or 'Execution failed' - if proposed
transaction failed. This may happen when network change its state during voting time - e.g. tokens was already
transferred to some other address.

**Proposal spam and double voting prevention**

To prevent voting more than one time with the same tokens DAO members needs to deposit their tokens as described above.

Another mechanism preventing malicious DAO members from creating huge number of proposals is requirement of deposit when
creating proposal. This deposit is not participating in voting and is returned afterwards as described above.

## Technical Details

### Smart contracts

**DaoVotingManager** is smart contract that is deployed on frontend 'Deploy' section and providing all functions to
dApp:

- deposit
- withdraw
- createProposal
- vote
- finalize
- getProposals
- getPossibleWithdrawTime

There are also mock contracts implementing LSP7DigitalAsset used as example governance token in DaoVotingManager
contract

- **LSP7DigitalAssetMockERC20**
- **LSP7DigitalAssetMock**

They are used in unit tests and for manual testing and presentation purposes in dApp.

### Frontend

Frontend is React app that connects with **DaoVotingManager** contract and its **LSP7DigitalAsset** governance token
contract.

It also uses AWS lambdas for better UX - having 'All DAOs list' in 'Manage' section.

### Backend

Backend contains of 2 AWS Lambdas that aggregates 'DAO Voting Manager list' data for frontend app in PostgreSQL
database.

- addDaoByTxHash - based on transaction hash saves newly deployed DAO Voting Manager contract address with its details
- getDaos - returns all DAO Voting Managers contract addresses with details (so frontend users can easily access them
  without providing exact contract address)