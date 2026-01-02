import { Card, Skeleton } from 'antd';

const CardSkeleton = ({ count = 1, loading = true, children }) => {
  if (!loading) {
    return children;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} style={{ marginBottom: 16 }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ))}
    </>
  );
};

export default CardSkeleton;
