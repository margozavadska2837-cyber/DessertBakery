-- create_db_and_products.sql
-- Виконай як адміністратор або користувач, що має права CREATE DATABASE

-- 1) Створити базу (якщо ще немає)
IF DB_ID('FoodCatalog') IS NULL
BEGIN
  CREATE DATABASE FoodCatalog;
END
GO

USE FoodCatalog;
GO

-- 2) Створити таблицю Products
IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Price DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) NOT NULL DEFAULT 'UAH',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- 3) Декілька тестових продуктів (виконати, якщо таблиця порожня)
IF NOT EXISTS (SELECT 1 FROM dbo.Products)
BEGIN
  INSERT INTO dbo.Products (Name, Description, Price, Currency) VALUES
    (N'Торт "Наполеон"', N'Ніжний багатошаровий торт', 150.00, 'UAH'),
    (N'Круасан "Французький"', N'Хрусткий круасан з маслом', 160.00, 'UAH'),
    (N'Чизкейк "Класичний"', N'Кремовий чизкейк', 100.00, 'UAH');
END
GO