import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/infra/app.module'
import request from 'supertest'
import { JwtService } from '@nestjs/jwt'
import { StudentFactory } from 'test/factory/make-student'
import { DatabaseModule } from '@/infra/database/database.module'
import { QuestionFactory } from 'test/factory/make-question'
import { Slug } from '@/domain/forum/enterprise/entities/value-object/slug'
import { AttachmentFactory } from 'test/factory/make-attachments'
import { QuestionAttachmentFactory } from 'test/factory/make-question-attachment'

let app: INestApplication
let jwt: JwtService
let questionFactory: QuestionFactory
let studentFactory: StudentFactory
let attachmentFactory: AttachmentFactory
let questionAttachmentFactory: QuestionAttachmentFactory

describe('Get Question By Slug (E2E)', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    jwt = moduleRef.get<JwtService>(JwtService)
    studentFactory = moduleRef.get<StudentFactory>(StudentFactory)
    questionFactory = moduleRef.get<QuestionFactory>(QuestionFactory)
    attachmentFactory = moduleRef.get<AttachmentFactory>(AttachmentFactory)
    questionAttachmentFactory = moduleRef.get<QuestionAttachmentFactory>(
      QuestionAttachmentFactory,
    )

    await app.init()
  })

  test('[GET] /questions/:slug', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    })
    const question = await questionFactory.makePrismaQuestion({
      slug: Slug.create('question-1'),
      title: 'Question 1',
      authorId: user.id,
    })

    const attachment = await attachmentFactory.makePrismaAttachment({
      title: 'Attachment 1',
    })

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id,
      attachmentId: attachment.id,
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .get('/questions/question-1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      question: expect.objectContaining({
        title: 'Question 1',
        author: 'John Doe',
        attachments: [
          expect.objectContaining({
            title: 'Attachment 1',
          }),
        ],
      }),
    })
  })
})
