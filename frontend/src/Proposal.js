import ProposalTableRow from "./ProposalTableRow";
import {ethers} from "ethers";
import {displayShortAddress} from "./ResponsiveUtils";

export default function Proposal({
                                     proposal, governanceTokenSymbol, contract, proposalTimeToVote, updateParent,
                                     currentAddress, minimumTokensToExecuteProposal, reload, balanceInContract, tokenContract
                                 }) {

    const link = (to) => <a className={"linkToExplorer"} target="_blank"
                            href={"https://explorer.execution.l16.lukso.network/address/" + to}>{displayShortAddress(to)}</a>

    const getDetails = () => {
        if(proposal.value > 0) {
            return <span>Transfer {ethers.utils.formatEther(proposal.value)} $LXYt
            to {link(proposal.to)}</span>
        } else {
            const data = tokenContract.interface.decodeFunctionData('transfer', proposal.payload)
            return <span>Transfer {ethers.utils.formatEther(data.amount)} ${governanceTokenSymbol} to {link(data.to)}</span>
        }
    }

    return <ProposalTableRow proposal={proposal} governanceTokenSymbol={governanceTokenSymbol} contract={contract}
                             proposalTimeToVote={proposalTimeToVote} updateParent={updateParent}
                             currentAddress={currentAddress}
                             minimumTokensToExecuteProposal={minimumTokensToExecuteProposal} reload={reload}
                             balanceInContract={balanceInContract} details={getDetails()}/>
}