const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const rp = require('request-promise');
const sandbox = sinon.createSandbox();

before(function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
});

after(function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    server.close();
})

afterEach( function () {
    sandbox.restore();
});

chai.use(chaiHttp);
describe('Error Handling', () => {
    describe('GET page that does not exist', () => {
        it('should receive 404', (done) => {
            chai.request(server)
                .get('/randomPage')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(404);
                    res.text.should.include("<title>Error</title>");
                    done();
                });
        });
    });
    describe('GET page with error details as query params', () => {
        it('should display passed values', (done) => {
            chai.request(server)
                .get('/randomPage')
                .query('error=ErrorForDoingSomethingBad')
                .query('error_description=ThisIsTheDescriptionForThatBadThing')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(404);
                    res.text.should.include("<title>Error</title>");
                    res.text.should.include("ErrorForDoingSomethingBad");
                    res.text.should.include("ThisIsTheDescriptionForThatBadThing");
                    done();
                });
        });
    });
});
