import {useEffect, useState} from "react";
import {ethers} from "ethers";
import {Route, Routes} from "react-router";
import TabComponent from "./TabComponent";
import './App.css'

export default function App() {

    const [address, setAddress] = useState()
    const [signer, setSigner] = useState()

    const initialize = async () => {
        console.log("Initializing")
        const etherProvider = new ethers.providers.Web3Provider(window.ethereum);

        const accounts = await etherProvider.send(
            'eth_requestAccounts',
            [],
        );
        setSigner(await etherProvider.getSigner())
        setAddress(accounts[0])
    }

    useEffect(() => {
        initialize()
    }, [])

    return <Routes>
        <Route path="*" element={<TabComponent active={"manage"} address={address} signer={signer}/>}/>
        <Route path="deploy" element={<TabComponent active={"deploy"} address={address} signer={signer}/>}/>
    </Routes>
}
