import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {useEffect, useState} from "react";
import {Button, ListGroup} from "react-bootstrap";
import NewProposalTransfer from "./NewProposalTransfer";
import "./ManageProposalList.css"

export default function ManageProposalList({contract, signer, currentAddress}) {

    const [proposals, setProposals] = useState()
    const [addNewProposalOpened, setAddNewProposalOpened] = useState(false)

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
                <Button variant="outline-dark" onClick={() => setAddNewProposalOpened(true)}>
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
                <NewProposalTransfer/>
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