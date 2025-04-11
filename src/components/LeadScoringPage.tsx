import * as React from 'react';
import { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

const columns: GridColDef[] = [
  { field: 'prospectId', headerName: 'Prospect ID', flex: 1, minWidth: 150 },
  { field: 'leadSource', headerName: 'Lead Source', flex: 1, minWidth: 120 },
  { field: 'totalVisits', headerName: 'Total Visits', headerAlign: 'right', align: 'right', flex: 1, minWidth: 100 },
  { field: 'timeSpent', headerName: 'Time Spent (s)', headerAlign: 'right', align: 'right', flex: 1, minWidth: 100 },
  { field: 'pageViewsPerVisit', headerName: 'Views/Visit', headerAlign: 'right', align: 'right', flex: 1, minWidth: 100 },
  { 
    field: 'conversionScore', 
    headerName: 'Conversion Score', 
    headerAlign: 'right', 
    align: 'right', 
    flex: 1, 
    minWidth: 120, 
    renderCell: (params) => `${(params.value * 100).toFixed(1)}%`,
    sortComparator: (v1, v2) => v2 - v1,
  },
  { 
    field: 'conversionPossibility', 
    headerName: 'Conversion Possibility', 
    flex: 1, 
    minWidth: 150,
    renderCell: (params) => (
      <span style={{ color: params.value === 'High' ? 'green' : params.value === 'Medium' ? 'orange' : 'red' }}>
        {params.value}
      </span>
    ),
  },
  { field: 'contactingSource', headerName: 'Contact Method', flex: 1, minWidth: 120 },
];

export default function LeadScoringPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeadScoringData = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/lead-scoring');
      const data = await res.json();
      const rowsWithId = data.map((row: any, index: number) => ({ id: index, ...row }));
      setRows(rowsWithId);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadScoringData();
  }, []);

  if (loading) return <Typography>Loading Lead Scoring Data...</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        AI-Driven Lead Scoring
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'conversionScore', sort: 'desc' }] },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableColumnResize
        density="compact"
        sx={{ height: 700 }}
      />
    </Box>
  );
}