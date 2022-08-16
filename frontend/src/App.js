import './App.css';
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import {Route, Routes} from "react-router";
import Manage from "./Manage";

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
        <Route path="*" element={<Manage/>}/>
    </Routes>
}
