const server = require('./server')
const request = require('supertest')
const db = require('../data/dbConfig')

const marcos = { username: 'Marcos', password: '1234' }

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

describe('Endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    it('returns an approriate error when username or password not provided', async () => {
      const response = await request(server).post('/api/auth/register').send({ username: 'Marcos' })
      expect(response.status).toBe(401)
      expect(response.body.message).toMatch(/username and password required/i)
    })
    it('returns new user when everything is sent in correctly', async () => {
      const response = await request(server).post('/api/auth/register').send(marcos)
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(marcos)
    })
  })
  describe(('[POST] /api/auth/login'), () => {
    it('returns an approriate error when username and password not provided', async () => {
      const response = await request(server).post('/api/auth/login').send({ username: '', password: '1234' })
      expect(response.status).toBe(401)
      expect(response.body.message).toMatch(/username and password required/i)
    })
    it('returns token in body of response when succesful', async () => {
      const response = await (await request(server).post('/api/auth/login')).setEncoding(marcos)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token')
    })
  })
  describe(('[GET] /api/jokes'), () => {
    it('returns an approriate message when no token is given', async () => {
      const response = await request(server).get('/api/jokes')
      expect(response.status).toBe(401)
      expect(response.body.message).toMatch(/token required/i)
    })
    it('returns with approriate message when token is invalid', async () => {
      const response = await (await request(server).get('/api/jokes')).set({ authorization: 'fake token'})
      expect(response.status).toBe(401)
      expect(response.body.message).toMatch(/invalid token/i)
    })
  })
})
