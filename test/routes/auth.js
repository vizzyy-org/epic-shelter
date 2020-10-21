const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const sinon = require('sinon');
const mockPassport = sinon.mock(require('passport'));
const passport = require('passport');
const sandbox = sinon.createSandbox();
const env = require('../../config/environments');
const mockMysql = sinon.mock(require('mysql'));

chai.use(chaiHttp);
describe('Auth', () => {

    let user = {
        "displayName":"Barnabas Vizy",
        "id":"google-oauth2|1234567",
        "user_id":"google-oauth2|1234567",
        "provider":"google-oauth2",
        "name":{"familyName":"Vizy","givenName":"Barnabas"},
        "emails":[{"value":"email@gmail.com"}],
        "picture":"https://lh5.googleusercontent.com/-QuFU_gp5Xqs/AAAAAAAAAAI/AAAAAAAAQS4/" +
            "AMZuuclOuP4rp6QdUSQbTSo6zePsUahiLg/photo.jpg",
        "locale":"en",
        "nickname":"barnabas.vizy",
    }

    before(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        env.secrets.environment = "test";
        mockMysql.expects('createConnection').atLeast(1).returns({
            query: (query, entry, callback) => {
                callback(null, "results", {});
            }
        });
        sandbox.stub(passport,"authenticate").callsFake((strategy, callback) => {
            callback(null, user, null);
            return (req,res,next)=>{
                console.log(req.user)
                // req.abort();
            };
        });
    });

    after(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        mockMysql.restore();
        server.close();
        sandbox.restore();
        env.secrets.environment = "dev";
    })

    describe('GET /login', () => {
        it('should invoke login endpoint', (done) => {
            chai.request(server)
                .get('/login')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    // console.log(res.text);
                    res.should.have.status(400);
                    done();
                });
        });
    });

    describe('GET /callback', () => {
        it('should invoke login endpoint', (done) => {
            chai.request(server)
                .get('/callback')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    console.log(res.text);
                    // res.should.have.status(200);
                    done();
                });
        });
    });

});