import "./Proposal.css"
import {BigNumber, ethers} from "ethers";
import {Button, ProgressBar} from "react-bootstrap";
import {displayShortAddress} from "./ResponsiveUtils";
import "./TransferProposal.css"
import {toast} from "react-toastify";
import EndingIn from "./EndingIn";
import {useEffect, useState} from "react";
import moment from "moment";

export default function ProposalTableRow({
                                             proposal,
                                             governanceTokenSymbol,
                                             contract,
                                             proposalTimeToVote,
                                             updateParent,
                                             currentAddress,
                                             minimumTokensToExecuteProposal,
                                             reload,
                                             balanceInContract,
                                             details
                                         }) {

    const [isVoted, setIsVoted] = useState()
    const [executeInProgress, setExecuteInProgress] = useState(false)
    const [voteInProgress, setVoteInProgress] = useState(false)

    const initialize = () => {
        contract.addressToProposalIdToVote(currentAddress, proposal.id).then(vote => {
            setIsVoted(vote !== 0)
        })
    }

    useEffect(_ => {
        initialize()
    }, [])

    const votingEnd = moment.unix(proposal.createdAt).add(proposalTimeToVote, 'seconds')

    const balanceInContractIs0 = balanceInContract.eq(BigNumber.from(0))

    const calculateCanVote = () => {
        return !votingEnd.isBefore(moment())
    }

    const [canVote, setCanVote] = useState(calculateCanVote())

    const isYesWinning = () => {
        return proposal.yesVotes.gt(proposal.noVotes)
    }

    const isMinimumVotes = () => {
        return proposal.yesVotes.gte(minimumTokensToExecuteProposal)
    }

    const isStatusPending = () => {
        return proposal.status === 0
    }

    const isFailedPending = () => {
        return proposal.status === 3
    }

    const canExecute = () => {
        return !canVote && isYesWinning() && isStatusPending() && isMinimumVotes()
    }

    const getYesToNoVotes = () => {
        const sumVotes = proposal.yesVotes.add(proposal.noVotes)
        if (sumVotes.gt(0)) {
            return (proposal.yesVotes.mul(100)).div(sumVotes)
        } else {
            return 0
        }
    }

    const getNoToYesVotes = () => {
        if (proposal.noVotes.gt(0)) {
            return BigNumber.from(100).sub(getYesToNoVotes())
        } else {
            return 0
        }
    }

    const voteYes = () => {
        setVoteInProgress(true)
        const voteYesPromise = contract.vote(proposal.id, true)
            .then(_ => {
                updateParent()
                setIsVoted(true)
            })
            .catch(e => {
                console.error(e)
                throw e
            }).finally(_ => setVoteInProgress(false))

        toast.promise(voteYesPromise, {
            pending: 'Voting Yes',
            success: '🦀 Voted Yes 🦀',
            error: '☠ Vote Yes failure ☠'
        })
    }

    const voteNo = () => {
        setVoteInProgress(true)
        const voteYesPromise = contract.vote(proposal.id, false)
            .then(_ => {
                updateParent()
                setIsVoted(true)
            })
            .catch(e => {
                console.error(e)
                throw e
            }).finally(_ => setVoteInProgress(false))

        toast.promise(voteYesPromise, {
            pending: 'Voting No',
            success: '🦀 Voted No 🦀',
            error: '☠ Vote No failure ☠'
        })
    }

    const execute = () => {
        setExecuteInProgress(true)
        const executePromise = contract.finalize(proposal.id)
            .then(async _ => {
                updateParent()
                return reload()
            })
            .catch(e => {
                console.error(e)
                throw e
            }).finally(_ => setExecuteInProgress(false))

        toast.promise(executePromise, {
            pending: 'Finalizing proposal',
            success: '🦀 Finalized proposal 🦀',
            error: '☠ Finalize proposal failed ☠'
        })
    }

    const link = (to) => <a className={"linkToExplorer"} target="_blank"
                            href={"https://explorer.execution.l16.lukso.network/address/" + to}>{displayShortAddress(to)}</a>

    const voteYesButton = <Button variant="outline-dark" size="sm" onClick={voteYes}
                                  disabled={!canVote || isVoted || balanceInContractIs0 || voteInProgress}>
        Vote Yes
    </Button>

    const voteNoButton = <Button variant="outline-dark" size="sm" onClick={voteNo}
                                 disabled={!canVote || isVoted || balanceInContractIs0 || voteInProgress}>
        Vote No
    </Button>

    const finalizeButton = () => {
        if (!canVote && (isStatusPending() || isFailedPending()) && proposal.createdBy === currentAddress && (!isMinimumVotes() || !isYesWinning())) {
            return <Button variant="outline-dark" size="sm" onClick={execute}
                           disabled={!isStatusPending() || executeInProgress}>
                Get deposit back
            </Button>
        } else {
            return <Button variant="outline-dark" size="sm" onClick={execute}
                           disabled={!canExecute() || executeInProgress}>
                Execute
            </Button>
        }
    }

    const buttons = () => <div className={"elementCentered"}>
        {voteYesButton} {voteNoButton} {finalizeButton()}
    </div>


    const voteProgress = () => <div>
        <ProgressBar animated className={"votesProgressBar"}>
            <ProgressBar animated striped variant="success" now={getYesToNoVotes()} key={1}
                         label={ethers.utils.formatEther(proposal.yesVotes) + " $" + governanceTokenSymbol}/>
            <ProgressBar animated striped variant="danger" now={getNoToYesVotes()} key={2}
                         label={ethers.utils.formatEther(proposal.noVotes) + " $" + governanceTokenSymbol}/>
        </ProgressBar>
    </div>

    if (isVoted === undefined) {
        return null
    }

    return <tr>
        <td className="align-middle">{proposal.id.toNumber()}</td>
        <td className="align-middle"><EndingIn votingEnd={votingEnd} proposal={proposal}
                                               updateCantVote={() => setCanVote(false)} canExecute={canExecute}/></td>
        <td className="align-middle">{details}</td>
        <td className="align-middle">{link(proposal.createdBy)}</td>
        <td className="align-middle">{voteProgress()}</td>
        <td className="align-middle">{buttons()}</td>
    </tr>
}