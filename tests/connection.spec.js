const Connection = require('../lib/connection')

describe('connection', () => {
  describe('find', () => {
    let connection

    beforeEach(() => {
      connection = new Connection({
        serverUrl: 'https://nowhere.com'
      })
    })

    it('returns an object with on property', () => {
      const result = connection.find('Nothing', 'Property')
      result.should.have.property('on').that.is.a('function')
    })

    it('emits error event when there is an error', (done) => {
      const result = connection.find('Nothing', 'Property')
      // need a data handler to start the stream flowing
      result.on('data', () => {
        done('there should be no data')
      })
      result.on('error', () => done())
    })

    it('emits error event when makeRequest returns invalid data', (done) => {
      connection.makeRequest = () => Promise.resolve({
        parameters: {},
        returnObj: { someotherproperty: [] }
      })
      const result = connection.find('Nothing', 'Property')
      result.on('data', () => {
        done('there should be no data')
      })
      result.on('error', () => done())
    })

    it('emits end event if there is no data', (done) => {
      connection.makeRequest = () => Promise.resolve({
        parameters: {},
        returnObj: { Property: [] }
      })
      const result = connection.find('Nothing', 'Property')
      result.on('data', () => {
        done('there should be no data')
      })
      result.on('end', done)
    })

    it('emits data events for retrieved records', (done) => {
      connection.makeRequest = () => Promise.resolve({
        parameters: {},
        returnObj: { Property: [{
          id: 1
        }] }
      })
      const result = connection.find('Nothing', 'Property')
      result.on('data', rec => {
        rec.id.should.equal(1)
      })
      result.on('end', done)
    })

    it('processes multiple pages when morePage is true', (done) => {
      const fakeRequest = sinon.stub()
        .onFirstCall().returns(Promise.resolve({
          parameters: { morePage: true },
          returnObj: { Property: [{id: 1}] }
        }))
        .onSecondCall().returns(Promise.resolve({
          parameters: { morePage: false },
          returnObj: { Property: [{id: 2}] }
        }))
      let data = []
      connection.makeRequest = fakeRequest
      const result = connection.find('Nothing', 'Property')
      result.on('data', rec => {
        data.push(rec)
      })
      result.on('end', () => {
        data.should.eql([
          {id: 1},
          {id: 2}
        ])
        done()
      })
    })

    it('processes large pages', (done) => {
      const fakeRequest = sinon.stub()
      for(let j = 0; j < 20; j++) {
        const page = []
        for(let i = 0; i < 25; i++) {
          page.push({id: j * 25 + i})
        }
        fakeRequest.onCall(j).returns(Promise.resolve({
          parameters: {morePage: j !== 19},
          returnObj: { Property: page }
        }))
      }
      let data = []
      connection.makeRequest = fakeRequest
      const result = connection.find('Nothing', 'Property')
      result.on('data', rec => data.push(rec))
      result.on('end', () => {
        data.should.have.length(20 * 25)
        for(let i = 0; i < 20 * 25; i++) {
          data[i].should.eql({id: i})
        }
        done()
      })
    })
  })
})