import {Table} from "react-bootstrap";
import "./ManageDaoList.css"
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import DaoVotingManager from "./contract/DaoVotingManager.json";
import {ContractFactory} from "ethers";

export default function ManageDaoList({provider}) {
    const daoListFromBackend = [{
        address: "0x526b36563cca2ab71c48cae0aad10609995aecdc",
        name: "Fashion DAO",
        governanceToken: "LDO",
    }, {
        address: "0x526b36563cca2ab71c48cae0aad10609995aecdc",
        name: "Investment DAO",
        governanceToken: "ABC",
    }]

    const [daoList, setDaoList] = useState()

    const initialize = () => {
        const daoPromiseList = daoListFromBackend.map(dao => {
            const contract = ContractFactory.getContract(dao.address, DaoVotingManager.abi, provider)
            return contract.getProposals().then(proposals => {
                return {
                    proposals: proposals.length,
                    address: dao.address,
                    name: dao.name,
                    governanceToken: dao.governanceToken
                }
            })
        })
        Promise.all(daoPromiseList).then(result => setDaoList(result))
    }

    useEffect(_ => {
        initialize()
    }, [])

    const orChooseFromList = () => <div className={"findDaoFromList"}>
        or choose from list
    </div>

    const link = (dao) => <Link to={"/manage/" + dao.address} className={"linkToExplorer"}>{dao.name}</Link>

    const element = (dao) => {
        return <tr>
            <td>{link(dao)}</td>
            <td>${dao.governanceToken}</td>
            <td>{dao.proposals}</td>
        </tr>
    }

    const elements = () => daoList.map(dao => element(dao))

    const table = () => <Table striped hover responsive variant="dark">
        <thead>
        <tr>
            <th>Name</th>
            <th>Governance Token</th>
            <th>Proposals</th>
        </tr>
        </thead>
        <tbody>
        {elements()}
        </tbody>
    </Table>

    if (!daoList) {
        return null
    }

    return <div>
        {orChooseFromList()}
        <div className={"manageDaoList"}>
            {table()}
        </div>
    </div>
}