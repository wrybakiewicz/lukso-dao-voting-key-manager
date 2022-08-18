const {expect} = require("chai");
const {ethers, waffle} = require("hardhat");

describe("DaoVotingManager", () => {

    const deployContract = async (daoName, minTokensToCreateProposal,
                                  minTokensToExecuteProposal, proposalTimeToVoteInSeconds) => {
        const LSP7DigitalAsset = await ethers.getContractFactory("LSP7DigitalAssetMock")
        const digitalAsset = await LSP7DigitalAsset.deploy()

        const DaoVotingManager = await ethers.getContractFactory("DaoVotingManager")
        const daoVotingManager = await DaoVotingManager.deploy(digitalAsset.address, daoName, minTokensToCreateProposal,
            minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        return {digitalAsset: digitalAsset, daoVotingManager: daoVotingManager}
    }

    it("should deploy", async () => {
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("10.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("10.0")
        const proposalTimeToVoteInSeconds = 30

        const {digitalAsset, daoVotingManager} = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)

        expect(await daoVotingManager.daoName()).to.be.equal(daoName)
        expect(await daoVotingManager.minTokensToCreateProposal()).to.be.equal(minTokensToCreateProposal)
        expect(await daoVotingManager.minTokensToExecuteProposal()).to.be.equal(minTokensToExecuteProposal)
        expect(await daoVotingManager.proposalTimeToVoteInSeconds()).to.be.equal(proposalTimeToVoteInSeconds)
        expect(await daoVotingManager.account()).to.not.empty
        expect(await daoVotingManager.daoGovernanceToken()).to.be.equal(digitalAsset.address)
    });

    it("should not deploy when minTokensToCreateProposal > totalSupply", async () => {
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("11.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30

        const deployTx = deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)

        await expect(deployTx).to.be.revertedWith("Min tokens to create proposal must be <= total supply")
    });

    it("should not deploy when minTokensToExecuteProposal > totalSupply", async () => {
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("5.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("11.0")
        const proposalTimeToVoteInSeconds = 30

        const deployTx = deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)

        await expect(deployTx).to.be.revertedWith("Min tokens to create proposal must be <= total supply")
    });

    it("should deposit when authorized", async () => {
        const [owner] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30

        const {digitalAsset, daoVotingManager} = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)

        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))

        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("7.0"))
        expect(await digitalAsset.balanceOf(daoVotingManager.address)).to.be.equal(ethers.utils.parseEther("3.0"))
    });

})