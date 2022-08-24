const {expect} = require("chai");
const {ethers} = require("hardhat");
const {time} = require("@nomicfoundation/hardhat-network-helpers");

describe("DaoVotingManager", () => {

    const deployContract = async (daoName, minTokensToCreateProposal,
                                  minTokensToExecuteProposal, proposalTimeToVoteInSeconds) => {
        const LSP7DigitalAsset = await ethers.getContractFactory("LSP7DigitalAssetMock")
        const digitalAsset = await LSP7DigitalAsset.deploy([])

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

        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)

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

        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)

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
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
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
        expect(proposals[0].status).to.be.equal(0)
        expect(await daoVotingManager.addressToLastVotedProposalId(owner.address)).to.be.equal(1)
        expect(await daoVotingManager.proposalDepositorsBalances(owner.address)).to.be.equal(minTokensToCreateProposal)
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("2.0"))
    });

    it("should not create proposal because of too low token deposit", async () => {
        const [, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
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
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
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
        expect(proposals[0].status).to.be.equal(0)

        expect(proposals[1].id).to.be.equal(2)
        expect(proposals[1].createdBy).to.be.equal(owner.address)
        expect(proposals[1].createdAt).to.be.equal(latestTime2)
        expect(proposals[1].operation).to.be.equal(operation)
        expect(proposals[1].to).to.be.equal(to2)
        expect(proposals[1].value).to.be.equal(value2)
        expect(proposals[1].payload).to.be.equal(payload)
        expect(proposals[1].yesVotes).to.be.equal(0)
        expect(proposals[1].noVotes).to.be.equal(0)
        expect(proposals[1].status).to.be.equal(0)

        expect(await daoVotingManager.addressToLastVotedProposalId(owner.address)).to.be.equal(2)
        expect(await daoVotingManager.proposalDepositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("2.0"))
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("1.0"))
    });

    it("should not vote because of 0 tokens deposit", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        const operation = 0
        const to = address1.address
        const value = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to, value, payload)

        const voteResult = daoVotingManager.connect(address1).vote(1, true)

        await expect(voteResult).to.be.revertedWith("Address must have some deposit")
    });

    it("should not vote when address already voted", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        const operation = 0
        const to = address1.address
        const value = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to, value, payload)

        await daoVotingManager.vote(1, true)
        const voteResult = daoVotingManager.vote(1, true)

        await expect(voteResult).to.be.revertedWith("Address already voted")
    });

    it("should not vote when too late", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        const operation = 0
        const to = address1.address
        const value = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to, value, payload)

        await time.increase(31);

        const voteResult = daoVotingManager.vote(1, true)

        await expect(voteResult).to.be.revertedWith("Too late to vote")
    });

    it("should vote", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        const operation = 0
        const to = address1.address
        const value = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to, value, payload)
        const latestTime = await time.latest()

        await daoVotingManager.vote(1, true)

        const vote = await daoVotingManager.addressToProposalIdToVote(owner.address, 1)
        expect(vote).to.be.equal(1)

        expect(await daoVotingManager.addressToLastVotedProposalId(owner.address)).to.be.equal(1)


        const proposals = await daoVotingManager.getProposals()
        expect(proposals.length).to.be.equal(1)
        expect(proposals[0].id).to.be.equal(1)
        expect(proposals[0].createdBy).to.be.equal(owner.address)
        expect(proposals[0].createdAt).to.be.equal(latestTime)
        expect(proposals[0].operation).to.be.equal(operation)
        expect(proposals[0].to).to.be.equal(to)
        expect(proposals[0].value).to.be.equal(value)
        expect(proposals[0].payload).to.be.equal(payload)
        expect(proposals[0].yesVotes).to.be.equal(ethers.utils.parseEther("2.0"))
        expect(proposals[0].noVotes).to.be.equal(0)
        expect(proposals[0].status).to.be.equal(0)

        expect(await daoVotingManager.proposalDepositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("1.0"))
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("2.0"))
    });

    it("should create proposal and fail to execute", async () => {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("4.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.transfer(owner.address, address1.address, ethers.utils.parseEther("5.0"), true, "0x")
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("5.0"))

        const operation = 0
        const to1 = address2.address
        const value1 = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to1, value1, payload)
        const latestTime1 = await time.latest()

        await daoVotingManager.vote(1, true)
        await time.increase(31);
        await daoVotingManager.finalize(1)

        expect(await daoVotingManager.addressToProposalIdToVote(owner.address, 1)).to.be.equal(1)
        expect(await daoVotingManager.addressToLastVotedProposalId(owner.address)).to.be.equal(1)

        const proposals = await daoVotingManager.getProposals()
        expect(proposals.length).to.be.equal(1)

        expect(proposals[0].id).to.be.equal(1)
        expect(proposals[0].createdBy).to.be.equal(owner.address)
        expect(proposals[0].createdAt).to.be.equal(latestTime1)
        expect(proposals[0].operation).to.be.equal(operation)
        expect(proposals[0].to).to.be.equal(to1)
        expect(proposals[0].value).to.be.equal(value1)
        expect(proposals[0].payload).to.be.equal(payload)
        expect(proposals[0].yesVotes).to.be.equal(ethers.utils.parseEther("4.0"))
        expect(proposals[0].noVotes).to.be.equal(0)
        expect(proposals[0].status).to.be.equal(2)

        expect(await daoVotingManager.proposalDepositorsBalances(owner.address)).to.be.equal(0)
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("5.0"))
    });

    it("should create 2 proposals and vote for both from 2 accounts then execute", async () => {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("3.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.transfer(owner.address, address1.address, ethers.utils.parseEther("5.0"), true, "0x")
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        await digitalAsset.connect(address1).authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.connect(address1).deposit(ethers.utils.parseEther("2.0"))
        await owner.sendTransaction({to: await daoVotingManager.account(), value: ethers.utils.parseEther("2.0")})
        const address3StartBalance = await address3.getBalance()

        const operation = 0
        const to1 = address2.address
        const value1 = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to1, value1, payload)
        const latestTime1 = await time.latest()

        const to2 = address3.address
        const value2 = ethers.utils.parseEther("2.0")
        await daoVotingManager.connect(address1).createProposal(operation, to2, value2, payload)
        const latestTime2 = await time.latest()

        await daoVotingManager.vote(1, true)
        await daoVotingManager.connect(address1).vote(1, false)
        await daoVotingManager.vote(2, true)
        await daoVotingManager.connect(address1).vote(2, true)

        await time.increase(31);

        await daoVotingManager.finalize(1)
        await daoVotingManager.finalize(2)

        expect(await daoVotingManager.addressToProposalIdToVote(owner.address, 1)).to.be.equal(1)
        expect(await daoVotingManager.addressToProposalIdToVote(address1.address, 1)).to.be.equal(2)
        expect(await daoVotingManager.addressToProposalIdToVote(owner.address, 2)).to.be.equal(1)
        expect(await daoVotingManager.addressToProposalIdToVote(address1.address, 2)).to.be.equal(1)

        expect(await daoVotingManager.addressToLastVotedProposalId(owner.address)).to.be.equal(2)
        expect(await daoVotingManager.connect(address1).addressToLastVotedProposalId(owner.address)).to.be.equal(2)

        const proposals = await daoVotingManager.getProposals()
        expect(proposals.length).to.be.equal(2)

        expect(proposals[0].id).to.be.equal(1)
        expect(proposals[0].createdBy).to.be.equal(owner.address)
        expect(proposals[0].createdAt).to.be.equal(latestTime1)
        expect(proposals[0].operation).to.be.equal(operation)
        expect(proposals[0].to).to.be.equal(to1)
        expect(proposals[0].value).to.be.equal(value1)
        expect(proposals[0].payload).to.be.equal(payload)
        expect(proposals[0].yesVotes).to.be.equal(ethers.utils.parseEther("2.0"))
        expect(proposals[0].noVotes).to.be.equal(ethers.utils.parseEther("1.0"))
        expect(proposals[0].status).to.be.equal(3)

        expect(proposals[1].id).to.be.equal(2)
        expect(proposals[1].createdBy).to.be.equal(address1.address)
        expect(proposals[1].createdAt).to.be.equal(latestTime2)
        expect(proposals[1].operation).to.be.equal(operation)
        expect(proposals[1].to).to.be.equal(to2)
        expect(proposals[1].value).to.be.equal(value2)
        expect(proposals[1].payload).to.be.equal(payload)
        expect(proposals[1].yesVotes).to.be.equal(ethers.utils.parseEther("3.0"))
        expect(proposals[1].noVotes).to.be.equal(0)
        expect(proposals[1].status).to.be.equal(1)

        expect((await address3.getBalance()).sub(address3StartBalance)).to.be.equal(value2)
        expect(await daoVotingManager.proposalDepositorsBalances(owner.address)).to.be.equal(0)
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("3.0"))
        expect(await daoVotingManager.proposalDepositorsBalances(address1.address)).to.be.equal(0)
        expect(await daoVotingManager.depositorsBalances(address1.address)).to.be.equal(ethers.utils.parseEther("2.0"))
    });

    it("should create proposal of transfer native token and execute", async () => {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("3.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("4.0"))
        const daoVotingManagerAccount = await daoVotingManager.account()
        expect(await digitalAsset.balanceOf(daoVotingManagerAccount)).to.be.equal(0)
        await digitalAsset.transfer(owner.address, daoVotingManagerAccount, ethers.utils.parseEther("1.0"), true, "0x")
        expect(await digitalAsset.balanceOf(daoVotingManagerAccount)).to.be.equal(ethers.utils.parseEther("1.0"))
        expect(await digitalAsset.balanceOf(address1.address)).to.be.equal(0)

        const operation = 0
        const to1 = digitalAsset.address
        const value1 = 0
        const payload = digitalAsset.interface.encodeFunctionData(
            'transfer(address,address,uint256,bool,bytes)',
            [daoVotingManagerAccount, address1.address, ethers.utils.parseEther("1.0"), true, "0x"],
        );
        await daoVotingManager.createProposal(operation, to1, value1, payload)
        const latestTime1 = await time.latest()

        await daoVotingManager.vote(1, true)

        await time.increase(31);

        await daoVotingManager.finalize(1)

        expect(await digitalAsset.balanceOf(daoVotingManagerAccount)).to.be.equal(0)
        expect(await digitalAsset.balanceOf(address1.address)).to.be.equal(ethers.utils.parseEther("1.0"))

        expect(await daoVotingManager.addressToProposalIdToVote(owner.address, 1)).to.be.equal(1)
        expect(await daoVotingManager.addressToLastVotedProposalId(owner.address)).to.be.equal(1)

        const proposals = await daoVotingManager.getProposals()
        expect(proposals.length).to.be.equal(1)

        expect(proposals[0].id).to.be.equal(1)
        expect(proposals[0].createdBy).to.be.equal(owner.address)
        expect(proposals[0].createdAt).to.be.equal(latestTime1)
        expect(proposals[0].operation).to.be.equal(operation)
        expect(proposals[0].to).to.be.equal(to1)
        expect(proposals[0].value).to.be.equal(value1)
        expect(proposals[0].payload).to.be.equal(payload)
        expect(proposals[0].yesVotes).to.be.equal(ethers.utils.parseEther("3.0"))
        expect(proposals[0].noVotes).to.be.equal(0)
        expect(proposals[0].status).to.be.equal(1)
    });

    it("should fail to withdraw - too early", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("5.0"))
        await daoVotingManager.createProposal(0, address1.address, ethers.utils.parseEther("1.0"), "0x")
        await daoVotingManager.vote(1, true)

        const withdrawTx = daoVotingManager.withdraw(ethers.utils.parseEther("5.0"))
        await expect(withdrawTx).to.be.revertedWith("Cannot withdraw before: last voted proposal created at time + proposalTimeToVoteInSeconds")
    });

    it("should withdraw just after deposit", async () => {
        const [owner] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("5.0"))

        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("5.0"))

        await daoVotingManager.withdraw(ethers.utils.parseEther("5.0"))

        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("10.0"))
    });

    it("should execute proposal and withdraw", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("6.0"))
        const operation = 0
        const to = address1.address
        const value = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to, value, payload)
        await owner.sendTransaction({to: await daoVotingManager.account(), value: ethers.utils.parseEther("1.0")})
        await daoVotingManager.vote(1, true)
        await time.increase(31);
        await daoVotingManager.finalize(1)

        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("4.0"))

        await time.increase(31);
        await daoVotingManager.withdraw(ethers.utils.parseEther("6.0"))

        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("10.0"))
    });

    it("should fail to execute proposal two times", async () => {
        const [owner, address1, address2] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.transfer(owner.address, address1.address, ethers.utils.parseEther("5.0"), true, "0x")
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("3.0"))
        await digitalAsset.connect(address1).authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.connect(address1).deposit(ethers.utils.parseEther("2.0"))
        await owner.sendTransaction({to: await daoVotingManager.account(), value: ethers.utils.parseEther("2.0")})

        const operation = 0
        const to1 = address2.address
        const value1 = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to1, value1, payload)
        const latestTime1 = await time.latest()

        await daoVotingManager.vote(1, true)
        await daoVotingManager.connect(address1).vote(1, true)

        await time.increase(31);

        await daoVotingManager.finalize(1)

        expect(await daoVotingManager.addressToProposalIdToVote(owner.address, 1)).to.be.equal(1)
        expect(await daoVotingManager.addressToProposalIdToVote(address1.address, 1)).to.be.equal(1)


        const proposals = await daoVotingManager.getProposals()
        expect(proposals.length).to.be.equal(1)

        expect(proposals[0].id).to.be.equal(1)
        expect(proposals[0].createdBy).to.be.equal(owner.address)
        expect(proposals[0].createdAt).to.be.equal(latestTime1)
        expect(proposals[0].operation).to.be.equal(operation)
        expect(proposals[0].to).to.be.equal(to1)
        expect(proposals[0].value).to.be.equal(value1)
        expect(proposals[0].payload).to.be.equal(payload)
        expect(proposals[0].yesVotes).to.be.equal(ethers.utils.parseEther("4.0"))
        expect(proposals[0].noVotes).to.be.equal(0)
        expect(proposals[0].status).to.be.equal(3)

        await expect(daoVotingManager.finalize(1)).to.be.revertedWith("Proposal status must be PENDING")
        expect(await daoVotingManager.proposalDepositorsBalances(owner.address)).to.be.equal(0)
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("3.0"))
    });

    it("should deposit and withdraw in 2 tranches", async () => {
        const [owner] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))

        await daoVotingManager.deposit(ethers.utils.parseEther("6.0"))
        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("4.0"))
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("6.0"))

        await daoVotingManager.withdraw(ethers.utils.parseEther("2.0"))
        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("6.0"))
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(ethers.utils.parseEther("4.0"))

        await daoVotingManager.withdraw(ethers.utils.parseEther("4.0"))
        expect(await digitalAsset.balanceOf(owner.address)).to.be.equal(ethers.utils.parseEther("10.0"))
        expect(await daoVotingManager.depositorsBalances(owner.address)).to.be.equal(0)
    });

    it("should deposit and fail withdraw more than deposited", async () => {
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))

        await daoVotingManager.deposit(ethers.utils.parseEther("6.0"))

        const withdrawTx = daoVotingManager.withdraw(ethers.utils.parseEther("6.1"))
        await expect(withdrawTx).to.be.revertedWith("Amount must be <= deposit")
    });

    it("should return getPossibleWithdrawTime when no proposals", async () => {
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)

        expect(await daoVotingManager.getPossibleWithdrawTime()).to.be.equal(proposalTimeToVoteInSeconds)
    });

    it("should return getPossibleWithdrawTime when proposal created", async () => {
        const [owner, address1] = await ethers.getSigners();
        const daoName = "fashionDao"
        const minTokensToCreateProposal = ethers.utils.parseEther("1.0")
        const minTokensToExecuteProposal = ethers.utils.parseEther("5.0")
        const proposalTimeToVoteInSeconds = 30
        const {
            digitalAsset,
            daoVotingManager
        } = await deployContract(daoName, minTokensToCreateProposal, minTokensToExecuteProposal, proposalTimeToVoteInSeconds)
        await digitalAsset.authorizeOperator(daoVotingManager.address, ethers.utils.parseEther("100.0"))
        await daoVotingManager.deposit(ethers.utils.parseEther("6.0"))
        const operation = 0
        const to = address1.address
        const value = ethers.utils.parseEther("1.0")
        const payload = "0x"
        await daoVotingManager.createProposal(operation, to, value, payload)
        const latestTime = await time.latest()

        expect(await daoVotingManager.getPossibleWithdrawTime()).to.be.equal(latestTime + proposalTimeToVoteInSeconds)
    });

})