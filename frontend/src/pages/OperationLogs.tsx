import { Button, DatePicker, Select, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { operationLogApi, OperationLogQuery } from '../api/operationLog';
import { OperationAction } from '../types/enums';
import { OperationLog } from '../types/operationLog';

type DateRange = [Dayjs | null, Dayjs | null] | null;

const columns: ColumnsType<OperationLog> = [
  {
    title: '时间',
    dataIndex: 'created_at',
    render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: '用户',
    render: (_, row) => row.user?.username ?? '匿名',
  },
  {
    title: '动作',
    dataIndex: 'action',
  },
  {
    title: '资源',
    render: (_, row) => `${row.resource}${row.resource_id ? ` #${row.resource_id}` : ''}`,
  },
  {
    title: 'IP',
    dataIndex: 'ip',
  },
];

export function OperationLogs() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [action, setAction] = useState<string | undefined>();
  const [range, setRange] = useState<DateRange>(null);

  const load = async () => {
    const query: OperationLogQuery = {
      action,
      from: range?.[0]?.toISOString(),
      to: range?.[1]?.toISOString(),
    };
    setLogs(await operationLogApi.list(query));
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <Typography.Title>操作日志</Typography.Title>
          <Typography.Paragraph type="secondary">管理员查看写操作审计记录。</Typography.Paragraph>
        </div>
      </section>
      <section className="toolbar-band">
        <Space wrap>
          <Select
            allowClear
            aria-label="动作"
            value={action}
            onChange={setAction}
            options={Object.values(OperationAction).map((value) => ({ label: value, value }))}
          />
          <DatePicker.RangePicker showTime value={range} onChange={setRange} />
          <Button type="primary" onClick={() => void load()}>
            查询
          </Button>
        </Space>
      </section>
      <Table rowKey="id" columns={columns} dataSource={logs} pagination={{ pageSize: 12 }} />
    </main>
  );
}
