const ExcelJS = require('exceljs');
const path = require('path');

async function debugFile() {
    const filePath = 'C:\\Users\\777\\Downloads\\Planilha Multi-Abas.xlsx';
    console.log(`Reading file: ${filePath}`);

    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        console.log('Worksheets found:', workbook.worksheets.length);

        workbook.eachSheet((worksheet, sheetId) => {
            console.log(`\n--- Sheet: ${worksheet.name} (ID: ${sheetId}) ---`);
            console.log(`RowCount: ${worksheet.rowCount}, ActualColumnCount: ${worksheet.actualColumnCount}`);
            
            // Print first 5 rows to see where headers might be
            for (let i = 1; i <= Math.min(5, worksheet.rowCount); i++) {
                const row = worksheet.getRow(i);
                if (row.values && row.values.length) {
                    // row.values is 1-indexed (index 0 is undefined usually)
                    console.log(`Row ${i}:`, JSON.stringify(row.values));
                }
            }
        });

    } catch (err) {
        console.error('Error reading file:', err);
    }
}

debugFile();
