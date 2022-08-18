import {useParams} from "react-router";
import {ethers} from "ethers";
import contract from "./contract/DaoVotingManager.json";
import {useEffect, useState} from "react";
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import "./ManageDetails.css"

export default function ManageDetails({myAddress, signer, provider}) {

    const [isValidContract, setIsValidContract] = useState()

    let {address} = useParams();

    useEffect(_ => {
        if (myAddress && signer && provider) {
            updateIsValidContract()
        }
    }, [myAddress, signer, provider])

    const updateIsValidContract = async () => {
        if (ethers.utils.isAddress(address)) {
            const contractCode = await provider.getCode(address)
            setIsValidContract(contractCode === contract.deployedBytecode)
        } else {
            setIsValidContract(false)
        }
    }

    if (!address || !signer || !provider) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    if (isValidContract === false) {
        return <div className={"connectWallet"}>Provided address is not a DAO Key Manager</div>
    }

    if (isValidContract) {
        return <div className={"manageDetails"}>
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                <Row>
                    <Col sm={2}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="first">Overview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="second">Owners</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="third">Transactions</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col sm={10}>
                        <Tab.Content>
                            <Tab.Pane eventKey="first">
                                Overview
                            </Tab.Pane>
                            <Tab.Pane eventKey="second">
                                Owners
                            </Tab.Pane>
                            <Tab.Pane eventKey="third">
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