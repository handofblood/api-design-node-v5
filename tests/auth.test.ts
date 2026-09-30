import { createTestUser, wipeDbTables } from './setup/dbHelpers.ts'
import db from '../src/db/db.ts'
import { users } from '../src/db/schema.ts'
import request from 'supertest'
import app from '../src/server.ts'
import env from '../env.ts'
import { verifyToken } from '../src/utils/jwt.ts'
describe('Auth endpoints', () => {

  afterEach(async () => {
    await wipeDbTables()
  })

  describe('POST /auth/login', () => {
    it('login with valid credentials', async () => {
      const { user, token, rawPassword } = await createTestUser()

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: rawPassword })
      expect(response.status).toBe(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body.user).not.toHaveProperty('password')

      const payload = await verifyToken(response.body.token)

      expect(payload.email).toEqual(user.email)
      expect(payload.username).toEqual(user.username)
      expect(payload.id).toEqual(user.id)
    })
    it('returns error for login with invalid credentials', async () => {
      const { user } = await createTestUser()

      await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'wrongpassword' })
        .expect(401)

      await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@gmail.com', password: 'wrongpassword' })
        .expect(401)

      await request(app).post('/api/auth/login').send({}).expect(400)
    })
  })
  describe('POST /auth/register', () => {
    it('gets error for register with invalid credentials', async () => {
      const userData = {
        username: 'usert123',
        password: 'test1234',
        firstName: 'Genry',
        lastName: 'Kevilp',
      }
      const { body } = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)
    })
    it('gets 409 for register with duplicated email or username', async () => {
      const { user } = await createTestUser()

      await request(app)
        .post('/api/auth/register')
        .send({ email: user.email, username: 'test', password: 'test1234' })
        .expect(409)

      const response =await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@fmail.com',
          username: user.username,
          password: 'test1234',
        })
        .expect(409)
        
        expect(response.body).toHaveProperty('token')
        expect(response.body.error).toEqual('Email or username already exists')
    })
    it('register with valid credentials', async () => {
      const id = crypto.randomUUID()
      const userData = {
        email: `test-${id}@gmail.com`,
        username: `user-${id}`,
        password: 'test1234',
        firstName: 'Genry',
        lastName: 'Kevilp',
      }
      const { body } = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      const { user, token } = body

      expect(token).toBeDefined()

      const payload = await verifyToken(token)

      expect(user.username).toEqual(userData.username)
      expect(payload.username).toEqual(userData.username)
    })
  })
})
