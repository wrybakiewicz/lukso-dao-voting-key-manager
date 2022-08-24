'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;


describe('get daos', function () {
    it('should return daos ', async () => {
        const result = await app.handler()

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        const response = JSON.parse(result.body);
        expect(response.result.length).to.equal(2);
        expect(response.result[0].address).to.equal('0x526b36563cca2ab71c48cae0aad10609995aecdc');
        expect(response.result[0].name).to.equal('New Cool DAO');
        expect(response.result[0].tokenSymbol).to.equal('MDT');
        expect(response.result[1].address).to.equal('0x426217b6bd5aa395154e3eac996fe72af2d0cf26');
        expect(response.result[1].name).to.equal('Super Cool DAO');
        expect(response.result[1].tokenSymbol).to.equal('LDT');
    });
});
