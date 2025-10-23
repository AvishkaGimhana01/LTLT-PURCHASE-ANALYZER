// Flexible column detection - case-insensitive fuzzy matching
const findColumn = (data, possibleNames) => {
  if (!data || data.length === 0) return null;
  
  const headers = Object.keys(data[0]);
  
  // Try exact matches first (case-insensitive)
  for (const possibleName of possibleNames) {
    const match = headers.find(h => h.toLowerCase() === possibleName.toLowerCase());
    if (match) return match;
  }
  
  // Try partial matches
  for (const possibleName of possibleNames) {
    const match = headers.find(h => 
      h.toLowerCase().includes(possibleName.toLowerCase()) ||
      possibleName.toLowerCase().includes(h.toLowerCase())
    );
    if (match) return match;
  }
  
  return null;
};

// Get value safely from row
const getValue = (row, column) => {
  if (!column || !row) return null;
  return row[column];
};

// Parse amount/numeric value
const parseAmount = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  
  // If already a number
  if (typeof value === 'number') return value;
  
  // If string, clean it
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[₹$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};

// Analyze sales data
const analyzeSalesData = (data) => {
  if (!data || data.length === 0) {
    return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topVendors: [],
      salesByPaymentType: {},
      monthlySales: {},
      error: 'No data provided'
    };
  }

  console.group('Data Analysis');
  console.log('Total rows:', data.length);

  // Auto-detect columns
  const amountCol = findColumn(data, ['amount', 'price', 'total', 'sale_amount', 'value', 'net_amount']);
  const vendorCol = findColumn(data, ['vendor', 'vendor_name', 'supplier', 'company', 'vendor_company']);
  const dateCol = findColumn(data, ['date', 'order_date', 'invoice_date', 'created_date', 'transaction_date']);
  const paymentCol = findColumn(data, ['payment_type', 'payment_method', 'payment', 'payment_status']);

  console.log('Detected columns:', {
    amount: amountCol,
    vendor: vendorCol,
    date: dateCol,
    payment: paymentCol
  });

  // Calculate total sales
  let totalSales = 0;
  let vendorSales = {};
  let paymentTypeSales = {};
  let monthlySales = {};

  data.forEach(row => {
    // Get amount
    const amount = parseAmount(getValue(row, amountCol));
    totalSales += amount;

    // Group by vendor
    if (vendorCol) {
      const vendor = getValue(row, vendorCol) || 'Unknown';
      vendorSales[vendor] = (vendorSales[vendor] || 0) + amount;
    }

    // Group by payment type
    if (paymentCol) {
      const paymentType = getValue(row, paymentCol) || 'Unknown';
      paymentTypeSales[paymentType] = (paymentTypeSales[paymentType] || 0) + amount;
    }

    // Group by month
    if (dateCol) {
      const dateValue = getValue(row, dateCol);
      if (dateValue) {
        try {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlySales[monthKey] = (monthlySales[monthKey] || 0) + amount;
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
    }
  });

  // Get top vendors
  const topVendors = Object.entries(vendorSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, total]) => ({ name, total }));

  const totalOrders = data.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  console.log('Analysis complete:', {
    totalSales,
    totalOrders,
    averageOrderValue,
    topVendorsCount: topVendors.length
  });
  console.groupEnd();

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    topVendors,
    salesByPaymentType: paymentTypeSales,
    monthlySales,
    detectedColumns: {
      amount: amountCol,
      vendor: vendorCol,
      date: dateCol,
      payment: paymentCol
    }
  };
};

module.exports = {
  analyzeSalesData,
  findColumn,
  parseAmount
};
