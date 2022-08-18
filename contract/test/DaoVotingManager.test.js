const {expect} = require("chai");
const {ethers, waffle} = require("hardhat");
const {time} = require("@nomicfoundation/hardhat-network-helpers");

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
        expect(await daoVotingManager.tokensToCreateProposal()).to.be.equal(minTokensToCreateProposal)
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

        await expect(deployTx).to.be.revertedWith("Tokens to create proposal must be <= total supply")
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
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("3.0"))
    });

    it("should create proposal", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {digitalAsset, daoVotingManager} = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        const operation = 0
        const to = address1.address
        const value = ethers.utils.parseEther("1.0")
        const payload = "0x"

        await daoVotingManager.createProposal(operation, to, value, payload)
        const latestTime = await time.latest()

        const proposals = await daoVotingManager.getProposals()
        expect(proposals.length).to.be.equal(1)
        expect(proposals[0].id).to.be.equal(1)
        expect(proposals[0].createdBy).to.be.equal(owner.address)
        expect(proposals[0].createdAt).to.be.equal(latestTime)
        expect(proposals[0].operation).to.be.equal(operation)
        expect(proposals[0].to).to.be.equal(to)
        expect(proposals[0].value).to.be.equal(value)
        expect(proposals[0].payload).to.be.equal(payload)
        expect(proposals[0].yesVotes).to.be.equal(0)
        expect(proposals[0].noVotes).to.be.equal(0)
    });

    it("should not create proposal because of too low token deposit", async () => {
        const [, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {digitalAsset, daoVotingManager} = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("0.9"))

        const createProposalTx = daoVotingManager.createProposal(0, address1.address, ethers.utils.parseEther("1.0"), "0x")

        await expect(createProposalTx).to.be.revertedWith("Not enough deposited tokens")
    });

    it("should create two proposals", async () => {
        const [owner, address1, address2] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {digitalAsset, daoVotingManager} = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        const operation = 0
        const to1 = address1.address
        const to2 = address2.address
        const value1 = ethers.utils.parseEther("1.0")
        const value2 = ethers.utils.parseEther("2.0")
        const payload = "0x"

        await daoVotingManager.createProposal(operation, to1, value1, payload)
        const latestTime1 = await time.latest()
        await daoVotingManager.createProposal(operation, to2, value2, payload)
        const latestTime2 = await time.latest()

        const proposals = await daoVotingManager.getProposals()
        expect(proposals.length).to.be.equal(2)

        expect(proposals[0].id).to.be.equal(1)
        expect(proposals[0].createdBy).to.be.equal(owner.address)
        expect(proposals[0].createdAt).to.be.equal(latestTime1)
        expect(proposals[0].operation).to.be.equal(operation)
        expect(proposals[0].to).to.be.equal(to1)
        expect(proposals[0].value).to.be.equal(value1)
        expect(proposals[0].payload).to.be.equal(payload)
        expect(proposals[0].yesVotes).to.be.equal(0)
        expect(proposals[0].noVotes).to.be.equal(0)

        expect(proposals[1].id).to.be.equal(2)
        expect(proposals[1].createdBy).to.be.equal(owner.address)
        expect(proposals[1].createdAt).to.be.equal(latestTime2)
        expect(proposals[1].operation).to.be.equal(operation)
        expect(proposals[1].to).to.be.equal(to2)
        expect(proposals[1].value).to.be.equal(value2)
        expect(proposals[1].payload).to.be.equal(payload)
        expect(proposals[1].yesVotes).to.be.equal(0)
        expect(proposals[1].noVotes).to.be.equal(0)
    });

})