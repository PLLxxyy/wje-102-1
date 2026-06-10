import { SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Select, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeApi } from '../api/recipe';
import { IngredientSelector } from '../components/common/IngredientSelector';
import { NutritionCard } from '../components/common/NutritionCard';
import { StepEditor } from '../components/common/StepEditor';
import { useNutritionCalc } from '../hooks/useNutritionCalc';
import { useIngredientStore } from '../stores/useIngredientStore';
import { DifficultyLevel, RecipeCategory, RecipeStatus } from '../types/enums';
import { RecipeIngredientInput, RecipePayload, RecipeStepInput } from '../types/recipe';

interface RecipeFormValues {
  title: string;
  description: string;
  category: RecipeCategory;
  servings: number;
  difficulty: DifficultyLevel;
  cover_image?: string;
  status: RecipeStatus;
}

const initialSteps: RecipeStepInput[] = [
  {
    step_number: 1,
    description: '',
    image_url: null,
    duration_minutes: 5,
  },
];

export function RecipeCreate() {
  const navigate = useNavigate();
  const { ingredients, fetchIngredients } = useIngredientStore();
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredientInput[]>([]);
  const [steps, setSteps] = useState<RecipeStepInput[]>(initialSteps);
  const nutrition = useNutritionCalc(selectedIngredients, ingredients);

  useEffect(() => {
    void fetchIngredients();
  }, [fetchIngredients]);

  const onFinish = async (values: RecipeFormValues) => {
    if (selectedIngredients.length === 0 || steps.some((step) => !step.description.trim())) {
      message.warning('请补齐食材和步骤描述');
      return;
    }
    const payload: RecipePayload = {
      ...values,
      cover_image: values.cover_image?.trim() || null,
      ingredients: selectedIngredients,
      steps,
    };
    const recipe = await recipeApi.create(payload);
    message.success('菜谱已创建');
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <Typography.Title>创建菜谱</Typography.Title>
          <Typography.Paragraph type="secondary">先确定结构，再让营养估算跟着食材用量实时变化。</Typography.Paragraph>
        </div>
      </section>
      <Form
        layout="vertical"
        className="recipe-form-grid"
        initialValues={{
          category: RecipeCategory.Meat,
          difficulty: DifficultyLevel.Easy,
          servings: 2,
          status: RecipeStatus.Draft,
        }}
        onFinish={onFinish}
      >
        <section className="form-panel">
          <Typography.Title level={4}>基础信息</Typography.Title>
          <Form.Item name="title" label="标题" rules={[{ required: true, max: 100 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="简介" rules={[{ required: true, max: 2000 }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Space wrap className="responsive-fields">
            <Form.Item name="category" label="分类" rules={[{ required: true }]}>
              <Select options={Object.values(RecipeCategory).map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="difficulty" label="难度" rules={[{ required: true }]}>
              <Select options={Object.values(DifficultyLevel).map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="servings" label="份数" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={Object.values(RecipeStatus).map((value) => ({ label: value, value }))} />
            </Form.Item>
          </Space>
          <Form.Item name="cover_image" label="封面图 URL">
            <Input />
          </Form.Item>
        </section>

        <IngredientSelector
          ingredients={ingredients}
          value={selectedIngredients}
          onChange={setSelectedIngredients}
        />
        <NutritionCard totals={nutrition} />
        <StepEditor value={steps} onChange={setSteps} />

        <div className="form-actions">
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            保存菜谱
          </Button>
        </div>
      </Form>
    </main>
  );
}
