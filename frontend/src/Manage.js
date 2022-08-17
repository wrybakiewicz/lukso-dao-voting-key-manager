import "./Manage.css"
import Form from "react-bootstrap/Form";
import {Button, InputGroup} from "react-bootstrap";
import {useState} from "react";
import {ethers} from "ethers";

export default function Manage({address, signer}) {

    const [existingDaoContractAddressInput, setExistingDaoContractAddressInput] = useState('')

    const findExistingDaoContract = () => {
        console.log("Finding existing dao contract: " + existingDaoContractAddressInput)
        //TODO: check if bytecode is ok
    }

    const findDao = () => <div className={"findDao"}>
        <InputGroup className="mb-3">
            <Form.Control placeholder={"Existing DAO contract address"} value={existingDaoContractAddressInput}
                          onChange={e => setExistingDaoContractAddressInput(e.target.value)}/>
            <Button variant="outline-dark" onClick={findExistingDaoContract}
                    disabled={!ethers.utils.isAddress(existingDaoContractAddressInput)}>
                Find
            </Button>
        </InputGroup>
    </div>

    if(!address || !signer) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    return <div className={"manage"}>
        {findDao()}
    </div>
}