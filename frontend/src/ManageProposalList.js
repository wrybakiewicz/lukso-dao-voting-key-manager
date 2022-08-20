import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {useEffect, useState} from "react";
import {Button, ListGroup} from "react-bootstrap";
import NewProposalTransfer from "./NewProposalTransfer";
import "./ManageProposalList.css"
import {ContractFactory, ethers} from "ethers";
import {ERC725YKeys} from "@lukso/lsp-smart-contracts/constants";
import {toUtf8String} from "@ethersproject/strings";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";

export default function ManageProposalList({contract, signer, currentAddress, provider}) {

    const [proposals, setProposals] = useState()
    const [addNewProposalOpened, setAddNewProposalOpened] = useState(false)
    const [governanceTokenSymbol, setGovernanceTokenSymbol] = useState()
    const [tokensToCreateProposal, setTokensToCreateProposal] = useState()
    const [tokenBalanceDeposited, setTokenBalanceDeposited] = useState()

    const initialize = () => {
        contract.getProposals().then(proposals => {
            setProposals(proposals)
        })
        contract.daoGovernanceToken().then(tokenAddress => {
            const contract = ContractFactory.getContract(tokenAddress, LSP7DigitalAsset.abi, provider)
            contract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenSymbol).then(tokenSymbol => setGovernanceTokenSymbol(toUtf8String(tokenSymbol)))

        })
        contract.depositorsBalances(currentAddress)
            .then(balance => setTokenBalanceDeposited(balance))
        contract.tokensToCreateProposal().then(tokens => setTokensToCreateProposal(tokens))
    }

    useEffect(_ => {
        initialize()
    }, [])

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
                Proposals:
                <ListGroup>
                    {proposals.map((proposal) => <ListGroup.Item className="d-flex justify-content-between pt-3"
                                                                 key={proposal.id}>
                        {proposal.id}
                    </ListGroup.Item>)}
                </ListGroup>
            </div>
        }
    }

    const addNewProposalButton = () => {
        if (!addNewProposalOpened) {
            return <div className={"manageSection"}>
                <div className={"inputFont proposalInfo"}>To create new proposal you need <span className={"proposalInfoValues"}>{ethers.utils.formatEther(tokensToCreateProposal)} ${governanceTokenSymbol}</span> deposited, you have <span className={"proposalInfoValues"}>{ethers.utils.formatEther(tokenBalanceDeposited)}</span></div>
                <Button variant="outline-dark" onClick={() => setAddNewProposalOpened(true)} disabled={tokensToCreateProposal.gte(tokenBalanceDeposited)}>
                    Add new proposal
                </Button>
            </div>
        } else {
            return null
        }
    }

    const addNewProposalCloseButton = () => {
        if (addNewProposalOpened) {
            return <div className={"manageSection"}>
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
                <NewProposalTransfer contract={contract} signer={signer} provider={provider} proposalCreated={proposalCreated}/>
            </div>
        } else {
            return null
        }
    }

    return <Row>
        <Col sm={3}/>
        <Col sm={8}>
            <div>
                {proposalList()}
                {addNewProposalButton()}
                {addNewProposalCloseButton()}
                {newProposal()}
            </div>
        </Col>
    </Row>
}