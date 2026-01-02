import { Skeleton, Table } from 'antd';

const TableSkeleton = ({ columns = 5, rows = 10 }) => {
  const skeletonColumns = Array.from({ length: columns }, (_, index) => ({
    title: <Skeleton.Input active size="small" style={{ width: 100 }} />,
    dataIndex: `col${index}`,
    key: `col${index}`,
    render: () => <Skeleton.Input active size="small" style={{ width: '100%' }} />,
  }));

  const skeletonData = Array.from({ length: rows }, (_, index) => ({
    key: index,
  }));

  return (
    <Table
      columns={skeletonColumns}
      dataSource={skeletonData}
      pagination={false}
      showHeader={true}
    />
  );
};

export default TableSkeleton;
