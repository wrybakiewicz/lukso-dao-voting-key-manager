import Form from 'react-bootstrap/Form';
import "./Deploy.css"
import {useState} from "react";
import {Button, InputGroup} from "react-bootstrap";
import {IconButton, Tooltip, Typography} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import {ContractFactory, ethers} from "ethers";
import DAOVotingManager from "./contract/DaoVotingManager.json"
import {toast} from "react-toastify";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useNavigate} from "react-router";

const CONTRACT_CREATED_FUNCTION_ID = "0x01c42bd7"

export default function Deploy({provider, signer}) {

    const navigate = useNavigate();

    const [daoNameInput, setDaoNameInput] = useState('')
    const [governanceTokenAddress, setGovernanceTokenAddress] = useState('')
    const [tokensNumberToCreateProposal, setTokensNumberToCreateProposal] = useState('')
    const [minimumTokensToExecuteProposal, setMinimumTokensToExecuteProposal] = useState('')
    const [proposalTimeToVote, setProposalTimeToVote] = useState('')
    const [proposalTimeToVoteUnit, setProposalTimeToVoteUnit] = useState(1)
    const [deployInProgress, setDeployInProgress] = useState(false)

    const deployContract = async () => {
        console.log("Deploying name: " + daoNameInput + " governanceTokenAddress: " + governanceTokenAddress +
            " tokensNumberToCreateProposal: " + tokensNumberToCreateProposal + " minimumTokensToExecuteProposal: " +
            minimumTokensToExecuteProposal + " proposalTimeToVote: " + proposalTimeToVote + " proposalTimeToVoteUnit: " +
            proposalTimeToVoteUnit)
        setDeployInProgress(true)
        const contractFactory = ContractFactory.fromSolidity(DAOVotingManager, signer)
        const proposalTimeToVoteInSeconds = getProposalTimeToVoteInSeconds(proposalTimeToVote, proposalTimeToVoteUnit)
        const tokensNumberToCreateProposalValue = (tokensNumberToCreateProposal * (10 ** 18)).toString()
        const minimumTokensToExecuteProposalValue = (minimumTokensToExecuteProposal * (10 ** 18)).toString()
        console.log("Formatted proposalTimeToVoteInSeconds: " + proposalTimeToVoteInSeconds + " tokensNumberToCreateProposalValueL " +
            tokensNumberToCreateProposalValue + " minimumTokensToExecuteProposalValue: " + minimumTokensToExecuteProposalValue)
        const deployPromise = contractFactory.deploy(governanceTokenAddress, daoNameInput,
            tokensNumberToCreateProposalValue, minimumTokensToExecuteProposalValue,
            proposalTimeToVoteInSeconds).then(async result => {
            return await getContractAddress(result.deployTransaction.hash)
        }).catch(e => {
            console.error(e)
            throw e
        }).finally(_ => {
            setDeployInProgress(false)
        })
        toast.promise(deployPromise, {
            pending: '🔨 Deploying your DAO 🔨',
            success: '🦀 DAO Deployed 🦀',
            error: '☠ DAO Deploy error ☠'
        })
        const contractAddress = await deployPromise
        navigate('/manage/' + contractAddress)
        //TODO: save on backend ?
    }

    const getContractAddress = async (hash) => {
        const transaction = await provider.getTransactionReceipt(hash)
        const contractCreatedLog = transaction.logs.filter(log => log.topics[0].startsWith(CONTRACT_CREATED_FUNCTION_ID))[0]
        const contractAddressAsBytes = contractCreatedLog.topics[2]
        return "0x" + contractAddressAsBytes.slice(-40)
    }


    const getProposalTimeToVoteInSeconds = (proposalTimeToVote, proposalTimeToVoteUnit) => {
        if (proposalTimeToVoteUnit.toString() === "1") {
            return 60 * proposalTimeToVote
        } else if (proposalTimeToVoteUnit.toString() === "2") {
            return 60 * 60 * proposalTimeToVote
        } else if (proposalTimeToVoteUnit.toString() === "3") {
            return 60 * 60 * 60 * proposalTimeToVote
        }
    }

    const daoName = () => <div>
        <Form.Label className={"inputFont"}>Name</Form.Label>
        <InputGroup>
            <div className={"tooltipStyle"}>
                <Tooltip
                    title={<Typography fontSize={20}>Name of a DAO shown in the dApp</Typography>}>
                    <IconButton>
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            </div>
            <Form.Control placeholder={"Name"} value={daoNameInput}
                          onChange={e => setDaoNameInput(e.target.value)}/>
        </InputGroup>
    </div>

    const daoGovernanceTokenAddress = () => <div className={"inputPaddingTop"}>
        <Form.Label className={"inputFont"}>Governance Token Address</Form.Label>
        <InputGroup>
            <div className={"tooltipStyle"}>
                <Tooltip
                    title={<Typography fontSize={20}>Input Governance Digital Asset address compliant with LSP7
                        standard</Typography>}>
                    <IconButton>
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            </div>
            <Form.Control placeholder={"Governance Token Address"} value={governanceTokenAddress}
                          onChange={e => setGovernanceTokenAddress(e.target.value)}/>
        </InputGroup>
    </div>

    const tokensToCreateProposal = () => <div className={"inputPaddingTop"}>
        <Form.Label className={"inputFont"}>Number of tokens to create proposal</Form.Label>
        <InputGroup>
            <div className={"tooltipStyle"}>
                <Tooltip
                    title={<Typography fontSize={20}>Number of tokens which is required to create new proposal in
                        DAO</Typography>}>
                    <IconButton>
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            </div>
            <Form.Control placeholder={"Number of tokens to create proposal"} type={"number"}
                          value={tokensNumberToCreateProposal}
                          onChange={e => setTokensNumberToCreateProposal(e.target.value)}/>
        </InputGroup>
    </div>

    const tokensToExecuteProposal = () => <div className={"inputPaddingTop"}>
        <Form.Label className={"inputFont"}>Minimum tokens to execute proposal</Form.Label>
        <InputGroup>
            <div className={"tooltipStyle"}>
                <Tooltip
                    title={<Typography fontSize={20}>Minimum number of tokens which needs to vote to execute
                        proposal</Typography>}>
                    <IconButton>
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            </div>
            <Form.Control placeholder={"Minimum tokens to execute proposal"} type={"number"}
                          value={minimumTokensToExecuteProposal}
                          onChange={e => setMinimumTokensToExecuteProposal(e.target.value)}/>
        </InputGroup>
    </div>

    const proposalTime = () => <div className={"inputPaddingTop"}>
        <Form.Label className={"inputFont"}>Proposal time to vote</Form.Label>
        <InputGroup>
            <div className={"tooltipStyle"}>
                <Tooltip
                    title={<Typography fontSize={20}>Time for voters to vote on proposal</Typography>}>
                    <IconButton>
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            </div>
            <Form.Control placeholder={"Proposal time to vote"} type={"number"} value={proposalTimeToVote}
                          onChange={e => setProposalTimeToVote(e.target.value)}/>
            <Form.Select value={proposalTimeToVoteUnit} onChange={e => setProposalTimeToVoteUnit(e.target.value)}>
                <option key={'minutes'} value={1}>Minutes</option>
                <option key={'hours'} value={2}>Hours</option>
                <option key={'days'} value={3}>Days</option>
            </Form.Select>
        </InputGroup>
    </div>

    const canDeploy = () => {
        return daoNameInput !== "" && ethers.utils.isAddress(governanceTokenAddress)
            && tokensNumberToCreateProposal > 0 && minimumTokensToExecuteProposal > 0 && proposalTimeToVote > 0
    }

    const deployButton = () => {
        return <div className={"deployButton"}>
            <Button variant="outline-dark" onClick={deployContract}
                    disabled={!canDeploy() || deployInProgress}>
                Deploy
            </Button>
        </div>
    }

    if (!signer) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    return <div className={"deploy"}>
        <Row>
            <Col sm={4}/>
            <Col sm={4}>
                {daoName()}
                {daoGovernanceTokenAddress()}
                {tokensToCreateProposal()}
                {tokensToExecuteProposal()}
                {proposalTime()}
                {deployButton()}
            </Col>
        </Row>
    </div>

}