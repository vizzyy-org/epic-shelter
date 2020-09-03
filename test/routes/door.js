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
describe('Door', () => {
    describe('GET /door', () => {
        it('it should get main door page', (done) => {
            chai.request(server)
                .get('/door')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(200);
                    res.text.should.include("<title>Door</title>");
                    done();
                });
        });
    });
    describe('GET /door/open', () => {
        it('it should invoke /door/open endpoint', (done) => {
            sandbox.stub(rp, 'Request').resolves({});
            chai.request(server)
                .get('/door/open')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(200);
                    res.req.path.should.eq("/door/open")
                    console.log(res.text);
                    done();
                });
        });
    });
    describe('GET /door/close', () => {
        it('it should invoke /door/close endpoint', (done) => {
            sandbox.stub(rp, 'Request').resolves(status=300);
            chai.request(server)
                .get('/door/close')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(300);
                    res.req.path.should.eq("/door/close")
                    console.log(res.text);
                    done();
                });
        });
    });
    describe('GET /door/status', () => {
        it('it should get /lights/inside page', (done) => {
            sandbox.stub(rp, 'Request').resolves("Closed");
            chai.request(server)
                .get('/door/status')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(200);
                    console.log(res.text);
                    res.text.should.eq("Closed");
                    done();
                });
        });
    });
});
