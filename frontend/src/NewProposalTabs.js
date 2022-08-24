import {Tab, Tabs} from "react-bootstrap";
import NewProposalTransfer from "./NewProposalTransfer";
import "./NewProposalTabs.css"
import NewProposalTransferNativeToken from "./NewProposalTransferNativeToken";

export default function NewProposalTabs({
                                            contract,
                                            governanceTokenAddress,
                                            proposalCreated,
                                            currentBalance,
                                            updateCreatingProposal,
                                            governanceTokenSymbol,
                                            daoAccountAddress,
                                            governanceTokenBalance,
                                            tokenContract
                                        }) {
    return <div className={"newProposalTabs"}>
        <Tabs
            defaultActiveKey={"native"}
            fill>
            <Tab eventKey="native" title="Transfer LYXt">
                <NewProposalTransfer contract={contract} proposalCreated={proposalCreated}
                                     currentBalance={currentBalance}
                                     updateCreatingProposal={(bool) => updateCreatingProposal(bool)}/>
            </Tab>
            <Tab eventKey="dao" title={"Transfer " + governanceTokenSymbol}>
                <NewProposalTransferNativeToken contract={contract} proposalCreated={proposalCreated}
                                                governanceTokenAddress={governanceTokenAddress} daoAccountAddress={daoAccountAddress}
                                                governanceTokenBalance={governanceTokenBalance} tokenContract={tokenContract}
                                                updateCreatingProposal={(bool) => updateCreatingProposal(bool)}
                                                governanceTokenSymbol={governanceTokenSymbol}/>
            </Tab>
        </Tabs>
    </div>
}