import { useState, useEffect } from 'react';
import { Card, Form, Checkbox, Select, Button, message, Descriptions, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaperDetail } from '@/api/papers';
import { getTemplateList } from '@/api/templates';
import { submitCheck } from '@/api/check';
import { PAPER_TYPE_NAMES } from '@/utils/constants';

const { Option } = Select;

const CheckSubmit = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paper, setPaper] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadData();
  }, [paperId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const paperData = await getPaperDetail(paperId);
      setPaper(paperData);
      
      // 获取模板列表
      const templateData = await getTemplateList({
        template_type: paperData.paper_type,
      });
      setTemplates(templateData.data || []);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const result = await submitCheck({
        paper_id: parseInt(paperId),
        ...values,
      });
      
      message.success('检查任务已提交');
      // 跳转到检查状态页面
      navigate(`/check/status/${result.task_id}`);
    } catch (error) {
      message.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Spin tip="加载中..." />
      </Card>
    );
  }

  return (
    <Card title="提交检查任务">
      <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
        <Descriptions.Item label="论文标题" span={2}>{paper?.title}</Descriptions.Item>
        <Descriptions.Item label="论文类型">{PAPER_TYPE_NAMES[paper?.paper_type]}</Descriptions.Item>
        <Descriptions.Item label="学生姓名">{paper?.student_name}</Descriptions.Item>
      </Descriptions>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          check_title: true,
          check_format: true,
          check_content: true,
          check_duplicate: true,
          check_logic: true,
        }}
      >
        <Form.Item label="选择检查项" required>
          <Form.Item name="check_title" valuePropName="checked" noStyle>
            <Checkbox>题目检查</Checkbox>
          </Form.Item>
          <br />
          <Form.Item name="check_format" valuePropName="checked" noStyle>
            <Checkbox>格式检查</Checkbox>
          </Form.Item>
          <br />
          <Form.Item name="check_content" valuePropName="checked" noStyle>
            <Checkbox>内容质量检查</Checkbox>
          </Form.Item>
          <br />
          <Form.Item name="check_duplicate" valuePropName="checked" noStyle>
            <Checkbox>查重检测</Checkbox>
          </Form.Item>
          <br />
          <Form.Item name="check_logic" valuePropName="checked" noStyle>
            <Checkbox>逻辑一致性检查</Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item
          label="选择模板"
          name="template_id"
          rules={[{ required: true, message: '请选择检查模板' }]}
        >
          <Select placeholder="请选择模板">
            {templates.map((template) => (
              <Option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            提交检查
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CheckSubmit;
