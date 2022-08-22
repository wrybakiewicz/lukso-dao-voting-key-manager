import TransferProposal from "./TransferProposal";

export default function Proposal({proposal, governanceTokenSymbol, contract, proposalTimeToVote, updateParent,
                                     currentAddress, minimumTokensToExecuteProposal}) {
    //handle based on proposal data - transfer proposal / digital asset transfer / other function
    return <TransferProposal proposal={proposal} governanceTokenSymbol={governanceTokenSymbol} contract={contract}
                             proposalTimeToVote={proposalTimeToVote} updateParent={updateParent}
                             currentAddress={currentAddress} minimumTokensToExecuteProposal={minimumTokensToExecuteProposal}/>
}