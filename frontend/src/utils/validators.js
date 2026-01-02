/**
 * 表单验证规则集合
 */

// 常用正则表达式
export const REGEX = {
  // 邮箱
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // 手机号（中国）
  PHONE: /^1[3-9]\d{9}$/,
  // 用户名（字母、数字、下划线，4-20位）
  USERNAME: /^[a-zA-Z0-9_]{4,20}$/,
  // 密码（至少8位，包含字母和数字）
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  // 学号（数字，通常8-12位）
  STUDENT_NUMBER: /^\d{8,12}$/,
  // 年份
  YEAR: /^(19|20)\d{2}$/,
  // 课程代码
  COURSE_CODE: /^[A-Z]{2,4}\d{3,4}$/i,
};

/**
 * 通用验证规则
 */
export const RULES = {
  // 必填
  required: (message = '此字段为必填项') => ({
    required: true,
    message,
  }),

  // 邮箱
  email: (message = '请输入有效的邮箱地址') => ({
    pattern: REGEX.EMAIL,
    message,
  }),

  // 手机号
  phone: (message = '请输入有效的手机号码') => ({
    pattern: REGEX.PHONE,
    message,
  }),

  // 用户名
  username: (message = '用户名应为4-20位字母、数字或下划线') => ({
    pattern: REGEX.USERNAME,
    message,
  }),

  // 密码
  password: (message = '密码至少8位，且包含字母和数字') => ({
    pattern: REGEX.PASSWORD,
    message,
  }),

  // 密码确认
  confirmPassword: (passwordField = 'password', message = '两次输入的密码不一致') => ({
    validator: (_, value, callback) => {
      const form = callback.form;
      const password = form.getFieldValue(passwordField);
      if (value && value !== password) {
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    },
  }),

  // 学号
  studentNumber: (message = '请输入8-12位数字学号') => ({
    pattern: REGEX.STUDENT_NUMBER,
    message,
  }),

  // 年份
  year: (message = '请输入有效的年份') => ({
    pattern: REGEX.YEAR,
    message,
  }),

  // 课程代码
  courseCode: (message = '课程代码格式不正确') => ({
    pattern: REGEX.COURSE_CODE,
    message,
  }),

  // 长度范围
  length: (min, max, message) => ({
    min,
    max,
    message: message || `长度应在${min}-${max}个字符之间`,
  }),

  // 最小长度
  minLength: (min, message) => ({
    min,
    message: message || `长度不能少于${min}个字符`,
  }),

  // 最大长度
  maxLength: (max, message) => ({
    max,
    message: message || `长度不能超过${max}个字符`,
  }),

  // 数字范围
  range: (min, max, message) => ({
    type: 'number',
    min,
    max,
    message: message || `数值应在${min}-${max}之间`,
  }),

  // URL
  url: (message = '请输入有效的URL地址') => ({
    type: 'url',
    message,
  }),

  // 自定义正则
  pattern: (pattern, message = '格式不正确') => ({
    pattern,
    message,
  }),

  // 白名单（只允许特定值）
  whitelist: (list, message = '请选择有效的选项') => ({
    validator: (_, value) => {
      if (value && !list.includes(value)) {
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    },
  }),

  // 自定义验证
  custom: (validator) => ({
    validator,
  }),
};

/**
 * 常用字段验证规则组合
 */
export const FIELD_RULES = {
  // 用户名（必填 + 格式验证）
  username: [
    RULES.required('请输入用户名'),
    RULES.username(),
  ],

  // 邮箱（必填 + 格式验证）
  email: [
    RULES.required('请输入邮箱'),
    RULES.email(),
  ],

  // 手机号（必填 + 格式验证）
  phone: [
    RULES.required('请输入手机号'),
    RULES.phone(),
  ],

  // 密码（必填 + 格式验证）
  password: [
    RULES.required('请输入密码'),
    RULES.password(),
  ],

  // 确认密码
  confirmPassword: [
    RULES.required('请再次输入密码'),
    RULES.confirmPassword(),
  ],

  // 论文标题
  paperTitle: [
    RULES.required('请输入论文标题'),
    RULES.length(5, 100, '标题长度应在5-100个字符之间'),
  ],

  // 学生姓名
  studentName: [
    RULES.required('请输入学生姓名'),
    RULES.length(2, 20, '姓名长度应在2-20个字符之间'),
  ],

  // 学号
  studentNumber: [
    RULES.required('请输入学号'),
    RULES.studentNumber(),
  ],

  // 专业
  major: [
    RULES.required('请输入专业'),
    RULES.maxLength(50),
  ],

  // 院系
  department: [
    RULES.required('请输入院系'),
    RULES.maxLength(50),
  ],

  // 指导教师
  advisor: [
    RULES.required('请输入指导教师'),
    RULES.length(2, 20),
  ],

  // 学年
  academicYear: [
    RULES.required('请输入学年'),
    RULES.year(),
  ],

  // 课程名称
  courseName: [
    RULES.required('请输入课程名称'),
    RULES.maxLength(50),
  ],

  // 课程代码
  courseCode: [
    RULES.required('请输入课程代码'),
    RULES.courseCode(),
  ],
};

/**
 * 表单验证辅助函数
 */

/**
 * 滚动到第一个错误字段
 * @param {Object} form - Ant Design Form 实例
 * @param {Object} errorInfo - 表单错误信息
 */
export const scrollToFirstError = (form, errorInfo) => {
  if (errorInfo?.errorFields?.length > 0) {
    const firstErrorField = errorInfo.errorFields[0].name[0];
    form.scrollToField(firstErrorField, {
      behavior: 'smooth',
      block: 'center',
    });
  }
};

/**
 * 表单字段触发验证
 * @param {Object} form - Ant Design Form 实例
 * @param {string} field - 字段名
 */
export const validateField = async (form, field) => {
  try {
    await form.validateFields([field]);
    return true;
  } catch {
    return false;
  }
};

export default {
  REGEX,
  RULES,
  FIELD_RULES,
  scrollToFirstError,
  validateField,
};
