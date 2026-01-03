import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { getTemplateList, uploadTemplate, updateTemplate, deleteTemplate } from '@/api/templates';
import { formatDateTime } from '@/utils/format';
import { TEMPLATE_TYPES } from '@/utils/constants';
import {
  Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Input, Select, Badge, Modal, Label, Loading, Textarea,
  ConfirmDialog, useToast, FileUpload
} from '@/components/ui';

const TemplateList = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_type: '',
    visibility: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTemplateList({});
      setDataSource(res.data || []);
    } catch (error) {
      showToast('加载模板列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setFileList([]);
    setFormData({
      name: '',
      description: '',
      template_type: '',
      visibility: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTemplate(record);
    setFormData({
      name: record.name,
      description: record.description,
      template_type: record.template_type,
      visibility: record.visibility,
    });
    setModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await deleteTemplate(deleteConfirm.id);
      showToast('删除成功', 'success');
      setDeleteConfirm({ open: false, id: null });
      loadData();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.description || !formData.template_type || !formData.visibility) {
      showToast('请填写所有必填字段', 'error');
      return;
    }

    try {
      setUploading(true);

      if (editingTemplate) {
        // Edit template
        await updateTemplate(editingTemplate.id, formData);
        showToast('更新成功', 'success');
      } else {
        // New template
        if (fileList.length === 0) {
          showToast('请上传模板文件', 'error');
          setUploading(false);
          return;
        }

        const formDataObj = new FormData();
        formDataObj.append('file', fileList[0]);
        Object.keys(formData).forEach(key => {
          formDataObj.append(key, formData[key]);
        });

        await uploadTemplate(formDataObj);
        showToast('上传成功', 'success');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      showToast('操作失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>模板管理</CardTitle>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              上传模板
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading && dataSource.length === 0 ? (
            <Loading text="加载中..." />
          ) : dataSource.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>暂无模板数据</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模板名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>可见性</TableHead>
                  <TableHead>上传时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSource.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>
                      <Badge variant={record.template_type === 'graduation' ? 'default' : 'secondary'}>
                        {record.template_type === 'graduation' ? '毕业论文' : '课程论文'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.visibility === 'public' ? 'success' : 'warning'}>
                        {record.visibility === 'public' ? '公开' : '私有'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(record.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(record)}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ open: true, id: record.id })}
                          className="gap-1 text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingTemplate ? '编辑模板' : '上传模板'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalVisible(false)} disabled={uploading}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? '提交中...' : '确定'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">模板名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入模板名称"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">描述 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请输入模板描述"
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="template_type">模板类型 *</Label>
            <Select
              id="template_type"
              value={formData.template_type}
              onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value }))}
              className="mt-2"
            >
              <option value="">请选择模板类型</option>
              <option value="graduation">毕业论文</option>
              <option value="course">课程论文</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="visibility">可见性 *</Label>
            <Select
              id="visibility"
              value={formData.visibility}
              onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
              className="mt-2"
            >
              <option value="">请选择可见性</option>
              <option value="public">公开</option>
              <option value="private">私有</option>
            </Select>
          </div>

          {!editingTemplate && (
            <div>
              <Label>上传文件 *</Label>
              <FileUpload
                value={fileList}
                onChange={setFileList}
                accept=".doc,.docx"
                className="mt-2"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="确认删除"
        message="确定要删除这个模板吗？删除后无法恢复。"
        confirmText="确认删除"
      />
    </div>
  );
};

export default TemplateList;
