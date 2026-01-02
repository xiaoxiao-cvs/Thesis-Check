import { Card, Skeleton, Row, Col } from 'antd';

const StatisticSkeleton = ({ count = 4 }) => {
  return (
    <Row gutter={16}>
      {Array.from({ length: count }).map((_, index) => (
        <Col key={index} xs={24} sm={12} lg={6}>
          <Card>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatisticSkeleton;
