import Form from 'react-bootstrap/Form';
import "./Deploy.css"
import {IoAddCircleSharp, MdDelete} from "react-icons/all";
import {useState} from "react";
import {Button, InputGroup, ListGroup} from "react-bootstrap";

export default function Deploy({}) {

    const [newOwnerInput, setNewOwnerInput] = useState('')
    const [owners, setOwners] = useState([])
    const [showNewOwnerRow, setShowNewOwnerRow] = useState(false)

    const addOwner = () => {
        setOwners([...owners, newOwnerInput])
        setShowNewOwnerRow(false)
        setNewOwnerInput('')
    }

    const deleteOwner = (index) => {
        const newOwners = owners.filter((_, arrayIndex) => arrayIndex !== index)
        setOwners(newOwners)
    }

    const daoName = <div>
        <Form.Label className={"inputFont"}>DAO Name</Form.Label>
        <div className={"deployInputName"}>
            <Form.Control placeholder={"DAO Name"}/>
        </div>
    </div>

    const newOwnerRow = () => {
        if (showNewOwnerRow) {
            return <div className={"deployInputName newOwner"}>
                <InputGroup className="mb-3">
                    <Form.Control placeholder={"New owner address"} value={newOwnerInput}
                                  onChange={e => setNewOwnerInput(e.target.value)}/>
                    <Button variant="outline-dark" onClick={addOwner}
                            disabled={false}>
                        Add
                    </Button>
                </InputGroup>
            </div>
        }
        return null
    }

    const addNewOwnerIcon = () => {
        if (!showNewOwnerRow) {
            return <div className={"add iconAdd"}>
                <IoAddCircleSharp
                    size={30}
                    onClick={() => setShowNewOwnerRow(true)}/>
            </div>
        } else {
            return null
        }
    }

    const ownerList = () => {
        if (owners.length > 0) {
            return <div className={"ownerList"}>
                <ListGroup>
                    {owners.map((owner, index) => <ListGroup.Item className="d-flex justify-content-between pt-3"
                                                                  key={owner}>
                        {owner}
                        <div className={"iconDelete"}>
                            <MdDelete size={30} onClick={() => deleteOwner(index)}/>
                        </div>
                    </ListGroup.Item>)}
                </ListGroup>
            </div>
        } else {
            return null
        }
    }

    const ownersSection = <div className={"owners"}>
        <Form.Label className={"inputFont"}>Owners</Form.Label>
        <Form.Check
            type="switch"
            label="Add yourself as an owner"
            defaultChecked={true}
        />
        {ownerList()}
        {newOwnerRow()}
        {addNewOwnerIcon()}
    </div>

    const confirmation = () => {
        if (owners.length > 0) {
            return <div className={"confirmations"}>
                <Form.Label className={"inputFont"}>Any transaction need confirmations from</Form.Label>
                <span className={"ownersInfo"}>
            <span className={"numberInput"}>
                <Form.Select>
                    {owners.map((_, index) => <option value={index + 1}>{index + 1}</option>)}
                </Form.Select>
            </span>
            <span className={"ownersInfo"}>out of {owners.length} owners</span>
        </span>
            </div>
        } else {
            return null
        }
    }

    const deployButton = () => {
        return <div className={"deployButton"}>
            <Button variant="outline-dark" onClick={null}
                    disabled={false}>
                Deploy
            </Button>
        </div>
    }

    return <div className={"deploy"}>
        {daoName}
        {ownersSection}
        {confirmation()}
        {deployButton()}
    </div>

}