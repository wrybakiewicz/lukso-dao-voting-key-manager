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
import ManageDeposit from "./ManageDeposit";
import ManageProposalList from "./ManageProposalList";
import ManageWithdraw from "./ManageWithdraw";
import {ERC725YKeys} from "@lukso/lsp-smart-contracts/constants";
import {toUtf8String} from "@ethersproject/strings";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";

export default function ManageDetails({myAddress, signer, provider, activeKey}) {

    const navigate = useNavigate();

    const [isValidContract, setIsValidContract] = useState()
    const [contract, setContract] = useState()
    const [reloadCounter, setReloadCounter] = useState(0)

    const [daoName, setDaoName] = useState()
    const [governanceTokenAddress, setGovernanceTokenAddress] = useState()
    const [governanceTokenSymbol, setGovernanceTokenSymbol] = useState()
    const [governanceTokenName, setGovernanceTokenName] = useState()
    const [daoAccountAddress, setDaoAccountAddress] = useState()
    const [tokensToCreateProposal, setTokensToCreateProposal] = useState()
    const [minimumTokensToExecuteProposal, setMinimumTokensToExecuteProposal] = useState()
    const [proposalTimeToVote, setProposalTimeToVote] = useState()
    const [currentBalance, setCurrentBalance] = useState()

    let {address} = useParams();

    const initialize = (contract) => {
        contract.daoName().then(name => setDaoName(name))
        contract.daoGovernanceToken().then(tokenAddress => {
            setGovernanceTokenAddress(tokenAddress)
            return tokenAddress
        }).then(tokenAddress => {
            const contract = ContractFactory.getContract(tokenAddress, LSP7DigitalAsset.abi, provider)
            contract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenName).then(tokenName => setGovernanceTokenName(toUtf8String(tokenName)))
            contract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenSymbol).then(tokenSymbol => setGovernanceTokenSymbol(toUtf8String(tokenSymbol)))
        })
        contract.account().then(address => {
            setDaoAccountAddress(address)
            provider.getBalance(address).then(balance => setCurrentBalance(balance))
        })
        contract.tokensToCreateProposal().then(tokens => setTokensToCreateProposal(ethers.utils.formatEther(tokens)))
        contract.minTokensToExecuteProposal().then(tokens => setMinimumTokensToExecuteProposal(ethers.utils.formatEther(tokens)))
        contract.proposalTimeToVoteInSeconds().then(proposalTimeToVoteInSeconds => setProposalTimeToVote(proposalTimeToVoteInSeconds.toNumber()))
    }

    useEffect(_ => {
        if (myAddress && signer && provider) {
            console.log("Initializing Manage Details")
            updateIsValidContract().then(_ => {
                const contract = updateContract()
                initialize(contract)
            })
        }
    }, [myAddress, signer, provider, reloadCounter])

    const reload = () => {
        setReloadCounter(reloadCounter + 1)
    }

    const updateIsValidContract = async () => {
        if (ethers.utils.isAddress(address)) {
            const contractCode = await provider.getCode(address)
            setIsValidContract(contractCode === DaoVotingManager.deployedBytecode)
        } else {
            setIsValidContract(false)
        }
    }

    const updateContract = () => {
        const contract = ContractFactory.getContract(address, DaoVotingManager.abi, signer)
        setContract(contract)
        return contract
    }

    if (!address || !signer || !provider) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    if (isValidContract === false) {
        return <div className={"connectWallet"}>Provided address is not a DAO Key Manager</div>
    }

    const overviewSection = () => {
        if (!daoName || !governanceTokenAddress || !governanceTokenSymbol || !governanceTokenName || !daoAccountAddress
            || !tokensToCreateProposal || !minimumTokensToExecuteProposal || !proposalTimeToVote || !address || !currentBalance) {
            return null
        }

        return <Overview daoName={daoName} governanceTokenAddress={governanceTokenAddress}
                         governanceTokenSymbol={governanceTokenSymbol}
                         governanceTokenName={governanceTokenName}
                         daoAccountAddress={daoAccountAddress}
                         tokensToCreateProposal={tokensToCreateProposal}
                         minimumTokensToExecuteProposal={minimumTokensToExecuteProposal}
                         proposalTimeToVote={proposalTimeToVote} currentBalance={currentBalance}/>
    }

    if (isValidContract && contract) {
        return <div className={"manageDetails"}>
            <Tab.Container activeKey={activeKey}>
                <Row>
                    <Col sm={2}>
                        <Nav variant="pills" className="flex-column roundedBorders">
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="overview"
                                          onClick={_ => navigate("/manage/" + address)}>Overview</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="deposit"
                                          onClick={_ => navigate("/manage/" + address + "/deposit")}>Deposit</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="withdraw"
                                          onClick={_ => navigate("/manage/" + address + "/withdraw")}>Withdraw</Nav.Link>
                            </Nav.Item>
                            <Nav.Item className={"leftTab"}>
                                <Nav.Link eventKey="proposals"
                                          onClick={_ => navigate("/manage/" + address + "/proposals")}>Proposals</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col sm={10}>
                        <Tab.Content>
                            <Tab.Pane eventKey="overview">
                                {overviewSection()}
                            </Tab.Pane>
                            <Tab.Pane eventKey="deposit">
                                <ManageDeposit contract={contract} signer={signer} currentAddress={myAddress}
                                               reloadParent={reload} reloadCounter={reloadCounter}/>
                            </Tab.Pane>
                            <Tab.Pane eventKey="withdraw">
                                <ManageWithdraw/>
                            </Tab.Pane>
                            <Tab.Pane eventKey="proposals">
                                <ManageProposalList contract={contract} signer={signer} currentAddress={myAddress}
                                                    provider={provider} reloadCounter={reloadCounter}/>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </div>
    }

    return null
}