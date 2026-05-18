# KVK Arena - Multi-Module Business Management System

A comprehensive, unified platform for managing multiple business operations with modular independence and scalable architecture. KVK Arena reduces manual work, improves efficiency, and provides centralized control over all business activities.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Modules](#modules)
  - [Gym Management Module](#-gym-management-module)
  - [Car Wash Management Module](#-car-wash-management-module)
  - [Badminton Court Management Module](#-badminton-court-management-module)
  - [Gaming Centre Management Module](#-gaming-centre-management-module)
  - [Retail Management Module](#-retail-management-module)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Cross-Module Features](#cross-module-features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Payment & Communication Services](#payment--communication-services)
- [Post-Deployment Support](#post-deployment-support)
- [License](#license)

---

## Overview

KVK Arena is designed as an integrated platform while maintaining modular independence for scalability and future enhancements. Each module is independently priced with its own set of features and functionalities, allowing flexibility and clarity in implementation.

The system operates with a robust backend API powering both administrative dashboards and customer-facing interfaces, ensuring secure, reliable, and scalable operations across all business modules.

---

## 📦 Modules

### 🏋️ GYM MANAGEMENT MODULE

A comprehensive solution for managing all day-to-day gym operations with member-centric features and automated financial tracking.

#### 🎯 Key Features

- **Member Management**
  - Member registration and profile management
  - Membership plan creation, renewal, and management
  - Membership expiry alerts and notifications
  - Member activity and attendance history management

- **Access Control**
  - Biometric fingerprint-based attendance tracking system
  - Real-time attendance monitoring and history tracking
  - Automated check-in/check-out

- **Subscription & Payments**
  - Online subscription payments through integrated payment gateway
  - Automated receipt generation for transactions
  - Payment confirmation notifications

- **Trainer Management**
  - Trainer time slot booking and scheduling system
  - Trainer scheduling optimization

- **Communication**
  - SMS notification service (membership expiry reminders, payment confirmations, promotions, announcements)

- **Reporting & Analytics**
  - Member activity tracking
  - Daily, weekly, and monthly reporting system
  - Attendance analytics

- **User Interfaces**
  - Online customer portal for member access
  - User-friendly admin dashboard for system management
  - Responsive design for all devices

#### ⚙️ System Capabilities

- ✅ Fully online and cloud-based system
- ✅ Integration with biometric fingerprint devices
- ✅ Secure payment gateway integration
- ✅ Secure and role-based access control
- ✅ Responsive customer and admin interfaces
- ✅ Fast, secure, and reliable system performance
- ✅ Centralised data management and reporting
- ✅ Scalable architecture for future enhancements and integrations

---

### 🚗 CAR WASH MANAGEMENT MODULE

A modern web-based system for efficiently managing car wash operations, billing, customer handling, and reporting.

#### 🎯 Key Features

- **Service Management**
  - Vehicle type, wash category, and pricing management
  - Dynamic pricing configuration
  - Service package creation and management

- **Admin & Access Control**
  - Admin user management (create, update, and access control)
  - Role-based access control (Super Admin / Admin)
  - System logs and activity tracking

- **Billing & Payments**
  - Billing system with service selection based on vehicle type
  - Cash and card payment handling
  - Electronic bill generation (E-Bill)
  - Day-end transaction closing system (locks daily operations for financial accuracy)

- **Customer Communication**
  - Email integration for sending invoices to customers (optional Gmail integration)
  - SMS notification service

- **Reporting & Analytics**
  - Real-time sales dashboard
  - Financial and performance reports (daily, weekly, monthly)
  - Day-end closing reports

- **Customer Interface**
  - Dedicated customer interface for viewing services and pricing
  - Service package browsing
  - User-friendly and responsive design

#### ⚙️ System Capabilities

- ✅ Role-based access control (Super Admin / Admin)
- ✅ Real-time data updates and dashboard analytics
- ✅ Secure transaction handling and billing workflow
- ✅ Day-end locking mechanism to ensure financial accuracy
- ✅ Cloud-ready architecture with centralised reporting
- ✅ Scalable structure for future enhancements and modules
- ✅ Email service integration for automated billing communication
- ✅ Optimised performance for counter-based fast billing operations

---

### 🏸 BADMINTON COURT MANAGEMENT MODULE

A React-based web application designed to efficiently manage court bookings, billing operations, and promotional package handling.

#### 🎯 Key Features

- **Court Management**
  - Court availability management and time slot scheduling
  - Real-time court usage monitoring

- **Booking System**
  - Manual booking system via admin
  - Online booking system via customer interface (FREE)
  - Booking history and transaction tracking

- **Billing & Pricing**
  - Normal billing support
  - Special package billing support
  - Dynamic pricing structure with flexible package support

- **Promotional Packages**
  - Special package creation by Super Admin (offers & promotions)
  - Example: Seasonal offers such as Valentine's Day couple packages with custom conditions
  - Customizable promotional conditions

- **Communication & Notifications**
  - SMS notification service
  - Booking confirmations and updates

- **Reporting & Analytics**
  - Reports and analytics (daily, weekly, monthly)
  - Court utilization tracking
  - Revenue analysis

- **Admin Management**
  - System logs and activity tracking
  - Admin user access control

#### ⚙️ System Capabilities

- ✅ Role-based access control (Super Admin / Admin)
- ✅ Real-time court availability updates
- ✅ Flexible pricing structure with dynamic package support
- ✅ Promotional package management system
- ✅ Secure booking and billing workflow
- ✅ Centralised reporting and analytics dashboard
- ✅ Scalable architecture for future feature expansion
- ✅ Optimised admin workflow for fast booking and billing operations
- ✅ Cloud-ready system with centralised data control

---

### 🎱 GAMING CENTRE MANAGEMENT MODULE

A React-based web application designed to manage gaming station bookings, time-based billing, and customer usage tracking.

#### 🎯 Key Features

- **Station Management**
  - Gaming station availability and session time slot management
  - Real-time station availability monitoring
  - Game session tracking and usage history

- **Booking System**
  - Manual booking system via admin
  - Online booking system via customer interface (FREE)

- **Billing System**
  - Time-based billing system for gaming sessions
  - Normal billing support
  - Package-based billing support
  - Payment processing (cash/card)

- **Communication & Notifications**
  - SMS notification service
  - Session confirmations and reminders

- **Reporting & Analytics**
  - Reports and analytics (daily, weekly, monthly)
  - Station utilization tracking
  - Session duration analysis

- **Admin Management**
  - System logs and activity tracking
  - Admin access control

#### ⚙️ System Capabilities

- ✅ Role-based access control (Super Admin / Admin)
- ✅ Real-time gaming station availability updates
- ✅ Flexible pricing based on time duration or packages
- ✅ Secure billing and transaction handling
- ✅ Centralised reporting and analytics dashboard
- ✅ Scalable structure for future expansion (new games/stations)
- ✅ Optimised admin workflow for fast billing and session management
- ✅ Cloud-ready architecture with centralised data control

---

### 👗 RETAIL MANAGEMENT MODULE

A React/TypeScript-based e-commerce system designed to manage online clothing sales with a powerful administrative backend.

#### 🎯 Key Features

- **E-Commerce Platform**
  - Fully responsive e-commerce frontend (React TypeScript)
  - Shopping cart and checkout system
  - Scalable product catalogue structure

- **Order Management**
  - Automated online purchases
  - Manual order handling for hybrid retail operations
  - Order confirmation and tracking system
  - Inventory synchronisation with sales

- **Payment & Transactions**
  - Secure payment gateway integration
  - Order confirmation system

- **Communication**
  - SMS notification service for purchase confirmations and updates
  - Customer notification for order status changes

- **Admin Management**
  - Role-based access control (Admin / Super Admin)
  - Fully featured admin panel for business management
  - Order control and management

#### ⚙️ System Capabilities

- ✅ Fully responsive e-commerce frontend
- ✅ Secure payment gateway integration
- ✅ Automated inventory management
- ✅ Role-based access control
- ✅ Scalable product catalogue structure
- ✅ Hybrid order handling (online + manual)
- ✅ Comprehensive admin controls

---

## System Architecture

KVK Arena is built on a distributed architecture with clear separation of concerns:

### Backend Architecture
- **API Layer**: ASP.NET Core Web API (.NET 10.0)
- **Authentication & Authorization**: kvk.Identity (identity management and role-based access control)
- **Shared Components**: kvk.BuildingBlocks (reusable utilities and common functionality)
- **Host/Gateway**: kvk.Host (main application host and API gateway)

### Frontend Architecture
- **Customer Interfaces**: React-based responsive web applications
- **Admin Dashboards**: React-based administrative panels
- **Mobile Support**: Responsive design for all devices

### Data Architecture
- Centralized data management with cloud-ready infrastructure
- Support for scalable database architectures
- Real-time data synchronization across modules

### Integration Architecture
- Payment gateway integration (stripe, PayPal, etc.)
- SMS service integration
- Email service integration
- Biometric device integration (Gym Module)

---

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 10.0
- **Language**: C#
- **Web API**: REST API with OpenAPI/Swagger documentation
- **Authentication**: Role-based access control (RBAC)

### Frontend
- **Framework**: React
- **Language**: TypeScript/JavaScript
- **Styling**: Responsive design
- **State Management**: (Configured as per module requirements)

### Services & Integrations
- **Payment Gateway**: Integrated for secure transactions
- **SMS Service**: SMS notifications across all modules
- **Email Service**: Email communication and invoicing
- **Cloud Infrastructure**: Cloud-ready, scalable architecture

### Database
- Structured for scalability and performance
- Support for real-time reporting
- Centralized data management

---

## Project Structure

```
kvk.arena/
├── kvk.arena.sln                    # Main solution file
├── kvk.Host/                        # Main API Host
│   ├── Program.cs                   # Application startup configuration
│   ├── appsettings.json             # Application settings
│   ├── appsettings.Development.json # Development-specific settings
│   ├── kvk.Host.csproj              # Project file
│   └── Properties/
│       └── launchSettings.json      # Launch configuration
├── kvk.Identity/                    # Identity & Authentication
│   └── kvk.Identity.csproj          # Identity project file
├── kvk.BuildingBlocks/              # Shared Utilities & Components
│   └── kvk.BuildingBlocks.csproj    # BuildingBlocks project file
├── README.MD                        # This file
└── kvk.arena.sln                    # Solution configuration

```

---

## Cross-Module Features

All modules benefit from the following integrated features:

### 🔐 Security & Access Control
- Role-based access control (RBAC) across all modules
- Super Admin and Admin role hierarchies
- Secure authentication and authorization
- Data encryption for sensitive information

### 📱 Communication Services
- **SMS Notifications**: Membership reminders, payment confirmations, booking notifications, promotions, announcements
- **Email Integration**: Invoice delivery, booking confirmations, promotional emails
- **Real-time Notifications**: Push notifications for time-sensitive updates

### 📊 Reporting & Analytics
- Daily, weekly, and monthly reports across all modules
- Real-time dashboards and analytics
- Financial reporting and performance metrics
- Activity logging and audit trails

### 💳 Payment Processing
- Integrated payment gateway for secure transactions
- Support for multiple payment methods (cash, card, online)
- Automated receipt and invoice generation
- Secure transaction handling and PCI compliance

### ☁️ Cloud Infrastructure
- Fully online and cloud-based system
- Scalable architecture supporting growth
- Centralised data management
- High availability and disaster recovery

### 🔄 Data Management
- Real-time data synchronization
- Centralised data control
- Support for backup and recovery
- Data migration support

---

## Prerequisites

### System Requirements
- **Operating System**: Windows, Linux, or macOS
- **.NET Runtime**: .NET 10.0 or higher
- **Browser**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Node.js**: 16.x or higher (for frontend development)

### Required Services
- **Database**: SQL Server, PostgreSQL, or MySQL
- **Payment Gateway**: Stripe, PayPal, or similar service account
- **SMS Provider**: Twilio or similar SMS service account
- **Email Provider**: Gmail, SendGrid, or similar email service
- **Biometric Device**: (Optional, for Gym Module - fingerprint reader device)

### Development Tools
- Visual Studio 2022 or Visual Studio Code
- .NET 10.0 SDK
- Git for version control

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/kvk-arena.git
cd kvk.arena
```

### 2. Restore Dependencies

```bash
dotnet restore
```

### 3. Build the Solution

```bash
dotnet build
```

### 4. Configure Application Settings

Edit `kvk.Host/appsettings.json` and `kvk.Host/appsettings.Development.json` with your configuration:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=kvk_arena;User Id=sa;Password=your-password;"
  },
  "PaymentGateway": {
    "Provider": "Stripe",
    "ApiKey": "your-api-key"
  },
  "SmsService": {
    "Provider": "Twilio",
    "AccountSid": "your-account-sid",
    "AuthToken": "your-auth-token",
    "PhoneNumber": "+1234567890"
  },
  "EmailService": {
    "Provider": "Gmail",
    "Email": "your-email@gmail.com",
    "AppPassword": "your-app-password"
  }
}
```

### 5. Run Database Migrations

```bash
dotnet ef database update
```

### 6. Run the Application

```bash
dotnet run --project kvk.Host
```

The API will be available at `https://localhost:5001` (or configured port)

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kvk_arena
DB_USER=postgres
DB_PASSWORD=your-password

# Payment Gateway
PAYMENT_PROVIDER=Stripe
PAYMENT_API_KEY=your-stripe-key

# SMS Service
SMS_PROVIDER=Twilio
SMS_ACCOUNT_SID=your-twilio-sid
SMS_AUTH_TOKEN=your-twilio-token

# Email Service
EMAIL_PROVIDER=Gmail
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Application
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:5001
```

### appsettings.json Structure

- **Logging**: Configure logging levels and providers
- **ConnectionStrings**: Database connection strings
- **PaymentGateway**: Payment processor configuration
- **SmsService**: SMS provider settings
- **EmailService**: Email provider configuration
- **ModuleSettings**: Individual module-specific configurations

---

## API Documentation

### OpenAPI/Swagger

The API includes built-in OpenAPI (Swagger) documentation. Once the application is running, access the documentation at:

```
https://localhost:5001/openapi/v1.json
```

### Swagger UI

A user-friendly interactive API explorer is available at:

```
https://localhost:5001/swagger
```

### API Endpoints

API endpoints are organized by module:

- `/api/gym` - Gym Management Module endpoints
- `/api/carwash` - Car Wash Management Module endpoints
- `/api/badminton` - Badminton Court Management Module endpoints
- `/api/gaming` - Gaming Centre Management Module endpoints
- `/api/retail` - Retail Management Module endpoints
- `/api/auth` - Authentication and authorization endpoints
- `/api/billing` - Billing and payment endpoints
- `/api/notifications` - SMS and email notification endpoints
- `/api/reports` - Reporting and analytics endpoints

### Authentication

All API endpoints require authentication. Include your Bearer token in the Authorization header:

```
Authorization: Bearer {your-jwt-token}
```

---

## Payment & Communication Services

### Payment Gateway Integration

The system integrates with secure payment gateways supporting:
- Online credit/debit card payments
- Digital wallets
- Multiple payment methods
- PCI compliance and security standards
- Automated invoice and receipt generation

**Supported Providers**: Stripe, PayPal, Square, Razorpay

### SMS Service

Automated SMS notifications for:
- Membership expiry reminders (Gym)
- Payment confirmations
- Booking confirmations (Badminton, Gaming)
- Promotional messages
- Order status updates (Retail)

**Supported Providers**: Twilio, AWS SNS, Vonage

### Email Service

Automated email communication for:
- Invoice delivery
- Order confirmations
- Booking receipts
- Promotional campaigns
- System notifications

**Supported Providers**: Gmail, SendGrid, Microsoft 365, AWS SES

### Biometric Integration (Gym Module)

Integration with fingerprint-based attendance systems:
- Real-time attendance tracking
- Automated check-in/check-out
- Attendance history and reporting
- Device synchronization

---

## Post-Deployment Support

KVK Arena includes comprehensive post-deployment maintenance and support:

### Support Services

- 🔧 **Bug Fixes**: Identification and resolution of issues
- 📞 **Technical Assistance**: Expert support for system administrators and end-users
- 📦 **System Updates**: Regular updates and patches to maintain security and performance
- 🔄 **Data Management**: Backup, recovery, and migration support
- 📊 **Performance Monitoring**: System health checks and optimization

### Maintenance Services

- **Monthly Monitoring**: Regular system health checks
- **Security Updates**: Timely security patches and vulnerability fixes
- **Performance Optimization**: System tuning for better performance
- **Database Maintenance**: Optimization and cleanup tasks

### Third-Party Service Subscriptions

- Monthly subscriptions for payment gateway services
- SMS service credits and monthly plans
- Email service subscriptions
- Cloud infrastructure costs (if applicable)

### Support Period

Post-deployment support is provided within the agreed support period, typically including:
- 24/7 emergency support
- Business hours standard support
- Monthly maintenance windows
- Quarterly system reviews

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Security

- All data is encrypted in transit (HTTPS/TLS)
- Sensitive information is encrypted at rest
- Role-based access control ensures proper authorization
- Regular security audits and penetration testing
- Compliance with industry standards (PCI-DSS, GDPR, etc.)

---

## Troubleshooting

### Common Issues

**Issue: Database connection fails**
- Verify connection string in appsettings.json
- Ensure database server is running and accessible
- Check firewall and network settings

**Issue: Payment gateway errors**
- Verify API keys are current and valid
- Check payment provider service status
- Review payment gateway logs for specific errors

**Issue: SMS/Email not sending**
- Verify service credentials in configuration
- Check service provider account status and credits
- Review firewall and network settings for outbound connections

### Logs

Application logs are stored in:
- Development: Console and Debug output
- Production: File logs in `/logs/` directory

Enable verbose logging by adjusting `appsettings.json`:

```json
"Logging": {
  "LogLevel": {
    "Default": "Debug"
  }
}
```

---

## License

This project is proprietary software. All rights reserved. Unauthorized use, reproduction, or distribution is prohibited.

---

## Contact & Support

For support, bug reports, or inquiries, please contact:

- **Email**: support@kvkarena.com
- **Website**: www.kvkarena.com
- **Support Portal**: support.kvkarena.com

---

**Last Updated**: May 14, 2026

---

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Gym Management Module
- ✅ Car Wash Management Module
- ✅ Badminton Court Management Module
- ✅ Gaming Centre Management Module
- ✅ Retail Management Module
- ✅ Integrated Payment Gateway
- ✅ SMS Notification Service
- ✅ Email Service Integration
- ✅ Role-based Access Control
- ✅ Comprehensive Reporting & Analytics

---

**KVK Arena - Empowering Multiple Business Operations Under One Platform**

