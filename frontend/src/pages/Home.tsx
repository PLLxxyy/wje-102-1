import { CopyOutlined } from '@ant-design/icons';
import { Button, Empty, Select, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeApi } from '../api/recipe';
import { RecipeCard } from '../components/common/RecipeCard';
import { RecipeStatus } from '../types/enums';
import { DifficultyLevel, RecipeCategory } from '../types/enums';
import { useRecipeStore } from '../stores/useRecipeStore';
import { useUserStore } from '../stores/useUserStore';

export function Home() {
  const { recipes, loading, fetchRecipes } = useRecipeStore();
  const { currentUser } = useUserStore();
  const navigate = useNavigate();
  const [category, setCategory] = useState<RecipeCategory | undefined>();
  const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>();

  useEffect(() => {
    void fetchRecipes({ category, difficulty });
  }, [category, difficulty, fetchRecipes]);

  const handleReference = async (recipeId: number) => {
    const created = await recipeApi.reference(recipeId);
    message.success('已引用为草稿');
    navigate(`/recipe/${created.id}/edit`);
  };

  return (
    <main className="page-shell">
      <section className="workspace-hero">
        <div>
          <Typography.Text className="eyebrow">Recipe Co-creation Studio</Typography.Text>
          <Typography.Title>菜谱共创工坊</Typography.Title>
          <Typography.Paragraph>
            把食材、步骤、营养和协作者放进同一个工作台，快速沉淀可复现的家庭菜谱。
          </Typography.Paragraph>
        </div>
        <Button type="primary" size="large">
          <Link to="/recipe/create">创建菜谱</Link>
        </Button>
      </section>

      <section className="toolbar-band">
        <Space wrap>
          <Select
            allowClear
            aria-label="分类"
            value={category}
            onChange={setCategory}
            options={Object.values(RecipeCategory).map((value) => ({ label: value, value }))}
          />
          <Select
            allowClear
            aria-label="难度"
            value={difficulty}
            onChange={setDifficulty}
            options={Object.values(DifficultyLevel).map((value) => ({ label: value, value }))}
          />
        </Space>
      </section>

      <section className="recipe-grid" aria-busy={loading}>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            actions={
              currentUser && recipe.status === RecipeStatus.Published ? (
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => void handleReference(recipe.id)}
                >
                  引用为草稿
                </Button>
              ) : undefined
            }
          />
        ))}
      </section>
      {!loading && recipes.length === 0 ? <Empty description="暂无匹配菜谱" /> : null}
    </main>
  );
}
