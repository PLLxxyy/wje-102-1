import { Button, Empty, Select, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RecipeCard } from '../components/common/RecipeCard';
import { DifficultyLevel, RecipeCategory } from '../types/enums';
import { useRecipeStore } from '../stores/useRecipeStore';

export function Home() {
  const { recipes, loading, fetchRecipes } = useRecipeStore();
  const [category, setCategory] = useState<RecipeCategory | undefined>();
  const [difficulty, setDifficulty] = useState<DifficultyLevel | undefined>();

  useEffect(() => {
    void fetchRecipes({ category, difficulty });
  }, [category, difficulty, fetchRecipes]);

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
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>
      {!loading && recipes.length === 0 ? <Empty description="暂无匹配菜谱" /> : null}
    </main>
  );
}
