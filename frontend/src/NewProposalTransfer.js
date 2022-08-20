import {Button, Form, InputGroup} from "react-bootstrap";

export default function NewProposalTransfer({}) {
    return <InputGroup className="mb-3">
        <Form.Control placeholder={"Receiver address"} value={null}
                      onChange={null}/>
        <Button variant="outline-dark" onClick={null}
                disabled={false}>
            Add
        </Button>
    </InputGroup>
}