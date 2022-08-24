import {Tab, Tabs} from "react-bootstrap";
import {useNavigate} from "react-router";
import "./TabComponent.css"
import Deploy from "./Deploy";

export default function TabComponent({active, provider, signer, manageComponent}) {

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
            DAO Voting Manager
        </div>
        <div className={"tabComponent"}>
            <Tabs
                activeKey={active}
                fill
                onSelect={onSelect}>
                <Tab eventKey="manage" title="Manage">
                    {manageComponent()}
                </Tab>
                <Tab eventKey="deploy" title="Deploy">
                    <Deploy provider={provider} signer={signer}/>
                </Tab>
            </Tabs>
        </div>
    </div>
}