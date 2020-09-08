const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const rp = require('request-promise');
const sandbox = sinon.createSandbox();

chai.use(chaiHttp);
describe('Home', () => {

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

    describe('GET /', () => {
        it('should render default route', (done) => {
            chai.request(server)
                .get('/')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(200);
                    res.text.should.include("<title>Home</title>");
                    done();
                });
        });
    });

});
