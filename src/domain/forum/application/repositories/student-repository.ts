import { Student } from '@/domain/forum/enterprise/entities/Student'

export abstract class StudentRepository {
  abstract create(Student: Student): Promise<void>
  abstract findByEmail(email: string): Promise<Student | null>
}
