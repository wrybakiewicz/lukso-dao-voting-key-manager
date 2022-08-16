import {Tab, Tabs} from "react-bootstrap";
import {useNavigate} from "react-router";
import "./TabComponent.css"

export default function TabComponent({active}) {

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
                    AAA
                </Tab>
                <Tab eventKey="deploy" title="Deploy">
                    BBB
                </Tab>
            </Tabs>
        </div>
    </div>
}