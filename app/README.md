# HealthAI Coach Backoffice

Welcome to the HealthAI Coach Backoffice project! This application serves as the administrative interface for managing health, nutrition, and fitness data.

## Project Structure

The project is organized as follows:

```
healthai-coach-backoffice
├── src
│   ├── app                # Main application components and providers
│   ├── routes             # Routing configuration and guards
│   ├── layouts            # Layout components for different sections
│   ├── pages              # Page components for various functionalities
│   ├── features           # Feature-specific logic and components
│   ├── components         # Reusable UI components
│   ├── api                # API client and endpoints
│   ├── services           # Services for handling authentication and logging
│   ├── hooks              # Custom hooks for shared logic
│   ├── utils              # Utility functions
│   ├── types              # Type definitions
│   ├── mocks              # Mock data for testing
│   ├── constants          # Constants used throughout the application
│   ├── main.tsx           # Entry point of the application
│   └── vite-env.d.ts      # TypeScript definitions for Vite
├── index.html             # Main HTML file
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # Node-specific TypeScript configuration
├── .env.example           # Example environment configuration
└── .gitignore             # Files to ignore in Git
```

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd healthai-coach-backoffice
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the development server:**
   ```
   npm run dev
   ```

   Profiles:
   - Complete (default): `npm run dev`
   - Offline (no network calls): `npm run dev:offline`
   - Performance (aggressive caching): `npm run dev:performance`

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Features

- **User Authentication:** Secure login and registration for users and admins.
- **Dashboard:** Visual representation of key performance indicators (KPIs) and analytics.
- **User Management:** View and manage users, including detailed profiles.
- **AI Recommendations:** Access and manage AI-generated health and nutrition recommendations.
- **Nutrition Catalog:** Browse and analyze nutritional data.
- **Sports Programs:** Manage and view sports programs and exercises.
- **Analytics:** Advanced analytics for user engagement and performance.
- **Partner Management:** Manage business partners and their performance.
- **Settings:** Configure application settings and preferences.

## Contributing

Contributions are welcome! Please follow the standard Git workflow:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

Thank you for using HealthAI Coach! We hope this application helps you manage health and wellness effectively.