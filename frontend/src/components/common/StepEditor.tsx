import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Input, InputNumber, Space, Typography } from 'antd';
import { DragEvent, useState } from 'react';
import { RecipeStepInput } from '../../types/recipe';

interface StepEditorProps {
  value: RecipeStepInput[];
  onChange: (value: RecipeStepInput[]) => void;
}

export function StepEditor({ value, onChange }: StepEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const normalize = (steps: RecipeStepInput[]) =>
    steps.map((step, index) => ({
      ...step,
      step_number: index + 1,
    }));

  const addStep = () => {
    onChange(
      normalize([
        ...value,
        {
          step_number: value.length + 1,
          description: '',
          image_url: null,
          duration_minutes: 5,
        },
      ]),
    );
  };

  const updateStep = (index: number, patch: Partial<RecipeStepInput>) => {
    onChange(normalize(value.map((step, current) => (current === index ? { ...step, ...patch } : step))));
  };

  const removeStep = (index: number) => {
    onChange(normalize(value.filter((_step, current) => current !== index)));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      return;
    }
    const reordered = [...value];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setDragIndex(null);
    onChange(normalize(reordered));
  };

  return (
    <div className="form-panel">
      <Space className="panel-title-row">
        <Typography.Title level={4}>烹饪步骤</Typography.Title>
        <Button icon={<PlusOutlined />} onClick={addStep}>
          添加步骤
        </Button>
      </Space>
      <div className="step-stack">
        {value.map((step, index) => (
          <Card
            key={step.step_number}
            size="small"
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, index)}
            title={`步骤 ${index + 1}`}
            extra={
              <Button
                aria-label={`删除步骤 ${index + 1}`}
                icon={<DeleteOutlined />}
                onClick={() => removeStep(index)}
              />
            }
          >
            <Space direction="vertical" className="full-width">
              <Input.TextArea
                rows={3}
                value={step.description}
                aria-label="描述火候、处理方式和判断标准"
                onChange={(event) => updateStep(index, { description: event.target.value })}
              />
              <Space wrap>
                <Input
                  value={step.image_url ?? ''}
                  aria-label="步骤图片 URL"
                  onChange={(event) =>
                    updateStep(index, { image_url: event.target.value.trim() || null })
                  }
                />
                <InputNumber
                  min={1}
                  addonAfter="分钟"
                  value={step.duration_minutes ?? 5}
                  onChange={(next) => updateStep(index, { duration_minutes: next ?? null })}
                />
              </Space>
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
}
