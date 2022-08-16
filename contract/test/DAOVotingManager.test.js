const {expect} = require("chai");
const {ethers, waffle} = require("hardhat");

describe("DAOVotingManager", function () {

    const deployContract = async (minimumOwnersToExecute, daoName, owners) => {
        const DAOVotingManager = await ethers.getContractFactory("DAOVotingManager")
        return await DAOVotingManager.deploy(minimumOwnersToExecute, daoName, owners)
    }

    it("should deploy", async () => {
        const [owner, address1, address2] = await ethers.getSigners();
        const minimumOwnersToExecute = 3
        const daoName = "fashionDao"
        const owners = [owner.address, address1.address, address2.address]


        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)

        expect(await contract.minimumOwnersToExecute()).to.be.equal(3)
        expect(await contract.daoName()).to.be.equal(daoName)
        expect(await contract.getOwners()).to.deep.equal(owners)
        expect((await contract.getTransactions()).length).to.be.equal(0)
    });

    it("should fail to add owner when executed by not owner", async () => {
        const [owner, address1, address2, address3, address4] = await ethers.getSigners();
        const minimumOwnersToExecute = 3
        const daoName = "fashionDao"
        const owners = [owner.address, address1.address, address2.address]
        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)

        const addOwnerTx = contract.connect(address3).addOwnerPropose(address4.address, 1);

        await expect(addOwnerTx).to.be.revertedWith("Executor must be owner of a dao")
    });

    it("should fail to add owner when newMinimumOwnersToExecute > owners", async () => {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const minimumOwnersToExecute = 3
        const daoName = "fashionDao"
        const owners = [owner.address, address1.address, address2.address]
        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)

        const addOwnerTx = contract.addOwnerPropose(address3.address, 5);

        await expect(addOwnerTx).to.be.revertedWith("New minimum owners to execute must be < owners count")
    });

    it("should fail to add owner when address is an owner", async () => {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const minimumOwnersToExecute = 3
        const daoName = "fashionDao"
        const owners = [owner.address, address1.address, address2.address]
        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)

        const addOwnerTx = contract.addOwnerPropose(address2.address, 4);

        await expect(addOwnerTx).to.be.revertedWith("Address cannot be an owner")
    });

    it("should add owner create proposal", async () => {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const minimumOwnersToExecute = 3
        const daoName = "fashionDao"
        const owners = [owner.address, address1.address, address2.address]
        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)

        await contract.addOwnerPropose(address3.address, 4);

        const transactions = await contract.getTransactions()
        expect(transactions.length).to.be.equal(1)
        expect(transactions[0].id).to.be.equal(0)
        expect(transactions[0].status).to.be.equal(0)
        expect(transactions[0].data.operation).to.be.equal(0)
        expect(transactions[0].data.payload).to.be.equal("0x")
        expect(transactions[0].data.to).to.be.equal("0x0000000000000000000000000000000000000000")
        expect(transactions[0].data.newMinimumOwnersToExecute).to.be.equal(4)
        expect(transactions[0].data.owner).to.be.equal(address3.address)
        expect(transactions[0].addressVotes.length).to.be.equal(3)
        expect(transactions[0].addressVotes[0].vote).to.be.equal(1)
        expect(transactions[0].addressVotes[0].owner).to.be.equal(owner.address)
        expect(transactions[0].addressVotes[1].vote).to.be.equal(0)
        expect(transactions[0].addressVotes[1].owner).to.be.equal(address1.address)
        expect(transactions[0].addressVotes[2].vote).to.be.equal(0)
        expect(transactions[0].addressVotes[2].owner).to.be.equal(address2.address)
    });

    it("should add owner create proposal and execute", async () => {
        const [owner, address1] = await ethers.getSigners();
        const minimumOwnersToExecute = 1
        const daoName = "fashionDao"
        const owners = [owner.address]
        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)

        await contract.addOwnerPropose(address1.address, 2);

        expect(await contract.getOwners()).to.deep.equal([owner.address, address1.address])
        expect(await contract.minimumOwnersToExecute()).to.be.equal(2)

        const transactions = await contract.getTransactions()
        expect(transactions.length).to.be.equal(1)
        expect(transactions[0].id).to.be.equal(0)
        expect(transactions[0].status).to.be.equal(1)
        expect(transactions[0].data.operation).to.be.equal(0)
        expect(transactions[0].data.payload).to.be.equal("0x")
        expect(transactions[0].data.to).to.be.equal("0x0000000000000000000000000000000000000000")
        expect(transactions[0].data.newMinimumOwnersToExecute).to.be.equal(2)
        expect(transactions[0].data.owner).to.be.equal(address1.address)
    });

    it("should transfer create proposal", async () => {
        const [owner, address1] = await ethers.getSigners();
        const minimumOwnersToExecute = 2
        const daoName = "fashionDao"
        const owners = [owner.address, address1.address]

        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)
        const account = await contract.account()
        await owner.sendTransaction({to: account, value: ethers.utils.parseEther("1.0")})
        const receiverInitialBalance = await address1.getBalance()

        await contract.executePropose("0x", address1.address, ethers.utils.parseEther("0.3"))

        const receiverEndBalance = await address1.getBalance()
        expect(receiverEndBalance.sub(receiverInitialBalance)).to.be.equal(0)
        expect(await owner.provider.getBalance(account)).to.be.equal(ethers.utils.parseEther("1.0"))
        const transactions = await contract.getTransactions()
        expect(transactions.length).to.be.equal(1)
        expect(transactions[0].id).to.be.equal(0)
        expect(transactions[0].status).to.be.equal(0)
        expect(transactions[0].data.operation).to.be.equal(2)
        expect(transactions[0].data.payload).to.be.equal("0x")
        expect(transactions[0].data.to).to.be.equal(address1.address)
        expect(transactions[0].data.newMinimumOwnersToExecute).to.be.equal(0)
        expect(transactions[0].data.owner).to.be.equal("0x0000000000000000000000000000000000000000")
    });

    it("should transfer create proposal and execute", async () => {
        const [owner, address1] = await ethers.getSigners();
        const minimumOwnersToExecute = 1
        const daoName = "fashionDao"
        const owners = [owner.address]
        
        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)
        const account = await contract.account()
        await owner.sendTransaction({to: account, value: ethers.utils.parseEther("1.0")})
        const receiverInitialBalance = await address1.getBalance()

        await contract.executePropose("0x", address1.address, ethers.utils.parseEther("0.3"))

        const receiverEndBalance = await address1.getBalance()
        expect(receiverEndBalance.sub(receiverInitialBalance)).to.be.equal(ethers.utils.parseEther("0.3"))
        expect(await owner.provider.getBalance(account)).to.be.equal(ethers.utils.parseEther("0.7"))
        const transactions = await contract.getTransactions()
        expect(transactions.length).to.be.equal(1)
        expect(transactions[0].id).to.be.equal(0)
        expect(transactions[0].status).to.be.equal(1)
        expect(transactions[0].data.operation).to.be.equal(2)
        expect(transactions[0].data.payload).to.be.equal("0x")
        expect(transactions[0].data.to).to.be.equal(address1.address)
        expect(transactions[0].data.newMinimumOwnersToExecute).to.be.equal(0)
        expect(transactions[0].data.owner).to.be.equal("0x0000000000000000000000000000000000000000")
    });

});
