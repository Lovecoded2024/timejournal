import { describe, it, expect } from 'vitest'
import type { BiographyProject, Upload, InterviewSession, CreateProjectFormData } from '@/types'

describe('Type Definitions', () => {
  it('should have valid BiographyProject structure', () => {
    const project: BiographyProject = {
      id: 'test-id',
      userId: 'user-id',
      subjectName: 'Test Name',
      subjectBirthDate: '1990-01-01',
      subjectBirthPlace: 'Beijing',
      subjectGender: 'male',
      projectType: 'family',
      projectGoal: 'Test goal',
      status: 'draft',
      progressPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(project).toHaveProperty('id')
    expect(project).toHaveProperty('userId')
    expect(project).toHaveProperty('subjectName')
    expect(project).toHaveProperty('status')
    expect(['draft', 'interviewing', 'reviewing', 'completed']).toContain(project.status)
  })

  it('should have valid Upload structure', () => {
    const upload: Upload = {
      id: 'upload-id',
      projectId: 'project-id',
      fileType: 'image',
      fileUrl: 'https://example.com/image.jpg',
      fileName: 'test.jpg',
      fileSize: 1024,
      uploadedAt: new Date().toISOString(),
    }

    expect(['image', 'audio', 'document', 'text']).toContain(upload.fileType)
    expect(upload.fileUrl).toBeTruthy()
  })

  it('should have valid InterviewSession structure', () => {
    const session: InterviewSession = {
      id: 'session-id',
      projectId: 'project-id',
      sessionNumber: 1,
      chapter: '大学时光',
      mode: 'text',
      status: 'active',
      startedAt: new Date().toISOString(),
    }

    expect(['text', 'voice']).toContain(session.mode)
    expect(['active', 'paused', 'completed']).toContain(session.status)
  })

  it('should have valid CreateProjectFormData structure', () => {
    const formData: CreateProjectFormData = {
      subjectName: 'Test Subject',
      subjectBirthDate: '1990-01-01',
      subjectBirthPlace: 'Beijing',
      subjectGender: 'male',
      projectType: 'family',
      projectGoal: 'Test goal',
      relationship: 'father',
    }

    expect(formData.subjectName).toBeTruthy()
    expect(['self', 'family']).toContain(formData.projectType)
  })
})
