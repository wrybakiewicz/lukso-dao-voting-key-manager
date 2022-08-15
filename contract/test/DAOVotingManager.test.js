const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("DAOVotingManager", function () {

    const deployContract = async () => {
        const DAOVotingManager = await ethers.getContractFactory("DAOVotingManager");
        return await DAOVotingManager.deploy();
    }

    it("should deploy", async function () {
        await deployContract();
    });

});
