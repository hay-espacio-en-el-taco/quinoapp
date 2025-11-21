# Quinoa

A comprehensive nutritional scheduling and meal planning application that helps users manage their daily nutrition through personalized meal plans, AI-powered recipe generation from grocery images, and specialist tracking capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Node](https://img.shields.io/badge/Node-20.x-green)

## 🌟 Features

- **Personalized Meal Planning**: Create and manage weekly meal schedules with nutritional tracking
- **AI-Powered Grocery Scanner**: Upload grocery images and get AI-generated recipes with nutritional information
- **Dual User Roles**: 
  - Regular users manage their own nutrition plans
  - Specialists (dietitians/nutritionists) monitor and guide multiple clients
- **Compliance Tracking**: Track meal adherence and maintain healthy eating habits
- **Nutritional Database**: Pre-defined meals with detailed nutritional information (calories, protein, carbs, fats)
- **Responsive Design**: Mobile-first approach with Material Design 3 principles

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Database Setup](#database-setup)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** database (or Neon serverless PostgreSQL)
- **OpenAI API Key** (for AI-powered features)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Quinoa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Session Secret (generate a random string)
   SESSION_SECRET=your_session_secret_here
   ```

   > **Note**: Never commit your `.env` file to version control. It should be added to `.gitignore`.

## ⚙️ Configuration

### Database Configuration

The application uses PostgreSQL with Drizzle ORM. The database configuration is located in:
- `drizzle.config.ts` - Drizzle Kit configuration
- `server/db.ts` - Database connection setup

### OpenAI Configuration

The AI features require an OpenAI API key. Configuration is in:
- `server/openai.ts` - OpenAI client setup

## 🚀 Running the Project

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5000` (or the port specified in your environment).

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Other Commands

- **Type checking**: `npm run check`
- **Database push**: `npm run db:push` (push schema changes to database)

## 📁 Project Structure

```
Quinoa/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/               # React components and pages
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── app.ts            # Express app configuration
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database access layer
│   ├── openai.ts         # OpenAI integration
│   ├── db.ts             # Database connection
│   ├── seed.ts           # Database seeding script
│   ├── index-dev.ts      # Development server entry
│   └── index-prod.ts     # Production server entry
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema definitions
├── .replit               # Replit configuration
├── components.json       # Shadcn UI configuration
├── design_guidelines.md  # Design system documentation
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json          # Project dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── README.md            # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Shadcn/ui** - Component library (built on Radix UI)
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **Express Session** - Session management
- **Multer** - File upload handling
- **OpenAI API** - AI-powered features

### Development Tools
- **ESBuild** - Server bundling
- **Drizzle Kit** - Database migrations
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🗄️ Database Setup

### Initialize the Database

1. **Ensure PostgreSQL is running** and you have created a database

2. **Update the DATABASE_URL** in your `.env` file

3. **Push the schema to the database**
   ```bash
   npm run db:push
   ```

4. **(Optional) Seed the database** with sample data
   ```bash
   npx tsx server/seed.ts
   ```

### Database Schema

The application uses the following main tables:
- `users` - User accounts with role-based access
- `meals` - Pre-defined meal database with nutritional info
- `recipes` - AI-generated recipes from grocery scanner
- `schedules` - Weekly meal plans
- `scheduleEntries` - Individual meal assignments
- `complianceLogs` - Meal adherence tracking

## 🤝 Contributing

We welcome contributions to Quinoa! Here's how you can help:

### Getting Started

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/Quinoa.git
   cd Quinoa
   ```

3. **Add the upstream remote**
   ```bash
   git remote add upstream <original-repository-url>
   ```

4. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make your changes**
   - Follow the existing code style and conventions
   - Refer to `design_guidelines.md` for UI/UX standards
   - Write clear, descriptive commit messages

2. **Test your changes**
   ```bash
   npm run check  # Type checking
   npm run dev    # Test in development mode
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   **Commit Message Convention**:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes

### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any` when possible
- **React**: Use functional components with hooks
- **Naming**: 
  - Components: PascalCase (`MealCard.tsx`)
  - Functions/variables: camelCase (`getMealById`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Formatting**: The project uses consistent spacing and indentation
- **Imports**: Use path aliases (`@/`, `@shared/`) for cleaner imports

### Design Guidelines

Please refer to `design_guidelines.md` for:
- Material Design 3 principles
- Typography hierarchy
- Layout systems
- Component patterns
- Responsive design standards

### What to Contribute

**Good First Issues**:
- Bug fixes
- Documentation improvements
- UI/UX enhancements
- Test coverage
- Accessibility improvements

**Feature Ideas**:
- Additional meal filters
- Export meal plans to PDF
- Integration with fitness trackers
- Recipe sharing between users
- Mobile app version
- Meal prep scheduling
- Shopping list generation

### Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, browser)

### Questions?

Feel free to open an issue with the `question` label if you need help or clarification.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Shadcn/ui](https://ui.shadcn.com/) component library
- Powered by [OpenAI](https://openai.com/) for AI features
- Database hosted on [Neon](https://neon.tech/) serverless PostgreSQL
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing [issues](../../issues)
2. Create a new issue with detailed information
3. Refer to the documentation in `replit.md` for architecture details

---

**Happy Coding! 🚀**
