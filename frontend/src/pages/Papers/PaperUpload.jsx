import { useState } from 'react';
import { Card, Form, Input, Select, Upload, Button, message, Radio } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { uploadGraduationPaper, uploadCoursePaper } from '@/api/papers';
import { PAPER_TYPES, ALLOWED_FILE_TYPES, MAX_UPLOAD_SIZE } from '@/utils/constants';
import { formatFileSize } from '@/utils/auth';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const PaperUpload = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [paperType, setPaperType] = useState(PAPER_TYPES.GRADUATION);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      message.error('请上传论文文件');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0]);
      
      // 添加表单数据
      Object.keys(values).forEach(key => {
        if (values[key]) {
          formData.append(key, values[key]);
        }
      });

      // 根据论文类型调用不同的API
      if (paperType === PAPER_TYPES.GRADUATION) {
        await uploadGraduationPaper(formData);
      } else {
        await uploadCoursePaper(formData);
      }

      message.success('论文上传成功，正在跳转...');
      setTimeout(() => {
        navigate('/papers/list');
      }, 1000);
    } catch (error) {
      message.error(error.message || '上传失败，请检查网络后重试');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      // 检查文件类型
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(extension)) {
        message.error(`只支持${ALLOWED_FILE_TYPES.join(', ')}格式的文件`);
        return false;
      }

      // 检查文件大小
      if (file.size > MAX_UPLOAD_SIZE) {
        message.error(`文件大小不能超过${formatFileSize(MAX_UPLOAD_SIZE)}`);
        return false;
      }

      setFileList([file]);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <Card title="上传论文">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ paper_type: PAPER_TYPES.GRADUATION }}
      >
        <Form.Item
          label="论文类型"
          name="paper_type"
          rules={[{ required: true, message: '请选择论文类型' }]}
        >
          <Radio.Group onChange={(e) => setPaperType(e.target.value)}>
            <Radio value={PAPER_TYPES.GRADUATION}>毕业论文</Radio>
            <Radio value={PAPER_TYPES.COURSE}>课程论文</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="论文标题"
          name="title"
          rules={[{ required: true, message: '请输入论文标题' }]}
        >
          <Input placeholder="请输入论文标题" />
        </Form.Item>

        <Form.Item
          label="学生姓名"
          name="student_name"
          rules={[{ required: true, message: '请输入学生姓名' }]}
        >
          <Input placeholder="请输入学生姓名" />
        </Form.Item>

        <Form.Item
          label="学号"
          name="student_number"
          rules={[{ required: true, message: '请输入学号' }]}
        >
          <Input placeholder="请输入学号" />
        </Form.Item>

        {paperType === PAPER_TYPES.GRADUATION ? (
          <>
            <Form.Item
              label="专业"
              name="major"
              rules={[{ required: true, message: '请输入专业' }]}
            >
              <Input placeholder="请输入专业" />
            </Form.Item>

            <Form.Item
              label="院系"
              name="department"
              rules={[{ required: true, message: '请输入院系' }]}
            >
              <Input placeholder="请输入院系" />
            </Form.Item>

            <Form.Item
              label="指导教师"
              name="advisor"
              rules={[{ required: true, message: '请输入指导教师' }]}
            >
              <Input placeholder="请输入指导教师姓名" />
            </Form.Item>

            <Form.Item
              label="学年"
              name="academic_year"
              rules={[{ required: true, message: '请输入学年' }]}
            >
              <Input placeholder="例如：2024" />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="课程名称"
              name="course_name"
              rules={[{ required: true, message: '请输入课程名称' }]}
            >
              <Input placeholder="请输入课程名称" />
            </Form.Item>

            <Form.Item
              label="课程代码"
              name="course_code"
              rules={[{ required: true, message: '请输入课程代码' }]}
            >
              <Input placeholder="请输入课程代码" />
            </Form.Item>

            <Form.Item
              label="学期"
              name="semester"
              rules={[{ required: true, message: '请选择学期' }]}
            >
              <Select placeholder="请选择学期">
                <Option value="2024-2025-1">2024-2025学年第一学期</Option>
                <Option value="2024-2025-2">2024-2025学年第二学期</Option>
                <Option value="2023-2024-1">2023-2024学年第一学期</Option>
                <Option value="2023-2024-2">2023-2024学年第二学期</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="任课教师"
              name="instructor"
              rules={[{ required: true, message: '请输入任课教师' }]}
            >
              <Input placeholder="请输入任课教师姓名" />
            </Form.Item>
          </>
        )}

        <Form.Item label="备注" name="description">
          <TextArea rows={4} placeholder="选填：其他说明" />
        </Form.Item>

        <Form.Item label="上传文件" required>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持.docx格式，文件大小不超过{formatFileSize(MAX_UPLOAD_SIZE)}
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} block>
            {uploading ? '上传中...' : '提交'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PaperUpload;
