import { HeartOutlined, HistoryOutlined, TeamOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Divider,
  Empty,
  List,
  Select,
  Space,
  Timeline,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collectionApi } from '../api/collection';
import { recipeApi } from '../api/recipe';
import { userApi } from '../api/user';
import { NutritionCard } from '../components/common/NutritionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useCollectionStore } from '../stores/useCollectionStore';
import { useRecipeStore } from '../stores/useRecipeStore';
import { useUserStore } from '../stores/useUserStore';
import { CollaborationRole } from '../types/enums';
import { User } from '../types/user';

export function RecipeDetail() {
  const { id } = useParams();
  const recipeId = Number(id);
  const currentUser = useUserStore((state) => state.currentUser);
  const { currentRecipe, fetchRecipe } = useRecipeStore();
  const { collections, fetchCollections } = useCollectionStore();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<number | null>(null);
  const [versionCount, setVersionCount] = useState(0);

  useEffect(() => {
    if (Number.isFinite(recipeId)) {
      void fetchRecipe(recipeId);
      if (currentUser) {
        void fetchCollections();
        void userApi.search().then(setUsers);
        void recipeApi.versions(recipeId).then((versions) => setVersionCount(versions.length));
      }
    }
  }, [currentUser, fetchCollections, fetchRecipe, recipeId]);

  const nutrition = useMemo(
    () => ({
      total_calories: currentRecipe?.total_calories ?? 0,
      total_protein: currentRecipe?.total_protein ?? 0,
      total_fat: currentRecipe?.total_fat ?? 0,
      total_carb: currentRecipe?.total_carb ?? 0,
    }),
    [currentRecipe],
  );

  if (!currentRecipe) {
    return (
      <main className="page-shell">
        <Empty description="菜谱不存在或正在加载" />
      </main>
    );
  }

  const addToCollection = async () => {
    if (!selectedCollection) {
      message.warning('请选择收藏夹');
      return;
    }
    await collectionApi.addRecipe(selectedCollection, currentRecipe.id);
    await fetchCollections();
    message.success('已加入收藏夹');
  };

  const inviteCollaborator = async () => {
    if (!selectedCollaborator) {
      message.warning('请选择协作者');
      return;
    }
    await recipeApi.invite(currentRecipe.id, selectedCollaborator, CollaborationRole.Editor);
    await fetchRecipe(currentRecipe.id);
    message.success('协作邀请已发送');
  };

  return (
    <main className="page-shell">
      <section className="recipe-detail-head">
        <div>
          <Space wrap>
            <StatusBadge status={currentRecipe.status} />
            <Typography.Text>{currentRecipe.category}</Typography.Text>
            <Typography.Text>{currentRecipe.difficulty}</Typography.Text>
          </Space>
          <Typography.Title>{currentRecipe.title}</Typography.Title>
          <Typography.Paragraph>{currentRecipe.description}</Typography.Paragraph>
          <Space wrap>
            <Button type="primary">
              <Link to={`/recipe/${currentRecipe.id}/edit`}>协作编辑</Link>
            </Button>
            <Button icon={<HistoryOutlined />}>版本 {versionCount}</Button>
          </Space>
        </div>
        <NutritionCard totals={nutrition} servings={currentRecipe.servings} />
      </section>

      <Descriptions bordered column={{ xs: 1, sm: 2, md: 4 }}>
        <Descriptions.Item label="作者">{currentRecipe.author.username}</Descriptions.Item>
        <Descriptions.Item label="份数">{currentRecipe.servings}</Descriptions.Item>
        <Descriptions.Item label="协作者">{currentRecipe.collaborations.length}</Descriptions.Item>
        <Descriptions.Item label="更新">{new Date(currentRecipe.updated_at).toLocaleString()}</Descriptions.Item>
      </Descriptions>

      {currentUser ? (
        <section className="toolbar-band">
          <Space wrap>
            <Select
              aria-label="加入收藏夹"
              value={selectedCollection}
              onChange={setSelectedCollection}
              options={collections.map((collection) => ({
                label: collection.name,
                value: collection.id,
              }))}
            />
            <Button icon={<HeartOutlined />} onClick={() => void addToCollection()}>
              收藏
            </Button>
            {currentUser.id === currentRecipe.author_id ? (
              <>
                <Select
                  showSearch
                  aria-label="邀请协作者"
                  value={selectedCollaborator}
                  onChange={setSelectedCollaborator}
                  optionFilterProp="label"
                  options={users
                    .filter((user) => user.id !== currentUser.id)
                    .map((user) => ({ label: `${user.username} · ${user.email}`, value: user.id }))}
                />
                <Button icon={<TeamOutlined />} onClick={() => void inviteCollaborator()}>
                  邀请编辑
                </Button>
              </>
            ) : null}
          </Space>
        </section>
      ) : null}

      <section className="detail-columns">
        <div className="form-panel">
          <Typography.Title level={3}>食材</Typography.Title>
          <List
            dataSource={currentRecipe.recipeIngredients}
            renderItem={(entry) => (
              <List.Item>
                <Typography.Text>{entry.ingredient.name}</Typography.Text>
                <Typography.Text strong>
                  {entry.amount}
                  {entry.unit}
                </Typography.Text>
              </List.Item>
            )}
          />
        </div>
        <div className="form-panel">
          <Typography.Title level={3}>步骤</Typography.Title>
          <Timeline
            items={currentRecipe.steps.map((step) => ({
              children: (
                <div>
                  <Typography.Text strong>步骤 {step.step_number}</Typography.Text>
                  <Typography.Paragraph>{step.description}</Typography.Paragraph>
                  <Typography.Text type="secondary">{step.duration_minutes ?? 0} 分钟</Typography.Text>
                </div>
              ),
            }))}
          />
        </div>
      </section>

      {currentRecipe.collaborations.length > 0 ? (
        <>
          <Divider />
          <List
            header="协作状态"
            dataSource={currentRecipe.collaborations}
            renderItem={(collaboration) => (
              <List.Item>
                {collaboration.user.username} · {collaboration.role} ·{' '}
                {collaboration.accepted_at ? '已接受' : '待接受'}
              </List.Item>
            )}
          />
        </>
      ) : null}
    </main>
  );
}
