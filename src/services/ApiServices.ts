import axios from 'axios';
import { GET_APIS, POST_APIS, PUT_APIS, DELETE_APIS } from '../connection';
import { AuthTokens, ApiError } from '../types/api';

// ─────────────────────────────────────────────
// Token Storage Utilities
// ─────────────────────────────────────────────
const ACCESS_TOKEN_KEY = 'EduJunction_access_token';
const REFRESH_TOKEN_KEY = 'EduJunction_refresh_token';

export function getStoredTokens(): AuthTokens | null {
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem('acugrade_access_token') || localStorage.getItem('acugrade_access_token');
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem('acugrade_refresh_token') || localStorage.getItem('acugrade_refresh_token');
  if (
    !accessToken || !refreshToken ||
    accessToken === 'undefined' || refreshToken === 'undefined' ||
    accessToken === 'null' || refreshToken === 'null'
  ) {
    return null;
  }
  return { accessToken, refreshToken };
}

export function storeTokens(tokensOrAccessToken: AuthTokens | string, maybeRefreshToken?: string) {
  let accToken = '';
  let refToken = '';

  if (typeof tokensOrAccessToken === 'string') {
    accToken = tokensOrAccessToken;
    refToken = maybeRefreshToken || '';
  } else if (tokensOrAccessToken && typeof tokensOrAccessToken === 'object') {
    accToken = tokensOrAccessToken.accessToken || '';
    refToken = tokensOrAccessToken.refreshToken || '';
  }

  if (accToken && accToken !== 'undefined' && accToken !== 'null') {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accToken);
  }
  if (refToken && refToken !== 'undefined' && refToken !== 'null') {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refToken);
  }
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function decodeTokenPayload(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const [, payloadB64] = token.split('.');
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Axios Instance & Interceptors
// ─────────────────────────────────────────────
const apiClient = axios.create();

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// Attach Bearer token to every request
apiClient.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Handle 401 TOKEN_EXPIRED with auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.error?.code === 'TOKEN_EXPIRED';

    if (isTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = getStoredTokens();
        if (!tokens) throw new Error('No refresh token');
        const res = await axios.post(POST_APIS.refreshToken, { refreshToken: tokens.refreshToken });
        const data = res.data;
        const newAccessToken = data.data?.accessToken || data.data?.tokens?.accessToken;
        const newRefreshToken = data.data?.refreshToken || data.data?.tokens?.refreshToken;
        if (newAccessToken && newRefreshToken) {
          storeTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
        throw new Error('Invalid tokens from refresh');
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error shape
    const code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
    const message = error.response?.data?.message || error.response?.data?.error?.message || 'Request failed';
    const customError = new ApiError(code, message, error.response?.status);
    return Promise.reject(customError);
  }
);

// ─────────────────────────────────────────────
// ApiServices Class
// ─────────────────────────────────────────────
class ApiServices {
  /** Unwraps `response.data.data` just like the old fetch wrapper returned `json.data` */
  private async get(url: string) {
    const res = await apiClient.get(url);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  private async post(url: string, body?: any) {
    const res = await apiClient.post(url, body);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  private async put(url: string, body?: any) {
    const res = await apiClient.put(url, body);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  private async del(url: string) {
    const res = await apiClient.delete(url);
    return res.data.data !== undefined ? res.data.data : res.data;
  }

  // ── Auth ──────────────────────────────────
  /** Returns raw axios response so LoginPage can read response.data directly */
  login(body: any) { return apiClient.post(POST_APIS.login, body); }
  googleLogin(body: any) { return apiClient.post(POST_APIS.googleLogin, body); }
  register(body: any) { return this.post(POST_APIS.register, body); }
  sendResetOtp(body: { identifier: string }) { return this.post(POST_APIS.sendResetOtp, body); }
  resetPassword(body: { identifier: string; otp?: string; newPassword: string }) { return this.post(POST_APIS.resetPassword, body); }
  getCaptcha() { return this.get(GET_APIS.captcha); }
  checkUsername(username: string) { return this.get(GET_APIS.checkUsername(username)); }
  getRoles() { return this.get(GET_APIS.roles); }
  verifySession() { return this.get(GET_APIS.verifySession); }
  async getMenuPermissions() {
    const res = await this.get(GET_APIS.menuPermissions);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.pageAccess)) return res.pageAccess;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  }
  childLogin(body: any) { return this.post(POST_APIS.childLogin, body); }
  logout(body: any) { return this.post(POST_APIS.logout, body); }

  // ── Master Data ───────────────────────────
  getBoardClassDropdown() { return this.get(GET_APIS.boardClassDropdown); }
  getCurriculumOptions(params?: { board?: string; classGrade?: string; studentId?: string | number }) {
    const q = new URLSearchParams();
    if (params?.board) q.append('board', params.board);
    if (params?.classGrade) q.append('classGrade', params.classGrade);
    if (params?.studentId) q.append('studentId', String(params.studentId));
    return this.get(GET_APIS.curriculumOptions(q.toString()));
  }

  // ── Parent ────────────────────────────────
  getParentDashboard() { return this.get(GET_APIS.parentDashboard); }
  getMe() { return this.get(GET_APIS.parentMe); }
  getChildren() { return this.get(GET_APIS.parentChildren); }
  addChild(body: any) { return this.post(POST_APIS.addChild, body); }
  updateChild(childId: string | number, body: any) { return this.put(PUT_APIS.updateChild(childId), body); }
  deleteChild(childId: string | number) { return this.del(DELETE_APIS.deleteChild(childId)); }
  getChildOverview(childId: string | number) { return this.get(GET_APIS.childOverview(childId)); }
  getChildLearningPath(childId: string | number) { return this.get(GET_APIS.childLearningPath(childId)); }
  scheduleExam(body: any) { return this.post(POST_APIS.scheduleExam, body); }
  getScheduledExams() { return this.get(GET_APIS.scheduledExams); }
  deleteScheduledExam(id: string) { return this.del(DELETE_APIS.deleteScheduledExam(id)); }
  getStudentActivityLogs(studentId?: string | number, days: number = 7) { return this.get(GET_APIS.studentActivityLog(studentId, days)); }

  // ── Student ───────────────────────────────
  getStudentDashboard() { return this.get(GET_APIS.studentDashboard); }
  getStudentMe() { return this.get(GET_APIS.studentMe); }
  getStudentLearningPath() { return this.get(GET_APIS.studentLearningPath); }
  getAssignedExams() { return this.get(GET_APIS.assignedExams); }
  getMyActivityLogs(days: number = 7) { return this.get(GET_APIS.myActivityLog(days)); }

  // ── Notifications ─────────────────────────
  getNotifications() { return this.get(GET_APIS.notifications); }
  markNotificationRead(notificationId: string) { return apiClient.patch(PUT_APIS.markNotificationRead(notificationId)).then(res => res.data.data !== undefined ? res.data.data : res.data); }
  markAllNotificationsRead() { return this.post(POST_APIS.markAllNotificationsRead); }


  // ── Exams ─────────────────────────────────
  generateExam(body: any) { return this.post(POST_APIS.generateExam, body); }
  generateQuickTest(paramsOrStudentId: any, limit: number = 10) {
    if (typeof paramsOrStudentId === 'object' && paramsOrStudentId !== null) {
      return this.post(POST_APIS.generateQuickTest, paramsOrStudentId);
    }
    return this.post(POST_APIS.generateQuickTest, { studentId: paramsOrStudentId, limit });
  }
  submitExam(examId: string, body: any) { return this.post(POST_APIS.submitExam(examId), body); }
  getExamSubmission(submissionId: string | number) { return this.get(GET_APIS.examSubmission(submissionId)); }

  // ── Runbooks ──────────────────────────────
  listRunbooks(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`${GET_APIS.runbooks}${params ? `?${params}` : ''}`);
  }
  createRunbook(body: any) { return this.post(POST_APIS.createRunbook, body); }
  updateRunbook(id: string, body: any) { return this.put(PUT_APIS.updateRunbook(id), body); }
  removeRunbook(id: string) { return this.del(DELETE_APIS.deleteRunbook(id)); }

  // ── Gamification ──────────────────────────
  listBadges() { return this.get(GET_APIS.badges); }
  awardXp(body: any) { return this.post(POST_APIS.awardXp, body); }
  leaderboard(period: string = 'all_time') { return this.get(`${GET_APIS.leaderboard}?period=${period}`); }

  // ── Communication ─────────────────────────
  listTeachers() { return this.get(GET_APIS.teachers); }
  listConversations() { return this.get(GET_APIS.conversations); }
  createConversation(body: any) { return this.post(POST_APIS.createConversation, body); }
  sendMessage(conversationId: string, body: any) { return this.post(POST_APIS.sendMessage(conversationId), body); }
  sendChatMessage(body: { messages: { role: string, content: string }[], student_id?: string | number }) { return this.post(POST_APIS.chat, body); }
  getChatSuggestions() { return this.get(GET_APIS.chatSuggestions); }
  markMessageRead(messageId: string) { return this.put(PUT_APIS.markMessageRead(messageId)); }
  createDossier(body: any) { return this.post(POST_APIS.createDossier, body); }
  listDossiers() { return this.get(GET_APIS.dossiers); }
  deleteDossier(dossierId: string) { return this.del(DELETE_APIS.deleteDossier(dossierId)); }
  getDossierPreview(studentId: string | number) { return this.get(GET_APIS.dossierPreview(studentId)); }
  getPublicDossier(shareToken: string) { return this.get(GET_APIS.publicDossier(shareToken)); }
  schedulePTM(body: any) { return this.post(POST_APIS.schedulePTM, body); }
  listPTMSchedules() { return this.get(GET_APIS.ptmSchedules); }

  // ── Admin ─────────────────────────────────
  adminLogin(body: any) { return apiClient.post(POST_APIS.adminLogin, body); }
  adminResetPassword(body: any) { return this.post(POST_APIS.adminResetPassword, body); }
  adminStatistics() { return this.get(GET_APIS.adminStatistics); }
  adminDashboard() { return this.get(GET_APIS.adminDashboard); }
  listAdminUsers(filters?: any) {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    return this.get(GET_APIS.adminUsers(params));
  }
  updateAdminUser(id: string | number, body: any) { return this.put(PUT_APIS.updateAdminUser(id), body); }
  deleteAdminUser(id: string | number) { return this.del(DELETE_APIS.deleteAdminUser(id)); }
  adminAuditLogs(filters?: any) {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    return this.get(GET_APIS.adminAuditLogs(params));
  }

  // ── Blogs ─────────────────────────────────
  listBlogs(filters?: any) {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    return this.get(`${GET_APIS.blogs}${params ? `?${params}` : ''}`);
  }
  getBlog(id: string | number) { return this.get(GET_APIS.blogById(id)); }
  createBlog(body: any) { return this.post(POST_APIS.createBlog, body); }
  uploadBlogImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(POST_APIS.uploadBlogImage, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data !== undefined ? res.data.data : res.data);
  }
  updateBlog(id: string | number, body: any) { return this.put(PUT_APIS.updateBlog(id), body); }
  deleteBlog(id: string | number) { return this.del(DELETE_APIS.deleteBlog(id)); }
  listBlogCategories() { return this.get(GET_APIS.blogCategories); }
  createBlogCategory(body: any) { return this.post(POST_APIS.createBlogCategory, body); }
  updateBlogCategory(id: string | number, body: any) { return this.put(PUT_APIS.updateBlogCategory(id), body); }
  deleteBlogCategory(id: string | number) { return this.del(DELETE_APIS.deleteBlogCategory(id)); }
  listBlogAuthors() { return this.get(GET_APIS.blogAuthors); }
  createBlogAuthor(body: any) { return this.post(POST_APIS.createBlogAuthor, body); }
  shareBlog(id: string | number) { return this.post(POST_APIS.shareBlog(id), {}); }

  // ── Curriculum & Question Bank ────────────
  getCurriculumTree() { return this.get(GET_APIS.curriculumTree); }
  listQuestions(filters?: any) {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    return this.get(GET_APIS.adminQuestions(params));
  }
  createQuestion(body: any) { return this.post(POST_APIS.createQuestion, body); }
  updateQuestion(id: string | number, body: any) { return this.put(PUT_APIS.updateQuestion(id), body); }
  deleteQuestion(id: string | number) { return this.del(DELETE_APIS.deleteQuestion(id)); }
  getQuestionUploadHistory(limit: number = 20) { return this.get(GET_APIS.questionUploadHistory(limit)); }

  bulkUploadQuestions(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(POST_APIS.bulkUploadQuestions, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data !== undefined ? res.data.data : res.data);
  }

  async bulkUploadQuestionsStream(file: File, onProgress: (data: any) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const tokens = getStoredTokens();
    const token = tokens?.accessToken || '';

    const response = await fetch(POST_APIS.bulkUploadQuestionsStream, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      let errJson: any = null;
      try {
        errJson = await response.json();
      } catch (e) {
        // text fallback
      }
      throw new Error(errJson?.error?.message || `Upload failed with HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported by browser environment.');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalResult: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.type === 'progress') {
            onProgress(parsed);
          } else if (parsed.type === 'complete') {
            finalResult = parsed;
          }
        } catch (e) {
          console.error('Failed to parse stream chunk:', trimmed, e);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim());
        if (parsed.type === 'complete') {
          finalResult = parsed;
        }
      } catch (e) {
        // ignore
      }
    }

    return finalResult || {
      inserted: 0,
      updated: 0,
      duplicate_skipped: 0,
      message: 'Upload completed'
    };
  }

  // ── AI & RAG Management ───────────────────
  getRagStatus() { return this.get(GET_APIS.ragStatus); }
  uploadRagFile(formData: FormData) {
    return apiClient.post(POST_APIS.uploadRagFile, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data !== undefined ? res.data.data : res.data);
  }
  deleteRagDocument(documentId: string) { return this.del(DELETE_APIS.deleteRagDocument(documentId)); }
  generateRagQuestions(payload: { document_id: string; count?: number; type?: string; difficulty?: string; instructions?: string }) {
    return this.post(POST_APIS.generateRagQuestions, payload);
  }
  saveRagQuestions(payload: { topic_id: number; questions: any[] }) {
    return this.post(POST_APIS.saveRagQuestions, payload);
  }
  extractCurriculumPreview(formData: FormData) {
    return apiClient.post(POST_APIS.extractCurriculumPreview, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data !== undefined ? res.data.data : res.data);
  }
  saveExtractedCurriculumQuestions(payload: {
    filename: string;
    board: string;
    classGrade: string;
    subject: string;
    documentType: string;
    cleanedText?: string;
    topicId?: number | null;
    questions: any[];
    detectedTopics?: any[];
    title?: string;
    summary?: string;
  }) {
    return this.post(POST_APIS.saveExtractedCurriculumQuestions, payload);
  }
  processDocumentPipeline(formData: FormData) {
    return apiClient.post(POST_APIS.processDocumentPipeline, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data !== undefined ? res.data.data : res.data);
  }
  processDocumentsBatch(formData: FormData) {
    return apiClient.post(POST_APIS.processDocumentsBatch, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data !== undefined ? res.data.data : res.data);
  }
  analyzeBookAndQuestionBank(formData: FormData) {
    return apiClient.post(POST_APIS.analyzeBook, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data !== undefined ? res.data.data : res.data);
  }

  // ── Mock Tests & Blueprints ──────────────
  getMockTestBlueprints() { return this.get(GET_APIS.mockTestBlueprints); }
  updateMockTestBlueprint(id: number | string, payload: any) {
    return this.put(PUT_APIS.updateMockTestBlueprint(id), payload);
  }
  generateAdminMockTest(payload: {
    board: string;
    classGrade: string;
    subject: string;
    chapterId?: number;
    chapterName?: string;
    topicId?: number;
    topicName?: string;
    academicYear: string;
    sessionType?: 'CURRENT' | 'UPCOMING';
    difficulty?: string;
    title?: string;
    isAutoAssign?: boolean;
    assignToExistingStudents?: boolean;
  }) {
    return this.post(POST_APIS.generateAdminMockTest, payload);
  }
  getAdminMockTests(params?: { board?: string; classGrade?: string; subject?: string; academicYear?: string }) {
    const q = new URLSearchParams();
    if (params?.board) q.append('board', params.board);
    if (params?.classGrade) q.append('classGrade', params.classGrade);
    if (params?.subject) q.append('subject', params.subject);
    if (params?.academicYear) q.append('academicYear', params.academicYear);
    return this.get(GET_APIS.adminMockTests(q.toString()));
  }
  toggleMockTestAutoAssign(id: string) {
    return this.post(POST_APIS.toggleMockTestAutoAssign(id), {});
  }
  bulkAssignMockTest(id: string) {
    return this.post(POST_APIS.bulkAssignMockTest(id), {});
  }
  deleteAdminMockTest(id: string) {
    return this.del(DELETE_APIS.deleteAdminMockTest(id));
  }

  generateFreeMockTest(payload: { board: string; classGrade: string; subject: string; studentId?: number }) {
    return this.post(POST_APIS.generateFreeMockTest, payload);
  }

  // ── Subject Subscriptions (₹300/Subject / Multi-Set) ──
  createSubjectSubscriptionOrder(payload: {
    board: string;
    classGrade: string;
    subject: string;
    studentId?: number;
    planId?: number;
    quantity?: number;
  }) {
    return this.post(POST_APIS.createSubjectSubscriptionOrder, payload);
  }
  verifySubjectSubscriptionPayment(payload: {
    orderId: string;
    paymentId?: string;
    signature?: string;
    subscriptionId?: string | number;
    board: string;
    classGrade: string;
    subject: string;
    studentId?: number;
    quantity?: number;
  }) {
    return this.post(POST_APIS.verifySubjectSubscriptionPayment, payload);
  }
  getMySubjectSubscriptions(studentId?: number | string) {
    const url = studentId ? `${GET_APIS.mySubjectSubscriptions}?studentId=${studentId}` : GET_APIS.mySubjectSubscriptions;
    return this.get(url);
  }
  previewSubjectModelPaper(subscriptionId: number | string) {
    return this.get(GET_APIS.previewSubjectModelPaper(subscriptionId));
  }
  evaluateSubjectModelPaper(subscriptionId: number | string, payload: { answers: Record<string, string>; timeSpentSeconds?: number }) {
    return this.post(POST_APIS.evaluateSubjectModelPaper(subscriptionId), payload);
  }
  async downloadSubjectModelPaper(subscriptionId: number | string, format: 'pdf' | 'docx' = 'pdf', customFilename?: string) {
    const url = GET_APIS.downloadSubjectModelPaper(subscriptionId, format);
    const response = await apiClient.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data], {
      type: format === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf'
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = customFilename || `Model_Paper_2027_Pass_${subscriptionId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  }
  getActiveSubscriptionPlans() {
    return this.get(GET_APIS.activeSubscriptionPlans);
  }
  getAdminSubscriptionPlans() {
    return this.get(GET_APIS.adminSubscriptionPlans);
  }
  createAdminSubscriptionPlan(payload: {
    planName: string;
    planCode?: string;
    planType?: string;
    priceInr: number;
    durationMinutes?: number;
    totalMarks?: number;
    boardCode?: string;
    className?: string;
    subjectName?: string;
    description?: string;
    features?: string[];
    isActive?: boolean;
  }) {
    return this.post(POST_APIS.createAdminSubscriptionPlan, payload);
  }
  updateAdminSubscriptionPlan(id: number | string, payload: {
    planName?: string;
    priceInr?: number;
    durationMinutes?: number;
    totalMarks?: number;
    boardCode?: string;
    className?: string;
    subjectName?: string;
    description?: string;
    features?: string[];
    isActive?: boolean;
  }) {
    return this.put(PUT_APIS.updateAdminSubscriptionPlan(id), payload);
  }
  deleteAdminSubscriptionPlan(id: number | string) {
    return this.del(DELETE_APIS.deleteAdminSubscriptionPlan(id));
  }
  getAdminSubscriptionHistory(params?: { search?: string; board?: string; classGrade?: string; subject?: string; status?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.board) q.append('board', params.board);
    if (params?.classGrade) q.append('classGrade', params.classGrade);
    if (params?.subject) q.append('subject', params.subject);
    if (params?.status) q.append('status', params.status);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return this.get(GET_APIS.adminSubscriptionHistory(q.toString()));
  }

  // ── LLM Configuration & Scenario Routing ───────────────────
  getLlmConfigs() {
    return this.get(GET_APIS.llmConfigs);
  }
  getActiveLlmConfig() {
    return this.get(GET_APIS.activeLlmConfig);
  }
  createLlmConfig(payload: {
    name?: string;
    displayTitle?: string;
    providerType?: string;
    providerName?: string;
    baseUrl?: string;
    apiKey?: string;
    modelName: string;
    timeoutSeconds?: number;
    isActive?: boolean;
  }) {
    return this.post(POST_APIS.createLlmConfig, payload);
  }
  updateLlmConfig(id: number | string, payload: {
    name?: string;
    displayTitle?: string;
    providerType?: string;
    providerName?: string;
    baseUrl?: string;
    apiKey?: string;
    modelName?: string;
    timeoutSeconds?: number;
    isActive?: boolean;
  }) {
    return this.put(PUT_APIS.updateLlmConfig(id), payload);
  }
  activateLlmConfig(id: number | string) {
    return this.post(POST_APIS.activateLlmConfig(id), {});
  }
  deleteLlmConfig(id: number | string) {
    return this.del(DELETE_APIS.deleteLlmConfig(id));
  }
  testLlmConfig(idOrPayload: number | string | { config_id?: number | string; id?: number | string }) {
    const configId = typeof idOrPayload === 'object' ? (idOrPayload.config_id || idOrPayload.id) : idOrPayload;
    return this.post(POST_APIS.testLlmConfig(configId!), typeof idOrPayload === 'object' ? idOrPayload : {});
  }
  getLlmScenarios() {
    return this.get(GET_APIS.llmScenarios);
  }
  updateLlmScenarios(payload: {
    assignments: Array<{
      scenario: string;
      provider_id?: number | string;
      providerId?: number | string;
      temperature?: number;
      max_tokens?: number;
      maxTokens?: number;
    }>;
  }) {
    return this.put(PUT_APIS.updateLlmScenarios, payload);
  }

  // ── Knowledge Graph (K-Graph) ────────────
  getKnowledgeGraph(params?: { board?: string; classGrade?: string; subject?: string; studentId?: string | number; mode?: 'curriculum' | 'student' }) {
    const q = new URLSearchParams();
    if (params?.board && params.board !== 'ALL') q.append('board', params.board);
    if (params?.classGrade && params.classGrade !== 'ALL') q.append('classGrade', params.classGrade);
    if (params?.subject && params.subject !== 'ALL') q.append('subject', params.subject);
    if (params?.studentId) q.append('studentId', String(params.studentId));
    if (params?.mode) q.append('mode', params.mode);
    return this.get(GET_APIS.knowledgeGraph(q.toString()));
  }
  getKnowledgeGraphExportUrl(params?: { board?: string; classGrade?: string; subject?: string; studentId?: string | number; mode?: 'curriculum' | 'student' }) {
    const q = new URLSearchParams();
    if (params?.board && params.board !== 'ALL') q.append('board', params.board);
    if (params?.classGrade && params.classGrade !== 'ALL') q.append('classGrade', params.classGrade);
    if (params?.subject && params.subject !== 'ALL') q.append('subject', params.subject);
    if (params?.studentId) q.append('studentId', String(params.studentId));
    if (params?.mode) q.append('mode', params.mode);

    const tokens = getStoredTokens();
    if (tokens?.accessToken) q.append('token', tokens.accessToken);

    return GET_APIS.exportKnowledgeGraphHtml(q.toString());
  }
  async exportKnowledgeGraphHtml(params?: { board?: string; classGrade?: string; subject?: string; studentId?: string | number; mode?: 'curriculum' | 'student' }) {
    const q = new URLSearchParams();
    if (params?.board && params.board !== 'ALL') q.append('board', params.board);
    if (params?.classGrade && params.classGrade !== 'ALL') q.append('classGrade', params.classGrade);
    if (params?.subject && params.subject !== 'ALL') q.append('subject', params.subject);
    if (params?.studentId) q.append('studentId', String(params.studentId));
    if (params?.mode) q.append('mode', params.mode);

    const tokens = getStoredTokens();
    if (tokens?.accessToken) q.append('token', tokens.accessToken);

    const res = await apiClient.get(GET_APIS.exportKnowledgeGraphHtml(q.toString()), {
      responseType: 'text'
    });
    return res.data;
  }
  syncKnowledgeGraph() {
    return this.post(POST_APIS.syncKnowledgeGraph, {});
  }

  // ── Health ────────────────────────────────
  checkHealth() { return this.get(GET_APIS.health); }
}

export default new ApiServices();
