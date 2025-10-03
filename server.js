const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // servir archivos estáticos

// إعدادات الاتصال بـ SQL Server
const dbConfig = {
    server: 'localhost', // أو اسم السيرفر
    database: 'MyStoreDB',
    user: 'اسم_المستخدم',
    password: 'microsoft.2025',

    options: {
        encrypt: false, // إذا كنت تستخدم Azure ضع true
        trustServerCertificate: true
    }
};

// API لجلب جميع المنتجات
app.get('/api/products', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query('SELECT * FROM Products');
        res.json(result.recordset);
    } catch (err) {
        console.error('خطأ في قاعدة البيانات:', err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// API لإضافة منتج جديد
app.post('/api/products', async (req, res) => {
    try {
        const { Name, Price, Description, ImageURL } = req.body;
        await sql.connect(dbConfig);
        
        const result = await sql.query`
            INSERT INTO Products (Name, Price, Description, ImageURL) 
            VALUES (${Name}, ${Price}, ${Description}, ${ImageURL});
            SELECT SCOPE_IDENTITY() AS NewID;
        `;
        
        res.json({ success: true, id: result.recordset[0].NewID });
    } catch (err) {
        console.error('خطأ في الإضافة:', err);
        res.status(500).json({ error: 'خطأ في الإضافة' });
    }
});

// تشغيل الخادم على المنفذ 3000
app.listen(3000, () => {
    console.log('الخادم يعمل على http://localhost:3000');
});