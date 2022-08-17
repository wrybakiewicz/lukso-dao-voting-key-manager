import {useParams} from "react-router";
import {ethers} from "ethers";
import contract from "./contract/DAOVotingManager.json";
import {useEffect, useState} from "react";

export default function ManageDetails({myAddress, signer, provider}) {

    const [isValidContract, setIsValidContract] = useState()

    let {address} = useParams();

    useEffect(_ => {
        if(myAddress && signer && provider) {
            updateIsValidContract()
        }
    }, [myAddress, signer, provider])

    const updateIsValidContract = async () => {
        if (ethers.utils.isAddress(address)) {
            const contractCode = await provider.getCode(address)
            setIsValidContract(contractCode === contract.deployedBytecode)
        } else {
            setIsValidContract(false)
        }
    }

    if (!address || !signer || !provider) {
        return <div className={"connectWallet"}>Connect your wallet</div>
    }

    if(isValidContract === false) {
        return <div className={"connectWallet"}>Provided address is not a DAO Key Manager</div>
    }

    if(isValidContract) {
        return <div>Details</div>
    }

    return null
}