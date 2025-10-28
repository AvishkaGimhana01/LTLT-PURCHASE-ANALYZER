/**
 * Data Analyzer Module
 * Performs one-time analysis on uploaded sales data
 * Data is analyzed in-memory and discarded after analysis
 */

const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Try multiple date formats
  const formats = [
    // ISO format
    /^\d{4}-\d{2}-\d{2}$/,
    // US format (MM/DD/YYYY)
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    // EU format (DD/MM/YYYY)
    /^\d{1,2}-\d{1,2}-\d{4}$/,
  ];

  try {
    return new Date(dateString);
  } catch (e) {
    return null;
  }
};

const parseAmount = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,₹€£]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const analyzeData = (data) => {
  if (!data || data.length === 0) {
    return {
      totalRecords: 0,
      summary: {},
      salesByVendor: [],
      salesByPaymentType: [],
      salesByShippingType: [],
      salesTrends: [],
      outstandingPayments: 0,
      totalSales: 0,
      averageSaleValue: 0
    };
  }

  // Initialize analysis object
  const analysis = {
    totalRecords: data.length,
    summary: {},
    salesByVendor: {},
    salesByPaymentType: {},
    salesByShippingType: {},
    salesByMonth: {},
    outstandingPayments: 0,
    totalSales: 0,
    paidSales: 0,
    averageSaleValue: 0,
    dateRange: { start: null, end: null }
  };

  // Detect column names (case-insensitive)
  const sampleRow = data[0] || {};
  const columns = Object.keys(sampleRow);
  
  const findColumn = (possibleNames) => {
    const lower = columns.map(c => c.toLowerCase());
    for (const name of possibleNames) {
      const idx = lower.indexOf(name.toLowerCase());
      if (idx !== -1) return columns[idx];
    }
    return null;
  };

  const vendorCol = findColumn(['vendor', 'vendor_name', 'supplier', 'company']);
  const amountCol = findColumn(['document total', 'document_total', 'documenttotal', 'amount', 'price', 'total', 'sale_amount', 'value']);
  const dateCol = findColumn(['date', 'sale_date', 'transaction_date', 'order_date']);
  const paymentCol = findColumn(['payment_type', 'payment_method', 'payment', 'payment_status']);
  const shippingCol = findColumn(['shipping_type', 'shipping_method', 'delivery', 'shipping']);
  const remarksCol = findColumn(['remarks', 'notes', 'comments', 'status']);

  // Analyze each record
  data.forEach((row) => {
    // Parse amount
    const amount = amountCol ? parseAmount(row[amountCol]) : 0;
    analysis.totalSales += amount;

    // Analyze by vendor
    if (vendorCol && row[vendorCol]) {
      const vendor = String(row[vendorCol]).trim();
      if (!analysis.salesByVendor[vendor]) {
        analysis.salesByVendor[vendor] = { count: 0, total: 0 };
      }
      analysis.salesByVendor[vendor].count++;
      analysis.salesByVendor[vendor].total += amount;
    }

    // Analyze by payment type
    if (paymentCol && row[paymentCol]) {
      const payment = String(row[paymentCol]).trim();
      if (!analysis.salesByPaymentType[payment]) {
        analysis.salesByPaymentType[payment] = { count: 0, total: 0 };
      }
      analysis.salesByPaymentType[payment].count++;
      analysis.salesByPaymentType[payment].total += amount;

      // Calculate outstanding payments
      const paymentLower = payment.toLowerCase();
      if (paymentLower.includes('pending') || 
          paymentLower.includes('outstanding') || 
          paymentLower.includes('unpaid') ||
          paymentLower.includes('due')) {
        analysis.outstandingPayments += amount;
      } else if (paymentLower.includes('paid') || 
                 paymentLower.includes('completed') ||
                 paymentLower.includes('cleared')) {
        analysis.paidSales += amount;
      }
    }

    // Analyze by shipping type
    if (shippingCol && row[shippingCol]) {
      const shipping = String(row[shippingCol]).trim();
      if (!analysis.salesByShippingType[shipping]) {
        analysis.salesByShippingType[shipping] = { count: 0, total: 0 };
      }
      analysis.salesByShippingType[shipping].count++;
      analysis.salesByShippingType[shipping].total += amount;
    }

    // Analyze by date/month
    if (dateCol && row[dateCol]) {
      const date = parseDate(row[dateCol]);
      if (date && !isNaN(date.getTime())) {
        // Track date range
        if (!analysis.dateRange.start || date < analysis.dateRange.start) {
          analysis.dateRange.start = date;
        }
        if (!analysis.dateRange.end || date > analysis.dateRange.end) {
          analysis.dateRange.end = date;
        }

        // Group by month
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!analysis.salesByMonth[monthKey]) {
          analysis.salesByMonth[monthKey] = { count: 0, total: 0, date: date };
        }
        analysis.salesByMonth[monthKey].count++;
        analysis.salesByMonth[monthKey].total += amount;
      }
    }
  });

  // Calculate average
  analysis.averageSaleValue = analysis.totalRecords > 0 
    ? analysis.totalSales / analysis.totalRecords 
    : 0;

  // Convert objects to arrays for easier frontend consumption
  const formatDataForChart = (obj) => {
    return Object.keys(obj)
      .map(key => ({
        label: key,
        count: obj[key].count,
        total: obj[key].total,
        average: obj[key].total / obj[key].count
      }))
      .sort((a, b) => b.total - a.total);
  };

  // Format sales trends
  const salesTrends = Object.keys(analysis.salesByMonth)
    .sort()
    .map(monthKey => ({
      month: monthKey,
      date: analysis.salesByMonth[monthKey].date,
      count: analysis.salesByMonth[monthKey].count,
      total: analysis.salesByMonth[monthKey].total,
      average: analysis.salesByMonth[monthKey].total / analysis.salesByMonth[monthKey].count
    }));

  return {
    totalRecords: analysis.totalRecords,
    totalSales: Math.round(analysis.totalSales * 100) / 100,
    paidSales: Math.round(analysis.paidSales * 100) / 100,
    outstandingPayments: Math.round(analysis.outstandingPayments * 100) / 100,
    averageSaleValue: Math.round(analysis.averageSaleValue * 100) / 100,
    dateRange: {
      start: analysis.dateRange.start,
      end: analysis.dateRange.end
    },
    salesByVendor: formatDataForChart(analysis.salesByVendor),
    salesByPaymentType: formatDataForChart(analysis.salesByPaymentType),
    salesByShippingType: formatDataForChart(analysis.salesByShippingType),
    salesTrends: salesTrends,
    detectedColumns: {
      vendor: vendorCol,
      amount: amountCol,
      date: dateCol,
      payment: paymentCol,
      shipping: shippingCol,
      remarks: remarksCol
    }
  };
};

module.exports = {
  analyzeData,
  parseDate,
  parseAmount
};
