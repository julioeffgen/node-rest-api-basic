import app from '../../app/app'
import {agent as request} from 'supertest'
import {expect} from 'chai'
import {JwtService} from "../../app/auth/services/jwt.service"

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
            "email": firstUserBody.email,
            "password": firstUserBody.password
        })
    expect(res.status).to.equal(201)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body.accessToken).to.be.an("string")
    expect(res.body.refreshToken).to.be.an("string")
    jwt.accessToken = res.body.accessToken
    jwt.refreshToken = res.body.refreshToken
})

it(`should POST to /auth/refresh-token and receive 403 for having an invalid JWT`, async () => {
    const res = await request(app)
        .post('/auth/refresh-token')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}123123`)
        .send({
            "refreshToken": jwt.refreshToken
        })
    expect(res.status).to.equal(403)
})

it(`should POST to /auth/refresh-token and receive 401 for not having a JWT set`, async () => {
    const res = await request(app)
        .post('/auth/refresh-token')
        .set('Accept', 'application/json')
        .send({
            "refreshToken": jwt.refreshToken
        })
    expect(res.status).to.equal(401)
})

it(`should POST to /auth/refresh-token and receive 400 for having an invalid refreshToken`, async () => {
    const res = await request(app)
        .post('/auth/refresh-token')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send({
            "refreshToken": '123'
        })
    expect(res.status).to.equal(400)
})

it(`should POST to /auth/refresh-token and retrieve a new access token`, async () => {
    const res = await request(app)
        .post('/auth/refresh-token')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send({
            "refreshToken": jwt.refreshToken
        })
    expect(res.status).to.equal(201)
    expect(res.body).not.to.be.empty
    expect(res.body).to.be.an("object")
    expect(res.body.accessToken).to.be.an("string")
    expect(res.body.refreshToken).to.be.an("string")
    jwt.accessToken = res.body.accessToken
    jwt.refreshToken = res.body.refreshToken
})

it('should DELETE /v1/users/:userId', async function () {
    const res = await request(app)
        .delete(`/v1/users/${firstUserIdTest}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .send()
    expect(res.status).to.equal(204)
})