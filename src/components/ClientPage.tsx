import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material'; // No PieChart here
import { PieChart } from '@mui/x-charts/PieChart'; // Correct import
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

const miniGridColumns: GridColDef[] = [
  { field: 'clientId', headerName: 'Client ID', width: 150 },
  { field: 'name', headerName: 'Name', width: 120 },
  { field: 'status', headerName: 'Status', width: 100 },
  { field: 'totalPurchases', headerName: 'Purchases', width: 100, align: 'right' },
  { field: 'revenue', headerName: 'Revenue ($)', width: 120, align: 'right', renderCell: (params) => params.value.toFixed(2) },
];

export default function ClientPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientData = async () => {
    try {
      const res = await fetch('http://localhost:5002/api/clients');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  if (loading) return <Typography>Loading Client Data...</Typography>;
  if (!data) return <Typography>No Client Data Available</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Client Management Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Clients</Typography>
              <Typography variant="h4">{data.summary.totalClients}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Clients</Typography>
              <Typography variant="h4">{data.summary.activeClients}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Revenue</Typography>
              <Typography variant="h4">${data.summary.totalRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pie Chart and Timeline */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>Client Status</Typography>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: data.statusCounts.Online, label: 'Online' },
                  { id: 1, value: data.statusCounts.Offline, label: 'Offline' },
                ],
              },
            ]}
            width={400}
            height={200}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>Recent Activities</Typography>
          <Timeline>
            {data.recentActivities.map((activity: any, index: number) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot />
                  {index < 4 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography>{`${activity.name} - ${activity.lastActivity} (${activity.lastActivityDate})`}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Grid>
      </Grid>

      {/* Mini Grid */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Client List
      </Typography>
      <DataGrid
        rows={data.clients.map((c: any, i: number) => ({ id: i, ...c }))}
        columns={miniGridColumns}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[10, 25]}
        disableColumnResize
        density="compact"
        sx={{ height: 300 }}
      />
    </Box>
  );
}