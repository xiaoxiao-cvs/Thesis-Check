import { useState, useEffect } from 'react';
import { Plus, Edit, Lock, Unlock, Settings } from 'lucide-react';
import { getParameterList, createParameter, updateParameter, lockParameter } from '@/api/parameters';
import { formatDateTime } from '@/utils/format';
import { usePermission } from '@/hooks/usePermission';
import { USER_ROLES } from '@/utils/constants';
import {
  Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Input, Select, Badge, Modal, Label, Loading, Textarea,
  useToast, NumberInput
} from '@/components/ui';

const ParameterList = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const { checkPermission } = usePermission();
  const isDean = checkPermission(USER_ROLES.DEAN);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duplicate_rate_threshold: undefined,
    format_threshold: undefined,
    title_threshold: undefined,
    content_threshold: undefined,
    logic_threshold: undefined,
    application_scope: '',
    scope_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getParameterList({});
      setDataSource(res.data || []);
    } catch (error) {
      showToast('加载参数列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingParam(null);
    setFormData({
      name: '',
      description: '',
      duplicate_rate_threshold: undefined,
      format_threshold: undefined,
      title_threshold: undefined,
      content_threshold: undefined,
      logic_threshold: undefined,
      application_scope: '',
      scope_id: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    if (record.is_locked && !isDean) {
      showToast('该参数已锁定，仅院长可修改', 'warning');
      return;
    }
    setEditingParam(record);
    setFormData({
      name: record.name,
      description: record.description || '',
      duplicate_rate_threshold: record.duplicate_rate_threshold,
      format_threshold: record.format_threshold,
      title_threshold: record.title_threshold,
      content_threshold: record.content_threshold,
      logic_threshold: record.logic_threshold,
      application_scope: record.application_scope,
      scope_id: record.scope_id || '',
    });
    setModalVisible(true);
  };

  const handleLock = async (id, lock) => {
    try {
      await lockParameter(id, { lock });
      showToast(lock ? '锁定成功' : '解锁成功', 'success');
      loadData();
    } catch (error) {
      showToast('操作失败', 'error');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.application_scope) {
      showToast('请填写所有必填字段', 'error');
      return;
    }
    
    if (
      formData.duplicate_rate_threshold === undefined ||
      formData.format_threshold === undefined ||
      formData.title_threshold === undefined ||
      formData.content_threshold === undefined ||
      formData.logic_threshold === undefined
    ) {
      showToast('请填写所有阈值', 'error');
      return;
    }
    
    try {
      if (editingParam) {
        await updateParameter(editingParam.id, formData);
        showToast('更新成功', 'success');
      } else {
        await createParameter(formData);
        showToast('创建成功', 'success');
      }
      
      setModalVisible(false);
      loadData();
    } catch (error) {
      showToast('操作失败', 'error');
    }
  };


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>参数设置</CardTitle>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              新增参数
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading && dataSource.length === 0 ? (
            <Loading text="加载中..." />
          ) : dataSource.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>暂无参数数据</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>参数名称</TableHead>
                  <TableHead>重复率阈值</TableHead>
                  <TableHead>格式阈值</TableHead>
                  <TableHead>适用范围</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSource.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.duplicate_rate_threshold}%</TableCell>
                    <TableCell>{record.format_threshold}%</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          record.application_scope === 'global' ? 'default' :
                          record.application_scope === 'department' ? 'success' : 'warning'
                        }
                      >
                        {record.application_scope === 'global' ? '全局' :
                         record.application_scope === 'department' ? '院系' : '专业'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.is_locked ? 'destructive' : 'success'}>
                        {record.is_locked ? '已锁定' : '未锁定'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(record.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(record)}
                          disabled={record.is_locked && !isDean}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          编辑
                        </Button>
                        {isDean && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLock(record.id, !record.is_locked)}
                            className="gap-1"
                          >
                            {record.is_locked ? (
                              <>
                                <Unlock className="h-4 w-4" />
                                解锁
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                锁定
                              </>
                            )}
                          </Button>
                        )}
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
        title={editingParam ? '编辑参数' : '新增参数'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalVisible(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              确定
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="name">参数名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入参数名称"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请输入描述"
              rows={2}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duplicate_rate_threshold">重复率阈值 (%) *</Label>
              <NumberInput
                id="duplicate_rate_threshold"
                value={formData.duplicate_rate_threshold}
                onChange={(val) => setFormData(prev => ({ ...prev, duplicate_rate_threshold: val }))}
                min={0}
                max={100}
                placeholder="0-100"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="format_threshold">格式检查阈值 (%) *</Label>
              <NumberInput
                id="format_threshold"
                value={formData.format_threshold}
                onChange={(val) => setFormData(prev => ({ ...prev, format_threshold: val }))}
                min={0}
                max={100}
                placeholder="0-100"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title_threshold">标题检查阈值 (%) *</Label>
              <NumberInput
                id="title_threshold"
                value={formData.title_threshold}
                onChange={(val) => setFormData(prev => ({ ...prev, title_threshold: val }))}
                min={0}
                max={100}
                placeholder="0-100"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="content_threshold">内容检查阈值 (%) *</Label>
              <NumberInput
                id="content_threshold"
                value={formData.content_threshold}
                onChange={(val) => setFormData(prev => ({ ...prev, content_threshold: val }))}
                min={0}
                max={100}
                placeholder="0-100"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="logic_threshold">逻辑检查阈值 (%) *</Label>
            <NumberInput
              id="logic_threshold"
              value={formData.logic_threshold}
              onChange={(val) => setFormData(prev => ({ ...prev, logic_threshold: val }))}
              min={0}
              max={100}
              placeholder="0-100"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="application_scope">适用范围 *</Label>
            <Select
              id="application_scope"
              value={formData.application_scope}
              onChange={(e) => setFormData(prev => ({ ...prev, application_scope: e.target.value }))}
              className="mt-2"
            >
              <option value="">请选择适用范围</option>
              <option value="global">全局</option>
              <option value="department">院系</option>
              <option value="major">专业</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="scope_id">范围ID</Label>
            <Input
              id="scope_id"
              value={formData.scope_id}
              onChange={(e) => setFormData(prev => ({ ...prev, scope_id: e.target.value }))}
              placeholder="如选择院系/专业，请输入对应ID"
              className="mt-2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ParameterList;
