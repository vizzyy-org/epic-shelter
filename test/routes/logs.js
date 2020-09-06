const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const mockMysql = sinon.mock(require('mysql'));
const sandbox = sinon.createSandbox();
const env = require('../../config/environments');

chai.use(chaiHttp);
describe('Logs', () => {

    before(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        mockMysql.expects('createConnection').atLeast(1).returns({
            query: (query, callback) => {
                query.should.be.eq("SELECT *  FROM logs ORDER by ID DESC LIMIT 15 OFFSET 0");
                callback(null, [{ // error = null, result = dummy data array
                            "date":"2020-09-06T01:44:06.000Z",
                            "message":{
                                "type":"Buffer",
                                "data":[68,69,86,32,85,83,69,82,32,111,112,101,110,101,
                                    100,32,118,111,120,32,115,116,114,101,97,109,46]
                            },
                            "id":1077,
                            "service":"epic-shelter"
                }]);
            }
        });
    });

    after(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        mockMysql.restore();
        server.close();
        sandbox.restore();
        env.secrets.environment = "dev";
    })

    describe('query_logs', () => {
        it('should append to log by toggling light', (done) => {
            chai.request(server)
                .get('/logs')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    // console.log(res.text);
                    res.should.have.status(200);
                    done();
                });
        });
    });

});