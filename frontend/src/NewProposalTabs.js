import {Tab, Tabs} from "react-bootstrap";
import NewProposalTransfer from "./NewProposalTransfer";
import "./NewProposalTabs.css"
import NewProposalTransferNativeToken from "./NewProposalTransferNativeToken";

export default function NewProposalTabs({
                                            contract,
                                            proposalCreated,
                                            currentBalance,
                                            setCreatingProposalInProgress,
                                            governanceTokenSymbol,
                                            governanceTokenBalance
                                        }) {
    return <div className={"newProposalTabs"}>
        <Tabs
            defaultActiveKey={"native"}
            fill>
            <Tab eventKey="native" title="Transfer LYXt">
                <NewProposalTransfer contract={contract} proposalCreated={proposalCreated}
                                     currentBalance={currentBalance}
                                     updateCreatingProposal={(bool) => setCreatingProposalInProgress(bool)}/>
            </Tab>
            <Tab eventKey="dao" title={"Transfer " + governanceTokenSymbol}>
                <NewProposalTransferNativeToken contract={contract} proposalCreated={proposalCreated}
                                                governanceTokenBalance={governanceTokenBalance}
                                                updateCreatingProposal={(bool) => setCreatingProposalInProgress(bool)}
                                                governanceTokenSymbol={governanceTokenSymbol}/>
            </Tab>
        </Tabs>
    </div>
}