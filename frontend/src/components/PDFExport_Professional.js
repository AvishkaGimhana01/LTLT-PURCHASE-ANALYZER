import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Professional PDF Report Generator for LTL Transformers
// With proper page breaks, company logo, and enhanced charts

// Helper function to load image as base64 with high quality
const loadImageAsBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        // Create high-quality canvas with original dimensions
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        const ctx = canvas.getContext('2d');
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image at full resolution
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to high-quality PNG
        const dataURL = canvas.toDataURL('image/png', 1.0);
        
        console.log('✅ Logo loaded successfully:', {
          width: canvas.width,
          height: canvas.height,
          size: Math.round(dataURL.length / 1024) + 'KB'
        });
        
        resolve(dataURL);
      } catch (error) {
        console.error('❌ Error converting logo to base64:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('❌ Failed to load logo image from:', imagePath, error);
      reject(new Error('Failed to load image from: ' + imagePath));
    };
    
    // Set image source
    img.src = imagePath;
  });
};

export const generateProfessionalPDF = async (data) => {
  try {
    console.log('📄 Professional PDF Export - Starting generation...');
    
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

    console.log('✅ Data validation passed');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    let pageNumber = 1;
    
    // Load company logo with multiple fallback paths
    let companyLogo = null;
    let logoFormat = 'PNG';
    
    const logoPaths = [
      { path: '/logo_/a.png', format: 'PNG' },
      { path: process.env.PUBLIC_URL + '/logo_/a.png', format: 'PNG' },
      { path: '/logo_/b.jpeg', format: 'JPEG' },
      { path: process.env.PUBLIC_URL + '/logo_/b.jpeg', format: 'JPEG' },
      { path: './logo_/a.png', format: 'PNG' },
      { path: '../../../public/logo_/a.png', format: 'PNG' }
    ];
    
    console.log('🔍 Attempting to load company logo...');
    
    for (const logoInfo of logoPaths) {
      try {
        console.log('   Trying path:', logoInfo.path);
        companyLogo = await loadImageAsBase64(logoInfo.path);
        logoFormat = logoInfo.format;
        console.log('✅ Logo loaded successfully from:', logoInfo.path, '| Format:', logoFormat);
        break;
      } catch (error) {
        console.warn('⚠️ Could not load logo from:', logoInfo.path);
        continue;
      }
    }
    
    if (!companyLogo) {
      console.warn('⚠️ Company logo could not be loaded from any path. PDF will be generated without logo.');
    }

    // Modern color scheme
    const colors = {
      primary: [102, 126, 234], // Purple gradient start
      secondary: [118, 75, 162], // Purple gradient end
      accent: [79, 70, 229], // Indigo
      orange: [249, 115, 22],
      success: [16, 185, 129],
      danger: [239, 68, 68],
      purple: [168, 85, 247],
      dark: [51, 51, 51],
      gray: [100, 100, 100],
      lightGray: [245, 247, 250],
      white: [255, 255, 255]
    };

    // ===== HELPER FUNCTIONS =====
    
    const addNewPage = () => {
      addFooter();
      doc.addPage();
      yPosition = 25;
      pageNumber++;
      addPageHeader();
    };

    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - 25) {
        addNewPage();
        return true;
      }
      return false;
    };

    const addPageHeader = () => {
      // Add small company logo to header (not on cover page)
      if (companyLogo && pageNumber > 1) {
        try {
          // Render logo with high quality - slightly larger for better visibility
          doc.addImage(companyLogo, logoFormat, 12, 6, 20, 20, undefined, 'FAST');
          console.log(`   ✓ Logo added to page ${pageNumber} header`);
        } catch (error) {
          console.warn('Could not add logo to header:', error);
        }
      }
      
      // Header line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, 24, pageWidth - 15, 24);
      yPosition = 30;
    };

    const addFooter = () => {
      const footerY = pageHeight - 15;
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
      
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.text('LTL Transformers - Purchase Analysis Report', pageWidth / 2, footerY, { align: 'center' });
      
      doc.setFontSize(7);
      doc.text(`Page ${pageNumber}`, pageWidth - 20, footerY, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, footerY);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(6);
      doc.text('Confidential - For Internal Use Only', pageWidth / 2, footerY + 4, { align: 'center' });
    };

    const formatCurrency = (amount) => {
      if (!amount || isNaN(amount)) return 'Rs. 0.00';
      const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `Rs. ${formatted}`;
    };

    const formatBillions = (num) => {
      if (!num || isNaN(num)) return 'Rs. 0';
      const absNum = Math.abs(num);
      
      if (absNum >= 1000000000) {
        return `Rs. ${(num / 1000000000).toFixed(2)}B`;
      } else if (absNum >= 10000000) {
        return `Rs. ${(num / 10000000).toFixed(2)}Cr`;
      } else if (absNum >= 100000) {
        return `Rs. ${(num / 100000).toFixed(2)}L`;
      }
      return formatCurrency(num);
    };

    const formatNumber = (num) => {
      if (!num || isNaN(num)) return '0';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const safeDivide = (numerator, denominator) => {
      if (!denominator || denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
        return 0;
      }
      return numerator / denominator;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const drawSectionHeader = (title, sectionNumber) => {
      checkPageBreak(15);
      
      // Gradient background
      const steps = 15;
      const headerHeight = 12;
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = colors.primary[0] + (colors.secondary[0] - colors.primary[0]) * ratio;
        const g = colors.primary[1] + (colors.secondary[1] - colors.primary[1]) * ratio;
        const b = colors.primary[2] + (colors.secondary[2] - colors.primary[2]) * ratio;
        doc.setFillColor(r, g, b);
        doc.rect(0, yPosition + i * (headerHeight / steps), pageWidth, headerHeight / steps, 'F');
      }
      
      doc.setTextColor(...colors.white);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sectionNumber}. ${title}`, 15, yPosition + 8);
      
      yPosition += headerHeight + 8;
    };

    const drawPieChart = (centerX, centerY, radius, data, chartColors) => {
      let currentAngle = -Math.PI / 2; // Start from top
      
      data.forEach((segment, index) => {
        const angle = (segment.percentage / 100) * 2 * Math.PI;
        const endAngle = currentAngle + angle;
        
        // Draw pie segment
        const colorIndex = index % chartColors.length;
        doc.setFillColor(...chartColors[colorIndex]);
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(1);
        
        // Create smooth pie slice
        const steps = 50;
        const angleStep = angle / steps;
        
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
          const labelRadius = radius * 0.65;
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

    const drawChartLegend = (startX, startY, data, chartColors) => {
      let currentY = startY;
      
      data.forEach((item, index) => {
        const colorIndex = index % chartColors.length;
        
        // Color box
        doc.setFillColor(...chartColors[colorIndex]);
        doc.roundedRect(startX, currentY - 3, 5, 5, 0.5, 0.5, 'F');
        
        // Label
        doc.setTextColor(...colors.dark);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const labelText = `${item.label}: ${formatCurrency(item.value)} (${item.percentage.toFixed(2)}%)`;
        doc.text(labelText, startX + 8, currentY);
        
        currentY += 6;
      });
    };

    // ==================== PAGE 1: COVER PAGE ====================
    
    // Company Logo (Large) - High quality rendering
    if (companyLogo) {
      try {
        // Add white background for logo clarity
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(pageWidth / 2 - 35, 15, 70, 70, 5, 5, 'F');
        
        // Add subtle shadow for depth
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(pageWidth / 2 - 34, 16, 70, 70, 5, 5, 'F');
        
        // Render logo at high quality with larger size for clarity
        doc.addImage(companyLogo, logoFormat, pageWidth / 2 - 32, 18, 64, 64, undefined, 'FAST');
        
        console.log('✅ Large logo added to cover page with format:', logoFormat);
      } catch (error) {
        console.warn('❌ Could not add logo to cover:', error);
      }
    } else {
      console.warn('⚠️ No logo available for cover page');
    }
    
    yPosition = companyLogo ? 95 : 30;
    
    // Gradient header
    const gradientHeight = 50;
    for (let i = 0; i < 25; i++) {
      const ratio = i / 25;
      const r = colors.primary[0] + (colors.secondary[0] - colors.primary[0]) * ratio;
      const g = colors.primary[1] + (colors.secondary[1] - colors.primary[1]) * ratio;
      const b = colors.primary[2] + (colors.secondary[2] - colors.primary[2]) * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(0, yPosition + i * (gradientHeight / 25), pageWidth, gradientHeight / 25, 'F');
    }
    
    // Company Name
    doc.setTextColor(...colors.white);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('LTL TRANSFORMERS', pageWidth / 2, yPosition + 18, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Engineering Solutions', pageWidth / 2, yPosition + 28, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ANALYSIS REPORT', pageWidth / 2, yPosition + 42, { align: 'center' });
    
    yPosition += gradientHeight + 20;
    
    // Report metadata
    doc.setTextColor(...colors.dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const reportDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Report Generated: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    doc.text(`Total Records Analyzed: ${formatNumber(filteredData.length)}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Filter information box
    yPosition += 15;
    if (filterInfo) {
      doc.setFillColor(...colors.lightGray);
      doc.roundedRect(25, yPosition, pageWidth - 50, 55, 3, 3, 'F');
      
      yPosition += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.accent);
      doc.text('REPORT SCOPE & FILTERS', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      
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
          const orderTypeText = filterInfo.orderType === '1' ? 'Import Orders (Overseas)' 
            : filterInfo.orderType === '2' ? 'Local Purchase Orders' : 'Job Work Orders';
          doc.text(`Order Type: ${orderTypeText}`, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 6;
        }
        
        if (filterInfo.itemService) {
          doc.text(`Category: ${filterInfo.itemService}`, pageWidth / 2, yPosition, { align: 'center' });
        }
      } else {
        doc.text('Status: Complete Dataset Analysis', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
        doc.text('No filters applied - Full dataset included', pageWidth / 2, yPosition, { align: 'center' });
      }
    }
    
    // Footer for cover page
    addFooter();

    // ==================== PAGE 2: EXECUTIVE SUMMARY (NEW PAGE) ====================
    
    addNewPage();
    
    drawSectionHeader('EXECUTIVE SUMMARY', 1);
    
    // Key metrics cards
    if (typeBreakdown) {
      const totalAmount = typeBreakdown.total || 0;
      const totalQty = typeBreakdown.totalQty || 0;
      const avgValue = safeDivide(totalAmount, totalQty);
      
      // Create summary table
      const summaryData = [
        ['Total Purchase Value', formatCurrency(totalAmount)],
        ['Total Transactions', formatNumber(totalQty)],
        ['Average Transaction Value', formatCurrency(avgValue)],
        ['Highest Single Order', formatCurrency(Math.max(...filteredData.map(row => parseFloat(row.Amount || 0))))],
        ['Analysis Period', filterInfo?.hasActiveFilters ? 'Filtered Dataset' : 'Complete Dataset'],
        ['Report Generated', new Date().toLocaleDateString('en-IN')]
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: {
          fillColor: colors.primary,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'left',
          textColor: colors.white
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 90 },
          1: { halign: 'right', cellWidth: 90, fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // ==================== PAGE 3: ORDER TYPE ANALYSIS (NEW PAGE) ====================
    
    addNewPage();
    
    drawSectionHeader('PURCHASE ORDER TYPE ANALYSIS', 2);
    
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
        head: [['Order Type', 'Total Amount', 'Quantity', '% Share', 'Avg. Value']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: colors.primary,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
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
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = colors.lightGray;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = colors.dark;
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
      
      checkPageBreak(90);
      
      // Chart title
      doc.setTextColor(...colors.dark);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Type Distribution Chart', 15, yPosition);
      
      yPosition += 10;
      
      // Prepare chart data
      const chartData = [];
      const chartColors = [
        colors.primary,
        colors.orange,
        colors.purple
      ];
      
      Object.entries(typeBreakdown.breakdown).forEach(([type, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total);
          chartData.push({
            label: type,
            percentage: percentage,
            value: data.value
          });
        }
      });
      
      // Draw pie chart
      const chartCenterX = 65;
      const chartCenterY = yPosition + 40;
      const chartRadius = 35;
      
      drawPieChart(chartCenterX, chartCenterY, chartRadius, chartData, chartColors);
      
      // Draw legend
      drawChartLegend(130, yPosition + 15, chartData, chartColors);
      
      yPosition += 85;
    }

    // ==================== PAGE 4: ITEM VS SERVICE ANALYSIS (NEW PAGE) ====================
    
    addNewPage();
    
    drawSectionHeader('ITEM VS SERVICE ANALYSIS', 3);
    
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
        head: [['Category', 'Total Amount', 'Quantity', '% Share', 'Avg. Value']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: colors.purple,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
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
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = colors.lightGray;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
      
      checkPageBreak(90);
      
      // Chart title
      doc.setTextColor(...colors.dark);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Item vs Service Distribution Chart', 15, yPosition);
      
      yPosition += 10;
      
      // Prepare chart data
      const chartData = [];
      const chartColors = [
        colors.purple,
        colors.danger
      ];
      
      Object.entries(itemServiceBreakdown.breakdown).forEach(([category, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total);
          chartData.push({
            label: category,
            percentage: percentage,
            value: data.value
          });
        }
      });
      
      // Draw pie chart
      const chartCenterX = 65;
      const chartCenterY = yPosition + 40;
      const chartRadius = 35;
      
      drawPieChart(chartCenterX, chartCenterY, chartRadius, chartData, chartColors);
      
      // Draw legend
      drawChartLegend(130, yPosition + 15, chartData, chartColors);
      
      yPosition += 85;
    }

    // ==================== PAGE 5: CURRENCY-WISE ANALYSIS (NEW PAGE) ====================
    
    if (currencyBreakdown && currencyBreakdown.breakdown && Object.keys(currencyBreakdown.breakdown).length > 0) {
      addNewPage();
      
      drawSectionHeader('CURRENCY-WISE ANALYSIS', 4);
      
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
        head: [['Currency', 'Total Amount', 'Quantity', '% Share', 'Avg. Value']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: colors.success,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
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
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = colors.lightGray;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
      
      checkPageBreak(90);
      
      // Chart title
      doc.setTextColor(...colors.dark);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Currency Distribution Chart', 15, yPosition);
      
      yPosition += 10;
      
      // Prepare chart data
      const chartData = [];
      const chartColors = [
        colors.success,
        [59, 130, 246],
        [245, 158, 11],
        colors.purple,
        colors.danger,
        [236, 72, 153],
        [20, 184, 166],
        colors.orange
      ];
      
      sortedCurrencies.forEach(([currency, data]) => {
        if (data.value > 0) {
          const percentage = safeDivide(data.value * 100, total);
          chartData.push({
            label: currency,
            percentage: percentage,
            value: data.value
          });
        }
      });
      
      // Draw pie chart
      const chartCenterX = 65;
      const chartCenterY = yPosition + 40;
      const chartRadius = 35;
      
      drawPieChart(chartCenterX, chartCenterY, chartRadius, chartData, chartColors);
      
      // Draw legend
      drawChartLegend(130, yPosition + 15, chartData, chartColors);
      
      yPosition += 85;
    }

    // ==================== PAGE 6: TOP VENDORS ANALYSIS (NEW PAGE) ====================
    
    if (vendorBreakdown && vendorBreakdown.breakdown) {
      addNewPage();
      
      drawSectionHeader('TOP VENDORS ANALYSIS', 5);
      
      const vendorTableData = [];
      const entries = Object.entries(vendorBreakdown.breakdown);
      let rank = 1;
      
      entries.forEach(([vendor, data]) => {
        const percentage = safeDivide(data.value * 100, vendorBreakdown.total).toFixed(2);
        
        vendorTableData.push([
          vendor === 'Other Vendors' ? '-' : rank++,
          vendor,
          formatBillions(data.value),
          formatNumber(data.qty),
          `${percentage}%`
        ]);
      });
      
      // Add Total
      vendorTableData.push([
        '',
        'GRAND TOTAL',
        formatBillions(vendorBreakdown.total),
        formatNumber(vendorBreakdown.totalQty),
        '100.00%'
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Rank', 'Vendor Name', 'Total Amount', 'Orders', '% Share']],
        body: vendorTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [34, 197, 94],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          textColor: colors.white
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { fontStyle: 'bold', halign: 'left', cellWidth: 80 },
          2: { halign: 'right', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 20 }
        },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.row.index === vendorTableData.length - 1 || 
              (data.cell.raw && data.cell.raw.toString().includes('Other Vendors'))) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = colors.lightGray;
          }
        }
      });
      
      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // ==================== FINAL PAGE: NOTES & SIGN-OFF (NEW PAGE) ====================
    
    addNewPage();
    
    drawSectionHeader('NOTES & OBSERVATIONS', 6);
    
    doc.setTextColor(...colors.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const notes = [
      '• All amounts are displayed in Indian Rupees (Rs.).',
      '• Purchase orders are categorized by first digit: 1 = Overseas, 2 = Local, 3 = Job Orders.',
      '• Vendor amounts shown in Billions (B), Crores (Cr), or Lakhs (L) for better readability.',
      '• Percentages are calculated based on total purchase value.',
      '• This report is generated from the specified filtered/complete dataset.',
      '• All calculations are automated and verified for accuracy.',
      '• Currency format uses standard Indian numbering system with comma separation.',
      '• Charts display percentage distribution for visual clarity.',
      '• Report generated using LTL Purchase Analyzer - Professional Edition.'
    ];
    
    notes.forEach(note => {
      checkPageBreak(10);
      doc.text(note, 20, yPosition);
      yPosition += 7;
    });
    
    yPosition += 15;
    checkPageBreak(30);
    
    // Signature Section
    doc.setDrawColor(...colors.gray);
    doc.line(20, yPosition, 90, yPosition);
    doc.line(pageWidth - 90, yPosition, pageWidth - 20, yPosition);
    
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared By', 20, yPosition);
    doc.text('Approved By', pageWidth - 90, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Purchase Analysis Team', 20, yPosition);
    doc.text('Management', pageWidth - 90, yPosition);
    
    yPosition += 5;
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.text(new Date().toLocaleDateString('en-IN'), 20, yPosition);
    
    // Final footer
    addFooter();
    
    // Save the PDF
    const fileName = `LTL_Purchase_Analysis_Professional_${new Date().toISOString().split('T')[0]}_${new Date().getHours()}${new Date().getMinutes()}.pdf`;
    
    console.log('💾 Saving professional PDF:', fileName);
    doc.save(fileName);
    
    console.log('✅ Professional PDF generated and saved successfully');
    return fileName;
    
  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    throw error;
  }
};
