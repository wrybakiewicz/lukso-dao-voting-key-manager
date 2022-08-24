'use strict';

const app = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

describe('add dao by tx hash', function () {
    it('should add dao by tx hash', async () => {
        const event = {
            "body": '{"txHash": "0x549260c6e61d165bf1ebcfe9c06fd63e1a6663e251d2b12a9343f5f0991a9800"}'
        }
        let context;

        const result = await app.handler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(201);
    });

    it('should not add dao when one already exists', async () => {
        const event = {
            "body": '{"txHash": "0x549260c6e61d165bf1ebcfe9c06fd63e1a6663e251d2b12a9343f5f0991a9800"}'
        }
        let context;

        const result = await app.handler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(400);
    });

    it('should fail when hash is wrong', async () => {
        const event = {
            "body": '{"txHash": "123"}'
        }
        let context;

        const resultPromise = app.handler(event, context)

        return expect(resultPromise).to.be.rejected;
    });
});
