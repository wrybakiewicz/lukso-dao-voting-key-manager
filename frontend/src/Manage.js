import "./Manage.css"
import Form from "react-bootstrap/Form";
import {Button, InputGroup} from "react-bootstrap";
import {useState} from "react";
import {ethers} from "ethers";
import {useMediaQuery} from "react-responsive";
import contract from "./contract/DAOVotingManager.json";

export default function Manage({address, signer, provider}) {

    const [isAddressValid, setIsAddressValid] = useState(false)
    const [existingDaoContractAddressInput, setExistingDaoContractAddressInput] = useState('')

    const isBigScreen = useMediaQuery({
        query: '(min-width: 1620px)'
    })

    const findExistingDaoContract = async () => {
        console.log("Finding existing dao contract: " + existingDaoContractAddressInput)

    }

    const updateFindExistingContractAddressInput = async (input) => {
        setExistingDaoContractAddressInput(input)
        if (ethers.utils.isAddress(input)) {
            const contractCode = await provider.getCode(input)
            setIsAddressValid(contractCode === contract.deployedBytecode)
        } else {
            setIsAddressValid(false)
        }
    }

    const findDao = () => <div className={isBigScreen ? "findDaoBig" : "findDaoSmall"}>
        <InputGroup className="mb-3">
            <Form.Control placeholder={"Existing DAO contract address"} value={existingDaoContractAddressInput}
                          onChange={e => updateFindExistingContractAddressInput(e.target.value)}/>
            <Button variant="outline-dark" onClick={findExistingDaoContract}
                    disabled={!isAddressValid}>
                Find
            </Button>
        </InputGroup>
    </div>

    if (!address || !signer || !provider) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    return <div className={"manage"}>
        {findDao()}
        {/*//TODO: list of your daos*/}
    </div>
}