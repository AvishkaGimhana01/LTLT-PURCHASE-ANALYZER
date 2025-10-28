import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Professional PDF Report Generator for LTL Transformers
export const generateProfessionalPDF = async (data) => {
  try {
    console.log('“„ PDF Export - Starting generation...');
    console.log('“Š Received data:', data);
    console.log('“¦ autoTable function:', typeof autoTable);
    console.log('“¦ jsPDF:', typeof jsPDF);
    
    const {
      typeBreakdown,
      itemServiceBreakdown,
      currencyBreakdown,
      vendorBreakdown,
      filterInfo,
      filteredData
    } = data;

    // Validate required data
    if (!typeBreakdown && !itemServiceBreakdown && !currencyBreakdown && !vendorBreakdown) {
      throw new Error('No analysis data available. Please ensure data is loaded before exporting.');
    }

    if (!filteredData || filteredData.length === 0) {
      throw new Error('No data records found. Please load data before exporting.');
    }

    console.log('… Data validation passed');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to format currency - CLEAN for PDF
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return 'Rs. 0.00';
    // Use simple formatting without special characters
    const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `Rs. ${formatted}`;
  };

  // Helper function to format number without currency - CLEAN for PDF
  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    // Simple comma separation for thousands
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Helper function for safe division
  const safeDivide = (numerator, denominator) => {
    if (!denominator || denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
      return 0;
    }
    return numerator / denominator;
  };

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to draw a pie chart
  const drawPieChart = (centerX, centerY, radius, data, colors) => {
    let currentAngle = -Math.PI / 2; // Start from top
    
    data.forEach((segment, index) => {
      const angle = (segment.percentage / 100) * 2 * Math.PI;
      const endAngle = currentAngle + angle;
      
      // Draw pie segment - Use modulo to wrap around if more items than colors
      const colorIndex = index % colors.length;
      doc.setFillColor(...colors[colorIndex]);
      
      // Create pie slice path
      const startX = centerX + radius * Math.cos(currentAngle);
      const startY = centerY + radius * Math.sin(currentAngle);
      
      // Draw the slice
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(2);
      
      // Calculate points for the arc
      const steps = 50;
      const angleStep = angle / steps;
      
      doc.triangle(
        centerX, centerY,
        centerX + radius * Math.cos(currentAngle), 
        centerY + radius * Math.sin(currentAngle),
        centerX + radius * Math.cos(endAngle), 
        centerY + radius * Math.sin(endAngle),
        'FD'
      );
      
      // Draw arc segments for smooth curve
      for (let i = 0; i < steps; i++) {
        const a1 = currentAngle + i * angleStep;
        const a2 = currentAngle + (i + 1) * angleStep;
        
        doc.triangle(
          centerX, centerY,
          centerX + radius * Math.cos(a1), 
          centerY + radius * Math.sin(a1),
          centerX + radius * Math.cos(a2), 
          centerY + radius * Math.sin(a2),
          'F'
        );
      }
      
      // Draw percentage label if segment is large enough
      if (segment.percentage > 5) {
        const labelAngle = currentAngle + angle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${segment.percentage.toFixed(1)}%`, labelX, labelY, { align: 'center' });
      }
      
      currentAngle = endAngle;
    });
    
    // Reset colors
    doc.setDrawColor(0, 0, 0);
    doc.setTextColor(0, 0, 0);
  };

  // Helper function to draw pie chart legend
  const drawLegend = (startX, startY, data, colors) => {
    let currentY = startY;
    
    data.forEach((item, index) => {
      // Color box - Use modulo to wrap around if more items than colors
      const colorIndex = index % colors.length;
      doc.setFillColor(...colors[colorIndex]);
      doc.roundedRect(startX, currentY - 3, 4, 4, 0.5, 0.5, 'F');
      
      // Label
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.label}: ${item.percentage.toFixed(2)}%`, startX + 6, currentY);
      
      currentY += 6;
    });
  };

  // ==================== PAGE 1: COVER PAGE ====================
  
  // Company Logo Area (Placeholder - you can add actual logo)
  doc.setFillColor(91, 127, 232); // Blue
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('LTL TRANSFORMERS', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sales & Purchase Analysis Report', pageWidth / 2, 42, { align: 'center' });
  
  // Report Title
  yPosition = 90;
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });
  
  // Date and Status
  yPosition += 20;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  const reportDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Report Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
  
  // Filter Information Box
  yPosition += 20;
  if (filterInfo) {
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(30, yPosition, pageWidth - 60, 50, 3, 3, 'F');
    
    yPosition += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('REPORT SCOPE', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    if (filterInfo.hasActiveFilters) {
      doc.text('Status: Filtered Data Analysis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      if (filterInfo.dateRange) {
        const dateText = filterInfo.dateRange.selectedDate 
          ? `Date: ${formatDate(filterInfo.dateRange.selectedDate)}`
          : `Period: ${formatDate(filterInfo.dateRange.startDate)} to ${formatDate(filterInfo.dateRange.endDate)}`;
        doc.text(dateText, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
      }
      
      if (filterInfo.orderType) {
        const orderTypeText = filterInfo.orderType === '1' ? 'Import Orders' 
          : filterInfo.orderType === '2' ? 'Local Orders' : 'Job Orders';
        doc.text(`Order Type: ${orderTypeText}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
      }
      
      if (filterInfo.itemService) {
        doc.text(`Category: ${filterInfo.itemService}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
      }
    } else {
      doc.text('Status: Complete Data Analysis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
    }
    
    doc.text(`Total Records Analyzed: ${(filterInfo.totalRecords || 0).toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Confidential - For Internal Use Only', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('© 2025 LTL Transformers. All rights reserved.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // ==================== PAGE 2: EXECUTIVE SUMMARY ====================
  
  doc.addPage();
  yPosition = 20;
  
  // Section Header
  doc.setFillColor(91, 127, 232);
  doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. EXECUTIVE SUMMARY', 15, yPosition + 4);
  
  yPosition += 20;
  
  // Summary Cards
  const summaryData = [];
  
  if (typeBreakdown) {
    const totalAmount = typeBreakdown.total || 0;
    const totalQty = typeBreakdown.totalQty || 0;
    
    summaryData.push(
      ['Total Purchase Value', formatCurrency(totalAmount)],
      ['Total Transactions', formatNumber(totalQty)],
      ['Average Transaction Value', formatCurrency(safeDivide(totalAmount, totalQty))],
      ['Analysis Period', filterInfo?.hasActiveFilte? 'Filtered Dataset' : 'Complete Dataset']
    );
  }
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [91, 127, 232],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 100 }
    },
    margin: { left: 15, right: 15 }
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;

  // ==================== PAGE 3: ORDER TYPE ANALYSIS ====================
  
  checkPageBreak(80);
  
  // Section Header
  doc.setFillColor(91, 127, 232);
  doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. PURCHASE ORDER TYPE ANALYSIS', 15, yPosition + 4);
  
  yPosition += 20;
  
  if (typeBreakdown && typeBreakdown.breakdown) {
    const tableData = [];
    const total = typeBreakdown.total || 0;
    
    Object.entries(typeBreakdown.breakdown).forEach(([type, data]) => {
      if (data.value > 0) {
        const percentage = safeDivide(data.value * 100, total).toFixed(2);
        tableData.push([
          type,
          formatCurrency(data.value),
          formatNumber(data.qty),
          `${percentage}%`,
          formatCurrency(safeDivide(data.value, data.qty))
        ]);
      }
    });
    
    // Add Total Row
    tableData.push([
      'TOTAL',
      formatCurrency(total),
      formatNumber(typeBreakdown.totalQty),
      '100.00%',
      formatCurrency(safeDivide(total, typeBreakdown.totalQty))
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Order Type', 'Total Amount', 'Quantity', 'Percentage', 'Avg. Value']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [91, 127, 232],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' }
      },
      foot: [[
        'TOTAL',
        formatCurrency(total),
        typeBreakdown.totalQty.toLocaleString(),
        '100.00%',
        formatCurrency(total / typeBreakdown.totalQty)
      ]],
      footStyles: {
        fillColor: [240, 240, 240],
        fontStyle: 'bold',
        fontSize: 9
      },
      margin: { left: 15, right: 15 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
    
    // Add Pie Chart for Order Type Distribution
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Type Distribution Chart', 15, yPosition);
    
    yPosition += 10;
    
    // Prepare chart data
    const orderTypeChartData = [];
    const orderTypeColors = [
      [91, 127, 232],   // Blue - Overseas
      [249, 115, 22],   // Orange - Local
      [168, 85, 247]    // Purple - Job Orders
    ];
    
    Object.entries(typeBreakdown.breakdown).forEach(([type, data]) => {
      if (data.value > 0) {
        const percentage = safeDivide(data.value * 100, total);
        orderTypeChartData.push({
          label: type,
          percentage: percentage,
          value: data.value
        });
      }
    });
    
    // Draw pie chart
    const chartCenterX = 60;
    const chartCenterY = yPosition + 35;
    const chartRadius = 30;
    
    drawPieChart(chartCenterX, chartCenterY, chartRadius, orderTypeChartData, orderTypeColors);
    
    // Draw legend
    drawLegend(120, yPosition + 15, orderTypeChartData, orderTypeColors);
    
    yPosition += 75;
  }

  // ==================== PAGE 4: ITEM VS SERVICE ANALYSIS ====================
  
  checkPageBreak(80);
  
  // Section Header
  doc.setFillColor(91, 127, 232);
  doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. ITEM VS SERVICE ANALYSIS', 15, yPosition + 4);
  
  yPosition += 20;
  
  if (itemServiceBreakdown && itemServiceBreakdown.breakdown) {
    const tableData = [];
    const total = itemServiceBreakdown.total || 0;
    
    Object.entries(itemServiceBreakdown.breakdown).forEach(([category, data]) => {
      if (data.value > 0) {
        const percentage = safeDivide(data.value * 100, total).toFixed(2);
        tableData.push([
          category,
          formatCurrency(data.value),
          formatNumber(data.qty),
          `${percentage}%`,
          formatCurrency(safeDivide(data.value, data.qty))
        ]);
      }
    });
    
    // Add Total Row
    tableData.push([
      'TOTAL',
      formatCurrency(total),
      formatNumber(itemServiceBreakdown.totalQty),
      '100.00%',
      formatCurrency(safeDivide(total, itemServiceBreakdown.totalQty))
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Total Amount', 'Quantity', 'Percentage', 'Avg. Value']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [168, 85, 247], // Purple
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
    
    // Add Pie Chart for Item vs Service Distribution
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Item vs Service Distribution Chart', 15, yPosition);
    
    yPosition += 10;
    
    // Prepare chart data
    const itemServiceChartData = [];
    const itemServiceColors = [
      [168, 85, 247],   // Purple - Item
      [239, 68, 68]     // Red - Service
    ];
    
    Object.entries(itemServiceBreakdown.breakdown).forEach(([category, data]) => {
      if (data.value > 0) {
        const percentage = safeDivide(data.value * 100, total);
        itemServiceChartData.push({
          label: category,
          percentage: percentage,
          value: data.value
        });
      }
    });
    
    // Draw pie chart
    const chartCenterX = 60;
    const chartCenterY = yPosition + 35;
    const chartRadius = 30;
    
    drawPieChart(chartCenterX, chartCenterY, chartRadius, itemServiceChartData, itemServiceColors);
    
    // Draw legend
    drawLegend(120, yPosition + 15, itemServiceChartData, itemServiceColors);
    
    yPosition += 75;
  }

  // ==================== PAGE 5: CURRENCY-WISE ANALYSIS ====================
  
  if (currencyBreakdown && currencyBreakdown.breakdown && Object.keys(currencyBreakdown.breakdown).length > 0) {
    checkPageBreak(80);
    
    // Section Header
    doc.setFillColor(91, 127, 232);
    doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. CURRENCY-WISE ANALYSIS', 15, yPosition + 4);
    
    yPosition += 20;
    
    const tableData = [];
    const total = currencyBreakdown.total || 0;
    
    // Sort currencies by value (descending)
    const sortedCurrencies = Object.entries(currencyBreakdown.breakdown)
      .sort((a, b) => b[1].value - a[1].value);
    
    sortedCurrencies.forEach(([currency, data]) => {
      if (data.value > 0) {
        const percentage = safeDivide(data.value * 100, total).toFixed(2);
        tableData.push([
          currency,
          formatCurrency(data.value),
          formatNumber(data.qty),
          `${percentage}%`,
          formatCurrency(safeDivide(data.value, data.qty))
        ]);
      }
    });
    
    // Add Total Row
    tableData.push([
      'TOTAL',
      formatCurrency(total),
      formatNumber(currencyBreakdown.totalQty),
      '100.00%',
      formatCurrency(safeDivide(total, currencyBreakdown.totalQty))
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Currency', 'Total Amount', 'Quantity', 'Percentage', 'Avg. Value']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [16, 185, 129], // Green
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' },
        1: { halign: 'right' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
    
    // Add Pie Chart for Currency Distribution
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Currency Distribution Chart', 15, yPosition);
    
    yPosition += 10;
    
    // Prepare chart data
    const currencyChartData = [];
    const currencyColors = [
      [16, 185, 129],   // Green
      [59, 130, 246],   // Blue
      [245, 158, 11],   // Orange
      [139, 92, 246],   // Purple
      [239, 68, 68],    // Red
      [236, 72, 153],   // Pink
      [20, 184, 166],   // Teal
      [249, 115, 22]    // Deep Orange
    ];
    
    sortedCurrencies.forEach(([currency, data], index) => {
      if (data.value > 0) {
        const percentage = safeDivide(data.value * 100, total);
        currencyChartData.push({
          label: currency,
          percentage: percentage,
          value: data.value
        });
      }
    });
    
    // Draw pie chart
    const chartCenterX = 60;
    const chartCenterY = yPosition + 35;
    const chartRadius = 30;
    
    drawPieChart(chartCenterX, chartCenterY, chartRadius, currencyChartData, currencyColors);
    
    // Draw legend
    drawLegend(120, yPosition + 15, currencyChartData, currencyColors);
    
    yPosition += 75;
  }

  // ==================== PAGE 6: TOP 10 VENDOANALYSIS ====================
  
  if (vendorBreakdown && vendorBreakdown.breakdown) {
    checkPageBreak(80);
    
    // Section Header
    doc.setFillColor(91, 127, 232);
    doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('5. TOP 10 VENDOANALYSIS', 15, yPosition + 4);
    
    yPosition += 20;
    
    const vendorTableData = [];
    const entries = Object.entries(vendorBreakdown.breakdown);
    let rank = 1;
    
    entries.forEach(([vendor, data]) => {
      const percentage = safeDivide(data.value * 100, vendorBreakdown.total).toFixed(2);
      const billionValue = safeDivide(data.value, 1000000000).toFixed(2);
      
      vendorTableData.push([
        vendor === 'Other Vendors' ? '-' : rank++,
        vendor,
        `Rs. ${billionValue}B`,
        formatNumber(data.qty),
        `${percentage}%`
      ]);
    });
    
    // Add Total
    vendorTableData.push([
      '',
      'GRAND TOTAL',
      `Rs. ${safeDivide(vendorBreakdown.total, 1000000000).toFixed(2)}B`,
      formatNumber(vendorBreakdown.totalQty),
      '100.00%'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Vendor Name', 'Total Amount', 'Orders', 'Share %']],
      body: vendorTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94], // Green
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { fontStyle: 'bold', halign: 'left', cellWidth: 70 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 25 }
      },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        // Highlight "Other Vendors" and "GRAND TOTAL" rows
        if (data.row.index === vendorTableData.length - 1 || 
            (data.cell.raw && data.cell.raw.toString().includes('Other Vendors'))) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [245, 245, 245];
        }
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ==================== PAGE: KEY METRICS SUMMARY ====================
  
  doc.addPage();
  yPosition = 20;
  
  // Section Header
  doc.setFillColor(91, 127, 232);
  doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('6. KEY METRICS SUMMARY', 15, yPosition + 4);
  
  yPosition += 25;
  
  // Create visual metrics boxes
  if (typeBreakdown && typeBreakdown.breakdown) {
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Purchase Order Distribution', 15, yPosition);
    
    yPosition += 10;
    
    // Create metric boxes for each type
    const boxWidth = (pageWidth - 40) / 3;
    const boxHeight = 35;
    const startX = 15;
    let currentX = startX;
    
    const types = [
      { name: 'Overseas', data: typeBreakdown.breakdown['Overseas'], color: [91, 127, 232] },
      { name: 'Local', data: typeBreakdown.breakdown['Local'], color: [249, 115, 22] },
      { name: 'Job Orders', data: typeBreakdown.breakdown['Job Orders'], color: [168, 85, 247] }
    ];
    
    types.forEach((type, index) => {
      if (type.data && type.data.value > 0) {
        // Box background
        doc.setFillColor(...type.color);
        doc.roundedRect(currentX, yPosition, boxWidth - 5, boxHeight, 3, 3, 'F');
        
        // Type name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(type.name, currentX + (boxWidth - 5) / 2, yPosition + 8, { align: 'center' });
        
        // Amount
        doc.setFontSize(12);
        const amount = formatCurrency(type.data.value);
        doc.text(amount, currentX + (boxWidth - 5) / 2, yPosition + 18, { align: 'center' });
        
        // Quantity
        doc.setFontSize(9);
        doc.text(`${formatNumber(type.data.qty)} orders`, currentX + (boxWidth - 5) / 2, yPosition + 26, { align: 'center' });
        
        // Percentage
        const percentage = safeDivide(type.data.value * 100, typeBreakdown.total).toFixed(2);
        doc.text(`${percentage}%`, currentX + (boxWidth - 5) / 2, yPosition + 32, { align: 'center' });
        
        currentX += boxWidth;
      }
    });
    
    yPosition += boxHeight + 20;
  }
  
  // Item vs Service Summary
  if (itemServiceBreakdown && itemServiceBreakdown.breakdown) {
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Item vs Service Distribution', 15, yPosition);
    
    yPosition += 10;
    
    const boxWidth = (pageWidth - 40) / 2;
    const boxHeight = 35;
    const startX = 15;
    let currentX = startX;
    
    const categories = [
      { name: 'Item', data: itemServiceBreakdown.breakdown['Item'], color: [168, 85, 247] },
      { name: 'Service', data: itemServiceBreakdown.breakdown['Service'], color: [239, 68, 68] }
    ];
    
    categories.forEach((cat, index) => {
      if (cat.data && cat.data.value > 0) {
        // Box background
        doc.setFillColor(...cat.color);
        doc.roundedRect(currentX, yPosition, boxWidth - 5, boxHeight, 3, 3, 'F');
        
        // Category name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(cat.name, currentX + (boxWidth - 5) / 2, yPosition + 8, { align: 'center' });
        
        // Amount
        doc.setFontSize(12);
        const amount = formatCurrency(cat.data.value);
        doc.text(amount, currentX + (boxWidth - 5) / 2, yPosition + 18, { align: 'center' });
        
        // Quantity
        doc.setFontSize(9);
        doc.text(`${formatNumber(cat.data.qty)} orders`, currentX + (boxWidth - 5) / 2, yPosition + 26, { align: 'center' });
        
        // Percentage
        const percentage = safeDivide(cat.data.value * 100, itemServiceBreakdown.total).toFixed(2);
        doc.text(`${percentage}%`, currentX + (boxWidth - 5) / 2, yPosition + 32, { align: 'center' });
        
        currentX += boxWidth;
      }
    });
    
    yPosition += boxHeight + 20;
  }

  // ==================== FINAL PAGE: NOTES & SIGNATURES ====================
  
  doc.addPage();
  yPosition = 20;
  
  // Section Header
  doc.setFillColor(91, 127, 232);
  doc.rect(0, yPosition - 5, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('6. NOTES & OBSERVATIONS', 15, yPosition + 4);
  
  yPosition += 20;
  
  // Notes Section
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const notes = [
    '€¢ All amounts are displayed in Indian Rupees (Rs.).',
    '€¢ Purchase ordeare categorized by first digit: 1=Overseas, 2=Local, 3=Job Orders.',
    '€¢ Vendor amounts shown in billions (B) for better readability.',
    '€¢ Percentages calculated based on total purchase value.',
    '€¢ This report is generated from filtered/complete dataset as specified in scope.',
    '€¢ Data analyzed using LTL Purchase Analyzer system.',
    '€¢ All calculations are automated and verified for accuracy.',
    '€¢ Currency format: Rs. (Indian Rupees) with standard comma separation.'
  ];
  
  notes.forEach(note => {
    doc.text(note, 20, yPosition);
    yPosition += 7;
  });
  
  yPosition += 20;
  
  // Signature Section
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 90, yPosition);
  doc.line(pageWidth - 90, yPosition, pageWidth - 20, yPosition);
  
  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared By', 20, yPosition);
  doc.text('Approved By', pageWidth - 90, yPosition);
  
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Sales Analysis Team', 20, yPosition);
  doc.text('Management', pageWidth - 90, yPosition);
  
  // Footer
  yPosition = pageHeight - 20;
  doc.setFillColor(91, 127, 232);
  doc.rect(0, yPosition, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('LTL Transforme- Professional Engineering Solutions', pageWidth / 2, yPosition + 8, { align: 'center' });
  doc.text(`Report Generated: ${reportDate}`, pageWidth / 2, yPosition + 14, { align: 'center' });
  doc.setFontSize(7);
  doc.text('This document is confidential and intended for authorized personnel only.', pageWidth / 2, yPosition + 20, { align: 'center' });

  // Save the PDF
  const fileName = `LTL_Purchase_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  console.log('’¾ Saving PDF:', fileName);
  doc.save(fileName);
  
  console.log('… PDF generated and saved successfully');
  return fileName;
  
  } catch (error) {
    console.error('Œ PDF Generation Error:', error);
    throw error; // Re-throw to be caught by the calling function
  }
};


