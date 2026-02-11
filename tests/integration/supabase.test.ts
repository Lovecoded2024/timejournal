import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

describe('Supabase Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Project Operations', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        { id: '1', subject_name: 'Test 1', status: 'draft' },
        { id: '2', subject_name: 'Test 2', status: 'interviewing' },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockProjects,
            error: null,
          }),
        }),
      })

      const { getProjects } = await import('@/lib/supabase')
      const projects = await getProjects()

      expect(projects).toHaveLength(2)
      expect(projects[0].subjectName).toBe('Test 1')
    })

    it('should create a project', async () => {
      const newProject = {
        userId: 'user-1',
        subjectName: 'New Project',
        subjectGender: 'male',
        projectType: 'family',
        status: 'draft',
        progressPercent: 0,
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-id', ...newProject },
              error: null,
            }),
          }),
        }),
      })

      const { createProject } = await import('@/lib/supabase')
      const project = await createProject(newProject as any)

      expect(project).toHaveProperty('id')
    })

    it('should handle errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      })

      const { getProjects } = await import('@/lib/supabase')
      
      await expect(getProjects()).rejects.toThrow()
    })
  })

  describe('Upload Operations', () => {
    it('should create upload record', async () => {
      const upload = {
        projectId: 'project-1',
        fileType: 'image' as const,
        fileUrl: 'https://example.com/image.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'upload-1', ...upload },
              error: null,
            }),
          }),
        }),
      })

      const { createUpload } = await import('@/lib/supabase')
      const result = await createUpload(upload)

      expect(result.fileName).toBe('test.jpg')
    })
  })
})
