import { Tag } from 'antd';
import { RecipeStatus } from '../../types/enums';

interface StatusBadgeProps {
  status: RecipeStatus;
}

const statusMeta: Record<RecipeStatus, { color: string; label: string }> = {
  [RecipeStatus.Draft]: { color: 'gold', label: '草稿' },
  [RecipeStatus.Published]: { color: 'green', label: '已发布' },
  [RecipeStatus.Archived]: { color: 'default', label: '已归档' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = statusMeta[status];
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
