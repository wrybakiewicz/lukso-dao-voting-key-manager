const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("DAOVotingManager", function () {

    const deployContract = async (minimumOwnersToExecute, daoName, owners) => {
        const DAOVotingManager = await ethers.getContractFactory("DAOVotingManager")
        return await DAOVotingManager.deploy(minimumOwnersToExecute, daoName, owners)
    }

    it("should deploy", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const minimumOwnersToExecute = 3
        const daoName = "fashionDao"
        const owners = [owner.address, address1.address, address2.address]


        const contract = await deployContract(minimumOwnersToExecute, daoName, owners)

        expect(await contract.minimumOwnersToExecute()).to.be.equal(3)
        expect(await contract.daoName()).to.be.equal(daoName)
        expect(await contract.getOwners()).to.deep.equal(owners)
    });

});
