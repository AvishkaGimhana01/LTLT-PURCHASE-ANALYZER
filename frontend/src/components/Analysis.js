import React, { useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Analysis.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analysis = ({ data, analysis }) => {
  // Comprehensive data calculations
  const advancedMetrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Time-based analysis
    const monthlyData = {};
    const quarterlyData = {};
    const yearlyData = {};

    // Vendor performance
    const vendorMetrics = {};

    // Payment analysis
    const paymentMethodAnalysis = {};

    // Product analysis
    const productPerformance = {};

    // Customer/Buyer analysis
    const buyerAnalysis = {};

    data.forEach(record => {
      const date = new Date(record.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
      const year = date.getFullYear().toString();
      
      const totalSale = parseFloat(record.total_sale) || 0;
      const paidAmount = parseFloat(record.paid_amount) || 0;
      const outstanding = totalSale - paidAmount;

      // Monthly aggregation
      if (!monthlyData[month]) {
        monthlyData[month] = { sales: 0, paid: 0, outstanding: 0, count: 0 };
      }
      monthlyData[month].sales += totalSale;
      monthlyData[month].paid += paidAmount;
      monthlyData[month].outstanding += outstanding;
      monthlyData[month].count++;

      // Quarterly aggregation
      if (!quarterlyData[quarter]) {
        quarterlyData[quarter] = { sales: 0, paid: 0, outstanding: 0, count: 0 };
      }
      quarterlyData[quarter].sales += totalSale;
      quarterlyData[quarter].paid += paidAmount;
      quarterlyData[quarter].outstanding += outstanding;
      quarterlyData[quarter].count++;

      // Yearly aggregation
      if (!yearlyData[year]) {
        yearlyData[year] = { sales: 0, paid: 0, outstanding: 0, count: 0 };
      }
      yearlyData[year].sales += totalSale;
      yearlyData[year].paid += paidAmount;
      yearlyData[year].outstanding += outstanding;
      yearlyData[year].count++;

      // Vendor metrics
      const vendor = record.vendor || 'Unknown';
      if (!vendorMetrics[vendor]) {
        vendorMetrics[vendor] = {
          totalSales: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          transactionCount: 0,
          avgSale: 0,
          paymentRate: 0
        };
      }
      vendorMetrics[vendor].totalSales += totalSale;
      vendorMetrics[vendor].totalPaid += paidAmount;
      vendorMetrics[vendor].totalOutstanding += outstanding;
      vendorMetrics[vendor].transactionCount++;

      // Payment method analysis
      const paymentMethod = record.payment_method || 'Unknown';
      if (!paymentMethodAnalysis[paymentMethod]) {
        paymentMethodAnalysis[paymentMethod] = { total: 0, count: 0, avgAmount: 0 };
      }
      paymentMethodAnalysis[paymentMethod].total += totalSale;
      paymentMethodAnalysis[paymentMethod].count++;

      // Product analysis
      const product = record.product || 'Unknown';
      if (!productPerformance[product]) {
        productPerformance[product] = { revenue: 0, quantity: 0, avgPrice: 0 };
      }
      productPerformance[product].revenue += totalSale;
      productPerformance[product].quantity++;

      // Buyer analysis
      const buyer = record.buyer || 'Unknown';
      if (!buyerAnalysis[buyer]) {
        buyerAnalysis[buyer] = { totalSpent: 0, orderCount: 0, avgOrder: 0 };
      }
      buyerAnalysis[buyer].totalSpent += totalSale;
      buyerAnalysis[buyer].orderCount++;
    });

    // Calculate averages and rates
    Object.keys(vendorMetrics).forEach(vendor => {
      vendorMetrics[vendor].avgSale = vendorMetrics[vendor].totalSales / vendorMetrics[vendor].transactionCount;
      vendorMetrics[vendor].paymentRate = (vendorMetrics[vendor].totalPaid / vendorMetrics[vendor].totalSales) * 100;
    });

    Object.keys(paymentMethodAnalysis).forEach(method => {
      paymentMethodAnalysis[method].avgAmount = paymentMethodAnalysis[method].total / paymentMethodAnalysis[method].count;
    });

    Object.keys(productPerformance).forEach(product => {
      productPerformance[product].avgPrice = productPerformance[product].revenue / productPerformance[product].quantity;
    });

    Object.keys(buyerAnalysis).forEach(buyer => {
      buyerAnalysis[buyer].avgOrder = buyerAnalysis[buyer].totalSpent / buyerAnalysis[buyer].orderCount;
    });

    return {
      monthlyData,
      quarterlyData,
      yearlyData,
      vendorMetrics,
      paymentMethodAnalysis,
      productPerformance,
      buyerAnalysis
    };
  }, [data]);

  // Monthly Trend Chart
  const monthlyTrendChart = useMemo(() => {
    if (!advancedMetrics) return null;

    const months = Object.keys(advancedMetrics.monthlyData).sort();
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Total Sales',
          data: months.map(m => advancedMetrics.monthlyData[m].sales),
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3
        },
        {
          label: 'Paid Amount',
          data: months.map(m => advancedMetrics.monthlyData[m].paid),
          borderColor: 'rgb(72, 187, 120)',
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3
        },
        {
          label: 'Outstanding',
          data: months.map(m => advancedMetrics.monthlyData[m].outstanding),
          borderColor: 'rgb(237, 137, 54)',
          backgroundColor: 'rgba(237, 137, 54, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3
        }
      ]
    };
  }, [advancedMetrics]);

  // Vendor Performance Chart
  const vendorPerformanceChart = useMemo(() => {
    if (!advancedMetrics) return null;

    const topVendors = Object.entries(advancedMetrics.vendorMetrics)
      .sort((a, b) => b[1].totalSales - a[1].totalSales)
      .slice(0, 10);

    return {
      labels: topVendors.map(v => v[0]),
      datasets: [
        {
          label: 'Total Sales',
          data: topVendors.map(v => v[1].totalSales),
          backgroundColor: 'rgba(102, 126, 234, 0.85)',
          borderColor: 'rgb(102, 126, 234)',
          borderWidth: 2,
          borderRadius: 8
        },
        {
          label: 'Total Paid',
          data: topVendors.map(v => v[1].totalPaid),
          backgroundColor: 'rgba(72, 187, 120, 0.85)',
          borderColor: 'rgb(72, 187, 120)',
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    };
  }, [advancedMetrics]);

  // Payment Method Distribution (Donut Chart)
  const paymentMethodChart = useMemo(() => {
    if (!advancedMetrics) return null;

    const methods = Object.entries(advancedMetrics.paymentMethodAnalysis)
      .sort((a, b) => b[1].total - a[1].total);

    return {
      labels: methods.map(m => m[0]),
      datasets: [{
        data: methods.map(m => m[1].total),
        backgroundColor: [
          'rgba(102, 126, 234, 0.85)',
          'rgba(72, 187, 120, 0.85)',
          'rgba(237, 137, 54, 0.85)',
          'rgba(66, 153, 225, 0.85)',
          'rgba(159, 122, 234, 0.85)',
          'rgba(236, 201, 75, 0.85)',
          'rgba(252, 129, 129, 0.85)',
          'rgba(246, 173, 85, 0.85)'
        ],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverOffset: 20,
        hoverBorderWidth: 5
      }]
    };
  }, [advancedMetrics]);

  // Top Products Chart
  const topProductsChart = useMemo(() => {
    if (!advancedMetrics) return null;

    const topProducts = Object.entries(advancedMetrics.productPerformance)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);

    return {
      labels: topProducts.map(p => p[0]),
      datasets: [{
        label: 'Revenue',
        data: topProducts.map(p => p[1].revenue),
        backgroundColor: 'rgba(118, 75, 162, 0.85)',
        borderColor: 'rgb(118, 75, 162)',
        borderWidth: 2,
        borderRadius: 8
      }]
    };
  }, [advancedMetrics]);

  // Quarterly Comparison
  const quarterlyComparisonChart = useMemo(() => {
    if (!advancedMetrics) return null;

    const quarters = Object.keys(advancedMetrics.quarterlyData).sort();

    return {
      labels: quarters,
      datasets: [{
        label: 'Sales',
        data: quarters.map(q => advancedMetrics.quarterlyData[q].sales),
        backgroundColor: 'rgba(102, 126, 234, 0.85)',
        borderColor: 'rgb(102, 126, 234)',
        borderWidth: 2,
        borderRadius: 8
      }]
    };
  }, [advancedMetrics]);

  // Top Buyers (Donut Chart)
  const topBuyersChart = useMemo(() => {
    if (!advancedMetrics) return null;

    const topBuyers = Object.entries(advancedMetrics.buyerAnalysis)
      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
      .slice(0, 10);

    return {
      labels: topBuyers.map(b => b[0]),
      datasets: [{
        data: topBuyers.map(b => b[1].totalSpent),
        backgroundColor: [
          'rgba(102, 126, 234, 0.85)',
          'rgba(72, 187, 120, 0.85)',
          'rgba(237, 137, 54, 0.85)',
          'rgba(66, 153, 225, 0.85)',
          'rgba(159, 122, 234, 0.85)',
          'rgba(236, 201, 75, 0.85)',
          'rgba(252, 129, 129, 0.85)',
          'rgba(246, 173, 85, 0.85)',
          'rgba(99, 179, 237, 0.85)',
          'rgba(183, 148, 244, 0.85)'
        ],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverOffset: 20,
        hoverBorderWidth: 5
      }]
    };
  }, [advancedMetrics]);

  // Standard Chart Options (for Bar/Line charts)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 13, weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 15,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(context.parsed.y || context.parsed);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11, weight: '500' },
          padding: 8,
          callback: function(value) {
            return 'Rs. ' + value.toLocaleString('en-IN');
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11, weight: '500' },
          padding: 8
        }
      }
    }
  };

  // Donut Chart Options
  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 12, weight: '600' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 15,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(value);
            return `${label}: ${formattedValue} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="analysis-page">
        <div className="no-data-message">
          <h2>📊 No Data Available for Analysis</h2>
          <p>Please upload a CSV file to view detailed analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      {/* Header */}
      <div className="analysis-header">
        <h1 className="analysis-title">📈 Advanced Analytics Dashboard</h1>
        <p className="analysis-subtitle">Comprehensive analysis of {data.length.toLocaleString()} transactions</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="quick-stats">
        <div className="stat-box primary">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h4>Total Revenue</h4>
            <p className="stat-value">Rs. {analysis.totalSales?.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="stat-box success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h4>Collection Rate</h4>
            <p className="stat-value">{((analysis.totalPaid / analysis.totalSales) * 100).toFixed(1)}%</p>
          </div>
        </div>
        <div className="stat-box warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h4>Pending</h4>
            <p className="stat-value">Rs. {analysis.totalOutstanding?.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="stat-box info">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h4>Total Orders</h4>
            <p className="stat-value">{data.length.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trend Analysis */}
      <div className="chart-section">
        <div className="section-header">
          <h2>📊 Monthly Trend Analysis</h2>
          <p>Track sales, payments, and outstanding amounts over time</p>
        </div>
        <div className="chart-container large">
          {monthlyTrendChart && (
            <Line data={monthlyTrendChart} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Vendor & Payment Grid */}
      <div className="charts-grid">
        <div className="chart-section">
          <div className="section-header">
            <h2>🏢 Top 10 Vendor Performance</h2>
            <p>Sales vs. Payment collection by vendor</p>
          </div>
          <div className="chart-container medium">
            {vendorPerformanceChart && (
              <Bar data={vendorPerformanceChart} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="chart-section">
          <div className="section-header">
            <h2>💳 Payment Method Distribution</h2>
            <p>Revenue breakdown by payment type</p>
          </div>
          <div className="chart-container medium donut-chart">
            {paymentMethodChart && (
              <Doughnut data={paymentMethodChart} options={donutChartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Products & Quarterly Grid */}
      <div className="charts-grid">
        <div className="chart-section">
          <div className="section-header">
            <h2>🎯 Top 10 Products by Revenue</h2>
            <p>Best-selling products and their revenue</p>
          </div>
          <div className="chart-container medium">
            {topProductsChart && (
              <Bar data={topProductsChart} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="chart-section">
          <div className="section-header">
            <h2>📅 Quarterly Performance</h2>
            <p>Sales comparison across quarters</p>
          </div>
          <div className="chart-container medium">
            {quarterlyComparisonChart && (
              <Bar data={quarterlyComparisonChart} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Top Buyers Section */}
      <div className="chart-section">
        <div className="section-header">
          <h2>👥 Top 10 Buyers by Revenue</h2>
          <p>Most valuable customers and their contribution</p>
        </div>
        <div className="chart-container large donut-chart">
          {topBuyersChart && (
            <Doughnut data={topBuyersChart} options={donutChartOptions} />
          )}
        </div>
      </div>

      {/* Detailed Metrics Tables */}
      <div className="metrics-tables">
        <div className="metrics-table-section">
          <h3>🏆 Top 5 Vendors - Detailed Metrics</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Total Sales</th>
                <th>Paid Amount</th>
                <th>Outstanding</th>
                <th>Transactions</th>
                <th>Avg Sale</th>
                <th>Payment Rate</th>
              </tr>
            </thead>
            <tbody>
              {advancedMetrics && Object.entries(advancedMetrics.vendorMetrics)
                .sort((a, b) => b[1].totalSales - a[1].totalSales)
                .slice(0, 5)
                .map(([vendor, metrics]) => (
                  <tr key={vendor}>
                    <td className="vendor-name">{vendor}</td>
                    <td className="amount">Rs. {metrics.totalSales.toLocaleString('en-IN')}</td>
                    <td className="amount success">Rs. {metrics.totalPaid.toLocaleString('en-IN')}</td>
                    <td className="amount warning">Rs. {metrics.totalOutstanding.toLocaleString('en-IN')}</td>
                    <td>{metrics.transactionCount}</td>
                    <td className="amount">Rs. {metrics.avgSale.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`payment-rate ${metrics.paymentRate >= 80 ? 'high' : metrics.paymentRate >= 50 ? 'medium' : 'low'}`}>
                        {metrics.paymentRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="metrics-table-section">
          <h3>💳 Payment Methods Analysis</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Payment Method</th>
                <th>Total Revenue</th>
                <th>Transaction Count</th>
                <th>Average Amount</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {advancedMetrics && Object.entries(advancedMetrics.paymentMethodAnalysis)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([method, metrics]) => (
                  <tr key={method}>
                    <td className="method-name">{method}</td>
                    <td className="amount">Rs. {metrics.total.toLocaleString('en-IN')}</td>
                    <td>{metrics.count}</td>
                    <td className="amount">Rs. {metrics.avgAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="percentage">
                        {((metrics.total / analysis.totalSales) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights-panel">
        <h3>🔍 Key Analytical Insights</h3>
        <div className="insights-list">
          {advancedMetrics && (
            <>
              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <p><strong>Peak Month:</strong> {Object.entries(advancedMetrics.monthlyData)
                  .sort((a, b) => b[1].sales - a[1].sales)[0]?.[0]} with Rs. {Object.entries(advancedMetrics.monthlyData)
                  .sort((a, b) => b[1].sales - a[1].sales)[0]?.[1].sales.toLocaleString('en-IN')} in sales</p>
              </div>
              <div className="insight-item">
                <span className="insight-icon">🏆</span>
                <p><strong>Top Vendor:</strong> {Object.entries(advancedMetrics.vendorMetrics)
                  .sort((a, b) => b[1].totalSales - a[1].totalSales)[0]?.[0]} contributed Rs. {Object.entries(advancedMetrics.vendorMetrics)
                  .sort((a, b) => b[1].totalSales - a[1].totalSales)[0]?.[1].totalSales.toLocaleString('en-IN')}</p>
              </div>
              <div className="insight-item">
                <span className="insight-icon">💰</span>
                <p><strong>Best Product:</strong> {Object.entries(advancedMetrics.productPerformance)
                  .sort((a, b) => b[1].revenue - a[1].revenue)[0]?.[0]} generated Rs. {Object.entries(advancedMetrics.productPerformance)
                  .sort((a, b) => b[1].revenue - a[1].revenue)[0]?.[1].revenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="insight-item">
                <span className="insight-icon">👤</span>
                <p><strong>Top Buyer:</strong> {Object.entries(advancedMetrics.buyerAnalysis)
                  .sort((a, b) => b[1].totalSpent - a[1].totalSpent)[0]?.[0]} spent Rs. {Object.entries(advancedMetrics.buyerAnalysis)
                  .sort((a, b) => b[1].totalSpent - a[1].totalSpent)[0]?.[1].totalSpent.toLocaleString('en-IN')}</p>
              </div>
              <div className="insight-item">
                <span className="insight-icon">💳</span>
                <p><strong>Preferred Payment:</strong> {Object.entries(advancedMetrics.paymentMethodAnalysis)
                  .sort((a, b) => b[1].count - a[1].count)[0]?.[0]} used in {Object.entries(advancedMetrics.paymentMethodAnalysis)
                  .sort((a, b) => b[1].count - a[1].count)[0]?.[1].count} transactions</p>
              </div>
              <div className="insight-item">
                <span className="insight-icon">📊</span>
                <p><strong>Average Order Value:</strong> Rs. {(analysis.totalSales / data.length).toLocaleString('en-IN')}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
