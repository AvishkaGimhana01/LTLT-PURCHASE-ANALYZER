import React, { useMemo, useState, useEffect } from 'react';


import { Pie, Bar } from 'react-chartjs-2';
// Currency symbols updated to Rs.


import {


  Chart as ChartJS,


  ArcElement,


  Tooltip,


  Legend,


  Title,


  CategoryScale,


  LinearScale,


  BarElement


} from 'chart.js';


import ChartDataLabels from 'chartjs-plugin-datalabels';


import { generateProfessionalPDF } from './PDFExport_Professional';


import './FilteredAnalysis.css';





// Register Chart.js components


ChartJS.register(


  ArcElement,


  Tooltip,


  Legend,


  Title,


  CategoryScale,


  LinearScale,


  BarElement,


  ChartDataLabels


);





function FilteredAnalysis({ filteredData, columns, filterInfo, onExportPDF, setExportHandler }) {


  // State for PDF export


  const [isExporting, setIsExporting] = useState(false);





  // Format currency - MOVED TO TOP to avoid hoisting issues


  const formatCurrency = (value) => {


    return new Intl.NumberFormat('en-IN', {


      minimumFractionDigits: 2,


      maximumFractionDigits: 2


    }).format(value);


  };





  // Format currency as billions or millions based on value


  const formatBillions = (value) => {


    if (value === 0) return 'Rs. 0.00';


    


    const absValue = Math.abs(value);


    


    if (absValue >= 1000000000) {


      // Show in Billions (B) if >= 1 billion


      const billions = (value / 1000000000).toFixed(2);


      return `Rs. ${billions}B`;


    } else if (absValue >= 1000000) {


      // Show in Millions (M) if >= 1 million


      const millions = (value / 1000000).toFixed(2);


      return `Rs. ${millions}M`;


    } else if (absValue >= 1000) {


      // Show in Thousands (K) if >= 1 thousand


      const thousands = (value / 1000).toFixed(2);


      return `Rs. ${thousands}K`;


    } else {


      // Show actual value for small amounts


      return `Rs. ${formatCurrency(value)}`;


    }


  };





  // Format date for display


  const formatDateRange = (dateInfo) => {


    if (!dateInfo) return null;


    


    if (dateInfo.selectedDate) {


      return `Date: ${dateInfo.selectedDate}`;


    } else if (dateInfo.startDate && dateInfo.endDate) {


      return `Date Range: ${dateInfo.startDate} - ${dateInfo.endDate}`;


    }


    return null;


  };





  // Auto-detect column names with better pattern matching


  const detectedColumns = useMemo(() => {


    if (!filteredData || filteredData.length === 0) {


      console.warn('š ℹ¸ No filtered data received!');


      return {};


    }


    


    const firstRow = filteredData[0];


    const keys = Object.keys(firstRow);


    


    console.group('” FilteredAnalysis - Column Detection');


    console.log(' Total filtered records:', filteredData.length);


    console.log(' Available columns:', keys);


    console.log(' Sample row (full):', firstRow);


    console.log(' First 3 rows full data:', filteredData.slice(0, 3));


    


    // Try to find columns with more flexible patterns


    const detected = {


      // For Order Type - USE ORDER NUMBER COLUMN (#_1) and extract FIRST DIGIT


      // Order number format: 1001300 ? first digit "1" = Import Order


      //                      2001234 ? first digit "2" = Local Order  


      //                      3001567 ? first digit "3" = Job Order


      type: keys.find(k => {


        // Look for "#_1" column (order number)


        if (k === '#_1' || k.toLowerCase().includes('order number') || k.toLowerCase().includes('ordernumber')) {


          const orderNum = String(firstRow[k] || '').trim();


          const firstDigit = orderNum.charAt(0);


          console.log(`📊 Found ORDER NUMBER column: "${k}" = ${orderNum}`);


          console.log(`📊 First digit: "${firstDigit}" ? ${firstDigit === '1' ? 'Import Order' : firstDigit === '2' ? 'Local Order' : firstDigit === '3' ? 'Job Order' : 'Unknown'}`);


          return true;


        }


        return false;


      }),


      // For Item Code (starts with number = Item, starts with S = Service)


      category: keys.find(k => {


        const lower = k.toLowerCase().replace(/\s+/g, '');


        // Check if this is "Document Type" column which has Item/Service


        if (lower === 'documenttype' || lower === 'document_type') return true;


        if (lower === 'type' && firstRow[k] && (String(firstRow[k]).toLowerCase().includes('item') || String(firstRow[k]).toLowerCase().includes('service'))) return true;


        


        return (lower.includes('item') && lower.includes('code')) ||


               lower === 'itemcode' ||


               lower === 'item' ||


               lower === 'code' ||


               lower === 'productcode' ||


               lower === 'product' ||


               lower.includes('sku');


      }),


      // For Amount/Value - try all possible column names


      amount: keys.find(k => {


        // EXCLUDE columns that are NOT amounts


        const lower = k.toLowerCase();


        if (lower.includes('price mode') || lower.includes('pricemode')) return false;


        if (lower.includes('currency')) return false;


        if (lower.includes('payment terms')) return false;


        if (lower.includes('status')) return false;


        


        // First, try exact match with the actual column name (case-insensitive)


        if (lower === 'document total') return true;


        if (lower === 'doc total') return true;


        


        // Then normalize and check


        const normalized = lower.replace(/\s+/g, '').replace(/_/g, '');


        


        // Check for exact matches (more specific)


        if (normalized === 'documenttotal') return true;


        if (normalized === 'doctotal') return true;


        


        // Then check for partial matches


        return normalized.includes('amount') || 


               normalized.includes('value') || 


               normalized.includes('total') ||


               normalized.includes('price') ||


               normalized.includes('sum') ||


               normalized.includes('net') ||


               normalized.includes('gross') ||


               normalized === 'amt' ||


               normalized.includes('sales') ||


               normalized.includes('revenue');


      }),


      // For Vendor name


      vendor: keys.find(k => {


        const lower = k.toLowerCase().replace(/\s+/g, '');


        return lower.includes('vendor') || 


               lower.includes('supplier') || 


               lower === 'vendorname' ||


               lower === 'suppliername' ||


               k === 'Vendor Name' ||


               k === 'vendor_name';


      }),


      // For Price Mode / Currency


      priceMode: keys.find(k => {


        const lower = k.toLowerCase().replace(/\s+/g, '');


        return lower.includes('pricemode') || 


               lower.includes('price_mode') || 


               lower === 'pricemode' ||


               lower.includes('currency') ||


               k === 'Price Mode' ||


               k === 'price_mode';


      }),


    };


    


    console.log(' Detected columns:', detected);


    


    // DEBUG: Check ALL columns to find order type


    console.group('  ” Searching for ORDER TYPE column (Overseas/Local/Job Orders):');


    keys.forEach(k => {


      const firstValue = String(firstRow[k] || '').trim();


      // Check if it might be order type related


      if (firstValue === '1' || firstValue === '2' || firstValue === '3') {


        console.log(`📊 Column "${k}": ${firstValue} † Might be order type!`);


      } else {


        const lower = firstValue.toLowerCase();


        if (lower.includes('import') || lower.includes('export') || 


            lower.includes('overseas') || lower.includes('local') || lower.includes('job')) {


          console.log(`📊 Column "${k}": ${firstValue} † Might be order type!`);


        }


      }


    });


    console.groupEnd();


    


    // DEBUG: Check #_1 column to see if it's the order type


    if (keys.includes('#_1')) {


      console.log('  ” Checking "#_1" column for order type:');


      console.log('    First row value:', firstRow['#_1']);


      console.log('    Sample values:', filteredData.slice(0, 5).map(r => r['#_1']));


    }


    


    // DEBUG: Check # column


    if (keys.includes('#')) {


      console.log('  ” Checking "#" column for order type:');


      console.log('    First row value:', firstRow['#']);


      console.log('    Sample values:', filteredData.slice(0, 5).map(r => r['#']));


    }


    


    // CRITICAL DEBUG: Show exact column names and their contents


    if (detected.amount) {


      console.log(`   Amount column detected: "${detected.amount}"`);


      console.log(`   First row amount value:`, firstRow[detected.amount], `(type: ${typeof firstRow[detected.amount]})`);


      console.log(`   Sample amount values from first 5 rows:`, 


        filteredData.slice(0, 5).map((r, i) => ({


          row: i + 1,


          value: r[detected.amount],


          type: typeof r[detected.amount]


        })));


    } else {


      console.error('❌ NO AMOUNT COLUMN DETECTED!');


      console.log('Available column names:', keys);


      console.log('Looking for columns containing: document, total, amount, value, price');


    }


    


    // Show sample values for detected columns with actual data


    if (detected.type) {


      console.log(`📊 Type column "${detected.type}":`, firstRow[detected.type]);


      console.log(`  Sample values from first 5 rows:`, 


        filteredData.slice(0, 5).map(r => r[detected.type]));


    } else {


      console.warn('  ⚠️ NO ORDER TYPE COLUMN detected!');


      console.log('  Will use filter info for order type categorization');


    }


    


    if (detected.type && detected.type !== 'Document Type') {


      console.log(`  Type column "${detected.type}":`, firstRow[detected.type]);


      console.log(`  Sample values from first 3 rows:`, 


        filteredData.slice(0, 3).map(r => r[detected.type]));


    } else {


      console.error('❌ Type column NOT detected!');


    }


    


    if (detected.category) {


      console.log(`  Category column "${detected.category}":`, firstRow[detected.category]);


      console.log(`  Sample values from first 3 rows:`, 


        filteredData.slice(0, 3).map(r => r[detected.category]));


    } else {


      console.error('❌ Category column NOT detected!');


    }


    


    if (detected.amount) {


      console.log(`  Amount column "${detected.amount}":`, firstRow[detected.amount]);


      console.log(`  Sample values from first 3 rows:`, 


        filteredData.slice(0, 3).map(r => r[detected.amount]));


    } else {


      console.error('❌ Amount column NOT detected!');


    }


    


    // Show ALL columns if any detection failed


    if (!detected.type || !detected.category || !detected.amount) {


      console.warn('⚠️ Some columns not detected. All available columns with sample values:');


      keys.forEach(key => {


        console.log(`  - "${key}": ${JSON.stringify(firstRow[key])}`);


      });


    }


    


    console.groupEnd();


    return detected;


  }, [filteredData]);





  // Calculate Overseas, Local, Job Ordebreakdown


  const typeBreakdown = useMemo(() => {


    if (!detectedColumns.amount) {


      console.warn('š ℹ¸ Type breakdown skipped - missing amount column:', { 


        amount: detectedColumns.amount 


      });


      console.warn('š ℹ¸ Available columns:', Object.keys(filteredData[0] || {}));


      // Return zero breakdown


      return {


        breakdown: {


          'Overseas': { value: 0, qty: 0 },


          'Local': { value: 0, qty: 0 },


          'Job Orders': { value: 0, qty: 0 }


        },


        total: 0,


        totalQty: 0


      };


    }





    console.group(' Calculating Type Breakdown (Overseas/Local/Job Orders)');


    console.log('Using columns:', { type: detectedColumns.type, amount: detectedColumns.amount });





    const breakdown = {


      'Import Order': { value: 0, qty: 0 },


      'Local Order': { value: 0, qty: 0 },


      'Job Order': { value: 0, qty: 0 }


    };





    // Sample first 5 rows for debugging


    const samples = [];


    


    // Calculate total amount from all filtered data


    let totalAmount = 0;


    let totalCount = filteredData.length;





    filteredData.forEach((row, index) => {


      const amountRaw = row[detectedColumns.amount];


      // Handle different amount formats: number, string with commas, currency symbols, etc.


      let amount = 0;


      


      if (amountRaw === null || amountRaw === undefined || amountRaw === '') {


        amount = 0;


      } else if (typeof amountRaw === 'number') {


        amount = amountRaw;


      } else if (typeof amountRaw === 'string') {


        // Remove currency symbols, commas, spaces and parse


        const cleaned = amountRaw.replace(/[?$ℹ¿½ℹ¿½,\s]/g, '').trim();


        amount = parseFloat(cleaned) || 0;


      } else {


        // Try to convert to number as last resort


        amount = parseFloat(amountRaw) || 0;


      }


      


      if (index < 3) {


        console.log(` TYPE BREAKDOWN - Row ${index + 1}: amountRaw =`, amountRaw, ', parsed =', amount, ', type =', typeof amountRaw);


      }


      


      totalAmount += amount;


      


      // If we have type column (ORDER NUMBER), extract FIRST DIGIT to categorize


      if (detectedColumns.type) {


        const orderNumber = String(row[detectedColumns.type] || '').trim();


        const firstDigit = orderNumber.charAt(0); // Extract first digit





        if (index < 5) {


          samples.push({ 


            orderNumber, 


            firstDigit, 


            orderType: firstDigit === '1' ? 'Import' : firstDigit === '2' ? 'Local' : firstDigit === '3' ? 'Job Order' : 'Unknown',


            amountRaw, 


            amountParsed: amount, 


            row: index + 1 


          });


        }





        // Categorize by FIRST DIGIT of order number


        // 1001300 ? first digit "1" ? Import Order


        // 2001234 ? first digit "2" ? Local Order


        // 3001567 ? first digit "3" ? Job Order


        if (firstDigit === '1') {


          breakdown['Import Order'].value += amount;


          breakdown['Import Order'].qty += 1;


        } else if (firstDigit === '2') {


          breakdown['Local Order'].value += amount;


          breakdown['Local Order'].qty += 1;


        } else if (firstDigit === '3') {


          breakdown['Job Order'].value += amount;


          breakdown['Job Order'].qty += 1;


        } else if (orderNumber) {


          if (index < 10) { // Log first 10 unmatched


            console.log(`“ Unmatched order number in row ${index + 1}: "${orderNumber}" (first digit: "${firstDigit}")`, 'Amount:', amount);


          }


        }


      }


    });


    


    // If no type column or all values went to one category based on filter, 


    // put all data in the appropriate category based on filterInfo


    if (!detectedColumns.type || (breakdown['Import Order'].qty === 0 && breakdown['Local Order'].qty === 0 && breakdown['Job Order'].qty === 0)) {


      console.warn('š ℹ¸ No ORDER NUMBER column detected - cannot extract first digit for order type');


      


      // Check if user filtered by order type


      if (filterInfo?.orderType) {



        if (filterInfo.orderType === '1') {


          breakdown['Import Order'].value = totalAmount;


          breakdown['Import Order'].qty = totalCount;


        } else if (filterInfo.orderType === '2') {


          breakdown['Local Order'].value = totalAmount;


          breakdown['Local Order'].qty = totalCount;


        } else if (filterInfo.orderType === '3') {


          breakdown['Job Order'].value = totalAmount;


          breakdown['Job Order'].qty = totalCount;


        }


      } else {


        // No filter, distribute to Import by default or show in all


        breakdown['Import Order'].value = totalAmount;


        breakdown['Import Order'].qty = totalCount;


      }


    }




    const total = Object.values(breakdown).reduce((sum, item) => sum + item.value, 0);


    const totalQty = Object.values(breakdown).reduce((sum, item) => sum + item.qty, 0);





    // Count distribution of first digits  


    const digitCounts = { '1': 0, '2': 0, '3': 0, 'other': 0 };


    filteredData.forEach(row => {


      const orderNum = String(row[detectedColumns.type] || '').trim();


      const firstDigit = orderNum.charAt(0);


      if (firstDigit === '1') digitCounts['1']++;


      else if (firstDigit === '2') digitCounts['2']++;


      else if (firstDigit === '3') digitCounts['3']++;


      else digitCounts['other']++;


    });





    console.log(' Sample order numbe(first 5 rows):', samples);


    console.log(' FIRST DIGIT DISTRIBUTION:');


    console.log(`   Ordestarting with 1: ${digitCounts['1']} (${(digitCounts['1']/totalQty*100).toFixed(2)}%)`);


    console.log(`   Ordestarting with 2: ${digitCounts['2']} (${(digitCounts['2']/totalQty*100).toFixed(2)}%)`);


    console.log(`   Ordestarting with 3: ${digitCounts['3']} (${(digitCounts['3']/totalQty*100).toFixed(2)}%)`);


    console.log(`   Other: ${digitCounts['other']}`);


    console.log(' Breakdown result:', breakdown);


    console.log(' Total Value:', total, '| Total Qty:', totalQty);


    console.log(' Import (1xxx):', breakdown['Import Order'].value, 'Qty:', breakdown['Import Order'].qty);


    console.log(' Export (2xxx):', breakdown['Local Order'].value, 'Qty:', breakdown['Local Order'].qty);


    console.log(' Job (3xxx):', breakdown['Job Order'].value, 'Qty:', breakdown['Job Order'].qty);


    console.groupEnd();





    return { breakdown, total, totalQty };


  }, [filteredData, detectedColumns, filterInfo]);





  // Calculate Item vs Service breakdown


  const itemServiceBreakdown = useMemo(() => {


    if (!detectedColumns.amount) {


      console.warn('š ℹ¸ Item/Service breakdown skipped - missing amount column:', { 


        amount: detectedColumns.amount 


      });


      console.warn('š ℹ¸ Available columns:', Object.keys(filteredData[0] || {}));


      // Return zero breakdown


      return {


        breakdown: {


          'Item': { value: 0, qty: 0 },


          'Service': { value: 0, qty: 0 }


        },


        total: 0,


        totalQty: 0


      };


    }





    console.group('·ℹ¸ Calculating Item vs Service Breakdown');


    console.log('Using columns:', { category: detectedColumns.category, amount: detectedColumns.amount });


    console.log('Working with filtered data:', filteredData.length, 'records');


    console.log('This data is AFTER order type filtering, so we analyze items/services WITHIN the filtered orders');





    const breakdown = {


      'Item': { value: 0, qty: 0 },


      'Service': { value: 0, qty: 0 }


    };





    // Sample first 5 rows for debugging


    const samples = [];


    


    // Calculate total amount from all filtered data


    let totalAmount = 0;


    let totalCount = filteredData.length;





    filteredData.forEach((row, index) => {


      const amountRaw = row[detectedColumns.amount];


      // Handle different amount formats: number, string with commas, currency symbols, etc.


      let amount = 0;


      


      if (amountRaw === null || amountRaw === undefined || amountRaw === '') {


        amount = 0;


      } else if (typeof amountRaw === 'number') {


        amount = amountRaw;


      } else if (typeof amountRaw === 'string') {


        // Remove currency symbols, commas, spaces and parse


        const cleaned = amountRaw.replace(/[?$ℹ¿½ℹ¿½,\s]/g, '').trim();


        amount = parseFloat(cleaned) || 0;


      } else {


        // Try to convert to number as last resort


        amount = parseFloat(amountRaw) || 0;


      }


      


      if (index < 3) {


        console.log(` ITEM/SERVICE BREAKDOWN - Row ${index + 1}: amountRaw =`, amountRaw, ', parsed =', amount, ', type =', typeof amountRaw);


      }


      


      totalAmount += amount;


      


      // If we have category column, categorize


      if (detectedColumns.category) {


        const categoryValue = String(row[detectedColumns.category] || '').trim();





        if (index < 5) {


          samples.push({ categoryValue, amountRaw, amountParsed: amount, row: index + 1 });


        }





        // Item codes starting with numbe(1xxx, 2xxx, 3xxx, etc.) = Items


        // Item codes starting with 'S' or containing 'service' = Services


        // OR directly check if value is "Item" or "Service" text


        const categoryLower = categoryValue.toLowerCase();


        const firstChar = categoryValue.charAt(0).toLowerCase();


        


        // Check for exact text match first (for "Document Type" column)


        if (categoryLower === 'item') {


          breakdown['Item'].value += amount;


          breakdown['Item'].qty += 1;


        } else if (categoryLower === 'service') {


          breakdown['Service'].value += amount;


          breakdown['Service'].qty += 1;


        } else if (firstChar >= '0' && firstChar <= '9') {


          // Starts with a number = Item


          breakdown['Item'].value += amount;


          breakdown['Item'].qty += 1;


        } else if (firstChar === 's' || categoryLower.includes('service') || categoryLower.includes('labour')) {


          // Starts with S or contains service/labour = Service


          breakdown['Service'].value += amount;


          breakdown['Service'].qty += 1;


        } else {


          // Default to Item if uncertain


          breakdown['Item'].value += amount;


          breakdown['Item'].qty += 1;


          if (categoryValue && index < 5) {


            console.log(`“ Uncertain category in row ${index + 1}:`, categoryValue, '(defaulted to Item)');


          }


        }


      }


    });


    


    // If no category column detected, we need to check if user already filtered by category


    if (!detectedColumns.category) {


      console.warn('š ℹ¸ No category column detected - checking filter info');


      


      // If user filtered by item/service, show it accordingly


      if (filterInfo?.itemService) {


        if (filterInfo.itemService.toLowerCase() === 'item') {


          breakdown['Item'].value = totalAmount;


          breakdown['Item'].qty = totalCount;


          console.log(' Using filter info: All data is Item (user filtered)');


        } else if (filterInfo.itemService.toLowerCase() === 'service') {


          breakdown['Service'].value = totalAmount;


          breakdown['Service'].qty = totalCount;


          console.log(' Using filter info: All data is Service (user filtered)');


        }


      } else {


        // No item/service filter and no category column


        // Show all data as uncategorized in Item by default


        breakdown['Item'].value = totalAmount;


        breakdown['Item'].qty = totalCount;


        console.log('š ℹ¸ No category info available - showing all as Item');


      }


    } else if (breakdown['Item'].qty === 0 && breakdown['Service'].qty === 0) {


      // Category column exists but no items were categorized


      console.warn('š ℹ¸ Category column exists but no categorization happened');


      


      // If user filtered by item/service, honor that


      if (filterInfo?.itemService) {


        if (filterInfo.itemService.toLowerCase() === 'item') {


          breakdown['Item'].value = totalAmount;


          breakdown['Item'].qty = totalCount;


        } else if (filterInfo.itemService.toLowerCase() === 'service') {


          breakdown['Service'].value = totalAmount;


          breakdown['Service'].qty = totalCount;


        }


      } else {


        // Default to showing in Item


        breakdown['Item'].value = totalAmount;


        breakdown['Item'].qty = totalCount;


      }


    }





    const total = Object.values(breakdown).reduce((sum, item) => sum + item.value, 0);


    const totalQty = Object.values(breakdown).reduce((sum, item) => sum + item.qty, 0);





    console.log(' Sample values (first 5 rows):', samples);


    console.log(' Breakdown result:', breakdown);


    console.log(' Total Value:', total, '| Total Qty:', totalQty);


    console.log(' Calculated Total Amount:', totalAmount, '| Total Count:', totalCount);


    console.groupEnd();





    return { breakdown, total, totalQty };


  }, [filteredData, detectedColumns, filterInfo]);





  // Currency-wise breakdown (Price Mode column)


  const currencyBreakdown = useMemo(() => {


    if (!detectedColumns.amount) {


      console.warn('š ℹ¸ Currency breakdown skipped - missing amount column');


      return {


        breakdown: {},


        total: 0,


        totalQty: 0


      };


    }





    console.group(' Calculating Currency-wise Breakdown');


    console.log('Using columns:', { priceMode: detectedColumns.priceMode, amount: detectedColumns.amount });


    console.log('Working with filtered data:', filteredData.length, 'records');





    const breakdown = {};


    let totalAmount = 0;


    let totalCount = filteredData.length;





    filteredData.forEach((row, index) => {


      // Get amount


      const amountRaw = row[detectedColumns.amount];


      let amount = 0;


      


      if (amountRaw === null || amountRaw === undefined || amountRaw === '') {


        amount = 0;


      } else if (typeof amountRaw === 'number') {


        amount = amountRaw;


      } else if (typeof amountRaw === 'string') {


        const cleaned = amountRaw.replace(/[?$ℹ¿½ℹ¿½,\s]/g, '').trim();


        amount = parseFloat(cleaned) || 0;


      } else {


        amount = parseFloat(amountRaw) || 0;


      }


      


      totalAmount += amount;





      // Get currency/price mode


      let currency = 'Unknown';


      if (detectedColumns.priceMode) {


        const currencyValue = String(row[detectedColumns.priceMode] || 'Unknown').trim();


        currency = currencyValue || 'Unknown';


      } else {


        currency = 'INR'; // Default to INR if no price mode column


      }





      // Initialize currency in breakdown if not exists


      if (!breakdown[currency]) {


        breakdown[currency] = { value: 0, qty: 0 };


      }





      breakdown[currency].value += amount;


      breakdown[currency].qty += 1;





      if (index < 3) {


        console.log(` Row ${index + 1}: currency =`, currency, ', amount =', amount);


      }


    });





    const total = Object.values(breakdown).reduce((sum, item) => sum + item.value, 0);


    const totalQty = Object.values(breakdown).reduce((sum, item) => sum + item.qty, 0);





    console.log(' Currency breakdown result:', breakdown);


    console.log(' Total Value:', total, '| Total Qty:', totalQty);


    console.groupEnd();





    return { breakdown, total, totalQty };


  }, [filteredData, detectedColumns]);





  // Top 10 VendoBreakdown with "Other Vendors"


  const vendorBreakdown = useMemo(() => {


    console.group('¢ VENDOR BREAKDOWN - Top 10 + Other');


    


    if (!detectedColumns.vendor) {


      console.warn('š ℹ¸ No vendor column detected!');


      console.groupEnd();


      return null;


    }





    if (!detectedColumns.amount) {


      console.error('❌ No amount column detected!');


      console.groupEnd();


      return null;


    }





    const vendorMap = {};





    filteredData.forEach((row, index) => {


      const vendorName = String(row[detectedColumns.vendor] || 'Unknown').trim();


      const amountRaw = row[detectedColumns.amount];


      


      let amount = 0;


      if (amountRaw === null || amountRaw === undefined || amountRaw === '') {


        amount = 0;


      } else if (typeof amountRaw === 'number') {


        amount = amountRaw;


      } else if (typeof amountRaw === 'string') {


        const cleaned = amountRaw.replace(/[?$ℹ¿½ℹ¿½,\s]/g, '').trim();


        amount = parseFloat(cleaned) || 0;


      } else {


        amount = parseFloat(amountRaw) || 0;


      }





      if (!vendorMap[vendorName]) {


        vendorMap[vendorName] = { value: 0, qty: 0 };


      }


      vendorMap[vendorName].value += amount;


      vendorMap[vendorName].qty += 1;


    });





    // Sort vendors by total value


    const sortedVendors = Object.entries(vendorMap)


      .sort((a, b) => b[1].value - a[1].value);





    // Get top 10


    const top10 = sortedVendors.slice(0, 10);


    const others = sortedVendors.slice(10);





    // Calculate "Other Vendors" total


    const otherTotal = others.reduce((sum, [_, data]) => sum + data.value, 0);


    const otherQty = others.reduce((sum, [_, data]) => sum + data.qty, 0);





    const breakdown = {};


    top10.forEach(([vendor, data]) => {


      breakdown[vendor] = data;


    });





    if (others.length > 0) {


      breakdown['Other Vendors'] = { value: otherTotal, qty: otherQty };


    }





    const total = Object.values(breakdown).reduce((sum, item) => sum + item.value, 0);


    const totalQty = Object.values(breakdown).reduce((sum, item) => sum + item.qty, 0);





    console.log(`📊 Top 10 vendors:`, top10.map(([name, data]) => `${name}: Rs. ${formatCurrency(data.value)}`));


    console.log(` Other vendo(${others.length}):`, `Rs. ${formatCurrency(otherTotal)}`);


    console.log(' Total Value:', total, '| Total Qty:', totalQty);


    console.groupEnd();





    return { breakdown, total, totalQty, vendorCount: sortedVendors.length };


  }, [filteredData, detectedColumns]);



  // Order Type vs Item/Service Breakdown for Stacked Chart


  const orderTypeItemServiceBreakdown = useMemo(() => {


    if (!detectedColumns.type || !detectedColumns.category || !detectedColumns.amount) {


      console.warn(' Order Type vs Item/Service breakdown skipped - missing columns');


      console.warn('  type:', detectedColumns.type);


      console.warn('  category:', detectedColumns.category);


      console.warn('  amount:', detectedColumns.amount);


      return {


        categories: [],


        itemData: [],


        serviceData: []


      };


    }



    console.group(' Calculating Order Type vs Item/Service Breakdown');


    console.log('Using columns:', { 


      type: detectedColumns.type, 


      category: detectedColumns.category, 


      amount: detectedColumns.amount 


    });


    


    // Initialize breakdown object


    const breakdown = {


      'Import Order': { item: 0, service: 0 },


      'Local Order': { item: 0, service: 0 },


      'Job Order': { item: 0, service: 0 }


    };



    filteredData.forEach((row) => {


      const orderNumber = String(row[detectedColumns.type] || '').trim();


      const category = String(row[detectedColumns.category] || '').trim().toLowerCase();


      const amountRaw = row[detectedColumns.amount];


      


      // Parse amount


      let amount = 0;


      if (amountRaw === null || amountRaw === undefined || amountRaw === '') {


        amount = 0;


      } else if (typeof amountRaw === 'number') {


        amount = amountRaw;


      } else if (typeof amountRaw === 'string') {


        const cleaned = amountRaw.replace(/[?$ℹ¿½ℹ¿½,\s]/g, '').trim();


        amount = parseFloat(cleaned) || 0;


      } else {


        amount = parseFloat(amountRaw) || 0;


      }



      if (!orderNumber || amount === 0) return;



      // Determine order type from first digit


      const firstChar = orderNumber.charAt(0);


      let orderType = '';


      


      if (firstChar === '1') {


        orderType = 'Import Order';


      } else if (firstChar === '2') {


        orderType = 'Local Order';


      } else if (firstChar === '3') {


        orderType = 'Job Order';


      }



      if (!orderType) return;



      // Determine if Item or Service


      const isService = category.includes('service') || 


                       category.includes('labour') || 


                       category.includes('labor');


      


      if (isService) {


        breakdown[orderType].service += amount;


      } else {


        breakdown[orderType].item += amount;


      }


    });



    // Prepare data for chart


    const categories = ['Import Order', 'Local Order', 'Job Order'];


    const itemData = categories.map(cat => breakdown[cat].item);


    const serviceData = categories.map(cat => breakdown[cat].service);



    console.log('Order Type Breakdown:', breakdown);


    console.log('Chart Data - Items:', itemData);


    console.log('Chart Data - Services:', serviceData);


    console.groupEnd();



    return {


      breakdown,


      categories,


      itemData,


      serviceData


    };


  }, [filteredData, detectedColumns]);





  // PDF Export Handler - MUST be after all useMemo hooks that it depends on


  const handleExportPDF = async () => {


    setIsExporting(true);


    try {


      console.log('Starting PDF export...');


      console.log('typeBreakdown:', typeBreakdown);


      console.log('itemServiceBreakdown:', itemServiceBreakdown);


      console.log('currencyBreakdown:', currencyBreakdown);


      console.log('vendorBreakdown:', vendorBreakdown);


      console.log('filterInfo:', filterInfo);


      


      const exportData = {


        typeBreakdown,


        itemServiceBreakdown,


        currencyBreakdown,


        vendorBreakdown,


        filterInfo,


        filteredData


      };


      


      console.log('Export data prepared:', exportData);


      


      const fileName = await generateProfessionalPDF(exportData);


      


      console.log('PDF generated successfully:', fileName);


      


      // Show success message


      alert(`✅ Report exported successfully!\n\nFile: ${fileName}`);


    } catch (error) {


      console.error('❌ PDF Export Error Details:', error);


      console.error('Error message:', error.message);


      console.error('Error stack:', error.stack);


      alert(`❌ Error generating PDF report.\n\nError: ${error.message}\n\nCheck browser console for details.`);


    } finally {


      setIsExporting(false);


    }


  };





  // Pass export handler to parent component


  useEffect(() => {


    if (setExportHandler) {


      setExportHandler(() => handleExportPDF);


    }


  }, [setExportHandler, typeBreakdown, itemServiceBreakdown, currencyBreakdown, vendorBreakdown, filterInfo, filteredData]);





  // Professional donut chart options with animations - Labels outside with lines


  const pieChartOptions = {


    responsive: true,


    maintainAspectRatio: true,


    cutout: '65%', // Creates donut hole (65% cutout for professional look)


    plugins: {


      legend: {


        display: true,


        position: 'bottom',


        labels: {


          font: {


            size: 14,


            family: "'Inter', sans-serif",


            weight: '600'


          },


          padding: 15,


          boxWidth: 20,


          boxHeight: 20,


          usePointStyle: true,


          pointStyle: 'circle',


          generateLabels: (chart) => {


            const data = chart.data;


            if (data.labels.length && data.datasets.length) {


              return data.labels.map((label, i) => {


                const meta = chart.getDatasetMeta(0);


                const style = meta.controller.getStyle(i);


                const value = data.datasets[0].data[i];


                const dataArray = data.datasets[0].data;


                const total = dataArray.reduce((sum, val) => sum + val, 0);


                const percentage = ((value / total) * 100).toFixed(2);


                


                return {


                  text: `${label}: ${percentage}%`,


                  fillStyle: style.backgroundColor,


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


        enabled: true,


        backgroundColor: 'rgba(255, 255, 255, 0.98)',


        titleColor: '#1f2937',


        bodyColor: '#374151',


        borderColor: '#e5e7eb',


        borderWidth: 2,


        padding: 16,


        titleFont: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },


        bodyFont: { size: 14, family: "'Inter', sans-serif" },


        bodySpacing: 6,


        cornerRadius: 12,


        displayColors: true,


        boxWidth: 12,


        boxHeight: 12,


        callbacks: {


          label: (context) => {


            const value = context.parsed || 0;


            const dataArray = context.chart.data.datasets[0].data;


            const total = dataArray.reduce((sum, val) => sum + val, 0);


            const percentage = ((value / total) * 100).toFixed(2);


            const items = context.dataset.items ? context.dataset.items[context.dataIndex] : 0;


            return [


              `Amount: Rs. ${formatCurrency(value)}`,


              `Percentage: ${percentage}%`,


              `Items: ${items.toLocaleString()}`


            ];


          }


        }


      },


      datalabels: {


        color: '#ffffff',


        font: { 


          weight: '700', 


          size: 16,


          family: "'Inter', 'Segoe UI', sans-serif"


        },


        formatter: (value, context) => {


          // Use the EXACT same total calculation method


          const dataArray = context.chart.data.datasets[0].data;


          const total = dataArray.reduce((sum, val) => sum + val, 0);


          const percentage = ((value / total) * 100).toFixed(2);


          const label = context.chart.data.labels[context.dataIndex];


          


          // Only show label and percentage for segments > 5%


          if (parseFloat(percentage) < 5) {


            return `${percentage}%`;


          }


          return `${label}\n${percentage}%`;


        },


        // Position labels INSIDE the pie slices


        anchor: 'center',


        align: 'center',


        offset: 0,


        borderWidth: 0,


        backgroundColor: null,


        padding: 6,


        textAlign: 'center',


        clamp: true,


        clip: false,


        textStrokeColor: 'rgba(0,0,0,0.3)',


        textStrokeWidth: 2


      }


    },


    interaction: {


      mode: 'index',


      intersect: false


    },


    animation: {


      animateRotate: true,


      animateScale: true,


      duration: 2000,


      easing: 'easeInOutQuart',


      delay: (context) => {


        let delay = 0;


        if (context.type === 'data' && context.mode === 'default') {


          delay = context.dataIndex * 150 + context.datasetIndex * 100;


        }


        return delay;


      }


    },


    transitions: {


      active: {


        animation: {


          duration: 400


        }


      }


    },


    hover: {


      mode: 'nearest',


      intersect: true,


      animationDuration: 400


    },


    elements: {


      arc: {


        borderWidth: 3,


        borderColor: '#ffffff',


        hoverBorderWidth: 4,


        hoverBorderColor: '#ffffff',


        hoverOffset: 15


      }


    },


    layout: {


      padding: {


        top: 40,


        bottom: 40,


        left: 40,


        right: 40


      }


    }


  };





  // Type breakdown chart data - Professional solid colors


  const typeChartData = typeBreakdown ? (() => {


    const entries = Object.entries(typeBreakdown.breakdown)


      .filter(([key, data]) => data.value > 0); // Only show non-zero values


    


    // Professional vibrant colomatching the reference image


    const professionalColors = [


      '#5B7FE8',  // Blue - Overseas/Import


      '#F97316',  // Orange - Local  


      '#A855F7',  // Purple - Job Orders


    ];


    


    return {


      labels: entries.map(([key]) => key),


      datasets: [{


        data: entries.map(([key, data]) => data.value),


        items: entries.map(([key, data]) => data.qty),


        backgroundColor: entries.map((_, i) => professionalColors[i] || '#94A3B8'),


        borderColor: '#ffffff',


        borderWidth: 3,


        hoverBackgroundColor: entries.map((_, i) => professionalColors[i] || '#94A3B8'),


        hoverBorderWidth: 4,


        hoverBorderColor: '#ffffff',


        hoverOffset: 8,


        offset: 2


      }]


    };


  })() : null;





  // Item/Service chart data - Professional solid colors


  const itemServiceChartData = itemServiceBreakdown ? (() => {


    const entries = Object.entries(itemServiceBreakdown.breakdown)


      .filter(([key, data]) => data.value > 0); // Only show non-zero values


    


    // Professional vibrant colors


    const professionalColors = [


      '#A855F7',  // Purple - Item


      '#EF4444',  // Red - Service


    ];


    


    return {


      labels: entries.map(([key]) => key),


      datasets: [{


        data: entries.map(([key, data]) => data.value),


        items: entries.map(([key, data]) => data.qty),


        backgroundColor: entries.map((_, i) => professionalColors[i] || '#94A3B8'),


        borderColor: '#ffffff',


        borderWidth: 3,


        hoverBackgroundColor: entries.map((_, i) => professionalColors[i] || '#94A3B8'),


        hoverBorderWidth: 4,


        hoverBorderColor: '#ffffff',


        hoverOffset: 8,


        offset: 5,


        spacing: 2


      }]


    };


  })() : null;





  // Bar chart options for vendor data


  const barChartOptions = {


    responsive: true,


    maintainAspectRatio: false,


    indexAxis: 'y', // Horizontal bar chart


    plugins: {


      legend: {


        display: false


      },


      tooltip: {


        enabled: true,


        backgroundColor: 'rgba(255, 255, 255, 0.98)',


        titleColor: '#1f2937',


        bodyColor: '#374151',


        borderColor: '#e5e7eb',


        borderWidth: 2,


        padding: 16,


        titleFont: { size: 16, weight: 'bold' },


        bodyFont: { size: 14 },


        cornerRadius: 12,


        callbacks: {


          label: (context) => {


            const value = context.parsed.x || 0;


            const billions = (value / 1000000000).toFixed(2);


            const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);


            const percentage = ((value / total) * 100).toFixed(2);


            return `Amount: Rs. ${billions}B (${percentage}%)`;


          }


        }


      },


      datalabels: {


        anchor: 'end',


        align: 'end',


        offset: 4,


        color: '#667eea',


        font: {


          size: 12,


          weight: 'bold'


        },


        formatter: (value, context) => {


          // Calculate percentage


          const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);


          const percentage = ((value / total) * 100).toFixed(2);


          const billions = (value / 1000000000).toFixed(2);


          return `Rs. ${billions}B (${percentage}%)`;


        }


      }


    },


    scales: {


      x: {


        beginAtZero: true,


        grid: {


          color: 'rgba(0, 0, 0, 0.05)',


          drawBorder: false


        },


        ticks: {


          callback: (value) => {


            const billions = (value / 1000000000).toFixed(1);


            return `Rs. ${billions}B`;


          },


          font: {


            size: 12,


            weight: '600'


          },


          color: '#6b7280'


        }


      },


      y: {


        grid: {


          display: false


        },


        ticks: {


          font: {


            size: 13,


            weight: '700'


          },


          color: '#374151',


          crossAlign: 'far'


        }


      }


    },


    animation: {


      duration: 1000,


      easing: 'easeInOutQuart'


    }


  };





  // Vendor bar chart data


  const vendorChartData = vendorBreakdown ? (() => {


    const entries = Object.entries(vendorBreakdown.breakdown);


    


    // Generate gradient colors for vendors


    const colors = entries.map((_, index) => {


      if (entries[index][0] === 'Other Vendors') {


        return '#94A3B8'; // Gray for "Other Vendors"


      }


      const hue = (index * 360 / 10); // Distribute colors across spectrum


      return `hsl(${hue}, 70%, 60%)`;


    });


    


    return {


      labels: entries.map(([vendor]) => vendor),


      datasets: [{


        label: 'Purchase Amount',


        data: entries.map(([_, data]) => data.value),


        backgroundColor: colors,


        borderColor: colors.map(c => c),


        borderWidth: 2,


        borderRadius: 8,


        barThickness: 35,


        maxBarThickness: 40


      }]


    };


  })() : null;





  // Early return if no data (after all hooks)


  if (!filteredData || filteredData.length === 0) {


    return (


      <div className="filtered-analysis">


        <div className="analysis-header">


          <h2>Purchase Type Analysis</h2>


          <span className="week-badge">No Data</span>


        </div>


        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>


          <p>No filtered data available. Please apply filteand try again.</p>


        </div>


      </div>


    );


  }





  return (


    <div className="filtered-analysis">


      <div className="analysis-header-title">


        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>


          <div>


            <h2> Purchase Analysis {filterInfo?.hasActiveFilte? '- Filtered Results' : '- All Data'}</h2>


            <p className="subtitle">


              {filterInfo?.hasActiveFilte


                ? 'Complete breakdown of filtered data' 


                : 'Complete breakdown of all available data'}


            </p>


          </div>


        </div>


        


        {/* DEBUG: Show detected columns */}


        {(!detectedColumns.amount || typeBreakdown?.total === 0) && (


          <div style={{


            background: '#fff3cd',


            border: '2px solid #ffc107',


            borderRadius: '8px',


            padding: '15px',


            margin: '15px 0',


            fontSize: '13px'


          }}>


            <strong>š ℹ¸ Debug Info:</strong>


            <div style={{ marginTop: '8px' }}>


              <div>? Detected Type Column: <code>{detectedColumns.type || 'NOT FOUND'}</code></div>


              <div>? Detected Category Column: <code>{detectedColumns.category || 'NOT FOUND'}</code></div>


              <div>📊 Detected Amount Column: <code style={{background: detectedColumns.amount ? '#d4edda' : '#f8d7da', padding: '2px 6px', borderRadius: '3px'}}>{detectedColumns.amount || '❌ NOT FOUND'}</code></div>


              <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>


                All columns: {Object.keys(filteredData[0] || {}).join(', ')}


              </div>


            </div>


          </div>


        )}


        


        {filterInfo && (


          <div className="filter-info-badges">


            {!filterInfo.hasActiveFilte&& (


              <span className="filter-badge all-data-badge" style={{


                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',


                color: 'white',


                fontWeight: '700',


                padding: '8px 16px',


                fontSize: '14px'


              }}>


                ? Showing All Data


              </span>


            )}


            {filterInfo.dateRange && formatDateRange(filterInfo.dateRange) && (


              <span className="filter-badge date-badge">


                 {formatDateRange(filterInfo.dateRange)}


              </span>


            )}


            {filterInfo.orderType && (


              <span className="filter-badge type-badge">


                 Order Type: {filterInfo.orderType === '1' ? 'Import' : filterInfo.orderType === '2' ? 'Local' : 'Job Order'}


              </span>


            )}


            {filterInfo.itemService && (


              <span className="filter-badge category-badge">


                ·ℹ¸ Category: {filterInfo.itemService}


              </span>


            )}


            <span className="filter-badge records-badge">


               {filterInfo.totalRecords?.toLocaleString()} {filterInfo.hasActiveFilte? `of ${filterInfo.originalRecords?.toLocaleString()}` : ''} records


            </span>


          </div>


        )}


      </div>





      {/* Combined Layout: Table Left + Chart Right in each card, stacked vertically */}


      <div className="analysis-container-vertical">


        


        {/* NEW SECTION: Order Type vs Item/Service Breakdown - Stacked Chart */}


        {orderTypeItemServiceBreakdown && orderTypeItemServiceBreakdown.categories.length > 0 && (


          <div className="analysis-card-combined">


            <div className="section-header-combined">


              <span className="week-badge-large">


                 Order Type Analysis - Items vs Services


              </span>


            </div>


            


            <div className="card-content-horizontal">


              


              {/* LEFT: Table */}


              <div className="table-section">


                <div className="combined-table-container">


                  <table className="combined-summary-table">


                    <thead>


                      <tr className="header-row">


                        <th>Order Type</th>


                        <th>Items</th>


                        <th>Services</th>


                        <th>Total</th>


                      </tr>


                    </thead>


                    <tbody>


                      {orderTypeItemServiceBreakdown.categories.map((orderType, index) => {


                        const items = orderTypeItemServiceBreakdown.itemData[index];


                        const services = orderTypeItemServiceBreakdown.serviceData[index];


                        const total = items + services;


                        


                        return (


                          <tr key={orderType}>


                            <td className="label-cell">{orderType}</td>


                            <td className="value-cell" style={{color: '#3B82F6'}}>{formatBillions(items)}</td>


                            <td className="value-cell" style={{color: '#F59E0B'}}>{formatBillions(services)}</td>


                            <td className="value-cell"><strong>{formatBillions(total)}</strong></td>


                          </tr>


                        );


                      })}


                      


                      {/* Total Row */}


                      <tr className="total-row">


                        <td className="label-cell"><strong>Total</strong></td>


                        <td className="value-cell"><strong>{formatBillions(orderTypeItemServiceBreakdown.itemData.reduce((a,b) => a+b, 0))}</strong></td>


                        <td className="value-cell"><strong>{formatBillions(orderTypeItemServiceBreakdown.serviceData.reduce((a,b) => a+b, 0))}</strong></td>


                        <td className="value-cell"><strong>{formatBillions(


                          orderTypeItemServiceBreakdown.itemData.reduce((a,b) => a+b, 0) + 


                          orderTypeItemServiceBreakdown.serviceData.reduce((a,b) => a+b, 0)


                        )}</strong></td>


                      </tr>


                    </tbody>


                  </table>


                </div>


                


                {/* Quick Stats */}


                <div className="stats-grid-compact">


                  {orderTypeItemServiceBreakdown.categories.map((orderType, index) => {


                    const items = orderTypeItemServiceBreakdown.itemData[index];


                    const services = orderTypeItemServiceBreakdown.serviceData[index];


                    const total = items + services;


                    const itemPercentage = total > 0 ? ((items / total) * 100).toFixed(1) : 0;


                    


                    return (


                      <div key={orderType} className="stat-card-small">


                        <div className="stat-card-label">{orderType}</div>


                        <div className="stat-card-value" style={{ color: '#667eea' }}>{formatBillions(total)}</div>


                        <div className="stat-card-items">{itemPercentage}% Items</div>


                      </div>


                    );


                  })}


                </div>


              </div>


              


              {/* RIGHT: Stacked Bar Chart */}


              <div className="chart-section">


                <div className="chart-container-inline">


                  <div style={{ width: '100%', height: '500px', padding: '20px' }}>


                    <Bar


                      data={{


                        labels: orderTypeItemServiceBreakdown.categories,


                        datasets: [


                          {


                            label: 'Items',


                            data: orderTypeItemServiceBreakdown.itemData,


                            backgroundColor: '#3B82F6',


                            borderColor: '#2563EB',


                            borderWidth: 2,


                          },


                          {


                            label: 'Services',


                            data: orderTypeItemServiceBreakdown.serviceData,


                            backgroundColor: '#F59E0B',


                            borderColor: '#D97706',


                            borderWidth: 2,


                          }


                        ]


                      }}


                      options={{


                        responsive: true,


                        maintainAspectRatio: false,


                        plugins: {


                          legend: {


                            display: true,


                            position: 'top',


                            labels: {


                              font: {


                                size: 14,


                                family: "'Inter', sans-serif",


                                weight: '600'


                              },


                              padding: 15,


                              boxWidth: 20,


                              boxHeight: 20,


                              usePointStyle: true


                            }


                          },


                          tooltip: {


                            backgroundColor: 'rgba(255, 255, 255, 0.98)',


                            titleColor: '#1f2937',


                            bodyColor: '#374151',


                            borderColor: '#e5e7eb',


                            borderWidth: 2,


                            padding: 16,


                            titleFont: { size: 16, weight: 'bold' },


                            bodyFont: { size: 14 },


                            callbacks: {


                              label: (context) => {


                                const label = context.dataset.label || '';


                                const value = context.parsed.y || 0;


                                return `${label}: Rs. ${formatCurrency(value)}`;


                              }


                            }


                          },


                          datalabels: {


                            display: true,


                            color: '#fff',


                            font: {


                              size: 14,


                              weight: 'bold',


                              family: "'Inter', sans-serif"


                            },


                            formatter: (value, context) => {


                              // Calculate percentage for this bar segment


                              const datasetIndex = context.datasetIndex;


                              const categoryIndex = context.dataIndex;


                              


                              // Get items and services for this category


                              const items = orderTypeItemServiceBreakdown.itemData[categoryIndex];


                              const services = orderTypeItemServiceBreakdown.serviceData[categoryIndex];


                              const total = items + services;


                              


                              if (total === 0) return '';


                              


                              // Calculate percentage based on which dataset (Items or Services)


                              const percentage = datasetIndex === 0 


                                ? ((items / total) * 100).toFixed(1)  // Items


                                : ((services / total) * 100).toFixed(1); // Services


                              


                              // Only show if percentage is > 2% (to avoid cluttering small values)


                              return percentage > 2 ? `${percentage}%` : '';


                            },


                            anchor: 'center',


                            align: 'center'


                          }


                        },


                        scales: {


                          x: {


                            stacked: true,


                            grid: {


                              display: false


                            },


                            ticks: {


                              font: {


                                size: 13,


                                weight: '600'


                              }


                            }


                          },


                          y: {


                            stacked: true,


                            beginAtZero: true,


                            grid: {


                              color: 'rgba(0, 0, 0, 0.05)'


                            },


                            ticks: {


                              font: {


                                size: 12


                              },


                              callback: function(value) {


                                // Use smart formatting for Y-axis labels


                                if (value === 0) return 'Rs. 0';


                                


                                const absValue = Math.abs(value);


                                


                                if (absValue >= 1000000000) {


                                  return 'Rs. ' + (value / 1000000000).toFixed(1) + 'B';


                                } else if (absValue >= 1000000) {


                                  return 'Rs. ' + (value / 1000000).toFixed(1) + 'M';


                                } else if (absValue >= 1000) {


                                  return 'Rs. ' + (value / 1000).toFixed(1) + 'K';


                                } else {


                                  return 'Rs. ' + value.toFixed(0);


                                }


                              }


                            }


                          }


                        },


                        animation: {


                          duration: 1500,


                          easing: 'easeInOutQuart',


                          delay: (context) => {


                            return context.dataIndex * 200;


                          }


                        }


                      }}


                    />


                  </div>


                </div>


              </div>


            </div>


          </div>


        )}



        {/* Card 1: Purchase Order Type Analysis - Table Left + Chart Right */}


        <div className="analysis-card-combined">


          <div className="section-header-combined">


            <span className="week-badge-large">


              Purchase Order Type Analysis


            </span>


          </div>


          


          <div className="card-content-horizontal">


            


            {/* LEFT: Table */}


            <div className="table-section">


              <div className="combined-table-container">


                <table className="combined-summary-table">


                  <thead>


                    <tr className="header-row">


                      <th></th>


                      <th>Document Total</th>


                      <th>Qty</th>


                    </tr>


                  </thead>


                  <tbody>


                    {/* Purchase Type Breakdown */}


                    {typeBreakdown && Object.entries(typeBreakdown.breakdown).map(([key, data]) => (


                      <tr key={key}>


                        <td className="label-cell">{key}</td>


                        <td className="value-cell">{formatBillions(data.value)}</td>


                        <td className="qty-cell">{data.qty}</td>


                      </tr>


                    ))}


                    


                    {/* Total Row */}


                    {typeBreakdown && (


                      <tr className="total-row">


                        <td className="label-cell"><strong>Total</strong></td>


                        <td className="value-cell"><strong>{formatBillions(typeBreakdown.total)}</strong></td>


                        <td className="qty-cell"><strong>{typeBreakdown.totalQty}</strong></td>


                      </tr>


                    )}


                  </tbody>


                </table>


              </div>


              


              {/* Quick Stats for Order Type */}


              {typeBreakdown && typeBreakdown.total > 0 && (


                <div className="stats-grid-compact">


                  {Object.entries(typeBreakdown.breakdown)


                    .filter(([key, data]) => data.value > 0)


                    .map(([key, data], index) => {


                      const colors = ['#5B7FE8', '#F97316', '#A855F7'];


                      const percentage = ((data.value / typeBreakdown.total) * 100).toFixed(2);


                      return (


                        <div key={key} className="stat-card-small">


                          <div className="stat-card-label">{key}</div>


                          <div className="stat-card-value" style={{ color: colors[index] }}>{percentage}%</div>


                          <div className="stat-card-items">{data.qty.toLocaleString()} items</div>


                        </div>


                      );


                    })


                  }


                </div>


              )}


            </div>


            


            {/* RIGHT: Chart */}


            <div className="chart-section">


              {typeBreakdown && typeBreakdown.total > 0 && typeChartData && (


                <div className="chart-container-inline">


                  <div style={{ width: '100%', height: '500px', padding: '10px' }}>


                    <Pie data={typeChartData} options={pieChartOptions} />


                  </div>


                </div>


              )}


            </div>


            


          </div>


        </div>





        {/* Card 2: Item vs Service Analysis - Table Left + Chart Right */}


        <div className="analysis-card-combined">


          <div className="section-header-combined">


            <span className="week-badge-large">


              Item vs Service Analysis


            </span>


          </div>


          


          <div className="card-content-horizontal">


            


            {/* LEFT: Table */}


            <div className="table-section">


              <div className="combined-table-container">


                <table className="combined-summary-table">


                  <thead>


                    <tr className="header-row">


                      <th></th>


                      <th>Document Total</th>


                      <th>Qty</th>


                    </tr>


                  </thead>


                  <tbody>


                    {/* Item/Service Breakdown */}


                    {itemServiceBreakdown && Object.entries(itemServiceBreakdown.breakdown).map(([key, data]) => (


                      <tr key={`item-${key}`}>


                        <td className="label-cell">{key}</td>


                        <td className="value-cell">{formatBillions(data.value)}</td>


                        <td className="qty-cell">{data.qty}</td>


                      </tr>


                    ))}


                    


                    {/* Total Row */}


                    {itemServiceBreakdown && (


                      <tr className="total-row">


                        <td className="label-cell"><strong>Total</strong></td>


                        <td className="value-cell"><strong>{formatBillions(itemServiceBreakdown.total)}</strong></td>


                        <td className="qty-cell"><strong>{itemServiceBreakdown.totalQty}</strong></td>


                      </tr>


                    )}


                  </tbody>


                </table>


              </div>


              


              {/* Quick Stats for Item vs Service */}


              {itemServiceBreakdown && itemServiceBreakdown.total > 0 && (


                <div className="stats-grid-compact">


                  {Object.entries(itemServiceBreakdown.breakdown)


                    .filter(([key, data]) => data.value > 0)


                    .map(([key, data], index) => {


                      const colors = ['#A855F7', '#EF4444'];


                      const percentage = ((data.value / itemServiceBreakdown.total) * 100).toFixed(2);


                      return (


                        <div key={key} className="stat-card-small">


                          <div className="stat-card-label">{key}</div>


                          <div className="stat-card-value" style={{ color: colors[index] }}>{percentage}%</div>


                          <div className="stat-card-items">{data.qty.toLocaleString()} items</div>


                        </div>


                      );


                    })


                  }


                </div>


              )}


            </div>


            


            {/* RIGHT: Chart */}


            <div className="chart-section">


              {itemServiceBreakdown && itemServiceBreakdown.total > 0 && itemServiceChartData && (


                <div className="chart-container-inline">


                  <div style={{ width: '100%', height: '500px', padding: '10px' }}>


                    <Pie data={itemServiceChartData} options={pieChartOptions} />


                  </div>


                </div>


              )}


            </div>


            


          </div>


        </div>





        {/* Card 3: Currency-wise Analysis - Table Left + Chart Right */}


        {currencyBreakdown && currencyBreakdown.total > 0 && (


          <div className="analysis-card-combined">


            <div className="section-header-combined">


              <span className="week-badge-large">


                 Currency-wise Analysis


              </span>


            </div>


            


            <div className="card-content-horizontal">


              


              {/* LEFT: Table */}


              <div className="table-section">


                <div className="combined-table-container">


                  <table className="combined-summary-table">


                    <thead>


                      <tr className="header-row">


                        <th>Currency</th>


                        <th>Document Total</th>


                        <th>Qty</th>


                        <th>Percentage</th>


                      </tr>


                    </thead>


                    <tbody>


                      {/* Currency Breakdown */}


                      {Object.entries(currencyBreakdown.breakdown)


                        .sort((a, b) => b[1].value - a[1].value)


                        .map(([currency, data]) => {


                          const percentage = ((data.value / currencyBreakdown.total) * 100).toFixed(2);


                          return (


                            <tr key={`currency-${currency}`}>


                              <td className="label-cell">{currency}</td>


                              <td className="value-cell">{formatBillions(data.value)}</td>


                              <td className="qty-cell">{data.qty}</td>


                              <td className="qty-cell" style={{ fontWeight: 'bold', color: '#667eea' }}>{percentage}%</td>


                            </tr>


                          );


                        })}


                      


                      {/* Total Row */}


                      <tr className="total-row">


                        <td className="label-cell"><strong>Total</strong></td>


                        <td className="value-cell"><strong>{formatBillions(currencyBreakdown.total)}</strong></td>


                        <td className="qty-cell"><strong>{currencyBreakdown.totalQty}</strong></td>


                        <td className="qty-cell"><strong>100.00%</strong></td>


                      </tr>


                    </tbody>


                  </table>


                </div>


                


                {/* Quick Stats for Currency */}


                <div className="stats-grid-compact">


                  {Object.entries(currencyBreakdown.breakdown)


                    .sort((a, b) => b[1].value - a[1].value)


                    .slice(0, 4)


                    .map(([currency, data], index) => {


                      const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];


                      const percentage = ((data.value / currencyBreakdown.total) * 100).toFixed(2);


                      return (


                        <div key={currency} className="stat-card-small">


                          <div className="stat-card-label">{currency}</div>


                          <div className="stat-card-value" style={{ color: colors[index % colors.length] }}>{percentage}%</div>


                          <div className="stat-card-items">{data.qty.toLocaleString()} orders</div>


                        </div>


                      );


                    })


                  }


                </div>


              </div>


              


              {/* RIGHT: Chart */}


              <div className="chart-section">


                <div className="chart-container-inline">


                  <div style={{ width: '100%', height: '600px', padding: '20px' }}>


                    <Pie 


                      data={{


                        labels: Object.keys(currencyBreakdown.breakdown),


                        datasets: [{


                          data: Object.values(currencyBreakdown.breakdown).map(d => d.value),


                          backgroundColor: [


                            '#3B82F6', // Blue - US Dollar


                            '#F59E0B', // Orange - Sri Lankan Rupee


                            '#10B981', // Green - Euro


                            '#8B5CF6', // Purple - Swiss Franc


                            '#EC4899', // Pink - Singapore Dollar


                            '#EF4444', // Red - British Pound


                            '#14B8A6', // Teal - Denmark Kroner


                            '#F97316', // Deep Orange - Others


                          ],


                          borderColor: '#ffffff',


                          borderWidth: 3,


                        }]


                      }} 


                      options={{


                        responsive: true,


                        maintainAspectRatio: true,


                        cutout: '65%',  // Donut chart with 65% cutout


                        plugins: {


                          legend: {


                            display: false  // Hide legend since we show labels on chart


                          },


                          tooltip: {


                            enabled: true,


                            backgroundColor: 'rgba(255, 255, 255, 0.98)',


                            titleColor: '#1f2937',


                            bodyColor: '#374151',


                            borderColor: '#e5e7eb',


                            borderWidth: 2,


                            padding: 16,


                            titleFont: { size: 16, weight: 'bold', family: "'Inter', sans-serif" },


                            bodyFont: { size: 14, family: "'Inter', sans-serif" },


                            bodySpacing: 6,


                            cornerRadius: 12,


                            displayColors: true,


                            boxWidth: 12,


                            boxHeight: 12,


                            callbacks: {


                              label: function(context) {


                                const label = context.label || '';


                                const value = context.parsed || 0;


                                const total = context.dataset.data.reduce((a, b) => a + b, 0);


                                const percentage = ((value / total) * 100).toFixed(2);


                                return `${label}: Rs. ${value.toLocaleString('en-IN', {


                                  minimumFractionDigits: 2,


                                  maximumFractionDigits: 2


                                })} (${percentage}%)`;


                              }


                            }


                          },


                          datalabels: {


                            color: '#1f2937',


                            font: {


                              size: 12,


                              weight: 'bold',


                              family: "'Inter', sans-serif"


                            },


                            formatter: (value, context) => {


                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);


                              const percentage = ((value / total) * 100);


                              const label = context.chart.data.labels[context.dataIndex];


                              


                              // Only show label if percentage is greater than 1%


                              if (percentage < 1) {


                                return '';


                              }


                              


                              return `${label}\n${percentage.toFixed(2)}%`;


                            },


                            anchor: function(context) {


                              // For large slices (>50%), use 'center' to avoid overlap


                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);


                              const percentage = ((context.dataset.data[context.dataIndex] / total) * 100);


                              return percentage > 50 ? 'center' : 'end';


                            },


                            align: function(context) {


                              // For large slices (>50%), use 'center', otherwise 'start'


                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);


                              const percentage = ((context.dataset.data[context.dataIndex] / total) * 100);


                              return percentage > 50 ? 'center' : 'start';


                            },


                            offset: function(context) {


                              // No offset for center-aligned large slices


                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);


                              const percentage = ((context.dataset.data[context.dataIndex] / total) * 100);


                              return percentage > 50 ? 0 : 25;


                            },


                            clamp: false,


                            display: function(context) {


                              // Only display if percentage is > 1%


                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);


                              const percentage = ((context.dataset.data[context.dataIndex] / total) * 100);


                              return percentage > 1;


                            },


                            textAlign: 'center',


                            padding: {


                              top: 6,


                              bottom: 6,


                              left: 10,


                              right: 10


                            },


                            backgroundColor: function(context) {


                              return 'rgba(255, 255, 255, 0.95)';


                            },


                            borderRadius: 6,


                            borderWidth: 2,


                            borderColor: function(context) {


                              return context.dataset.backgroundColor[context.dataIndex];


                            }


                          }


                        },


                        layout: {


                          padding: {


                            top: 70,


                            bottom: 70,


                            left: 70,


                            right: 70


                          }


                        },


                        animation: {


                          animateRotate: true,


                          animateScale: true,


                          duration: 2000,


                          easing: 'easeInOutQuart',


                          delay: (context) => {


                            let delay = 0;


                            if (context.type === 'data' && context.mode === 'default') {


                              delay = context.dataIndex * 150 + context.datasetIndex * 100;


                            }


                            return delay;


                          }


                        },


                        transitions: {


                          active: {


                            animation: {


                              duration: 400


                            }


                          }


                        },


                        hover: {


                          mode: 'nearest',


                          intersect: true,


                          animationDuration: 400


                        },


                        elements: {


                          arc: {


                            borderWidth: 3,


                            borderColor: '#ffffff',


                            hoverBorderWidth: 4,


                            hoverBorderColor: '#ffffff',


                            hoverOffset: 15


                          }


                        }


                      }} 


                    />


                  </div>


                </div>


              </div>


              


            </div>


          </div>


        )}





        {/* Card 4: Top 10 Vendo- Bar Chart (Full Width) */}


        {vendorBreakdown && vendorChartData && (


          <div className="analysis-card-full-width">


            <div className="section-header-combined">


              <span className="week-badge-large">


                ¢ Top 10 VendoAnalysis


                {vendorBreakdown.vendorCount > 10 && (


                  <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: '10px', opacity: 0.9 }}>


                    (Total: {vendorBreakdown.vendorCount} vendors)


                  </span>


                )}


              </span>


            </div>


            


            <div className="vendor-chart-container">


              <div className="vendor-bar-chart">


                <Bar data={vendorChartData} options={barChartOptions} />


              </div>


              


              {/* Vendor Stats Summary */}


              <div className="vendor-stats-summary">


                <div className="vendor-stat-card">


                  <div className="stat-label">Total Vendors</div>


                  <div className="stat-value">{vendorBreakdown.vendorCount}</div>


                </div>


                <div className="vendor-stat-card">


                  <div className="stat-label">Top 10 Total</div>


                  <div className="stat-value">Rs. {(


                    Object.entries(vendorBreakdown.breakdown)


                      .filter(([vendor]) => vendor !== 'Other Vendors')


                      .reduce((sum, [_, data]) => sum + data.value, 0) / 1000000000


                  ).toFixed(2)}B</div>


                </div>


                {vendorBreakdown.breakdown['Other Vendors'] && (


                  <div className="vendor-stat-card highlight">


                    <div className="stat-label">Other Vendors</div>


                    <div className="stat-value">Rs. {(vendorBreakdown.breakdown['Other Vendors'].value / 1000000000).toFixed(2)}B</div>


                    <div className="stat-count">{vendorBreakdown.vendorCount - 10} vendors</div>


                  </div>


                )}


                <div className="vendor-stat-card primary">


                  <div className="stat-label">Grand Total</div>


                  <div className="stat-value">Rs. {(vendorBreakdown.total / 1000000000).toFixed(2)}B</div>


                  <div className="stat-count">{vendorBreakdown.totalQty} orders</div>


                </div>


              </div>


            </div>


          </div>


        )}





      </div>


    </div>


  );


}





export default FilteredAnalysis;

























