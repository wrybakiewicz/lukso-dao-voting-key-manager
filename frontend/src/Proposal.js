import TransferProposal from "./TransferProposal";

export default function Proposal({proposal}) {
    //handle based on proposal data - transfer proposal / digital asset transfer / other function
    return <TransferProposal proposal={proposal} />
}