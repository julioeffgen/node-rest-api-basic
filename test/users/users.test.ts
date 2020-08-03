import app from '../../app/app'
import {agent as request} from 'supertest'
import {expect} from 'chai'
import { JwtService } from '../../app/auth/services/jwt.service'

let firstUserIdTest = ''
let firstUserBody = {
    "name": "Fulano de Tal",
    "email": "fulano.de.tal@gmail.com",
    "password": "1234567890"
}

let jwt = {
    accessToken: '',
    refreshToken: ''
}

const adminJWT = JwtService.generateToken(2147483647)

it('should DELETE /v1/users', async function () {
    const res = await request(app)
        .delete(`/v1/users`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${adminJWT}`)
        .send()
    expect(res.status).to.equal(204)
})

it('should POST /v1/users', async function () {
    const res = await request(app)
        .post('/v1/users').send(firstUserBody)
    expect(res.status).to.equal(201)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body._id).to.be.an('string')
    firstUserIdTest = res.body._id
})

it(`should POST to /auth and retrieve an access token`, async () => {
    const res = await request(app)
        .post('/auth').send({
            "email" : firstUserBody.email,
            "password" : firstUserBody.password
        })
    expect(res.status).to.equal(201)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body.accessToken).to.be.an("string")
    expect(res.body.refreshToken).to.be.an("string")
    jwt.accessToken = res.body.accessToken
    jwt.refreshToken = res.body.refreshToken
})

it(`should GET /v1/users/:userId`, async function () {
    const res = await request(app)
        .get(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send()
    expect(res.status).to.equal(200)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body._id).to.be.an('string')
    expect(res.body.name).to.be.equals(firstUserBody.name)
    expect(res.body.email).to.be.equals(firstUserBody.email)
    expect(res.body.permissionLevel).to.be.equals(15)
    expect(res.body._id).to.be.equals(firstUserIdTest)
})

it(`should GET /v1/users`, async function () {
    const res = await request(app)
        .get(`/v1/users`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${adminJWT}`)
        .send()
    expect(res.status).to.equal(200)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("array")
    expect(res.body[0]._id).to.be.an('string')
    expect(res.body[0].name).to.be.equals(firstUserBody.name)
    expect(res.body[0].email).to.be.equals(firstUserBody.email)
    expect(res.body[0]._id).to.be.equals(firstUserIdTest)
})

it('should PUT /v1/users/:userId password cant be changed', async function () {
    const res = await request(app)
        .put(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send({
            name: firstUserBody.name,
            password: '123123'
        })
    expect(res.status).to.equal(400)
})

it('should PUT /v1/users/:userId email cant be changed', async function () {
    const name = 'John'
    const res = await request(app)
        .put(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send({
            name: name,
            email: firstUserBody.email
        })
    expect(res.status).to.equal(400)
})

it('should PUT /v1/users/:userId', async function () {
    const name = 'Thor'
    const res = await request(app)
        .put(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send({
            name: name
        })
    expect(res.status).to.equal(204)
})

it(`should GET /v1/users/:userId to have a new name`, async function () {
    const res = await request(app)
        .get(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send()
    expect(res.status).to.equal(200)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body._id).to.be.an('string')
    expect(res.body.name).to.be.not.equals(firstUserBody.name)
    expect(res.body.email).to.be.equals(firstUserBody.email)
    expect(res.body._id).to.be.equals(firstUserIdTest)
})

it('should PATCH /v1/users/:userId', async function () {
    let newField = {description: 'My user description'}
    const res = await request(app)
        .patch(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send(newField)
    expect(res.status).to.equal(204)
})

it(`should GET /v1/users/:userId to have a new field called description`, async function () {
    const res = await request(app)
        .get(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send()
    expect(res.status).to.equal(200)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body._id).to.be.an('string')
    expect(res.body.description).to.be.equals('My user description')
})

it('should PUT /v1/users/:userId/password/change not allowed to different users', async function () {
    const res = await request(app)
        .put(`/v1/users/${firstUserIdTest}/password/change`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${adminJWT}`)
        .send({
            password: '123123'
        })
    expect(res.status).to.equal(403)
})

it('should PUT /v1/users/:userId/password/change', async function () {
    const res = await request(app)
        .put(`/v1/users/${firstUserIdTest}/password/change`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send({
            password: '123123'
        })
    expect(res.status).to.equal(204)
})

it('should POST /v1/forgot invalid user', async function () {
    const email = 'invalid@email.com'
    const res = await request(app)
        .post(`/v1/forgot`)
        .set('Accept', 'application/json')
        .send({
            email: email
        })
    expect(res.status).to.equal(400)
})

it('should POST /v1/forgot', async function () {
    const res = await request(app)
        .post(`/v1/forgot`)
        .set('Accept', 'application/json')
        .send({
            email: firstUserBody.email
        })
    expect(res.status).to.equal(200)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body.message).to.be.equals(`New password was sent to ${firstUserBody.email}`)
})

it('should DELETE /v1/users/:userId', async function () {
    const res = await request(app)
        .delete(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send()
    expect(res.status).to.equal(204)
})

it(`should GET /v1/users and receive a 403 for not being an ADMIN`, async function () {
    const res = await request(app)
        .get(`/v1/users`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send()
    expect(res.status).to.equal(403)
})