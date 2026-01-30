const ExcelJS = require('exceljs');

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
            
            // Scan first 10 rows
            for (let i = 1; i <= 10; i++) {
                const row = worksheet.getRow(i);
                if (row.values && row.values.length) {
                    console.log(`Row ${i}:`, JSON.stringify(row.values));
                }
            }
        });

    } catch (err) {
        console.error('Error reading file:', err);
    }
}

debugFile();
