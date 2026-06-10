import { CloudSyncOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Input,
  InputNumber,
  List,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { recipeApi } from '../api/recipe';
import { IngredientSelector } from '../components/common/IngredientSelector';
import { NutritionCard } from '../components/common/NutritionCard';
import { StepEditor } from '../components/common/StepEditor';
import { useNutritionCalc } from '../hooks/useNutritionCalc';
import { useWebSocket } from '../hooks/useWebSocket';
import { useIngredientStore } from '../stores/useIngredientStore';
import { useRecipeStore } from '../stores/useRecipeStore';
import { useUserStore } from '../stores/useUserStore';
import { DifficultyLevel, RecipeCategory, RecipeStatus } from '../types/enums';
import { RecipeIngredientInput, RecipePayload, RecipeStepInput, RecipeVersion } from '../types/recipe';

interface EditState {
  title: string;
  description: string;
  category: RecipeCategory;
  servings: number;
  difficulty: DifficultyLevel;
  cover_image: string | null;
  status: RecipeStatus;
}

const defaultState: EditState = {
  title: '',
  description: '',
  category: RecipeCategory.Meat,
  servings: 2,
  difficulty: DifficultyLevel.Easy,
  cover_image: null,
  status: RecipeStatus.Draft,
};

export function RecipeEdit() {
  const { id } = useParams();
  const recipeId = Number(id);
  const user = useUserStore((state) => state.currentUser);
  const { currentRecipe, fetchRecipe } = useRecipeStore();
  const { ingredients, fetchIngredients } = useIngredientStore();
  const [editState, setEditState] = useState<EditState>(defaultState);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientInput[]>([]);
  const [steps, setSteps] = useState<RecipeStepInput[]>([]);
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const appliedEventIds = useRef(new Set<string>());
  const nutrition = useNutritionCalc(recipeIngredients, ingredients);
  const websocket = useWebSocket(recipeId, user?.id ?? null, user?.username ?? null);

  useEffect(() => {
    if (Number.isFinite(recipeId)) {
      void fetchRecipe(recipeId);
      void fetchIngredients();
      void recipeApi.versions(recipeId).then(setVersions);
    }
  }, [fetchIngredients, fetchRecipe, recipeId]);

  useEffect(() => {
    if (!currentRecipe) {
      return;
    }
    setEditState({
      title: currentRecipe.title,
      description: currentRecipe.description,
      category: currentRecipe.category,
      servings: currentRecipe.servings,
      difficulty: currentRecipe.difficulty,
      cover_image: currentRecipe.cover_image,
      status: currentRecipe.status,
    });
    setRecipeIngredients(
      currentRecipe.recipeIngredients.map((entry) => ({
        ingredient_id: entry.ingredient_id,
        amount: entry.amount,
        unit: entry.unit,
      })),
    );
    setSteps(
      currentRecipe.steps.map((step) => ({
        step_number: step.step_number,
        description: step.description,
        image_url: step.image_url,
        duration_minutes: step.duration_minutes,
      })),
    );
  }, [currentRecipe]);

  useEffect(() => {
    const latest = websocket.changes[0];
    if (!latest || latest.userId === user?.id || appliedEventIds.current.has(latest.clientEventId)) {
      return;
    }
    appliedEventIds.current.add(latest.clientEventId);
    setEditState((state) => ({ ...state, [latest.field]: latest.value }));
  }, [user?.id, websocket.changes]);

  const totalDuration = useMemo(
    () => steps.reduce((sum, step) => sum + (step.duration_minutes ?? 0), 0),
    [steps],
  );

  const updateField = <K extends keyof EditState>(field: K, value: EditState[K]) => {
    setEditState((state) => ({ ...state, [field]: value }));
    if (user) {
      websocket.send({
        recipeId,
        userId: user.id,
        username: user.username,
        field,
        value: typeof value === 'boolean' ? String(value) : value,
        clientEventId: crypto.randomUUID(),
      });
    }
  };

  const saveRecipe = async () => {
    const payload: RecipePayload = {
      ...editState,
      cover_image: editState.cover_image || null,
      ingredients: recipeIngredients,
      steps,
    };
    await recipeApi.update(recipeId, payload);
    const [freshRecipe, freshVersions] = await Promise.all([
      fetchRecipe(recipeId),
      recipeApi.versions(recipeId),
    ]);
    setVersions(freshVersions);
    if (freshRecipe) {
      message.success('菜谱已保存并生成版本快照');
    }
  };

  const rollback = async (versionId: number) => {
    await recipeApi.rollback(recipeId, versionId);
    await fetchRecipe(recipeId);
    setVersions(await recipeApi.versions(recipeId));
    message.success('已回滚到所选版本');
  };

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <Typography.Title>协作编辑</Typography.Title>
          <Typography.Paragraph type="secondary">
            WebSocket 状态：{websocket.connected ? '已连接' : '连接中'} · 预计耗时 {totalDuration} 分钟
          </Typography.Paragraph>
        </div>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => void saveRecipe()}>
          保存
        </Button>
      </section>

      <section className="recipe-form-grid">
        <div className="form-panel">
          <Typography.Title level={4}>实时字段</Typography.Title>
          <Space direction="vertical" className="full-width">
            <Input
              value={editState.title}
              onChange={(event) => updateField('title', event.target.value)}
              onFocus={() =>
                user &&
                websocket.sendCursor({
                  recipeId,
                  userId: user.id,
                  username: user.username,
                  field: 'title',
                  position: editState.title.length,
                })
              }
            />
            <Input.TextArea
              rows={4}
              value={editState.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
            <Space wrap className="responsive-fields">
              <Select
                value={editState.category}
                onChange={(value) => updateField('category', value)}
                options={Object.values(RecipeCategory).map((value) => ({ label: value, value }))}
              />
              <Select
                value={editState.difficulty}
                onChange={(value) => updateField('difficulty', value)}
                options={Object.values(DifficultyLevel).map((value) => ({ label: value, value }))}
              />
              <InputNumber
                min={1}
                value={editState.servings}
                addonAfter="人份"
                onChange={(value) => updateField('servings', value ?? 1)}
              />
              <Select
                value={editState.status}
                onChange={(value) => updateField('status', value)}
                options={Object.values(RecipeStatus).map((value) => ({ label: value, value }))}
              />
            </Space>
            <Input
              value={editState.cover_image ?? ''}
              aria-label="封面图 URL"
              onChange={(event) => updateField('cover_image', event.target.value.trim() || null)}
            />
          </Space>
        </div>

        <IngredientSelector
          ingredients={ingredients}
          value={recipeIngredients}
          onChange={setRecipeIngredients}
        />
        <NutritionCard totals={nutrition} servings={editState.servings} />
        <StepEditor value={steps} onChange={setSteps} />
      </section>

      <section className="activity-band">
        <Typography.Title level={4}>
          <CloudSyncOutlined /> 实时活动
        </Typography.Title>
        <List
          size="small"
          dataSource={[...websocket.presenceEvents, ...websocket.cursorEvents].slice(0, 8)}
          renderItem={(event) => (
            <List.Item>
              {'status' in event
                ? `${event.username} ${event.status === 'joined' ? '加入' : '离开'}`
                : `${event.username} 正在编辑 ${event.field}`}
            </List.Item>
          )}
        />
      </section>

      <Divider />
      <section className="form-panel">
        <Typography.Title level={4}>版本历史</Typography.Title>
        <List
          dataSource={versions}
          renderItem={(version) => (
            <List.Item
              actions={[
                <Button key="rollback" size="small" onClick={() => void rollback(version.id)}>
                  回滚
                </Button>,
              ]}
            >
              #{version.id} · {new Date(version.created_at).toLocaleString()} ·{' '}
              {version.createdBy?.username ?? '系统'}
            </List.Item>
          )}
        />
      </section>
    </main>
  );
}
