import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { QuestionFactory } from 'test/factory/make-question'
import { StudentFactory } from 'test/factory/make-student'
import { DatabaseModule } from '@/infra/database/database.module'

let app: INestApplication
let studentFactory: StudentFactory
let questionFactory: QuestionFactory
let jwt: JwtService

describe('Fetch Recent Question (E2E)', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    jwt = moduleRef.get<JwtService>(JwtService)
    studentFactory = moduleRef.get<StudentFactory>(StudentFactory)
    questionFactory = moduleRef.get<QuestionFactory>(QuestionFactory)

    await app.init()
  })

  test('[GET] /questions', async () => {
    const user = await studentFactory.makePrismaStudent()
    await Promise.all([
      questionFactory.makePrismaQuestion({
        title: 'Question 1',
        authorId: user.id,
      }),
      questionFactory.makePrismaQuestion({
        title: 'Question 2',
        authorId: user.id,
      }),
    ])

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      questions: expect.arrayContaining([
        expect.objectContaining({ title: 'Question 2' }),
        expect.objectContaining({ title: 'Question 1' }),
      ]),
    })
  })
})
