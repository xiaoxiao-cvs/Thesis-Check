import { useState, useEffect } from 'react';
import { Search as SearchIcon, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { getUserList, updateUserRole, deleteUser } from '@/api/users';
import { formatDateTime } from '@/utils/format';
import { ROLE_NAMES, USER_ROLES } from '@/utils/constants';
import { 
  Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Input, Select, Badge, Modal, Label, Loading,
  ConfirmDialog, useToast
} from '@/components/ui';

const UserList = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    role: '',
    search: '',
  });
  const [searchValue, setSearchValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters,
      };
      
      const res = await getUserList(params);
      setDataSource(res.items || []);
      setPagination(prev => ({ ...prev, total: res.total || 0 }));
    } catch (error) {
      showToast('加载用户列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchValue }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleEditRole = (record) => {
    setEditingUser(record);
    setEditRole(record.role);
    setModalVisible(true);
  };

  const handleUpdateRole = async () => {
    if (!editRole) {
      showToast('请选择角色', 'error');
      return;
    }
    try {
      await updateUserRole(editingUser.id, { role: editRole });
      showToast('角色更新成功', 'success');
      setModalVisible(false);
      loadData();
    } catch (error) {
      showToast('更新失败', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteConfirm.id);
      showToast('删除成功', 'success');
      setDeleteConfirm({ open: false, id: null });
      loadData();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      student: 'default',
      teacher: 'info',
      director: 'warning',
      dean: 'warning',
      admin: 'destructive',
    };
    return variants[role] || 'default';
  };

  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名或邮箱"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="w-full sm:w-40"
            >
              <option value="">所有角色</option>
              <option value="student">学生</option>
              <option value="teacher">教师</option>
              <option value="director">主任</option>
              <option value="dean">院长</option>
              <option value="admin">管理员</option>
            </Select>
            <Button onClick={handleSearch} variant="outline">搜索</Button>
          </div>

          {/* Table */}
          {loading && dataSource.length === 0 ? (
            <Loading text="加载中..." />
          ) : dataSource.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>暂无用户数据</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>昵称</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>院系</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSource.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.username}</TableCell>
                      <TableCell>{record.nickname}</TableCell>
                      <TableCell>{record.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(record.role)}>
                          {ROLE_NAMES[record.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{formatDateTime(record.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(record)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            改角色
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  共 {pagination.total} 条记录
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current === 1}
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                  >
                    上一页
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    第 {pagination.current} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Modal */}
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        title="修改用户角色"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalVisible(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateRole}>
              确定
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>用户名</Label>
            <div className="mt-2 text-sm text-muted-foreground">{editingUser?.username}</div>
          </div>
          <div>
            <Label htmlFor="role">角色</Label>
            <Select
              id="role"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="mt-2"
            >
              <option value="">请选择角色</option>
              <option value={USER_ROLES.STUDENT}>学生</option>
              <option value={USER_ROLES.TEACHER}>教师</option>
              <option value={USER_ROLES.DIRECTOR}>主任</option>
              <option value={USER_ROLES.DEAN}>院长</option>
              <option value={USER_ROLES.ADMIN}>管理员</option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="确认删除"
        message="确定要删除这个用户吗？删除后无法恢复。"
        confirmText="确认删除"
      />
    </div>
  );
};

export default UserList;
