import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, FileDown, Search as SearchIcon } from 'lucide-react';
import { getResultList } from '@/api/results';
import { formatDateTime } from '@/utils/format';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Input, Loading, useToast } from '@/components/ui';
import GradeTag from '@/components/GradeTag';
import useLoading from '@/hooks/useLoading';
import { exportTableData } from '@/utils/export';

const ResultList = () => {
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
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    await withLoading(async () => {
      try {
        const params = {
          page: pagination.current,
          page_size: pagination.pageSize,
          search: searchValue,
        };
        
        const res = await getResultList(params);
        setDataSource(res.data || []);
        setPagination(prev => ({ ...prev, total: res.total || 0 }));
      } catch (error) {
        toast.error('加载检查结果失败，请稍后重试');
      }
    });
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadData();
  };

  // 批量导出
  const handleBatchExport = () => {
    if (selectedRows.size === 0) {
      toast.warning('请先选择要导出的结果');
      return;
    }

    // 筛选选中的数据
    const exportData = dataSource.filter(item => selectedRows.has(item.id));
    
    // 导出为CSV
    const result = exportTableData(
      exportData,
      ['paper_title', 'created_at', 'overall_grade', 'duplicate_rate', 'problem_count'],
      `检查结果_${new Date().toISOString().split('T')[0]}`,
      'csv'
    );

    if (result.success) {
      toast.success(`已导出 ${selectedRows.size} 条结果`);
      setSelectedRows(new Set());
    } else {
      toast.error(result.message);
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

  const getDuplicateColor = (rate) => {
    const percent = rate * 100;
    if (percent > 30) return 'destructive';
    if (percent > 15) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>检查结果</CardTitle>
          {selectedRows.size > 0 && (
            <Button
              onClick={handleBatchExport}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              导出 ({selectedRows.size})
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索论文标题"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>搜索</Button>
        </div>
        
        {loading && dataSource.length === 0 ? (
          <Loading text="加载中..." />
        ) : dataSource.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileDown className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>暂无检查结果</p>
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
                  <TableHead>检查时间</TableHead>
                  <TableHead>评级</TableHead>
                  <TableHead>查重率</TableHead>
                  <TableHead>问题数</TableHead>
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
                    <TableCell className="font-medium">{record.paper_title}</TableCell>
                    <TableCell>{formatDateTime(record.created_at)}</TableCell>
                    <TableCell>
                      <GradeTag grade={record.overall_grade} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={getDuplicateColor(record.duplicate_rate)}>
                        {(record.duplicate_rate * 100).toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{record.problem_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/results/${record.id}`)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        详情
                      </Button>
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
  );
};

export default ResultList;
