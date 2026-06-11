'use client';

import { Box, Card, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from 'trpc/react';
import { FormattedMessage } from 'react-intl';

export default function EmployeeTable() {
  const theme = useTheme();
  const { data, isLoading } = api.employee.getSummary.useQuery();

  if (isLoading) {
    return (
      <MainCard title={<FormattedMessage id="recapitulation" />}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  const mockTableData = data?.tableData || [];
  const totals = data?.totalsRow || { role: 'Jumlah Karyawan DevTI', tetap: 0, prof: 0, tlh: 0, magang: 0, outsource: 0, total: 0 };
  const pieData = data?.pieData || [];

  return (
    <MainCard title={<FormattedMessage id="recapitulation" />}>
      <Grid container spacing={3}>
        {/* Left Side: Table */}
        <Grid item xs={12} md={7} lg={8}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600, border: `1px solid ${theme.palette.divider}` }}>
              <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f9f9f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}` }}>
                    <FormattedMessage id="devti-employees" />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}` }}>
                    <FormattedMessage id="permanent-employee" />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}` }}>
                    <FormattedMessage id="professional" />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}` }}>
                    TLH
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}` }}>
                    <FormattedMessage id="intern" />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: `1px solid ${theme.palette.divider}` }}>
                    <FormattedMessage id="outsource" />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="total" />
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `2px solid ${theme.palette.divider}`
                    }}
                  >
                    {totals.role === 'Jumlah Karyawan DevTI' ? <FormattedMessage id="total-devti-employees" /> : totals.role}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `2px solid ${theme.palette.divider}`
                    }}
                  >
                    {totals.tetap}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `2px solid ${theme.palette.divider}`
                    }}
                  >
                    {totals.prof}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `2px solid ${theme.palette.divider}`
                    }}
                  >
                    {totals.tlh}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `2px solid ${theme.palette.divider}`
                    }}
                  >
                    {totals.magang}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      borderRight: `1px solid ${theme.palette.divider}`,
                      borderBottom: `2px solid ${theme.palette.divider}`
                    }}
                  >
                    {totals.outsource}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: `2px solid ${theme.palette.divider}` }}>
                    {totals.total}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTableData.map((row: any, index: number) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{row.role}</TableCell>
                    <TableCell align="center" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {row.tetap}
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {row.prof}
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {row.tlh}
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {row.magang}
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {row.outsource}
                    </TableCell>
                    <TableCell align="center">{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Grid>

        {/* Right Side: Chart */}
        <Grid item xs={12} md={5} lg={4}>
          <Card sx={{ border: `1px solid ${theme.palette.divider}`, p: 3, height: '100%', bgcolor: 'transparent' }} elevation={0}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              <FormattedMessage id="workforce-in-devti" />
            </Typography>

            <Box sx={{ height: 300, position: 'relative' }}>
              {totals.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
                        if (value === 0) return null;
                        const RADIAN = Math.PI / 180;
                        const radius = 25 + innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                            {`${Number(value).toFixed(1)}%`}
                          </text>
                        );
                      }}
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${props.payload.rawCount} orang (${Number(value).toFixed(1)}%)`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    <FormattedMessage id="no-employee-data" />
                  </Typography>
                </Box>
              )}
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {pieData.map((item: any, index: number) => (
                <Grid item xs={6} key={index}>
                  <Card
                    sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, textAlign: 'center', bgcolor: 'transparent' }}
                    elevation={0}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color, mr: 1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {item.value.toFixed(1)}%
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </MainCard>
  );
}
