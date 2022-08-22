import TransferProposal from "./TransferProposal";

export default function Proposal({proposal, governanceTokenSymbol, contract, proposalTimeToVote, voteSent}) {
    //handle based on proposal data - transfer proposal / digital asset transfer / other function
    return <TransferProposal proposal={proposal} governanceTokenSymbol={governanceTokenSymbol} contract={contract}
                             proposalTimeToVote={proposalTimeToVote} voteSent={voteSent}/>
}