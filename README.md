# DocuTracker

> **Secure Document Request and Tracking System**

DocuTracker is a comprehensive web-based application designed to streamline the process of requesting, managing, and tracking official documents. Built with modern web technologies, it provides a secure platform for users to submit document requests and for administrators to efficiently process them.

## 🚀 Features

### For Users
- **Secure Authentication**: Registration and login with session management
- **Document Requests**: Easy-to-use interface for requesting various document types
- **Real-time Tracking**: Monitor request status and progress in real-time
- **Payment Integration**: Support for multiple payment methods (Credit Card, GCash)
- **Profile Management**: Complete user profile with identity verification
- **Request History**: View and manage all past document requests
- **Notifications**: Stay updated with request status changes

### For Administrators
- **Dashboard Analytics**: Comprehensive overview with charts and statistics
- **User Management**: View, verify, and manage user accounts
- **Application Processing**: Review and process document applications
- **Document Management**: Handle various document types and requirements
- **Payment Tracking**: Monitor payments and billing information
- **Reports Generation**: Generate detailed reports on system usage
- **Settings Management**: Configure system settings and document types

### Security Features
- **Session Management**: Secure token-based authentication
- **Data Protection**: Encrypted data storage and transmission
- **Audit Logging**: Comprehensive logging system for all activities
- **Access Control**: Role-based permissions (User/Admin)
- **Secure File Upload**: Protected file handling and storage

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with component-based architecture
  - Global CSS system with centralized variables
  - Responsive design with mobile-first approach
  - Component libraries (buttons, forms, cards, layouts)
- **JavaScript (ES6+)** - Interactive functionality and API communication
- **Font Awesome** - Icons and visual elements
- **Chart.js** - Data visualization and reporting
- **Lottie Player** - Animations and micro-interactions

### Backend
- **PHP 7.4+** - Server-side processing and API endpoints
- **MySQL** - Database management and data storage
- **Session Management** - Secure user authentication

### Architecture
- **MVC Pattern** - Organized code structure
- **RESTful APIs** - Clean API design for frontend-backend communication
- **Component-Based CSS** - Modular and maintainable styling
- **Responsive Design** - Mobile-friendly interface

## 📁 Project Structure

```
DocuTracker/
├── css/                    # Stylesheets
│   ├── global/            # Global CSS components
│   │   ├── master.css     # Main CSS import file
│   │   ├── variables.css  # CSS custom properties
│   │   ├── buttons.css    # Button components
│   │   ├── forms.css      # Form elements
│   │   ├── cards.css      # Card components
│   │   └── ...
│   └── [page-specific].css # Individual page styles
├── js/                    # JavaScript files
│   ├── admin/            # Admin-specific functionality
│   ├── client/           # User-facing features
│   ├── auth/             # Authentication logic
│   └── services/         # Shared services and utilities
├── php/                  # Backend PHP files
│   ├── admin/            # Admin API endpoints
│   ├── auth/             # Authentication handlers
│   ├── client/           # User API endpoints
│   └── services/         # Database and utility services
├── assets/               # Images and static files
├── userfiles/            # User-uploaded documents
├── logs/                 # Application logs
└── [pages].html          # HTML pages
```

## 🚀 Getting Started

### Prerequisites
- **Web Server** (Apache/Nginx)
- **PHP 7.4+** with extensions:
  - mysqli
  - json
  - session
  - file_uploads
- **MySQL 5.7+**
- **Modern Web Browser**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/markjayson545/DocuTracker.git
   cd DocuTracker
   ```

2. **Database Setup**
   - Create a MySQL database named `docutracker`
   - Import the database schema (contact repository owner for SQL file)
   - Update database credentials in `php/services/open-db.php`:
   ```php
   $username = "your_username";
   $password = "your_password";
   $dbname = "docutracker";
   $servername = "localhost";
   ```

3. **Configure File Permissions**
   ```bash
   chmod 755 userfiles/
   chmod 755 logs/
   ```

4. **Web Server Configuration**
   - Point your web server document root to the project directory
   - Ensure PHP is properly configured
   - Enable URL rewriting if needed

5. **Access the Application**
   - Open your web browser and navigate to your server URL
   - Register a new account or use admin credentials to get started

## 📖 Usage

### For Users
1. **Registration**: Create an account with valid email and phone number
2. **Identity Verification**: Complete the verification process with required documents
3. **Request Documents**: Select document type and fill out the application form
4. **Payment**: Choose payment method and complete the transaction
5. **Track Progress**: Monitor your request status in the dashboard
6. **Download**: Receive completed documents through the system

### For Administrators
1. **Login**: Access the admin panel with administrator credentials
2. **Dashboard**: Review system statistics and recent activities
3. **Manage Users**: Verify user identities and manage accounts
4. **Process Applications**: Review, approve, or reject document requests
5. **Generate Reports**: Create detailed reports on system usage
6. **System Settings**: Configure document types and system parameters

## 🔧 Configuration

### CSS Architecture
The project uses a sophisticated CSS architecture with:
- **Centralized Variables**: 111+ CSS custom properties in `variables.css`
- **Component System**: Modular CSS files for reusable components
- **Import Hierarchy**: Proper CSS loading order for consistency
- **Mobile-First**: Responsive design approach

### Payment Methods
Currently supported payment methods:
- Credit Card processing
- GCash integration
- Extensible payment gateway system

### Document Types
The system supports various document types:
- Birth Certificate
- Marriage Certificate
- Death Certificate
- Business Permits
- And more (configurable by admin)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code structure and naming conventions
- Use the global CSS system for styling
- Ensure responsive design compatibility
- Add appropriate error handling and logging
- Test thoroughly before submitting

## 📝 API Documentation

### Authentication Endpoints
- `POST /php/auth/login.php` - User login
- `POST /php/auth/register.php` - User registration
- `POST /php/auth/logout.php` - User logout

### User Endpoints
- `GET /php/client/dashboard/fetch-dashboard-data.php` - Dashboard data
- `POST /php/client/document-request/save-request.php` - Create request
- `GET /php/services/get-requests.php` - Get user requests

### Admin Endpoints
- `GET /php/admin/admin-manage-users/fetch-users-data.php` - User management
- `POST /php/admin/admin-application-request/fetch-application-request.php` - Applications
- `GET /php/admin/admin-reports/fetch-statistics.php` - Reports data

## 📊 Database Schema

Key tables include:
- `User` - User accounts and profiles
- `Request` - Document requests
- `Application` - Detailed applications
- `Payment` - Payment records
- `SessionTokens` - Session management
- `AuditLog` - System activity logs
- `DocumentTypes` - Available document types

## 🔒 Security Features

- **Password Hashing**: Secure password storage using PHP's password_hash()
- **Session Tokens**: Secure session management with database tokens
- **CSRF Protection**: Form token validation
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Protected file handling with type validation
- **Audit Logging**: Comprehensive activity tracking

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mark Jayson** ([@markjayson545](https://github.com/markjayson545))

## 🙏 Acknowledgments

- Font Awesome for icons
- Chart.js for data visualization
- Lottie for animations
- PHP and MySQL communities

## 📞 Support

For support, email markjayson545@gmail.com or create an issue in the GitHub repository.

---

**DocuTracker** - Making document requests simple, secure, and efficient.
