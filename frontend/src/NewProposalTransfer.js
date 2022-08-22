import {Button, Form, InputGroup} from "react-bootstrap";
import {useEffect, useState} from "react";
import {IconButton, Tooltip, Typography} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import {ethers} from "ethers";
import {toast} from "react-toastify";

export default function NewProposalTransfer({contract, proposalCreated, currentBalance, updateCreatingProposal}) {

    const [creatingProposalInProgress, setCreatingProposalInProgress] = useState(false)
    const [receiverAddress, setReceiverAddress] = useState('')
    const [amount, setAmount] = useState('')

    const setMaxAmount = () => {
        setAmount(ethers.utils.formatEther(currentBalance))
    }

    const createProposal = () => {
        console.log("Creating proposal amount: " + amount + " address: " + receiverAddress)
        setCreatingProposalInProgress(true)
        updateCreatingProposal(true)
        const createProposalPromise = contract.createProposal(0, receiverAddress, ethers.utils.parseEther(amount), "0x")
            .then(_ => proposalCreated())
            .catch(e => {
                console.error(e)
                throw e
            }).finally(_ => {
                setCreatingProposalInProgress(false)
                updateCreatingProposal(false)
            })

        toast.promise(createProposalPromise, {
            pending: 'Creating LXYt transfer proposal',
            success: '🦀 Proposal Created 🦀',
            error: '☠ Create proposal failed ☠'
        })
    }

    const canCreateProposal = () => {
        return ethers.utils.isAddress(receiverAddress) && amount > 0 && ethers.utils.parseEther(amount).lte(currentBalance)
    }

    const currentBalanceSection = () => <div className={"manageSection"}>
        <div className={"inputFont"}>Current DAO LYXt balance</div>
        <div className={"overviewValue"}>{ethers.utils.formatEther(currentBalance)}</div>
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
        <Button variant="outline-dark" onClick={() => createProposal()} disabled={!canCreateProposal() || creatingProposalInProgress}>
            Create proposal
        </Button>
    </div>

    if(!currentBalance) {
        return null
    }

    return <div>
        {currentBalanceSection()}
        {receiverAddressSection()}
        {amountSection()}
        {createProposalButton()}
    </div>
}