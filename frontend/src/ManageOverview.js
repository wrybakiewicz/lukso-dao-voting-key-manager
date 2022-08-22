import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useEffect, useState} from "react";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import "@lukso/lsp-smart-contracts/contracts/LSP4DigitalAssetMetadata/LSP4Constants.sol";
import {ContractFactory, ethers} from "ethers";
import {ERC725YKeys} from "@lukso/lsp-smart-contracts/constants";
import {toUtf8String} from "@ethersproject/strings";
import "./ManageOverview.css"
import {useParams} from "react-router";

const SECONDS_IN_MINUTE = 60
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60
const SECONDS_IN_DAYS = SECONDS_IN_HOUR * 24

export default function Overview({contract, provider}) {

    let {address} = useParams();

    const [daoName, setDaoName] = useState()
    const [governanceTokenAddress, setGovernanceTokenAddress] = useState()
    const [governanceTokenSymbol, setGovernanceTokenSymbol] = useState()
    const [governanceTokenName, setGovernanceTokenName] = useState()
    const [daoAccountAddress, setDaoAccountAddress] = useState()
    const [tokensToCreateProposal, setTokensToCreateProposal] = useState()
    const [minimumTokensToExecuteProposal, setMinimumTokensToExecuteProposal] = useState()
    const [proposalTimeToVote, setProposalTimeToVote] = useState()
    const [currentBalance, setCurrentBalance] = useState()

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
        contract.account().then(address => {
            setDaoAccountAddress(address)
            provider.getBalance(address).then(balance => setCurrentBalance(balance))
        })
        contract.tokensToCreateProposal().then(tokens => setTokensToCreateProposal(ethers.utils.formatEther(tokens)))
        contract.minTokensToExecuteProposal().then(tokens => setMinimumTokensToExecuteProposal(ethers.utils.formatEther(tokens)))
        contract.proposalTimeToVoteInSeconds().then(proposalTimeToVoteInSeconds => setProposalTimeToVote(proposalTimeToVoteInSeconds.toNumber()))
    }

    useEffect(_ => {
        initialize()
    }, [])

    const renderProposalTimeToVote = (timeToVoteInSeconds) => {
        if(timeToVoteInSeconds % SECONDS_IN_DAYS === 0) {
            const days = "" + (timeToVoteInSeconds / SECONDS_IN_DAYS)
            if(days === "1") {
                return days + " Day"
            } else {
                return days + " Days"
            }
        } else if(timeToVoteInSeconds % SECONDS_IN_HOUR === 0) {
            const hours = "" + (timeToVoteInSeconds / SECONDS_IN_HOUR)
            if(hours === "1") {
                return hours + " Hour"
            } else {
                return hours + " Hour"
            }
        } else {
            const minutes = "" + (timeToVoteInSeconds / SECONDS_IN_MINUTE)
            if(minutes === "1") {
                return minutes + " Minute"
            } else {
                return minutes + " Minutes"
            }
        }
    }

    if (!daoName || !governanceTokenAddress || !governanceTokenSymbol || !governanceTokenName || !daoAccountAddress
        || !tokensToCreateProposal || !minimumTokensToExecuteProposal || !proposalTimeToVote || !address || !currentBalance) {
        return null
    }

    const name = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Name</div>
        <div className={"overviewValue"}>{daoName}</div>
    </div>

    const currentBalanceSection = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Current balance</div>
        <div className={"overviewValue"}>{ethers.utils.formatEther(currentBalance)} LYXt</div>
    </div>

    const governanceToken = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Governance token</div>
        <div className={"overviewValue"}>
            <a className={"linkToExplorer"} target="_blank"
               href={"https://explorer.execution.l16.lukso.network/address/" + governanceTokenAddress}>${governanceTokenSymbol} {governanceTokenName}</a>
        </div>
    </div>

    const daoVotingManagerAddressDetails = () => <div className={"manageSection"}>
        <div className={"inputFont"}>DAO Voting Manager address</div>
        <div className={"overviewValue"}>
            <a className={"linkToExplorer"} target="_blank"
               href={"https://explorer.execution.l16.lukso.network/address/" + address}>Voting Manager</a>
        </div>
    </div>

    const daoAccountAddressDetails = () => <div className={"manageSection"}>
        <div className={"inputFont"}>DAO Account address</div>
        <div className={"overviewValue"}>
            <a className={"linkToExplorer"} target="_blank"
               href={"https://explorer.execution.l16.lukso.network/address/" + daoAccountAddress}>Account</a>
        </div>
    </div>

    const tokensToCreateProposalDetails = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Tokens to create proposal</div>
        <div className={"overviewValue"}>{tokensToCreateProposal}</div>
    </div>

    const minimumTokensToExecuteProposalDetails = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Minimum tokens to execute proposal</div>
        <div className={"overviewValue"}>{minimumTokensToExecuteProposal}</div>
    </div>

    const proposalTimeToVoteDetails = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Proposal time to vote</div>
        <div className={"overviewValue"}>{renderProposalTimeToVote(proposalTimeToVote)}</div>
    </div>

    return <Row>
        <Col sm={3}/>
        <Col sm={6}>
            {name()}
            {currentBalanceSection()}
            {tokensToCreateProposalDetails()}
            {minimumTokensToExecuteProposalDetails()}
            {proposalTimeToVoteDetails()}
            {daoVotingManagerAddressDetails()}
            {daoAccountAddressDetails()}
            {governanceToken()}
        </Col>
    </Row>
}