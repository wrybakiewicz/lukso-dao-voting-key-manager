import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {useEffect, useState} from "react";
import {Button, Table} from "react-bootstrap";
import NewProposalTransfer from "./NewProposalTransfer";
import "./ManageProposalList.css"
import {ethers} from "ethers";
import Proposal from "./Proposal";

export default function ManageProposalList({
                                               contract,
                                               currentAddress,
                                               currentBalance,
                                               governanceTokenSymbol,
                                               tokensToCreateProposal,
                                               minimumTokensToExecuteProposal,
                                               proposalTimeToVote,
                                               balanceInContract,
                                               reload
                                           }) {

    const [addNewProposalOpened, setAddNewProposalOpened] = useState(false)
    const [proposals, setProposals] = useState()
    const [creatingProposalInProgress, setCreatingProposalInProgress] = useState(false)

    const initialize = () => {
        contract.getProposals().then(proposals => {
            setProposals(proposals)
        })
    }

    useEffect(_ => {
        initialize()
    }, [])

    if (!proposals) {
        return null
    }

    const proposalCreated = () => {
        initialize()
        reload()
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
                <div className={"manageSection proposalInfo"}>
                    <div className={"inputFont proposalInfoSection"}>To proposal to be accepted it needs <span
                        className={"proposalInfoValues"}>{ethers.utils.formatEther(minimumTokensToExecuteProposal)} ${governanceTokenSymbol}</span> and
                        more <span
                            className={"proposalInfoValues"}>Yes</span> than <span
                            className={"proposalInfoValues"}>No</span> votes.
                    </div>
                    <div className={"inputFont"}>When you vote on proposal your deposit is locked until proposal voting end.
                    </div>
                </div>
                <Table striped hover responsive variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Status</th>
                        <th>Details</th>
                        <th>Created by</th>
                        <th>
                            <div className={"elementCentered"}>Votes</div>
                        </th>
                        <th>
                            <div className={"elementCentered"}>Actions</div>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {proposals.map(proposal => <Proposal key={proposal.id.toNumber()} proposal={proposal}
                                                         governanceTokenSymbol={governanceTokenSymbol}
                                                         contract={contract} proposalTimeToVote={proposalTimeToVote}
                                                         updateParent={() => initialize()}
                                                         currentAddress={currentAddress}
                                                         minimumTokensToExecuteProposal={minimumTokensToExecuteProposal}
                                                         reload={reload} balanceInContract={balanceInContract}/>)}
                    </tbody>
                </Table>
            </div>
        }
    }

    const proposalInfo = () =>
        <div className={"manageSection proposalInfo"}>
            <div className={"inputFont proposalInfoSection"}>To create proposal you need <span
                className={"proposalInfoValues"}>{ethers.utils.formatEther(tokensToCreateProposal)} ${governanceTokenSymbol}</span> deposited,
                you have <span className={"proposalInfoValues"}>{ethers.utils.formatEther(balanceInContract)} ${governanceTokenSymbol}</span>.
            </div>
            <div className={"inputFont"}>Those funds are locked during proposal creation and you can get them back when proposal is finalized.
            </div>
        </div>


    const addNewProposalButton = () => {
        if (!addNewProposalOpened) {
            return <div className={"createNewProposalButton"}>
                <Button variant="outline-dark" onClick={() => setAddNewProposalOpened(true)}
                        disabled={tokensToCreateProposal.gt(balanceInContract)}>
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
                <Button variant="outline-dark" onClick={() => setAddNewProposalOpened(false)} disabled={creatingProposalInProgress}>
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
                <NewProposalTransfer contract={contract} proposalCreated={proposalCreated}
                                     currentBalance={currentBalance} updateCreatingProposal={(bool) => setCreatingProposalInProgress(bool)}/>
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