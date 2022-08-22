import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {BigNumber, ethers} from "ethers";
import {useState} from "react";
import Form from "react-bootstrap/Form";
import {Button, InputGroup} from "react-bootstrap";
import "./ManageDeposit.css"
import {toast} from "react-toastify";

export default function ManageDeposit({
                                          contract,
                                          reload,
                                          tokenContract,
                                          governanceTokenSymbol,
                                          tokenBalance,
                                          balanceInContract,
                                          authorizedAmount
                                      }) {

    const [depositInProgress, setDepositInProgress] = useState(false)
    const [showOnlyDeposit, setShowOnlyDeposit] = useState(true)
    const [depositInput, setDepositInput] = useState('')

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

    const depositToContract = () => {
        console.log("Depositing: " + depositInput)
        setDepositInProgress(true)
        const depositPromise = contract.deposit(ethers.utils.parseEther(depositInput)).then(_ => {
            reload()
        }).catch(e => {
            console.error(e)
            throw e
        }).finally(_ => {
            setDepositInProgress(false)
        })
        toast.promise(depositPromise, {
            pending: 'Depositing $' + governanceTokenSymbol,
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
        Deposit <span className={"depositValueInfo"}>${governanceTokenSymbol}</span> to participate in DAO voting
    </div>

    const balance = () => <div className={"manageSection inputFont"}>
        Your balance: <span
        className={"depositValueInfo"}>{ethers.utils.formatEther(tokenBalance)} ${governanceTokenSymbol}</span>
    </div>

    const balanceInContractDetails = () => {
        if (balanceInContract.eq(BigNumber.from(0))) {
            return <div className={"manageSection inputFont"}>
                You don't have any <span className={"depositValueInfo"}>${governanceTokenSymbol}</span> deposited in DAO
                voting
                contract
            </div>
        } else {
            return <div className={"manageSection inputFont"}>
                You have already deposited <span
                className={"depositValueInfo"}>{ethers.utils.formatEther(balanceInContract)}</span> <span
                className={"depositValueInfo"}>${governanceTokenSymbol}</span>
            </div>
        }
    }

    const deposit = () => <div className={"manageSection depositSection"}>
        <InputGroup className="mb-3">
            <Form.Control placeholder={`Number of ${governanceTokenSymbol} tokens to deposit`} type={"number"}
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