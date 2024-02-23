import { StudentRepository } from '@/domain/forum/application/repositories/Student-repository'
import { Student } from '@/domain/forum/enterprise/entities/Student'
import { InMemoryBaseRepository } from './in-memory-base-repository'

export class InMemoryStudentRepository
  extends InMemoryBaseRepository<Student>
  implements StudentRepository
{
  constructor() {
    super()
  }

  async create(Student: Student): Promise<void> {
    this.data.push(Student)
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.data.find((Student) => Student.email === email) || null
  }
}
