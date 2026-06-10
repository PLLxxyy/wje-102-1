import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm, Select, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recipeApi } from '../api/recipe';
import { RecipeCard } from '../components/common/RecipeCard';
import { RecipeStatus } from '../types/enums';
import { useRecipeStore } from '../stores/useRecipeStore';

export function MyRecipes() {
  const { myRecipes, loading, fetchMyRecipes } = useRecipeStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchMyRecipes(search);
  }, [fetchMyRecipes, search]);

  const updateStatus = async (id: number, status: RecipeStatus) => {
    await recipeApi.updateStatus(id, status);
    message.success('状态已更新');
    await fetchMyRecipes(search);
  };

  const removeRecipe = async (id: number) => {
    await recipeApi.remove(id);
    message.success('菜谱已删除');
    await fetchMyRecipes(search);
  };

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <Typography.Title>我的菜谱</Typography.Title>
          <Typography.Paragraph type="secondary">管理草稿、发布状态和协作编辑入口。</Typography.Paragraph>
        </div>
        <Button type="primary">
          <Link to="/recipe/create">新建菜谱</Link>
        </Button>
      </section>
      <section className="toolbar-band">
        <Input.Search
          allowClear
          aria-label="搜索我的菜谱"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>
      <section className="recipe-grid" aria-busy={loading}>
        {myRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            actions={
              <Space wrap>
                <Select
                  size="small"
                  value={recipe.status}
                  onChange={(status) => void updateStatus(recipe.id, status)}
                  options={Object.values(RecipeStatus).map((value) => ({ label: value, value }))}
                />
                <Button size="small" icon={<EditOutlined />}>
                  <Link to={`/recipe/${recipe.id}/edit`}>协作编辑</Link>
                </Button>
                <Popconfirm title="删除该菜谱？" onConfirm={() => void removeRecipe(recipe.id)}>
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            }
          />
        ))}
      </section>
    </main>
  );
}
