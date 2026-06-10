import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, InputNumber, Select, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { Ingredient } from '../../types/ingredient';
import { RecipeIngredientInput } from '../../types/recipe';

interface IngredientSelectorProps {
  ingredients: Ingredient[];
  value: RecipeIngredientInput[];
  onChange: (value: RecipeIngredientInput[]) => void;
}

interface IngredientSelectionRow extends RecipeIngredientInput {
  key: string;
  ingredientName: string;
}

export function IngredientSelector({ ingredients, value, onChange }: IngredientSelectorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const ingredientMap = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const rows: IngredientSelectionRow[] = value.map((entry) => ({
    ...entry,
    key: `${entry.ingredient_id}-${entry.unit}`,
    ingredientName: ingredientMap.get(entry.ingredient_id)?.name ?? `食材 ${entry.ingredient_id}`,
  }));

  const addIngredient = () => {
    if (!selectedId) {
      return;
    }
    const ingredient = ingredientMap.get(selectedId);
    if (!ingredient) {
      return;
    }
    const exists = value.find((entry) => entry.ingredient_id === selectedId);
    if (exists) {
      onChange(
        value.map((entry) =>
          entry.ingredient_id === selectedId ? { ...entry, amount: entry.amount + amount } : entry,
        ),
      );
    } else {
      onChange([
        ...value,
        {
          ingredient_id: selectedId,
          amount,
          unit: ingredient.default_unit,
        },
      ]);
    }
    setSelectedId(null);
    setAmount(100);
  };

  const updateAmount = (ingredientId: number, nextAmount: number | null) => {
    onChange(
      value.map((entry) =>
        entry.ingredient_id === ingredientId
          ? { ...entry, amount: Math.max(nextAmount ?? 0.01, 0.01) }
          : entry,
      ),
    );
  };

  const removeIngredient = (ingredientId: number) => {
    onChange(value.filter((entry) => entry.ingredient_id !== ingredientId));
  };

  const columns: ColumnsType<IngredientSelectionRow> = [
    {
      title: '食材',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
    },
    {
      title: '用量',
      key: 'amount',
      render: (_, row) => (
        <InputNumber
          min={0.01}
          value={row.amount}
          addonAfter={row.unit}
          onChange={(next) => updateAmount(row.ingredient_id, next)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, row) => (
        <Button
          aria-label={`移除 ${row.ingredientName}`}
          icon={<DeleteOutlined />}
          onClick={() => removeIngredient(row.ingredient_id)}
        />
      ),
    },
  ];

  return (
    <div className="form-panel">
      <Typography.Title level={4}>食材清单</Typography.Title>
      <Space.Compact className="selector-row">
        <Select
          showSearch
          value={selectedId}
          aria-label="搜索食材"
          optionFilterProp="label"
          onChange={setSelectedId}
          options={ingredients.map((ingredient) => ({
            label: `${ingredient.name} · ${ingredient.category}`,
            value: ingredient.id,
          }))}
        />
        <InputNumber min={0.01} value={amount} onChange={(next) => setAmount(next ?? 100)} />
        <Button type="primary" icon={<PlusOutlined />} onClick={addIngredient}>
          添加
        </Button>
      </Space.Compact>
      <Table columns={columns} dataSource={rows} pagination={false} size="small" />
    </div>
  );
}
