import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useEffect, useState} from "react";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import "@lukso/lsp-smart-contracts/contracts/LSP4DigitalAssetMetadata/LSP4Constants.sol";
import {ContractFactory} from "ethers";
import {ERC725YKeys} from "@lukso/lsp-smart-contracts/constants";
import {toUtf8String} from "@ethersproject/strings";

export default function Overview({contract, provider}) {

    const [daoName, setDaoName] = useState()
    const [governanceTokenAddress, setGovernanceTokenAddress] = useState()
    const [governanceTokenSymbol, setGovernanceTokenSymbol] = useState()
    const [governanceTokenName, setGovernanceTokenName] = useState()

    const initialize = () => {
        contract.daoName().then(name => setDaoName(name))
        contract.daoGovernanceToken().then(tokenAddress => {
            setGovernanceTokenAddress(tokenAddress)
            return tokenAddress
        }).then(tokenAddress => {
            const contract = ContractFactory.getContract(tokenAddress, LSP7DigitalAsset.abi, provider)
            contract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenName).then(tokenName => setGovernanceTokenName(toUtf8String(tokenName)))
            contract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenSymbol).then(tokenSymbol => setGovernanceTokenSymbol(toUtf8String(tokenSymbol)))
        })
    }

    useEffect(_ => {
        initialize()
    }, [])

    if (!daoName) {
        return null
    }

    const name = () => <div className={"inputFont"}>
        Name: <b>{daoName}</b>
    </div>

    const governanceToken = () => <div className={"inputFont"}>
        Governance token: ${governanceTokenSymbol} {governanceTokenName} {governanceTokenAddress}
    </div>

    return <Row>
        <Col sm={3}/>
        <Col sm={4}>
            {name()}
            {governanceToken()}
        </Col>
    </Row>
}