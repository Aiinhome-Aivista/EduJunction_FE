const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
export const BASE_URL = rawBaseUrl.replace(/\/+$/, '');
export const API_V1 = `${BASE_URL}/api/v1`;

export const GET_APIS = {
  // Auth
  captcha: `${API_V1}/auth/captcha`,
  roles: `${API_V1}/auth/roles`,
  verifySession: `${API_V1}/auth/verify`,
  menuPermissions: `${API_V1}/auth/menu-permissions`,
  checkUsername: (username: string) => `${API_V1}/auth/check-username?username=${encodeURIComponent(username)}`,

  // Master Data
  boardClassDropdown: `${API_V1}/master/board_class_dropdown`,
  curriculumOptions: (params?: string) => `${API_V1}/master/curriculum-options${params ? `?${params}` : ''}`,

  // Parent
  parentDashboard: `${API_V1}/parents/dashboard`,
  parentMe: `${API_V1}/parents/me`,
  parentChildren: `${API_V1}/parents/me/children`,
  childOverview: (id: string | number) => `${API_V1}/parents/me/children/${id}/overview`,
  childLearningPath: (id: string | number) => `${API_V1}/parents/me/children/${id}/learning-path`,
  scheduledExams: `${API_V1}/parents/scheduled-exams`,
  studentActivityLog: (studentId?: string | number, days: number = 7) => `${API_V1}/parents/student-activity-log?${studentId ? `studentId=${studentId}&` : ''}days=${days}`,

  // Student
  studentDashboard: `${API_V1}/students/dashboard`,
  studentMe: `${API_V1}/students/me`,
  studentLearningPath: `${API_V1}/students/me/learning-path`,
  assignedExams: `${API_V1}/students/assigned-exams`,
  myActivityLog: (days: number = 7) => `${API_V1}/students/activity-log?days=${days}`,

  // Notifications
  notifications: `${API_V1}/notifications`,

  // Exams
  examSubmission: (id: string | number) => `${API_V1}/exams/submissions/${id}`,

  // Runbooks
  runbooks: `${API_V1}/runbooks`,

  // Gamification
  badges: `${API_V1}/gamification/badges`,
  leaderboard: `${API_V1}/leaderboard`,

  // Communication
  teachers: `${API_V1}/teachers`,
  conversations: `${API_V1}/conversations`,
  dossiers: `${API_V1}/dossiers`,
  dossierPreview: (id: string | number) => `${API_V1}/dossiers/preview/${id}`,
  publicDossier: (token: string) => `${API_V1}/dossiers/public/${encodeURIComponent(token)}`,
  ptmSchedules: `${API_V1}/ptm/schedules`,
  chatSuggestions: `${API_V1}/chat/suggestions`,

  // Blogs
  blogs: `${API_V1}/blogs`,
  blogById: (id: string | number) => `${API_V1}/blogs/${id}`,
  blogCategories: `${API_V1}/blogs/categories`,
  blogAuthors: `${API_V1}/blogs/authors`,

  // Admin & Academics
  adminStatistics: `${API_V1}/admin/statistics`,
  adminDashboard: `${API_V1}/admin/dashboard`,
  adminUsers: (params?: string) => `${API_V1}/admin/users${params ? `?${params}` : ''}`,
  adminAuditLogs: (params?: string) => `${API_V1}/admin/audit-logs${params ? `?${params}` : ''}`,
  curriculumTree: `${API_V1}/admin/curriculum/tree`,
  adminQuestions: (params?: string) => `${API_V1}/admin/questions${params ? `?${params}` : ''}`,
  questionUploadHistory: (limit: number = 20) => `${API_V1}/admin/questions/upload-history?limit=${limit}`,
  ragStatus: `${API_V1}/admin/rag/status`,
  knowledgeGraph: (params?: string) => `${API_V1}/admin/rag/knowledge-graph${params ? `?${params}` : ''}`,
  exportKnowledgeGraphHtml: (params?: string) => `${API_V1}/admin/rag/knowledge-graph/export-html${params ? `?${params}` : ''}`,
  health: `${API_V1}/health`,
  mockTestBlueprints: `${API_V1}/admin/mock-tests/blueprints`,
  adminMockTests: (params?: string) => `${API_V1}/admin/mock-tests${params ? `?${params}` : ''}`,
  mySubjectSubscriptions: `${API_V1}/subscriptions/subject/my-subscriptions`,
  activeSubscriptionPlans: `${API_V1}/subscription-plans/active`,
  adminSubscriptionPlans: `${API_V1}/admin/subscription-plans`,
  adminSubscriptionHistory: (params?: string) => `${API_V1}/admin/subscription-history${params ? `?${params}` : ''}`,
  llmConfigs: `${API_V1}/admin/llm-config`,
  activeLlmConfig: `${API_V1}/admin/llm-config/active`,
  llmScenarios: `${API_V1}/admin/llm-scenarios`,
  previewSubjectModelPaper: (subId: number | string) => `${API_V1}/subscriptions/subject/${subId}/preview-paper`,
  downloadSubjectModelPaper: (subId: number | string, format: string = 'pdf') => `${API_V1}/subscriptions/subject/${subId}/download-paper?format=${format}`,
};

export const POST_APIS = {
  // Auth
  login: `${API_V1}/auth/login`,
  googleLogin: `${API_V1}/auth/google`,
  register: `${API_V1}/auth/register`,
  childLogin: `${API_V1}/auth/child-login`,
  sendResetOtp: `${API_V1}/auth/send-reset-otp`,
  resetPassword: `${API_V1}/auth/reset-password`,
  logout: `${API_V1}/auth/logout`,
  refreshToken: `${API_V1}/auth/refresh`,

  // Parent
  addChild: `${API_V1}/parents/add-child`,
  scheduleExam: `${API_V1}/parents/schedule-exam`,

  // Notifications
  markAllNotificationsRead: `${API_V1}/notifications/read-all`,

  // Exams
  generateExam: `${BASE_URL}/api/v1/exams/generate`,
  generateQuickTest: `${BASE_URL}/api/v1/exams/quick-test`,
  submitExam: (id: string) => `${BASE_URL}/api/v1/exams/${id}/submit`,

  // Chat
  chat: `${API_V1}/chat`,

  // Runbooks
  createRunbook: `${API_V1}/runbooks`,

  // Gamification
  awardXp: `${API_V1}/gamification/award-xp`,

  // Communication
  createConversation: `${API_V1}/conversations`,
  sendMessage: (id: string) => `${API_V1}/conversations/${id}/messages`,
  createDossier: `${API_V1}/dossiers`,
  schedulePTM: `${API_V1}/ptm/schedule`,

  // Blogs
  createBlog: `${API_V1}/blogs`,
  uploadBlogImage: `${API_V1}/files/upload-image`,
  createBlogCategory: `${API_V1}/blogs/categories`,
  createBlogAuthor: `${API_V1}/blogs/authors`,
  shareBlog: (id: string | number) => `${API_V1}/blogs/${id}/share`,

  // Admin & Academics
  createQuestion: `${API_V1}/admin/questions`,
  bulkUploadQuestions: `${API_V1}/admin/questions/bulk-upload`,
  bulkUploadQuestionsStream: `${API_V1}/admin/questions/bulk-upload-stream`,
  uploadRagFile: `${API_V1}/files/upload`,
  generateRagQuestions: `${API_V1}/admin/rag/generate-questions`,
  saveRagQuestions: `${API_V1}/admin/rag/save-questions`,
  extractCurriculumPreview: `${API_V1}/curriculum/extract-preview`,
  saveExtractedCurriculumQuestions: `${API_V1}/curriculum/save-extracted-questions`,
  processDocumentPipeline: `${API_V1}/admin/rag/process-document`,
  processDocumentsBatch: `${API_V1}/admin/rag/process-documents-batch`,
  analyzeBook: `${API_V1}/admin/rag/analyze-book`,
  syncKnowledgeGraph: `${API_V1}/admin/rag/sync-knowledge-graph`,
  generateAdminMockTest: `${API_V1}/admin/mock-tests/generate`,
  generateFreeMockTest: `${API_V1}/mock-tests/free/generate`,
  createSubjectSubscriptionOrder: `${API_V1}/subscriptions/subject/create-order`,
  verifySubjectSubscriptionPayment: `${API_V1}/subscriptions/subject/verify`,
  toggleMockTestAutoAssign: (id: string) => `${API_V1}/admin/mock-tests/${id}/toggle-auto-assign`,
  bulkAssignMockTest: (id: string) => `${API_V1}/admin/mock-tests/${id}/assign-bulk`,
  adminLogin: `${API_V1}/admin/login`,
  adminResetPassword: `${API_V1}/admin/reset-password`,
  createLlmConfig: `${API_V1}/admin/llm-config`,
  testLlmConfig: (id: string | number) => `${API_V1}/admin/llm-config/${id}/test`,
  activateLlmConfig: (id: string | number) => `${API_V1}/admin/llm-config/${id}/activate`,
  createAdminSubscriptionPlan: `${API_V1}/admin/subscription-plans`,
  evaluateSubjectModelPaper: (subId: number | string) => `${API_V1}/subscriptions/subject/${subId}/evaluate-paper`,
};

export const PUT_APIS = {
  markNotificationRead: (id: string | number) => `${API_V1}/notifications/${id}/read`,
  updateChild: (id: string | number) => `${API_V1}/parents/me/children/${id}`,
  updateRunbook: (id: string) => `${API_V1}/runbooks/${id}`,
  updateAdminUser: (id: string | number) => `${API_V1}/admin/users/${id}`,
  updateBlog: (id: string | number) => `${API_V1}/blogs/${id}`,
  updateBlogCategory: (id: string | number) => `${API_V1}/blogs/categories/${id}`,
  markMessageRead: (id: string) => `${API_V1}/messages/${id}/read`,
  updateQuestion: (id: string | number) => `${API_V1}/admin/questions/${id}`,
  updateMockTestBlueprint: (id: number | string) => `${API_V1}/admin/mock-tests/blueprints/${id}`,
  updateLlmConfig: (id: string | number) => `${API_V1}/admin/llm-config/${id}`,
  updateLlmScenarios: `${API_V1}/admin/llm-scenarios`,
  updateAdminSubscriptionPlan: (id: number | string) => `${API_V1}/admin/subscription-plans/${id}`,
};

export const DELETE_APIS = {
  deleteChild: (id: string | number) => `${API_V1}/parents/me/children/${id}`,
  deleteScheduledExam: (id: string) => `${API_V1}/parents/scheduled-exams/${id}`,
  deleteRunbook: (id: string) => `${API_V1}/runbooks/${id}`,
  deleteAdminUser: (id: string | number) => `${API_V1}/admin/users/${id}`,
  deleteDossier: (id: string) => `${API_V1}/dossiers/${encodeURIComponent(id)}`,
  deleteBlog: (id: string | number) => `${API_V1}/blogs/${id}`,
  deleteBlogCategory: (id: string | number) => `${API_V1}/blogs/categories/${id}`,
  deleteQuestion: (id: string | number) => `${API_V1}/admin/questions/${id}`,
  deleteRagDocument: (id: string) => `${API_V1}/admin/rag/documents/${id}`,
  deleteAdminMockTest: (id: string) => `${API_V1}/admin/mock-tests/${id}`,
  deleteLlmConfig: (id: string | number) => `${API_V1}/admin/llm-config/${id}`,
  deleteAdminSubscriptionPlan: (id: number | string) => `${API_V1}/admin/subscription-plans/${id}`,
};
