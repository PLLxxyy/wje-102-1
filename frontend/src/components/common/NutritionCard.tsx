import { Card, Col, Row, Segmented, Statistic } from 'antd';
import { useMemo, useState } from 'react';
import { NutritionTotals } from '../../utils/nutrition';

interface NutritionCardProps {
  totals: NutritionTotals;
  servings?: number;
  title?: string;
}

type NutritionMode = 'total' | 'serving';

export function NutritionCard({ totals, servings = 1, title = '营养估算' }: NutritionCardProps) {
  const [mode, setMode] = useState<NutritionMode>('total');
  const divisor = mode === 'serving' ? Math.max(servings, 1) : 1;
  const values = useMemo(
    () => ({
      calories: Math.round(totals.total_calories / divisor),
      protein: (totals.total_protein / divisor).toFixed(1),
      fat: (totals.total_fat / divisor).toFixed(1),
      carb: (totals.total_carb / divisor).toFixed(1),
    }),
    [divisor, totals],
  );

  return (
    <Card
      className="nutrition-card"
      title={title}
      extra={
        <Segmented
          size="small"
          value={mode}
          onChange={(value) => setMode(value as NutritionMode)}
          options={[
            { label: '总量', value: 'total' },
            { label: '每份', value: 'serving' },
          ]}
        />
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Statistic title="热量" value={values.calories} suffix="kcal" />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="蛋白质" value={values.protein} suffix="g" />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="脂肪" value={values.fat} suffix="g" />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic title="碳水" value={values.carb} suffix="g" />
        </Col>
      </Row>
    </Card>
  );
}
