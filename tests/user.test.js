const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const { userOne, userOneId, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async() => {
    const response = await request(app).post('/users').send({
        name:'Anuj',
        email:'anuj@example.com',
        password:'mypass111!'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user:{
            name:'Anuj',
            email:'anuj@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('mypass111!')
})

test('Should login existing user', async() => {
    const response = await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not accept non-existing users', async() => {
    await request(app).post('/users/login').send({
        email:'fail@example.com',
        password:'shouldfail!23'
    }).expect(400)
})

test('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete for unauthorized user', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        expect(200)

        // checking if image is stored properly as a buffer
        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'updatedName',
            email: 'updatedEmail@exampleasd.com'
        })
        .expect(200)

    // checking data to confirm
    const user = await User.findById(userOneId)
    expect(user.name).toBe('updatedName')
    expect(user.email).toBe('updatedemail@exampleasd.com')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            wrong: 'updatedName',
            againWrong: 'updatedEmail@exampleasd.com'
        })
        .expect(400)
})