import Form from 'react-bootstrap/Form';
import "./Deploy.css"
import {IoAddCircleSharp, MdDelete} from "react-icons/all";
import {useEffect, useState} from "react";
import {Button, InputGroup, ListGroup} from "react-bootstrap";
import {ContractFactory, ethers} from "ethers";
import DAOVotingManager from "./contract/DAOVotingManager.json"
import {toast} from "react-toastify";
import { useMediaQuery } from 'react-responsive'
import {displayAddress} from "./ResponsiveUtils";

export default function Deploy({address, signer}) {

    const [daoNameInput, setDaoNameInput] = useState('')
    const [addYourselfAsAnOwner, setAddYourselfAsAnOwner] = useState(true)
    const [newOwnerInput, setNewOwnerInput] = useState('')
    const [owners, setOwners] = useState([])
    const [showNewOwnerRow, setShowNewOwnerRow] = useState(false)
    const [minimumOwnersToExecute, setMinimumOwnersToExecute] = useState(1)
    const [deployInProgress, setDeployInProgress] = useState(false)

    const initialize = () => {
        if(address && signer) {
            setOwners([address])
        }
    }

    useEffect(_ => {
        initialize()
    }, [address, signer])

    const showFullAddress = useMediaQuery({
        query: '(min-width: 1250px)'
    })

    const deployContract = () => {
        console.log("Deploying minimum owners: " + minimumOwnersToExecute + " name: " + daoNameInput + " owners: ")
        console.log(owners)
        setDeployInProgress(true)
        const contractFactory = ContractFactory.fromSolidity(DAOVotingManager, signer)
        const deployPromise = contractFactory.deploy(minimumOwnersToExecute, daoNameInput, owners).then(_ => {
            setDaoNameInput('')
            setAddYourselfAsAnOwner(true)
            setNewOwnerInput('')
            setOwners([address])
            setShowNewOwnerRow(false)
            setMinimumOwnersToExecute(1)
        }).finally(_ => {
            setDeployInProgress(false)
        })
        toast.promise(deployPromise, {
            pending: '🔨 Deploying your DAO 🔨',
            success: '🦀 DAO Deployed 🦀',
            error: '☠ DAO Deploy error ☠'
        })
        //TODO: save on backend ?
    }

    const addOwner = () => {
        setOwners([...owners, newOwnerInput])
        setShowNewOwnerRow(false)
        setNewOwnerInput('')
    }

    const deleteOwner = (ownerToDelete) => {
        const newOwners = owners.filter((owner) => ownerToDelete !== owner)
        setOwners(newOwners)
    }

    const updateAddYourselfAsAnOwner = (checked) => {
        setAddYourselfAsAnOwner(checked)
        if(checked) {
            setOwners([...owners, address])
        } else {
            const newOwners = owners.filter(owner => owner !== address)
            setOwners(newOwners)
        }
    }

    const daoName = () => <div>
        <Form.Label className={"inputFont"}>DAO Name</Form.Label>
        <div className={"deployInputName"}>
            <Form.Control placeholder={"DAO Name"} value={daoNameInput} onChange={e => setDaoNameInput(e.target.value)}/>
        </div>
    </div>

    const canAddOwner = () => {
        return ethers.utils.isAddress(newOwnerInput) && newOwnerInput.toLowerCase() !== address.toLowerCase()
    }

    const newOwnerRow = () => {
        if (showNewOwnerRow) {
            return <div className={"deployInputName newOwner"}>
                <InputGroup className="mb-3">
                    <Form.Control placeholder={"New owner address"} value={newOwnerInput}
                                  onChange={e => setNewOwnerInput(e.target.value)}/>
                    <Button variant="outline-dark" onClick={addOwner}
                            disabled={!canAddOwner()}>
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
            const ownersWithoutOurself = owners.filter(owner => owner !== address)
            return <div className={"ownerList"}>
                <ListGroup>
                    {ownersWithoutOurself.map((owner) => <ListGroup.Item className="d-flex justify-content-between pt-3"
                                                                  key={owner}>
                        {displayAddress(owner, showFullAddress)}
                        <div className={"iconDelete"}>
                            <MdDelete size={30} onClick={() => deleteOwner(owner)}/>
                        </div>
                    </ListGroup.Item>)}
                </ListGroup>
            </div>
        } else {
            return null
        }
    }

    const ownersSection = () => <div className={"owners"}>
        <Form.Label className={"inputFont"}>Owners</Form.Label>
        <Form.Check
            type="switch"
            label="Add yourself as an owner"
            checked={addYourselfAsAnOwner}
            onChange={e => updateAddYourselfAsAnOwner(e.target.checked)}
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
                <Form.Select value={minimumOwnersToExecute} onChange={(e) => setMinimumOwnersToExecute(e.target.value)}>
                    {owners.map((_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}
                </Form.Select>
            </span>
            <div className={"outOfOwnersInfo"}>out of {owners.length} owners</div>
        </span>
            </div>
        } else {
            return null
        }
    }

    const canDeploy = () => {
        return daoNameInput !== "" && owners.length > 0
    }

    const deployButton = () => {
        return <div className={"deployButton"}>
            <Button variant="outline-dark" onClick={deployContract}
                    disabled={!canDeploy() || deployInProgress}>
                Deploy
            </Button>
        </div>
    }

    if(!address || !signer) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    return <div className={"deploy"}>
        {daoName()}
        {ownersSection()}
        {confirmation()}
        {deployButton()}
    </div>

}