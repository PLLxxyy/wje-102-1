import { DeleteOutlined, FolderAddOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, List, Popconfirm, Switch, Typography, message } from 'antd';
import { useEffect } from 'react';
import { collectionApi, CollectionPayload } from '../api/collection';
import { useCollectionStore } from '../stores/useCollectionStore';

export function Collections() {
  const [form] = Form.useForm<CollectionPayload>();
  const { collections, fetchCollections } = useCollectionStore();

  useEffect(() => {
    void fetchCollections();
  }, [fetchCollections]);

  const createCollection = async (values: CollectionPayload) => {
    await collectionApi.create(values);
    form.resetFields();
    await fetchCollections();
    message.success('收藏夹已创建');
  };

  const removeCollection = async (id: number) => {
    await collectionApi.remove(id);
    await fetchCollections();
    message.success('收藏夹已删除');
  };

  const removeRecipe = async (collectionId: number, recipeId: number) => {
    await collectionApi.removeRecipe(collectionId, recipeId);
    await fetchCollections();
    message.success('已移出菜谱');
  };

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <Typography.Title>收藏夹</Typography.Title>
          <Typography.Paragraph type="secondary">按主题整理可复做、可公开分享的菜谱集合。</Typography.Paragraph>
        </div>
      </section>
      <section className="split-layout">
        <Card title="新建收藏夹" className="flat-card">
          <Form form={form} layout="vertical" onFinish={createCollection}>
            <Form.Item name="name" label="名称" rules={[{ required: true, max: 50 }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} maxLength={200} />
            </Form.Item>
            <Form.Item name="is_public" label="公开" valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<FolderAddOutlined />}>
              创建
            </Button>
          </Form>
        </Card>
        <div className="collection-stack">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="flat-card"
              title={`${collection.name}${collection.is_public ? ' · 公开' : ''}`}
              extra={
                <Popconfirm title="删除收藏夹？" onConfirm={() => void removeCollection(collection.id)}>
                  <Button icon={<DeleteOutlined />} danger />
                </Popconfirm>
              }
            >
              <Typography.Paragraph type="secondary">
                {collection.description || '未填写描述'}
              </Typography.Paragraph>
              <List
                dataSource={collection.recipes}
                renderItem={(recipe) => (
                  <List.Item
                    actions={[
                      <Button
                        key="remove"
                        size="small"
                        onClick={() => void removeRecipe(collection.id, recipe.id)}
                      >
                        移出
                      </Button>,
                    ]}
                  >
                    {recipe.title} · {recipe.category}
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
