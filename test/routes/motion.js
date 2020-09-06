const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();

chai.use(chaiHttp);
describe('Motion', () => {

    before(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    });

    after(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        server.close();
    })

    describe('GET /motion', () => {
        it('should render motion page', (done) => {
            chai.request(server)
                .get('/motion')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.text.should.include("<title>Motion</title>");
                    res.req.path.should.eq("/motion")
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('GET /motion/next', () => {
        it('should render motion page after seeking forward', (done) => {
            chai.request(server)
                .get('/motion/next')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.req.path.should.eq("/motion/next")
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('GET /motion/prev', () => {
        it('should render motion page after seeking backwards', (done) => {
            chai.request(server)
                .get('/motion/prev')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.req.path.should.eq("/motion/prev")
                    res.should.have.status(200);
                    done();
                });
        });
    });

});