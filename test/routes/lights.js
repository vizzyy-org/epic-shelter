let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();

before(function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
});

chai.use(chaiHttp);
describe('Lights', () => {
    describe('GET /lights', () => {
        it('it should get main lights page', (done) => {
            chai.request(server)
                .get('/lights')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(200);
                    res.text.should.include("<title>Lights</title>");
                    done();
                });
        });
    });
    describe('GET /lights/inside', () => {
        it('it should get /lights/inside page', (done) => {
            chai.request(server)
                .get('/lights/inside')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(200);
                    res.text.should.include("<h2>Inside Light Strip</h2>");
                    done();
                });
        });
    });
    describe('GET /lights/outside', () => {
        it('it should get /lights/outside page', (done) => {
            chai.request(server)
                .get('/lights/outside')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.should.have.status(200);
                    res.text.should.include("<h2>Outside Light Strip</h2>");
                    done();
                });
        });
    });
    describe('GET /bedroom/xmas LIGHT OFF', () => {
        it('it should toggle /lights/bedroom/xmas OFF', (done) => {
            chai.request(server)
                .get('/lights/bedroom/xmas')
                .query("status=false")
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.req.path.should.eq("/lights/bedroom/xmas?status=false")
                    res.should.have.status(200);
                    done();
                });
        });
    });
    describe('GET /bedroom/xmas LIGHT ON', () => {
        it('it should toggle /lights/bedroom/xmas ON', (done) => {
            chai.request(server)
                .get('/lights/bedroom/xmas')
                .query("status=true")
                .end((err, res) => {
                    if(err) { console.log(err); }
                    res.req.path.should.eq("/lights/bedroom/xmas?status=true")
                    res.should.have.status(200);
                    done();
                });
        });
    });
});

after(function () {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    server.close();
});