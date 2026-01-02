import { Tag } from 'antd';
import { PROBLEM_SEVERITY_NAMES, PROBLEM_SEVERITY_COLORS } from '@/utils/constants';

/**
 * 问题严重程度标签组件
 * @param {string} severity 严重程度
 */
const SeverityTag = ({ severity }) => {
  if (!severity) return null;
  
  return (
    <Tag color={PROBLEM_SEVERITY_COLORS[severity]}>
      {PROBLEM_SEVERITY_NAMES[severity]}
    </Tag>
  );
};

export default SeverityTag;
