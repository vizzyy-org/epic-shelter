const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const env = require('../../config/environments');
const sinon = require('sinon');
const mockMysql = sinon.mock(require('mysql'));

chai.use(chaiHttp);
describe('Error Handling', () => {

    before(function () {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        env.secrets.environment = "dev";
        mockMysql.expects('createConnection').atLeast(1).returns({
            query: (query, entry, callback) => {
                callback(null, "results", "fields");
            }
        });
    });

    after(function () {
        env.secrets.environment = "dev";
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        mockMysql.restore();
        server.close();
    })

    describe('GET page that does not exist', () => {
        it('should receive 404', (done) => {
            chai.request(server)
                .get('/randomPage')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    console.log(res.text);
                    res.should.have.status(404);
                    res.text.should.include("<title>Error</title>");
                    done();
                });
        });
    });
    describe('GET page with error details as query params', () => {
        it('should display passed values', (done) => {
            chai.request(server)
                .get('/randomPage')
                .query('error=ErrorForDoingSomethingBad')
                .query('error_description=ThisIsTheDescriptionForThatBadThing')
                .end((err, res) => {
                    if(err) { console.log(err); }
                    console.log(res.text);
                    res.should.have.status(404);
                    res.text.should.include("<title>Error</title>");
                    res.text.should.include("ErrorForDoingSomethingBad");
                    res.text.should.include("ThisIsTheDescriptionForThatBadThing");
                    done();
                });
        });
    });
});
