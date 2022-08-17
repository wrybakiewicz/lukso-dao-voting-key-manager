import {Tab, Tabs} from "react-bootstrap";
import {useNavigate} from "react-router";
import "./TabComponent.css"
import Deploy from "./Deploy";

export default function TabComponent({active, address, signer, manageComponent}) {

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
                    {manageComponent()}
                </Tab>
                <Tab eventKey="deploy" title="Deploy">
                    <Deploy address={address} signer={signer}/>
                </Tab>
            </Tabs>
        </div>
    </div>
}