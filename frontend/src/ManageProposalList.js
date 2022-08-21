import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {useEffect, useState} from "react";
import {Button, Table} from "react-bootstrap";
import NewProposalTransfer from "./NewProposalTransfer";
import "./ManageProposalList.css"
import {ContractFactory, ethers} from "ethers";
import {ERC725YKeys} from "@lukso/lsp-smart-contracts/constants";
import {toUtf8String} from "@ethersproject/strings";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import Proposal from "./Proposal";

export default function ManageProposalList({contract, signer, currentAddress, provider, reloadCounter}) {

    const [proposals, setProposals] = useState()
    const [addNewProposalOpened, setAddNewProposalOpened] = useState(false)
    const [governanceTokenSymbol, setGovernanceTokenSymbol] = useState()
    const [tokensToCreateProposal, setTokensToCreateProposal] = useState()
    const [minimumTokensToExecuteProposal, setMinimumTokensToExecuteProposal] = useState()
    const [tokenBalanceDeposited, setTokenBalanceDeposited] = useState()
    const [proposalTimeToVote, setProposalTimeToVote] = useState()

    const initialize = () => {
        contract.getProposals().then(proposals => {
            setProposals(proposals)
        })
        contract.daoGovernanceToken().then(tokenAddress => {
            const contract = ContractFactory.getContract(tokenAddress, LSP7DigitalAsset.abi, provider)
            contract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenSymbol).then(tokenSymbol => setGovernanceTokenSymbol(toUtf8String(tokenSymbol)))

        })
        contract.minTokensToExecuteProposal().then(tokens => setMinimumTokensToExecuteProposal(tokens))
        contract.depositorsBalances(currentAddress)
            .then(balance => setTokenBalanceDeposited(balance))
        contract.tokensToCreateProposal().then(tokens => setTokensToCreateProposal(tokens))
        contract.proposalTimeToVoteInSeconds().then(proposalTimeToVoteInSeconds => setProposalTimeToVote(proposalTimeToVoteInSeconds.toNumber()))
    }

    useEffect(_ => {
        initialize()
    }, [reloadCounter])

    if (!proposals || !governanceTokenSymbol || !tokensToCreateProposal || !tokenBalanceDeposited) {
        return null
    }

    const proposalCreated = () => {
        initialize()
        setAddNewProposalOpened(false)
    }

    const proposalList = () => {
        if (proposals.length === 0) {
            return <div className={"bigManageSection bigInputFont"}>
                There are no proposals yet
            </div>
        } else {
            return <div>
                <div className={"bigManageSection bigInputFont"}>
                    Proposals
                </div>
                <div className={"manageSection"}>
                    <div className={"inputFont proposalInfo"}>To proposal to be accepted it needs <span
                        className={"proposalInfoValues"}>{ethers.utils.formatEther(minimumTokensToExecuteProposal)} ${governanceTokenSymbol}</span> and more <span
                        className={"proposalInfoValues"}>Yes</span> than <span
                        className={"proposalInfoValues"}>No</span> votes
                    </div>
                </div>
                <Table striped hover responsive variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Status</th>
                        <th>Details</th>
                        <th>Created by</th>
                        <th>Votes</th>
                        <th>Execution</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {proposals.map(proposal => <Proposal key={proposal.id.toNumber()} proposal={proposal}
                                                         governanceTokenSymbol={governanceTokenSymbol}
                                                         contract={contract} proposalTimeToVote={proposalTimeToVote}/>)}
                    </tbody>
                </Table>
            </div>
        }
    }

    const proposalInfo = () =>
        <div className={"manageSection"}>
            <div className={"inputFont proposalInfo"}>To create new proposal you need <span
                className={"proposalInfoValues"}>{ethers.utils.formatEther(tokensToCreateProposal)} ${governanceTokenSymbol}</span> deposited,
                you have <span className={"proposalInfoValues"}>{ethers.utils.formatEther(tokenBalanceDeposited)}</span>
            </div>
        </div>


    const addNewProposalButton = () => {
        if (!addNewProposalOpened) {
            return <div>
                <Button variant="outline-dark" onClick={() => setAddNewProposalOpened(true)}
                        disabled={tokensToCreateProposal.gt(tokenBalanceDeposited)}>
                    Add new proposal
                </Button>
            </div>
        } else {
            return null
        }
    }

    const addNewProposalCloseButton = () => {
        if (addNewProposalOpened) {
            return <div>
                <Button variant="outline-dark" onClick={() => setAddNewProposalOpened(false)}>
                    Forget this proposal
                </Button>
            </div>
        } else {
            return null
        }
    }


    const newProposal = () => {
        if (addNewProposalOpened) {
            return <div className={"manageSection"}>
                <NewProposalTransfer contract={contract} signer={signer} provider={provider}
                                     proposalCreated={proposalCreated}/>
            </div>
        } else {
            return null
        }
    }

    return <Row>
        <Col sm={1}/>
        <Col sm={10}>
            <div>
                {proposalList()}
                {proposalInfo()}
                {addNewProposalButton()}
                {addNewProposalCloseButton()}
                {newProposal()}
            </div>
        </Col>
    </Row>
}