const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const mockMysql = sinon.mock(require('mysql'));
const sandbox = sinon.createSandbox();
const env = require('../../config/environments');
const rp = require('request-promise');

before(function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    mockMysql.expects('createConnection').thrice().returns({
        connect: () => {
            console.log('Successfully connected');
        },
        query: (query, entry, callback) => {
            query.should.be.eq("INSERT INTO logs SET ?");
            callback("error", "results", {});
        },
        end: () => {
            console.log('Connection ended');
        }
    });
});

after(function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    mockMysql.restore();
    server.close();
})

afterEach( function () {
    sandbox.restore();
    env.secrets.environment = "dev";
});

chai.use(chaiHttp);
describe('Logging Helper', () => {

    describe('append_to_log', () => {
        it('should append to log by toggling light', (done) => {
            env.secrets.environment = "test"; // need to enable test to log to db
            sandbox.stub(rp, 'Request').resolves({});
            chai.request(server)
                .get('/lights/bedroom/xmas')
                .query("status=false")
                .end((err, res) => {
                    if(err) { console.log(err); }
                    console.log(res.text);
                    res.should.have.status(200);
                    done();
                });
        });
    });
});
