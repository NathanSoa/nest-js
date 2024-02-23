import { StudentRepository } from '@/domain/forum/application/repositories/Student-repository'
import { Student } from '@/domain/forum/enterprise/entities/Student'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { HashGenerator } from '../cryptography/hash-generator'
import { StudentAlreadyExistsError } from './errors/student-already-exists-error'

type Params = {
  name: string
  email: string
  password: string
}

type Return = Either<
  StudentAlreadyExistsError,
  {
    student: Student
  }
>

@Injectable()
export class RegisterStudentUseCase {
  constructor(
    private studentRepository: StudentRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({ email, name, password }: Params): Promise<Return> {
    const studentWithSameEmail = await this.studentRepository.findByEmail(email)

    if (studentWithSameEmail) {
      return left(new StudentAlreadyExistsError(email))
    }

    const student = Student.create({
      email,
      name,
      password: await this.hashGenerator.hash(password),
    })

    await this.studentRepository.create(student)

    return right({ student })
  }
}
