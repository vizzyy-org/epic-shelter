const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const rp = require('request-promise');
const request = require("request");
const env = require("../../config/environments");
const sandbox = sinon.createSandbox();
const mockMysql = sinon.mock(require('mysql'));

chai.use(chaiHttp);
describe('Streams', () => {

    before(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        mockMysql.expects('createConnection').atLeast(1).returns({
            query: (query, entry, callback) => {
                callback("Query Callback", "results", {});
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

    describe('GET /streams', () => {
        it('should hit streams endpoint', (done) => {
            env.secrets.environment = "test";
            sandbox.stub(rp, 'Request').resolves({});
            chai.request(server)
                .get('/streams')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    // console.log(res.text);
                    res.req.path.should.eq("/streams")
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('GET /streams/door', () => {

        class MockRequest {
            pipe(res) {
                res.end();
            }
            on(){
                return this;
            }
            abort(){
                return this;
            }
        }

        it('should hit streams endpoint', (done) => {
            env.secrets.environment = "test";
            sandbox.stub(request, "Request").returns(new MockRequest());
            chai.request(server)
                .get('/streams/door')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    // console.log(res.text);
                    res.req.path.should.eq("/streams/door")
                    res.should.have.status(200);
                    done();
                });
        });
    });

});
