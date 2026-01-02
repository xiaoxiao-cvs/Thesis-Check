import { Tag } from 'antd';
import { GRADE_NAMES, GRADE_COLORS } from '@/utils/constants';

/**
 * 评级标签组件
 * @param {string} grade 评级
 */
const GradeTag = ({ grade }) => {
  if (!grade) return null;
  
  return (
    <Tag color={GRADE_COLORS[grade]}>
      {GRADE_NAMES[grade]}
    </Tag>
  );
};

export default GradeTag;
