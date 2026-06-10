import { ClockCircleOutlined, FireOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Card, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Recipe } from '../../types/recipe';
import { StatusBadge } from './StatusBadge';

interface RecipeCardProps {
  recipe: Recipe;
  actions?: React.ReactNode;
}

export function RecipeCard({ recipe, actions }: RecipeCardProps) {
  const totalMinutes = recipe.steps.reduce((sum, step) => sum + (step.duration_minutes ?? 0), 0);
  return (
    <Card className="recipe-card" hoverable actions={actions ? [actions] : undefined}>
      <Space direction="vertical" size={12} className="full-width">
        <Space wrap>
          <StatusBadge status={recipe.status} />
          <Typography.Text type="secondary">{recipe.category}</Typography.Text>
          <Typography.Text type="secondary">{recipe.difficulty}</Typography.Text>
        </Space>
        <Link to={`/recipe/${recipe.id}`}>
          <Typography.Title level={3}>{recipe.title}</Typography.Title>
        </Link>
        <Typography.Paragraph ellipsis={{ rows: 2 }}>{recipe.description}</Typography.Paragraph>
        <Space wrap className="recipe-meta">
          <span>
            <TeamOutlined /> {recipe.servings} 人份
          </span>
          <span>
            <ClockCircleOutlined /> {totalMinutes || 0} 分钟
          </span>
          <span>
            <FireOutlined /> {Math.round(recipe.total_calories ?? 0)} kcal
          </span>
        </Space>
        <Space className="recipe-card-footer">
          <Typography.Text type="secondary">作者：{recipe.author?.username ?? '未知'}</Typography.Text>
          <Button type="link" size="small">
            <Link to={`/recipe/${recipe.id}`}>查看</Link>
          </Button>
        </Space>
      </Space>
    </Card>
  );
}
