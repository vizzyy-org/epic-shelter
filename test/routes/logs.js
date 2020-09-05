const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const mockMysql = sinon.mock(require('mysql'));
const sandbox = sinon.createSandbox();
const env = require('../../config/environments');
const rp = require('request-promise');

chai.use(chaiHttp);
describe('Logs', () => {

    describe('query_logs', () => {
        it('should append to log by toggling light', (done) => {
            chai.request(server)
                .get('/logs')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    console.log(res.text);
                    res.should.have.status(200);
                    done();
                });
        });
    });

});