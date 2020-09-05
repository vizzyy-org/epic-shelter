const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const rp = require('request-promise');
const env = require("../../config/environments");
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
    env.secrets.environment = "dev";
});

chai.use(chaiHttp);
describe('Streams', () => {
    describe('GET /streams', () => {
        it('should hit streams endpoint', (done) => {
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

    describe('GET /streams/door', () => {
        it('should hit streams endpoint', (done) => {
            env.secrets.environment = "test";
            sinon.stub(rp, "Request").returns(new MockRequest());
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
