import "./Proposal.css"
import {ethers} from "ethers";
import moment from "moment";
import {Button, ProgressBar} from "react-bootstrap";
import {displayShortAddress} from "./ResponsiveUtils";
import "./TransferProposal.css"

export default function TransferProposal({proposal, governanceTokenSymbol}) {
    console.log(proposal)

    const link = (to) => <a className={"linkToExplorer"} target="_blank"
                            href={"https://explorer.execution.l16.lukso.network/address/" + to}>{displayShortAddress(to)}</a>

    const createdAt = moment.unix(proposal.createdAt).format("Do MMMM YYYY");

    const voteYesButton = <Button variant="outline-dark" size="sm">
        Vote Yes
    </Button>

    const voteNoButton = <Button variant="outline-dark" size="sm">
        Vote No
    </Button>

    const yesVotes = "3.0 $" + governanceTokenSymbol
    const noVotes = "2.0 $" + {governanceTokenSymbol}

    const voteProgress = <div>
        <ProgressBar animated className={"votesProgressBar"}>
            <ProgressBar animated striped variant="success" now={35} key={1} label={yesVotes}/>
            <ProgressBar animated striped variant="danger" now={10} key={2} label={noVotes}/>
        </ProgressBar>
    </div>
    return <tr key={proposal.id.toNumber()} className={"tableRowCenter"}>
        <td className="align-middle">{proposal.id.toNumber()}</td>
        <td className="align-middle">Transfer {ethers.utils.formatEther(proposal.value)} $LXYt to {link(proposal.to)}</td>
        <td className="align-middle">{link(proposal.createdBy)}</td>
        <td className="align-middle">{createdAt}</td>
        <td className="align-middle">{voteProgress}</td>
        <td className="align-middle">{voteYesButton} {voteNoButton}</td>
    </tr>
}