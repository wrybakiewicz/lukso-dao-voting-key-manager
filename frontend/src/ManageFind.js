import "./Manage.css"
import Form from "react-bootstrap/Form";
import {Button, InputGroup} from "react-bootstrap";
import {useState} from "react";
import {ethers} from "ethers";
import {useMediaQuery} from "react-responsive";
import contract from "./contract/DaoVotingManager.json";
import {useNavigate} from "react-router";
import ManageDaoList from "./ManageDaoList";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function ManageFind({address, signer, provider}) {

    const [isAddressValid, setIsAddressValid] = useState(false)
    const [existingDaoContractAddressInput, setExistingDaoContractAddressInput] = useState('')

    const navigate = useNavigate();

    const findExistingDaoContract = async () => {
        navigate('/manage/' + existingDaoContractAddressInput)
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

    const findByAddress = () => <div className={"findDaoByAddress"}>
        Find DAO by address
    </div>

    const findDao = () => <div className={"findDaoInput"}>
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

    return <div>
        <Row>
            <Col sm={4}/>
            <Col sm={4}>
                {findByAddress()}
                {findDao()}
                <ManageDaoList provider={provider} />
            </Col>
            <Col sm={4}/>
        </Row>
    </div>
}