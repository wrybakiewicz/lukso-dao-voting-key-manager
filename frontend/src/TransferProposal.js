import {ListGroup} from "react-bootstrap";
import "./Proposal.css"

export default function TransferProposal({proposal}) {
    return <ListGroup.Item className="d-flex justify-content-between proposalItem"
                           key={proposal.id.toNumber()}>
        {proposal.id.toNumber()}
    </ListGroup.Item>
}