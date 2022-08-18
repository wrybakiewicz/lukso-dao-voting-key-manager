module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    log("Deploying LSP7DigitalAssetMock")
    const owners = ["0xdE7bEDD9326D759620c438ae6d587ac41BfB1017", "0xCCEAE00998C8Acf3D805ed025e94dDf3779738Fa",
        "0xA759C71aafC4017B5C1238E85f315a5E8210b634", "0x7c5Be162011Aaf50C8aD2840ed6DAE510440483e"]
    const contract = await deploy("LSP7DigitalAssetMock", {from: deployer, log: true, args: [owners]})
    log("Deployed: " + contract.address)
}