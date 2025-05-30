A robust Node.js application that integrates HubSpot CRM with a local database, providing a seamless synchronization system for contacts and companies. This application serves as a middleware layer between HubSpot and your local database, enabling efficient data management and real-time updates through webhooks.

## Features

- **Contact Management**
  - Batch creation of contacts in HubSpot
  - Real-time contact synchronization with local database
  - Advanced contact search and filtering
  - Contact property updates and deletion

- **Company Management**
  - Batch creation of companies in HubSpot
  - Company synchronization with local database
  - Domain-based company lookup
  - Company property updates and deletion

- **Webhook Integration**
  - Secure webhook handling for real-time updates
  - Signature verification for enhanced security
  - Automatic synchronization of changes between HubSpot and local database

- **Repository Pattern**
  - Clean separation of database operations
  - Type-safe database interactions
  - Centralized data access layer

## Tech Stack

- **Backend**
  - Node.js with TypeScript
  - Express.js for API endpoints
  - MongoDB for local database
  - HubSpot API Client for CRM integration

- **Development Tools**
  - TypeScript for type safety
  - ESLint for code quality
  - JSDoc for documentation
  - Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- HubSpot Developer Account
- HubSpot API Access Token
- HubSpot Webhook Secret

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hubspot-sync
   cd hubspot-sync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # HubSpot Configuration
   HUBSPOT_ACCESS_TOKEN=your_access_token_here
   HUBSPOT_WEBHOOK_SECRET=your_webhook_secret_here

   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=your_database_name

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Contacts

- `POST /api/contacts/batch` - Create multiple contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/search` - Search contacts with filters
- `DELETE /api/contacts/:id` - Delete a contact

### Companies

- `POST /api/companies/batch` - Create multiple companies
- `GET /api/companies` - List all companies
- `GET /api/companies/search` - Search companies with filters
- `DELETE /api/companies/:id` - Delete a company

### Webhooks

- `POST /api/webhooks/hubspot` - Handle HubSpot webhook events

## Webhook Setup

1. In your HubSpot account, go to Settings > Integrations > Webhooks
2. Create a new webhook subscription
3. Set the webhook URL to: `https://your-domain.com/api/webhooks/hubspot`
4. Select the events you want to subscribe to (contacts and companies)
5. Copy the webhook secret and add it to your `.env` file

## Development

- Run in development mode with hot-reload:
  ```bash
  npm run dev
  ```

- Run tests:
  ```bash
  npm test
  ```

- Lint code:
  ```bash
  npm run lint
  ```

## Project Structure

```
hubspot-sync/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Database operations
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── clients/        # External service clients
│   ├── tests/              # Test files
│   └── package.json
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All API endpoints are protected with proper validation
- Webhook signatures are verified for each incoming request
- Sensitive data is stored securely in environment variables
- Input validation is implemented for all endpoints

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Acknowledgments

- HubSpot API Documentation
- MongoDB Documentation
- Express.js Documentation
- TypeScript Documentation

## API Documentation

### Contact Controller APIs

#### Create Batch Contacts
```http
POST /api/contact/createBatch
Content-Type: application/json

Request Body:
{
  "contacts": [
    {
      "email": "john.doe@example.com",
      "firstname": "John",
      "lastname": "Doe",
      "phone": "+1234567890",
      "company": "Example Corp",
      "jobtitle": "Software Engineer"
    },
    {
      "email": "barann.basarann@gmail.com",
      "firstname": "Baran",
      "lastname": "Basaran",
      "phone": "+353852321113",
      "company": "N/A",
      "jobtitle": "Software Engineer"
    }

  ]
}




#### Search Contacts
```http
GET /contact/search?property=email&operator=EQ&value=barann.basarann@gmail.com
GET /contact/search?property=firstname&operator=EQ&value=baran

Response (200 OK):
{
    "status": "success",
    "message": "Contacts retrieved successfully",
    "data": [
        {
            "createdAt": "2025-05-30T21:26:26.818Z",
            "archived": false,
            "id": "313469083890",
            "properties": {
                "company": "N/A",
                "createdate": "2025-05-30T21:26:26.818Z",
                "email": "barann.basarann@gmail.com",
                "firstname": "Baran",
                "hs_object_id": "313469083890",
                "lastmodifieddate": "2025-05-30T21:31:29.527Z",
                "lastname": "Basaran",
                "phone": "+353852321113"
            },
            "updatedAt": "2025-05-30T21:31:29.527Z"
        }
    ]
}


```

#### Delete Contact
```http
DELETE /contact/delete/313469083890

Response (200 OK):
{
  "status": "success",
  "message": "Contact deleted successfully"
}

Error Response (404 Not Found):
{
  "status": "error",
  "message": "Contact not found with ID: 313469083890"
}
```

### Company Controller APIs

#### Create Batch Companies
```http
POST /company/createBatch
Content-Type: application/json

{
  "companies": [
    {
      "name": "Acme Corporation",
      "domain": "acme.com",
      "phone": "+1-555-0123",
      "description": "Leading technology solutions provider",
      "industry": "INFORMATION_TECHNOLOGY_AND_SERVICES"
    },
    {
      "name": "Global Finance Ltd",
      "domain": "globalfinance.com",
      "phone": "+1-555-0124",
      "description": "International financial services",
      "industry": "FINANCIAL_SERVICES"
    }
  ]
}
```

**Response (Success - 201)**
```json
{
  "status": "success",
  "message": "Companies created successfully",
  "data": [
    {
      "id": "123456789",
      "properties": {}, 
      "createdAt": "2024-03-14T12:00:00Z",
      "updatedAt": "2024-03-14T12:00:00Z"
    },
    {
      "id": "987654321",
      "properties": {}, 
      "createdAt": "2024-03-14T12:00:00Z",
      "updatedAt": "2024-03-14T12:00:00Z"
    }
  ]
}
```

**Response (Error - 400)**
```json
{
  "status": "error",
  "message": "Invalid industry value provided: Invalid industry value: TECHNOLOGY",
  "error": "Valid options are: ACCOUNTING, ADVERTISING_AND_MARKETING, AEROSPACE, AGRICULTURE, ARCHITECTURE_AND_PLANNING, ARTS_AND_ENTERTAINMENT, AUTOMOTIVE, BANKING_AND_FINANCE, BIOTECHNOLOGY, BROADCASTING, BUSINESS_SERVICES, CHEMICALS, CIVIL_ENGINEERING, COMPUTER_HARDWARE, COMPUTER_SOFTWARE, CONSTRUCTION, CONSUMER_ELECTRONICS, CONSUMER_GOODS, CONSUMER_SERVICES, DEFENSE, EDUCATION, ENERGY, ENGINEERING, ENVIRONMENTAL_SERVICES, FINANCIAL_SERVICES, FOOD_AND_BEVERAGE, GOVERNMENT, HEALTHCARE, HOSPITALITY, INFORMATION_TECHNOLOGY_AND_SERVICES, INSURANCE, LEGAL_SERVICES, LIFE_SCIENCES, MANUFACTURING, MEDIA_PRODUCTION, MEDICAL_DEVICES, MINING_AND_METALS, NONPROFIT, OIL_AND_ENERGY, PHARMACEUTICALS, PROFESSIONAL_SERVICES, REAL_ESTATE, RETAIL, TELECOMMUNICATIONS, TEXTILES, TRANSPORTATION, TRAVEL_AND_TOURISM, UTILITIES, VENTURE_CAPITAL_AND_PRIVATE_EQUITY, WAREHOUSING, WHOLESALE"
}
```

**Notes:**
- `name` and `domain` are required fields
- `phone`, `description`, and `industry` are optional
- `industry` must be one of the predefined HubSpot industry values (case-sensitive)
- Additional custom properties can be included in the request body

**Valid Industry Values:**
| Industry Value | Description |
|----------------|-------------|
| ACCOUNTING | Accounting and financial services |
| ADVERTISING_AND_MARKETING | Advertising and marketing services |
| AEROSPACE | Aerospace and defense |
| AGRICULTURE | Agricultural services and products |
| ARCHITECTURE_AND_PLANNING | Architecture and urban planning |
| ARTS_AND_ENTERTAINMENT | Arts, entertainment, and recreation |
| AUTOMOTIVE | Automotive industry |
| BANKING_AND_FINANCE | Banking and financial services |
| BIOTECHNOLOGY | Biotechnology research and development |
| BROADCASTING | Broadcasting and media |
| BUSINESS_SERVICES | Business consulting and services |
| CHEMICALS | Chemical manufacturing |
| CIVIL_ENGINEERING | Civil engineering services |
| COMPUTER_HARDWARE | Computer hardware manufacturing |
| COMPUTER_SOFTWARE | Software development and services |
| CONSTRUCTION | Construction and building |
| CONSUMER_ELECTRONICS | Consumer electronics manufacturing |
| CONSUMER_GOODS | Consumer goods manufacturing |
| CONSUMER_SERVICES | Consumer services |
| DEFENSE | Defense and military |
| EDUCATION | Educational services |
| ENERGY | Energy production and distribution |
| ENGINEERING | Engineering services |
| ENVIRONMENTAL_SERVICES | Environmental services |
| FINANCIAL_SERVICES | Financial services |
| FOOD_AND_BEVERAGE | Food and beverage industry |
| GOVERNMENT | Government and public sector |
| HEALTHCARE | Healthcare services |
| HOSPITALITY | Hospitality and tourism |
| INFORMATION_TECHNOLOGY_AND_SERVICES | IT services and consulting |
| INSURANCE | Insurance services |
| LEGAL_SERVICES | Legal services |
| LIFE_SCIENCES | Life sciences research |
| MANUFACTURING | Manufacturing industry |
| MEDIA_PRODUCTION | Media production |
| MEDICAL_DEVICES | Medical device manufacturing |
| MINING_AND_METALS | Mining and metals industry |
| NONPROFIT | Non-profit organizations |
| OIL_AND_ENERGY | Oil and energy industry |
| PHARMACEUTICALS | Pharmaceutical industry |
| PROFESSIONAL_SERVICES | Professional services |
| REAL_ESTATE | Real estate services |
| RETAIL | Retail industry |
| TELECOMMUNICATIONS | Telecommunications services |
| TEXTILES | Textile manufacturing |
| TRANSPORTATION | Transportation services |
| TRAVEL_AND_TOURISM | Travel and tourism services |
| UTILITIES | Utility services |
| VENTURE_CAPITAL_AND_PRIVATE_EQUITY | Venture capital and private equity |
| WAREHOUSING | Warehousing and storage |
| WHOLESALE | Wholesale trade |

#### Search Companies
```http
GET /api/company/search?property=domain&operator=EQ&value=example.com


#### Delete Company
```http
DELETE /company/delete/456


### Search Parameters

Both contact and company search endpoints accept the following query parameters:

- `property` (required): The property name to search on (e.g., "email", "domain", "name")
- `operator` (required): The comparison operator to use
- `value` (required): The value to search for

Example searches:
```http
# Search for contacts with email containing "@example.com"
GET /api/contact/search?property=email&operator=CONTAINS&value=@example.com

# Search for companies in the Technology industry
GET /api/company/search?property=industry&operator=EQ&value=Technology

# Search for contacts with a specific phone number
GET /api/contact/search?property=phone&operator=EQ&value=+1234567890
```

## Search Filter Operators

Both contact and company search endpoints support the following filter operators:

- `EQ` - Equals
- `NEQ` - Not equals
- `GT` - Greater than
- `GTE` - Greater than or equal
- `LT` - Less than
- `LTE` - Less than or equal
- `BETWEEN` - Between two values
- `IN` - In a list of values
- `NOT_IN` - Not in a list of values
- `CONTAINS` - Contains substring
- `NOT_CONTAINS` - Does not contain substring
- `IS_KNOWN` - Property has a value
- `IS_UNKNOWN` - Property has no value

Example of complex search filter:
```json
[
  {
    "propertyName": "email",
    "operator": "CONTAINS",
    "value": "@example.com"
  },
  {
    "propertyName": "company",
    "operator": "EQ",
    "value": "Example Corp"
  }
]
``` 