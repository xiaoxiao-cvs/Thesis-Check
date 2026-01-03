import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search as SearchIcon, Trash2, CheckCircle, Eye, FileText } from 'lucide-react';
import { getPaperList, deletePaper } from '@/api/papers';
import { formatDateTime } from '@/utils/format';
import { PAPER_TYPE_NAMES } from '@/utils/constants';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, Select, Loading, useToast, ConfirmDialog } from '@/components/ui';
import useLoading from '@/hooks/useLoading';
import { handleBatchErrors } from '@/utils/errorHandler';

const PaperList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, withLoading } = useLoading(true);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    paper_type: '',
    search: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, batch: false });
  const [searchValue, setSearchValue] = useState('');
  
  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize, filters]);
  
  const loadData = async () => {
    await withLoading(async () => {
      try {
        const params = {
          page: pagination.current,
          page_size: pagination.pageSize,
          ...filters,
        };
        
        const res = await getPaperList(params);
        setDataSource(res.data || []);
        setPagination(prev => ({ ...prev, total: res.total || 0 }));
      } catch (error) {
        toast.error('加载论文列表失败，请稍后重试');
      }
    });
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchValue }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };
  
  const handleDelete = async () => {
    const { id, batch } = deleteConfirm;
    
    if (batch) {
      // 批量删除
      try {
        const deletePromises = Array.from(selectedRows).map(id => 
          deletePaper(id).catch(error => ({ error, id }))
        );
        
        const results = await Promise.allSettled(deletePromises);
        const summary = handleBatchErrors(results);
        
        if (summary.success > 0) {
          toast.success(`成功删除 ${summary.success} 篇论文`);
        }
        
        if (summary.failed > 0) {
          toast.error(`${summary.failed} 篇论文删除失败`);
        }
        
        setSelectedRows(new Set());
        loadData();
      } catch (error) {
        toast.error('批量删除失败');
      }
    } else {
      // 单个删除
      try {
        await deletePaper(id);
        toast.success('删除成功');
        loadData();
      } catch (error) {
        toast.error(error.message || '删除失败，请稍后重试');
      }
    }
  };

  const toggleRowSelection = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === dataSource.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(dataSource.map(item => item.id)));
    }
  };
  
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>论文列表</CardTitle>
            <Button onClick={() => navigate('/papers/upload')} className="gap-2">
              <Plus className="h-4 w-4" />
              上传论文
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索论文标题或学生"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.paper_type}
              onChange={(e) => setFilters(prev => ({ ...prev, paper_type: e.target.value }))}
              className="w-full sm:w-32"
            >
              <option value="">所有类型</option>
              <option value="graduation">毕业论文</option>
              <option value="course">课程论文</option>
            </Select>
            <Button onClick={handleSearch} variant="outline">搜索</Button>
            {selectedRows.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirm({ open: true, batch: true })}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                删除 ({selectedRows.size})
              </Button>
            )}
          </div>

          {/* Table */}
          {loading && dataSource.length === 0 ? (
            <Loading text="加载中..." />
          ) : dataSource.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>暂无论文数据</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === dataSource.length && dataSource.length > 0}
                        onChange={toggleAllRows}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>论文标题</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>学生姓名</TableHead>
                    <TableHead>上传时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSource.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(record.id)}
                          onChange={() => toggleRowSelection(record.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{record.title}</TableCell>
                      <TableCell>
                        <Badge variant={record.paper_type === 'graduation' ? 'default' : 'secondary'}>
                          {PAPER_TYPE_NAMES[record.paper_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{formatDateTime(record.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/papers/${record.id}`)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            详情
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/check/submit/${record.id}`)}
                            className="gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            检查
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm({ open: true, id: record.id, batch: false })}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, batch: false })}
        onConfirm={handleDelete}
        title="确认删除"
        message={
          deleteConfirm.batch
            ? `确定要删除选中的 ${selectedRows.size} 篇论文吗？删除后无法恢复。`
            : '确定要删除这篇论文吗？删除后无法恢复。'
        }
        confirmText="确认删除"
      />
    </div>
  );
};

export default PaperList;
