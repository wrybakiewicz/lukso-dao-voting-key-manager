import {ethers} from "ethers";
import {toast} from "react-toastify";
import {Button, Form, InputGroup} from "react-bootstrap";
import {IconButton, Tooltip, Typography} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import {useState} from "react";

export default function NewProposalTransferNativeToken({
                                                           contract,
                                                           daoAccountAddress,
                                                           governanceTokenAddress,
                                                           governanceTokenBalance,
                                                           proposalCreated,
                                                           updateCreatingProposal,
                                                           governanceTokenSymbol,
                                                           tokenContract
                                                       }) {

    const [creatingProposalInProgress, setCreatingProposalInProgress] = useState(false)
    const [receiverAddress, setReceiverAddress] = useState('')
    const [amount, setAmount] = useState('')

    const setMaxAmount = () => {
        setAmount(ethers.utils.formatEther(governanceTokenBalance))
    }

    const createProposal = () => {
        console.log("Creating proposal amount: " + amount + " address: " + receiverAddress + " token address: " + governanceTokenAddress)
        setCreatingProposalInProgress(true)
        updateCreatingProposal(true)
        const payload = tokenContract.interface.encodeFunctionData(
            'transfer(address,address,uint256,bool,bytes)',
            [daoAccountAddress, receiverAddress, ethers.utils.parseEther(amount), true, "0x"],
        );
        const createProposalPromise = contract.createProposal(0, governanceTokenAddress, 0, payload)
            .then(_ => proposalCreated())
            .catch(e => {
                console.error(e)
                throw e
            }).finally(_ => {
                setCreatingProposalInProgress(false)
                updateCreatingProposal(false)
            })

        toast.promise(createProposalPromise, {
            pending: 'Creating ' + governanceTokenSymbol + ' transfer proposal',
            success: '🦀 Proposal Created 🦀',
            error: '☠ Create proposal failed ☠'
        })
    }

    const canCreateProposal = () => {
        return ethers.utils.isAddress(receiverAddress) && amount > 0 && ethers.utils.parseEther(amount).lte(governanceTokenBalance)
    }

    const currentBalanceSection = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Current DAO {governanceTokenSymbol} balance</div>
        <div className={"overviewValue"}>{ethers.utils.formatEther(governanceTokenBalance)}</div>
    </div>

    const receiverAddressSection = () => <div className={"manageProposalWidth manageSection"}>
        <Form.Label className={"inputFont"}>Receiver address</Form.Label>
        <InputGroup>
            <div className={"tooltipStyle"}>
                <Tooltip
                    title={<Typography fontSize={20}>Address that will receive sending amount</Typography>}>
                    <IconButton>
                        <InfoIcon/>
                    </IconButton>
                </Tooltip>
            </div>
            <Form.Control placeholder={"Receiver address"} value={receiverAddress}
                          onChange={e => setReceiverAddress(e.target.value)}/>
        </InputGroup>
    </div>

    const amountSection = () => <div className={"manageProposalWidth manageSection"}>
        <Form.Label className={"inputFont"}>Sending amount</Form.Label>
        <InputGroup>
            <Form.Control placeholder={"Sending amount"} type={"number"} value={amount}
                          onChange={e => setAmount(e.target.value)}/>
            <Button variant="outline-dark" onClick={setMaxAmount}>
                Max
            </Button>
        </InputGroup>
    </div>

    const createProposalButton = () => <div className={"createProposalButton"}>
        <Button variant="outline-dark" onClick={() => createProposal()}
                disabled={!canCreateProposal() || creatingProposalInProgress}>
            Create proposal
        </Button>
    </div>

    if (!governanceTokenBalance) {
        return null
    }

    return <div>
        {currentBalanceSection()}
        {receiverAddressSection()}
        {amountSection()}
        {createProposalButton()}
    </div>
}