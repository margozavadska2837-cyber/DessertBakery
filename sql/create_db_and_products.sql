IF DB_ID('FoodCatalog') IS NULL
BEGIN
  CREATE DATABASE FoodCatalog;
END
GO

USE FoodCatalog;
GO

IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
  CREATE TABLE Products (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100),
  description NVARCHAR(255),
  price DECIMAL(18,2),
  currency NVARCHAR(10),
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE()
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