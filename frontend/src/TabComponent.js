import {Tab, Tabs} from "react-bootstrap";
import {useNavigate} from "react-router";

export default function TabComponent({active}) {

    const navigate = useNavigate();

    return <Tabs
        defaultActiveKey={active}
        className="mb-3"
        fill
        onSelect={(e, b) => {
            if(e === "manage") {
                navigate("/")
            } else {
                navigate("/deploy")
            }
        }}>
        <Tab eventKey="manage" title="Manage">
            AAA
        </Tab>
        <Tab eventKey="deploy" title="Deploy">
            BBB
        </Tab>
    </Tabs>
}