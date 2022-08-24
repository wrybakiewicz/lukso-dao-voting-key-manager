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

    const [daoName, setDaoName] = useState()
    const [governanceTokenAddress, setGovernanceTokenAddress] = useState()
    const [governanceTokenBalance, setGovernanceTokenBalance] = useState()
    const [governanceTokenSymbol, setGovernanceTokenSymbol] = useState()
    const [governanceTokenName, setGovernanceTokenName] = useState()
    const [daoAccountAddress, setDaoAccountAddress] = useState()
    const [tokensToCreateProposal, setTokensToCreateProposal] = useState()
    const [minimumTokensToExecuteProposal, setMinimumTokensToExecuteProposal] = useState()
    const [proposalTimeToVote, setProposalTimeToVote] = useState()
    const [currentBalance, setCurrentBalance] = useState()

    const [tokenContract, setTokenContract] = useState()
    const [tokenBalance, setTokenBalance] = useState()
    const [balanceInContract, setBalanceInContract] = useState()
    const [authorizedAmount, setAuthorizedAmount] = useState()
    const [possibleWithdrawTime, setPossibleWithdrawTime] = useState()

    let {address} = useParams();

    const initializeContract = (contract) => {
        const accountPromise = contract.account().then(address => {
            setDaoAccountAddress(address)
            return provider.getBalance(address).then(balance => {
                setCurrentBalance(balance)
                return address
            })
        })
        const namePromise = contract.daoName().then(name => setDaoName(name))
        const tokenPromise = contract.daoGovernanceToken().then(tokenAddress => {
            setGovernanceTokenAddress(tokenAddress)
            return tokenAddress
        }).then(tokenAddress => {
            const daoGovernanceContract = ContractFactory.getContract(tokenAddress, LSP7DigitalAsset.abi, signer)
            setTokenContract(daoGovernanceContract)
            const balancePromise = daoGovernanceContract.balanceOf(myAddress).then(addressBalance => setTokenBalance(addressBalance))
            const isOperatorPromise = daoGovernanceContract.isOperatorFor(contract.address, myAddress).then(tokens => setAuthorizedAmount(tokens))
            const namePromise = daoGovernanceContract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenName).then(tokenName => setGovernanceTokenName(toUtf8String(tokenName)))
            const symbolPromise = daoGovernanceContract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenSymbol).then(tokenSymbol => setGovernanceTokenSymbol(toUtf8String(tokenSymbol)))
            accountPromise.then(accountAddress => daoGovernanceContract.balanceOf(accountAddress).then(balance => setGovernanceTokenBalance(balance)))
            return Promise.all([balancePromise, isOperatorPromise, namePromise, symbolPromise])
        })
        const tokensToCreateProposalPromise = contract.tokensToCreateProposal().then(tokens => setTokensToCreateProposal(tokens))
        const tokensToExecuteProposalPromise = contract.minTokensToExecuteProposal().then(tokens => setMinimumTokensToExecuteProposal(tokens))
        const timeToVotePromise = contract.proposalTimeToVoteInSeconds().then(proposalTimeToVoteInSeconds => setProposalTimeToVote(proposalTimeToVoteInSeconds.toNumber()))
        const depositorBalancesPromise = contract.depositorsBalances(myAddress)
            .then(balance => setBalanceInContract(balance))
        const withdrawalTimePromise = contract.getPossibleWithdrawTime().then(time => setPossibleWithdrawTime(time.toNumber()))
        return Promise.all([namePromise, tokenPromise, accountPromise, tokensToCreateProposalPromise, tokensToExecuteProposalPromise, timeToVotePromise, depositorBalancesPromise, withdrawalTimePromise])
    }

    const initialize = () => {
        console.log("Initializing Manage Details")
        return updateIsValidContract().then(_ => {
            const contract = updateContract()
            return initializeContract(contract)
        })
    }

    useEffect(_ => {
        if (myAddress && signer && provider) {
            initialize()
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
        if (!daoName || !governanceTokenAddress || !governanceTokenBalance || !governanceTokenSymbol || !governanceTokenName || !daoAccountAddress || !tokensToCreateProposal || !minimumTokensToExecuteProposal || !proposalTimeToVote || !address || !currentBalance) {
            return null
        }

        return <Overview daoName={daoName} governanceTokenAddress={governanceTokenAddress}
                         governanceTokenSymbol={governanceTokenSymbol}
                         governanceTokenName={governanceTokenName}
                         daoAccountAddress={daoAccountAddress} governanceTokenBalance={governanceTokenBalance}
                         tokensToCreateProposal={tokensToCreateProposal}
                         minimumTokensToExecuteProposal={minimumTokensToExecuteProposal}
                         proposalTimeToVote={proposalTimeToVote} currentBalance={currentBalance}/>
    }

    const manageDetailsSection = () => {
        if (!tokenContract || !governanceTokenSymbol || !tokenBalance || !balanceInContract || !authorizedAmount) {
            return null
        }
        return <ManageDeposit contract={contract} reload={() => initialize()} tokenContract={tokenContract}
                              governanceTokenSymbol={governanceTokenSymbol} tokenBalance={tokenBalance}
                              balanceInContract={balanceInContract} authorizedAmount={authorizedAmount}/>

    }

    const manageProposalListSection = () => {
        if (!governanceTokenSymbol || !daoAccountAddress || !tokenContract || !governanceTokenAddress || !governanceTokenBalance || !tokensToCreateProposal || !balanceInContract || !proposalTimeToVote || !minimumTokensToExecuteProposal || !currentBalance) {
            return null
        }
        return <ManageProposalList contract={contract} currentAddress={myAddress}
                                   currentBalance={currentBalance} governanceTokenAddress={governanceTokenAddress}
                                   governanceTokenSymbol={governanceTokenSymbol} tokenContract={tokenContract}
                                   tokensToCreateProposal={tokensToCreateProposal}
                                   governanceTokenBalance={governanceTokenBalance} daoAccountAddress={daoAccountAddress}
                                   minimumTokensToExecuteProposal={minimumTokensToExecuteProposal}
                                   balanceInContract={balanceInContract} proposalTimeToVote={proposalTimeToVote}
                                   reload={() => initialize()}/>
    }

    const manageWithdrawSection = () => {
        if (!governanceTokenSymbol || !balanceInContract || !tokenBalance || !possibleWithdrawTime) {
            return null
        }
        return <ManageWithdraw governanceTokenSymbol={governanceTokenSymbol} balanceInContract={balanceInContract}
                               tokenBalance={tokenBalance} contract={contract} reload={() => initialize()}
                               possibleWithdrawTime={possibleWithdrawTime}/>
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
                                {manageDetailsSection()}
                            </Tab.Pane>
                            <Tab.Pane eventKey="withdraw">
                                {manageWithdrawSection()}
                            </Tab.Pane>
                            <Tab.Pane eventKey="proposals">
                                {manageProposalListSection()}
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </div>
    }

    return null
}