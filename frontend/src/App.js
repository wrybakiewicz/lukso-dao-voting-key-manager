import './App.css';
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import {Route, Routes} from "react-router";
import TabComponent from "./TabComponent";

export default function App() {

    const [provider, setProvider] = useState()

    const initialize = async () => {
        console.log("Initializing")
        const etherProvider = new ethers.providers.Web3Provider(window.ethereum);

        await etherProvider.send(
            'eth_requestAccounts',
            [],
        );
        setProvider(etherProvider)
    }

    useEffect(() => {
        initialize()
    }, [])

    return <Routes>
        <Route path="*" element={<TabComponent active={"manage"}/>}/>
        <Route path="deploy" element={<TabComponent active={"deploy"}/>}/>
    </Routes>
}
