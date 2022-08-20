import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {ContractFactory, ethers} from "ethers";
import {ERC725YKeys} from "@lukso/lsp-smart-contracts/constants";
import {toUtf8String} from "@ethersproject/strings";
import {useEffect, useState} from "react";
import LSP7DigitalAsset from "@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json";
import Form from "react-bootstrap/Form";
import {Button, InputGroup} from "react-bootstrap";
import "./ManageDeposit.css"
import {toast} from "react-toastify";

export default function ManageDeposit({contract, signer, currentAddress}) {

    const [tokenContract, setTokenContract] = useState()
    const [depositInProgress, setDepositInProgress] = useState(false)
    const [showOnlyDeposit, setShowOnlyDeposit] = useState(true)
    const [tokenSymbol, setTokenSymbol] = useState()
    const [depositInput, setDepositInput] = useState('')
    const [tokenBalance, setTokenBalance] = useState()
    const [balanceInContract, setBalanceInContract] = useState()
    const [authorizedAmount, setAuthorizedAmount] = useState()

    const initialize = () => {
        contract.daoGovernanceToken().then(tokenAddress => {
            const tokenContract = ContractFactory.getContract(tokenAddress, LSP7DigitalAsset.abi, signer)
            setTokenContract(tokenContract)
            tokenContract["getData(bytes32)"](ERC725YKeys.LSP4.LSP4TokenSymbol).then(tokenSymbol => setTokenSymbol(toUtf8String(tokenSymbol)))
            tokenContract.balanceOf(currentAddress).then(addressBalance => setTokenBalance(addressBalance))
            tokenContract.isOperatorFor(contract.address, currentAddress).then(tokens => setAuthorizedAmount(tokens))
        })
        contract.depositorsBalances(currentAddress)
            .then(balance => setBalanceInContract(ethers.utils.formatEther(balance)))
    }

    useEffect(_ => {
        initialize()
    }, [])

    const maxDeposit = () => {
        setDepositInput(ethers.utils.formatEther(tokenBalance))
    }

    const canDeposit = () => {
        return depositInput > 0 && ethers.utils.parseEther(depositInput).lte(tokenBalance)
    }

    const updateDepositInput = (depositInput) => {
        setDepositInput(depositInput)
        if (depositInput === '' || depositInput === "0" || ethers.utils.parseEther(depositInput).lte(authorizedAmount)) {
            setShowOnlyDeposit(true)
        } else {
            setShowOnlyDeposit(false)
        }
    }

    //TODO: deposit to contract need to reload the whole component
    const depositToContract = () => {
        console.log("Depositing: " + depositInput)
        setDepositInProgress(true)
        const depositPromise = contract.deposit(ethers.utils.parseEther(depositInput)).then(_ => initialize()).catch(e => {
            console.error(e)
            throw e
        }).finally(_ => {
            setDepositInProgress(false)
        })
        toast.promise(depositPromise, {
            pending: 'Depositing $' + tokenSymbol,
            success: '🦀 Deposit succeed 🦀',
            error: '☠ Deposit failed ☠'
        })
    }

    const authorizeContract = () => {
        console.log("Authorizing: " + depositInput)
        setDepositInProgress(true)
        const depositPromise = tokenContract.authorizeOperator(contract.address, ethers.constants.MaxUint256).then(_ => {
            setShowOnlyDeposit(true)
        }).catch(e => {
            console.error(e)
            throw e
        }).finally(_ => {
            setDepositInProgress(false)
        })
        toast.promise(depositPromise, {
            pending: 'Authorizing contract',
            success: '🦀 Authorized contract 🦀',
            error: '☠ Authorize failed ☠'
        })
    }

    const info = () => <div className={"bigManageSection bigInputFont"}>
        Deposit <span className={"depositValueInfo"}>${tokenSymbol}</span> to participate in DAO voting
    </div>

    const balance = () => <div className={"manageSection inputFont"}>
        Your <span className={"depositValueInfo"}>${tokenSymbol}</span> balance: <span
        className={"depositValueInfo"}>{ethers.utils.formatEther(tokenBalance)}</span>
    </div>

    const balanceInContractDetails = () => {
        if (balanceInContract === "0.0") {
            return <div className={"manageSection inputFont"}>
                You don't have any <span className={"depositValueInfo"}>${tokenSymbol}</span> deposited in DAO voting
                contract
            </div>
        } else {
            return <div className={"manageSection inputFont"}>
                You have already deposited <span
                className={"depositValueInfo"}>{balanceInContract}</span> <span
                className={"depositValueInfo"}>${tokenSymbol}</span>
            </div>
        }
    }

    const deposit = () => <div className={"manageSection depositSection"}>
        <InputGroup className="mb-3">
            <Form.Control placeholder={`Number of ${tokenSymbol} tokens to deposit`} type={"number"}
                          value={depositInput}
                          onChange={e => updateDepositInput(e.target.value)}/>
            <Button variant="outline-dark" onClick={maxDeposit}>
                Max
            </Button>
        </InputGroup>
    </div>

    const authorizeAndDepositButtons = () => {
        const authorizeButton = <span className={"buttonsPadding"}>
            <Button variant="outline-dark" onClick={authorizeContract}
                    disabled={!canDeposit() || depositInProgress}>
            Authorize contract
            </Button>
        </span>
        const authorizeButtonContent = showOnlyDeposit ? null : authorizeButton

        return <div className={"depositButton"}>
            {authorizeButtonContent}
            <Button variant="outline-dark" onClick={depositToContract}
                    disabled={!canDeposit() || depositInProgress || !showOnlyDeposit}>
                Deposit
            </Button>
        </div>
    }

    if (!tokenContract || !tokenSymbol || !tokenBalance || !balanceInContract || !authorizedAmount) {
        return null
    }

    return <Row>
        <Col sm={3}/>
        <Col sm={8}>
            {info()}
            {balance()}
            {balanceInContractDetails()}
            {deposit()}
            {authorizeAndDepositButtons()}
        </Col>
    </Row>
}