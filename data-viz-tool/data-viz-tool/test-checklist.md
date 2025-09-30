# Data Visualization Tool - Test Checklist

## ✅ **Pre-Test Verification**
- [x] Project builds successfully (`npm run build`)
- [x] Development server starts (`npm run dev`)
- [x] All dependencies installed
- [x] TypeScript compilation passes
- [x] ESLint passes

## 🧪 **Functional Testing**

### **1. CSV Upload Testing**
- [ ] **Test 1.1**: Upload sample-data.csv
  - Expected: File uploads successfully
  - Expected: Data parses correctly (12 rows, 4 columns)
  - Expected: Column types detected (Month: categorical, Sales: numeric, Profit: numeric, Region: categorical)
  - Expected: Switches to Data Table tab

- [ ] **Test 1.2**: Upload invalid CSV
  - Expected: Error message displayed
  - Expected: App remains on upload screen

- [ ] **Test 1.3**: Upload empty CSV
  - Expected: Error message displayed

### **2. Data Table Testing**
- [ ] **Test 2.1**: Edit cell values
  - Expected: Values update in real-time
  - Expected: Chart updates when switching to Chart tab

- [ ] **Test 2.2**: Add new row
  - Expected: New row added with empty values
  - Expected: Can edit new row values

- [ ] **Test 2.3**: Delete row
  - Expected: Row removed from data
  - Expected: Chart updates accordingly

### **3. Chart Rendering Testing**
- [ ] **Test 3.1**: Bar Chart
  - Expected: Renders with proper bars
  - Expected: X-axis shows months, Y-axis shows sales values
  - Expected: Interactive tooltips

- [ ] **Test 3.2**: Line Chart
  - Expected: Renders with connected line points
  - Expected: Smooth line transitions

- [ ] **Test 3.3**: Pie Chart
  - Expected: Renders with colored segments
  - Expected: Legend shows region names
  - Expected: Values sum correctly

- [ ] **Test 3.4**: Scatter Plot
  - Expected: Renders with data points
  - Expected: X and Y axes show numeric values

### **4. Chart Customization Testing**
- [ ] **Test 4.1**: Change chart type
  - Expected: Chart updates immediately
  - Expected: Controls update for new chart type

- [ ] **Test 4.2**: Change chart title
  - Expected: Title updates on chart
  - Expected: Title persists across chart type changes

- [ ] **Test 4.3**: Change axis columns
  - Expected: Chart data updates
  - Expected: Axis labels update

- [ ] **Test 4.4**: Change colors
  - Expected: Chart colors update
  - Expected: Multiple colors work for different data series

### **5. Export Functionality Testing**
- [ ] **Test 5.1**: Export as PNG
  - Expected: File downloads with .png extension
  - Expected: Image quality is good

- [ ] **Test 5.2**: Export as SVG
  - Expected: File downloads with .svg extension
  - Expected: Vector format is scalable

- [ ] **Test 5.3**: Export as PDF
  - Expected: File downloads with .pdf extension
  - Expected: PDF opens correctly in viewer

### **6. Error Handling Testing**
- [ ] **Test 6.1**: Invalid data types
  - Expected: Graceful error handling
  - Expected: User-friendly error messages

- [ ] **Test 6.2**: Large datasets
  - Expected: Performance remains acceptable
  - Expected: No browser crashes

### **7. Responsive Design Testing**
- [ ] **Test 7.1**: Mobile view
  - Expected: Layout adapts to small screens
  - Expected: Touch interactions work

- [ ] **Test 7.2**: Tablet view
  - Expected: Layout works on medium screens
  - Expected: Charts remain readable

## 🐛 **Known Issues to Watch For**

1. **Chart.js Scatter Plot**: May need additional configuration
2. **Export Canvas**: Ensure chart is fully rendered before export
3. **Data Validation**: Handle edge cases with empty cells
4. **Performance**: Large datasets may cause slowdowns

## 📊 **Test Results Summary**

- **Total Tests**: 20+
- **Passed**: 0
- **Failed**: 0
- **Pending**: 20+

## 🚀 **Next Steps After Testing**

1. Fix any identified issues
2. Optimize performance if needed
3. Add additional error handling
4. Prepare for deployment
