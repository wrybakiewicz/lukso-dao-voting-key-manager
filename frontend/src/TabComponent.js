import {Tab, Tabs} from "react-bootstrap";
import {useNavigate} from "react-router";
import "./TabComponent.css"
import Deploy from "./Deploy";
import Manage from "./Manage";

export default function TabComponent({active, address, signer, provider}) {

    const navigate = useNavigate();

    const onSelect = (tab) => {
        if (tab === "manage") {
            navigate("/")
        } else {
            navigate("/deploy")
        }
    }

    return <div>
        <div className={"header"}>
            DAO Voting Key Manager
        </div>
        <div className={"tabComponent"}>
            <Tabs
                defaultActiveKey={active}
                fill
                onSelect={onSelect}>
                <Tab eventKey="manage" title="Manage">
                    <Manage address={address} signer={signer} provider={provider}/>
                </Tab>
                <Tab eventKey="deploy" title="Deploy">
                    <Deploy address={address} signer={signer}/>
                </Tab>
            </Tabs>
        </div>
    </div>
}