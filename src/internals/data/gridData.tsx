import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

type SparkLineData = number[];

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function renderSparklineCell(params: GridCellParams<SparkLineData, any>) {
  const data = getDaysInMonth(4, 2024);
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        colors={['hsl(210, 98%, 42%)']}
        xAxis={{ scaleType: 'band', data }}
      />
    </div>
  );
}

function renderStatus(status: 'Online' | 'Offline') {
  const colors: { [index: string]: 'success' | 'default' } = {
    Online: 'success',
    Offline: 'default',
  };
  return <Chip label={status} color={colors[status]} size="small" />;
}

export function renderAvatar(params: GridCellParams<{ name: string; color: string }, any, any>) {
  if (params.value == null) {
    return '';
  }
  return (
    <Avatar
      sx={{ backgroundColor: params.value.color, width: '24px', height: '24px', fontSize: '0.85rem' }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns: GridColDef[] = [
  { field: 'pageTitle', headerName: 'Page Title', flex: 1.5, minWidth: 200 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.5,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value as any),
  },
  {
    field: 'users',
    headerName: 'Users',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'eventCount',
    headerName: 'Event Count',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'viewsPerUser',
    headerName: 'Views per User',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'averageTime',
    headerName: 'Average Time',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'conversions',
    headerName: 'Daily Conversions',
    flex: 1,
    minWidth: 150,
    renderCell: renderSparklineCell,
  },
];

const CustomizedDataGrid: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);

  const fetchData = () => {
    fetch('http://localhost:5000/api/grid-data')
      .then((res) => res.json())
      .then((data) => {
        const rowsWithId = data.map((row: any, index: number) => ({ id: index, ...row }));
        setRows(rowsWithId);
      })
      .catch((err) => console.error('Error fetching grid data:', err));
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000); // Fetch every 2 seconds
    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
};

export default CustomizedDataGrid;