import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPaperList } from '@/api/papers';
import { getResultList } from '@/api/results';
import { formatDateTime } from '@/utils/format';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Loading, useToast } from '@/components/ui';
import GradeTag from '@/components/GradeTag';
import useLoading from '@/hooks/useLoading';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { loading, withLoading } = useLoading(true);
  const [stats, setStats] = useState({
    totalPapers: 0,
    checkingPapers: 0,
    completedChecks: 0,
    problemCount: 0,
  });
  const [recentPapers, setRecentPapers] = useState([]);
  
  // 加载统计数据
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    await withLoading(async () => {
      try {
        // 获取论文列表
        const paperRes = await getPaperList({ page: 1, page_size: 5 });
        setRecentPapers(paperRes.data || []);
        setStats(prev => ({ ...prev, totalPapers: paperRes.total || 0 }));
        
        // 获取检查结果
        const resultRes = await getResultList({ page: 1, page_size: 100 });
        const results = resultRes.data || [];
        setStats(prev => ({
          ...prev,
          completedChecks: results.length,
          problemCount: results.reduce((sum, r) => sum + (r.problem_count || 0), 0),
        }));
      } catch (error) {
        toast.error('加载仪表盘数据失败，请刷新页面');
      }
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
            {trend && (
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">
          欢迎回来，{user?.nickname || user?.username}！
        </h2>
        <p className="text-muted-foreground">
          今天是 {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long' 
          })}
        </p>
      </div>
      
      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="我的论文"
            value={stats.totalPapers}
            icon={FileText}
            color="#3b82f6"
          />
          <StatCard
            title="检查中"
            value={stats.checkingPapers}
            icon={Clock}
            color="#f59e0b"
          />
          <StatCard
            title="已完成"
            value={stats.completedChecks}
            icon={CheckCircle}
            color="#10b981"
          />
          <StatCard
            title="问题总数"
            value={stats.problemCount}
            icon={AlertTriangle}
            color="#ef4444"
          />
        </div>
      )}
      
      {/* Recent Papers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最近论文</CardTitle>
          <Button variant="ghost" onClick={() => navigate('/papers/list')}>
            查看全部
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading text="加载中..." />
          ) : recentPapers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>暂无论文数据</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>论文标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>上传时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPapers.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell className="font-medium">{paper.title}</TableCell>
                    <TableCell>
                      <Badge variant={paper.paper_type === 'graduation' ? 'default' : 'secondary'}>
                        {paper.paper_type === 'graduation' ? '毕业论文' : '课程论文'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(paper.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/papers/${paper.id}`)}
                      >
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
