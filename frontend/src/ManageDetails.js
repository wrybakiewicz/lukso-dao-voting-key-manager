import {useNavigate, useParams} from "react-router";
import {ContractFactory, ethers} from "ethers";
import DaoVotingManager from "./contract/DaoVotingManager.json";
import {useEffect, useState} from "react";
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import "./ManageDetails.css"
import Overview from "./ManageOverview";

export default function ManageDetails({myAddress, signer, provider, activeKey}) {

    const navigate = useNavigate();

    const [isValidContract, setIsValidContract] = useState()
    const [contract, setContract] = useState()

    let {address} = useParams();

    useEffect(_ => {
        if (myAddress && signer && provider) {
            updateIsValidContract().then(_ => updateContract())
        }
    }, [myAddress, signer, provider])

    const updateIsValidContract = async () => {
        if (ethers.utils.isAddress(address)) {
            const contractCode = await provider.getCode(address)
            setIsValidContract(contractCode === DaoVotingManager.deployedBytecode)
        } else {
            setIsValidContract(false)
        }
    }

    const updateContract = () => {
        const contract = ContractFactory.getContract(address, DaoVotingManager.abi, provider)
        setContract(contract)
    }

    if (!address || !signer || !provider) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    if (isValidContract === false) {
        return <div className={"connectWallet"}>Provided address is not a DAO Key Manager</div>
    }

    if (isValidContract && contract) {
        return <div className={"manageDetails"}>
            <Tab.Container activeKey={activeKey}>
                <Row>
                    <Col sm={2}>
                        <Nav variant="pills" className="flex-column roundedBorders" >
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="overview" onClick={_ => navigate("/manage/" + address)}>Overview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="deposit" onClick={_ => navigate("/manage/" + address + "/deposit")}>Deposit</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="withdraw" onClick={_ => navigate("/manage/" + address + "/withdraw")}>Withdraw</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="transactions" onClick={_ => navigate("/manage/" + address + "/transactions")}>Transactions</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col sm={10}>
                        <Tab.Content>
                            <Tab.Pane eventKey="overview">
                                <Overview contract={contract} provider={provider}/>
                            </Tab.Pane>
                            <Tab.Pane eventKey="deposit">
                                Deposit
                            </Tab.Pane>
                            <Tab.Pane eventKey="withdraw">
                                Withdraw
                            </Tab.Pane>
                            <Tab.Pane eventKey="transactions">
                                Transactions
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </div>
    }

    return null
}