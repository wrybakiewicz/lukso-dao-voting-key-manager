import Col from "react-bootstrap/Col";
import {Button, InputGroup, Row} from "react-bootstrap";
import {BigNumber, ethers} from "ethers";
import Form from "react-bootstrap/Form";
import "./ManageWithdraw.css"
import {useEffect, useState} from "react";
import {toast} from "react-toastify";
import moment from "moment";
import {formatTime} from "./TimeUtils";

export default function ManageWithdraw({
                                           contract,
                                           governanceTokenSymbol,
                                           balanceInContract,
                                           tokenBalance,
                                           reload,
                                           possibleWithdrawTime
                                       }) {

    const [withdrawInput, setWithdrawInput] = useState('')
    const [withdrawalInProgress, setWithdrawalInProgress] = useState(false)

    const calculateWithdrawTimer = () => {
        if (!moment.unix(possibleWithdrawTime).isBefore(moment())) {
            const inTime = formatTime(moment.unix(possibleWithdrawTime))
            return <div className={"manageSection inputFont"}>You will be able to withdraw in <span className={"depositValueInfo"}>{inTime}</span></div>
        } else {
            return null
        }
    }

    const [withdrawTimer, setWithdrawTimer] = useState(calculateWithdrawTimer())

    useEffect(() => {
        const timer = setTimeout(() => {
            setWithdrawTimer(calculateWithdrawTimer());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const withdrawFromContract = () => {
        console.log("Withdrawing: " + withdrawInput)
        setWithdrawalInProgress(true)
        const withdrawalPromise = contract.withdraw(ethers.utils.parseEther(withdrawInput)).then(_ => {
            reload()
        }).catch(e => {
            console.error(e)
            throw e
        }).finally(_ => {
            setWithdrawalInProgress(false)
        })
        toast.promise(withdrawalPromise, {
            pending: 'Withdrawing $' + governanceTokenSymbol,
            success: '🦀 Withdrawal succeed 🦀',
            error: '☠ Withdraw failed ☠'
        })
    }

    const canWithdraw = () => {
        return withdrawInput > 0 && ethers.utils.parseEther(withdrawInput).lte(balanceInContract) && moment.unix(possibleWithdrawTime).isBefore(moment())
    }

    const maxWithdraw = () => {
        setWithdrawInput(ethers.utils.formatEther(balanceInContract))
    }

    const info = () => <div className={"bigManageSection bigInputFont"}>
        Withdraw <span className={"depositValueInfo"}>${governanceTokenSymbol}</span> from DAO contract
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
                You have <span
                className={"depositValueInfo"}>{ethers.utils.formatEther(balanceInContract)}</span> <span
                className={"depositValueInfo"}>${governanceTokenSymbol}</span> deposited in DAO voting contract
            </div>
        }
    }

    const balance = () => <div className={"manageSection inputFont"}>
        Your balance: <span
        className={"depositValueInfo"}>{ethers.utils.formatEther(tokenBalance)} ${governanceTokenSymbol}</span>
    </div>

    const withdraw = () => <div className={"manageSection withdrawSection"}>
        <InputGroup className="mb-3">
            <Form.Control placeholder={`Number of ${governanceTokenSymbol} tokens to withdraw`} type={"number"}
                          value={withdrawInput}
                          onChange={e => setWithdrawInput(e.target.value)}/>
            <Button variant="outline-dark" onClick={maxWithdraw}>
                Max
            </Button>
        </InputGroup>
    </div>

    const withdrawButton = () => {
        return <div className={"withdrawButton"}>
            <Button variant="outline-dark" onClick={withdrawFromContract}
                    disabled={!canWithdraw() || withdrawalInProgress}>
                Withdraw
            </Button>
        </div>
    }

    return <Row>
        <Col sm={3}/>
        <Col sm={8}>
            {info()}
            {balanceInContractDetails()}
            {balance()}
            {withdraw()}
            {withdrawTimer}
            {withdrawButton()}
        </Col>
    </Row>
}