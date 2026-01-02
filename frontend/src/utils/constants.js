// 用户角色枚举
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  DIRECTOR: 'director',
  DEAN: 'dean',
  ADMIN: 'admin',
};

// 角色权限层级（数字越大权限越高）
export const ROLE_LEVELS = {
  [USER_ROLES.STUDENT]: 1,
  [USER_ROLES.TEACHER]: 2,
  [USER_ROLES.DIRECTOR]: 3,
  [USER_ROLES.DEAN]: 4,
  [USER_ROLES.ADMIN]: 5,
};

// 角色显示名称
export const ROLE_NAMES = {
  [USER_ROLES.STUDENT]: '学生',
  [USER_ROLES.TEACHER]: '教师',
  [USER_ROLES.DIRECTOR]: '主任',
  [USER_ROLES.DEAN]: '院长',
  [USER_ROLES.ADMIN]: '管理员',
};

// 论文类型
export const PAPER_TYPES = {
  GRADUATION: 'graduation',
  COURSE: 'course',
};

// 论文类型显示名称
export const PAPER_TYPE_NAMES = {
  [PAPER_TYPES.GRADUATION]: '毕业论文',
  [PAPER_TYPES.COURSE]: '课程论文',
};

// 检查状态
export const CHECK_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// 检查状态显示名称
export const CHECK_STATUS_NAMES = {
  [CHECK_STATUS.PENDING]: '等待中',
  [CHECK_STATUS.PROCESSING]: '检查中',
  [CHECK_STATUS.COMPLETED]: '已完成',
  [CHECK_STATUS.FAILED]: '检查失败',
};

// 评级
export const GRADE_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  PASSING: 'passing',
  FAILURE: 'failure',
};

// 评级显示名称
export const GRADE_NAMES = {
  [GRADE_LEVELS.EXCELLENT]: '优秀',
  [GRADE_LEVELS.GOOD]: '良好',
  [GRADE_LEVELS.PASSING]: '合格',
  [GRADE_LEVELS.FAILURE]: '不合格',
};

// 评级颜色
export const GRADE_COLORS = {
  [GRADE_LEVELS.EXCELLENT]: 'success',
  [GRADE_LEVELS.GOOD]: 'processing',
  [GRADE_LEVELS.PASSING]: 'warning',
  [GRADE_LEVELS.FAILURE]: 'error',
};

// 模板类型
export const TEMPLATE_TYPES = {
  GRADUATION: 'graduation',
  COURSE: 'course',
};

// 模板可见性
export const TEMPLATE_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};

// 问题严重程度
export const PROBLEM_SEVERITY = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  INFO: 'info',
};

// 问题严重程度显示名称
export const PROBLEM_SEVERITY_NAMES = {
  [PROBLEM_SEVERITY.CRITICAL]: '严重',
  [PROBLEM_SEVERITY.MAJOR]: '重要',
  [PROBLEM_SEVERITY.MINOR]: '一般',
  [PROBLEM_SEVERITY.INFO]: '提示',
};

// 问题严重程度颜色
export const PROBLEM_SEVERITY_COLORS = {
  [PROBLEM_SEVERITY.CRITICAL]: 'red',
  [PROBLEM_SEVERITY.MAJOR]: 'orange',
  [PROBLEM_SEVERITY.MINOR]: 'gold',
  [PROBLEM_SEVERITY.INFO]: 'blue',
};

// 最大文件上传大小
export const MAX_UPLOAD_SIZE = import.meta.env.VITE_MAX_UPLOAD_SIZE || 52428800; // 50MB

// 支持的文件类型
export const ALLOWED_FILE_TYPES = ['.docx'];

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/api/v1';

// WebSocket URL
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8888/ws';
