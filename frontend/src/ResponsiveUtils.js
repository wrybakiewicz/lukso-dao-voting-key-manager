const displayShortAddress = address => displayAddress(address, false)

const displayAddress = (address, showFull) => {
    if(!address) {
        return
    }
    if (showFull) {
        return address
    }
    const beginning = address.substring(0, 4);
    const end = address.slice(-4)
    return beginning + '...' + end
}

export {displayAddress, displayShortAddress}