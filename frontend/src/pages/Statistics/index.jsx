import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, DatePicker, Spin, message } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getStatisticsOverview, getStatisticsByDepartment, getStatisticsByTeacher } from '@/api/statistics';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { USER_ROLES } from '@/utils/constants';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Statistics = () => {
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const isDirector = hasPermission(USER_ROLES.DIRECTOR);
  const isDean = hasPermission(USER_ROLES.DEAN);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
      };

      // 加载总览数据
      const overviewRes = await getStatisticsOverview(params);
      setOverviewData(overviewRes.data);

      // 根据权限加载不同数据
      if (isDean) {
        const deptRes = await getStatisticsByDepartment(params);
        setDepartmentData(deptRes.data || []);
      }

      if (isDirector || isDean) {
        const teacherRes = await getStatisticsByTeacher(params);
        setTeacherData(teacherRes.data || []);
      }
    } catch (error) {
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 总览卡片配置
  const getOverviewOption = () => {
    if (!overviewData) return {};
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '检查状态',
          type: 'pie',
          radius: '50%',
          data: [
            { value: overviewData.completed_count, name: '已完成' },
            { value: overviewData.pending_count, name: '检查中' },
            { value: overviewData.failed_count, name: '失败' },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  // 成绩分布图
  const getGradeDistributionOption = () => {
    if (!overviewData?.grade_distribution) return {};

    const grades = ['优秀', '良好', '中等', '及格', '不及格'];
    const counts = [
      overviewData.grade_distribution.excellent || 0,
      overviewData.grade_distribution.good || 0,
      overviewData.grade_distribution.medium || 0,
      overviewData.grade_distribution.pass || 0,
      overviewData.grade_distribution.fail || 0,
    ];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: grades,
      },
      yAxis: {
        type: 'value',
        name: '数量'
      },
      series: [
        {
          name: '成绩分布',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: (params) => {
              const colors = ['#52c41a', '#1890ff', '#faad14', '#fa8c16', '#f5222d'];
              return colors[params.dataIndex];
            }
          }
        }
      ]
    };
  };

  // 院系对比图
  const getDepartmentComparisonOption = () => {
    if (!departmentData.length) return {};

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['论文数', '平均成绩', '优秀率']
      },
      xAxis: {
        type: 'category',
        data: departmentData.map(d => d.department_name),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '数量',
          position: 'left',
        },
        {
          type: 'value',
          name: '百分比',
          position: 'right',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: '论文数',
          type: 'bar',
          data: departmentData.map(d => d.paper_count)
        },
        {
          name: '优秀率',
          type: 'line',
          yAxisIndex: 1,
          data: departmentData.map(d => d.excellent_rate)
        }
      ]
    };
  };

  // 教师统计图
  const getTeacherStatOption = () => {
    if (!teacherData.length) return {};

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: teacherData.slice(0, 10).map(t => t.teacher_name),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '数量'
      },
      series: [
        {
          name: '检查次数',
          type: 'bar',
          data: teacherData.slice(0, 10).map(t => t.check_count),
          itemStyle: {
            color: '#1890ff'
          }
        }
      ]
    };
  };

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px' }}>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="YYYY-MM-DD"
            />
          </div>

          {overviewData && (
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="论文总数"
                  value={overviewData.total_papers}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已完成"
                  value={overviewData.completed_count}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="检查中"
                  value={overviewData.pending_count}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="失败"
                  value={overviewData.failed_count}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          )}
        </Card>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="检查状态分布" style={{ marginBottom: 16 }}>
              <ReactECharts option={getOverviewOption()} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="成绩分布" style={{ marginBottom: 16 }}>
              <ReactECharts option={getGradeDistributionOption()} style={{ height: 300 }} />
            </Card>
          </Col>
        </Row>

        {isDean && departmentData.length > 0 && (
          <Card title="院系对比" style={{ marginBottom: 16 }}>
            <ReactECharts option={getDepartmentComparisonOption()} style={{ height: 400 }} />
          </Card>
        )}

        {(isDirector || isDean) && teacherData.length > 0 && (
          <Card title="教师检查统计（Top 10）">
            <ReactECharts option={getTeacherStatOption()} style={{ height: 400 }} />
          </Card>
        )}
      </div>
    </Spin>
  );
};

export default Statistics;
