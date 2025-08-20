# Salon Shift Management System

A comprehensive React-based shift management system for salon businesses with AI-powered scheduling capabilities.

## Features

### Core Functionality
- **Staff Management**: Add, edit, and manage staff members with roles and contact information
- **Shift Scheduling**: Create and manage shifts with drag-and-drop interface
- **AI-Powered Shift Generation**: Automated shift creation using Google Gemini AI
- **Request Management**: Staff can submit shift preferences and time-off requests
- **Store Configuration**: Set operating hours, shift times, and minimum staffing requirements

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Data Persistence**: Local storage with import/export capabilities
- **Error Handling**: Comprehensive error boundaries and validation
- **Toast Notifications**: User-friendly feedback system
- **Modern UI**: Clean, accessible interface with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd salondx_shift_create
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components
│   ├── dashboard/      # Dashboard components
│   ├── staff/          # Staff management components
│   └── calendar/       # Calendar components
├── hooks/              # Custom React hooks
├── services/           # External services and APIs
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration files
└── context/            # React context providers
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Usage Guide

### For Administrators

1. **Dashboard**: View system overview and quick statistics
2. **Staff Management**: 
   - Add new staff members with their roles
   - Edit existing staff information
   - Delete staff (only if not assigned to shifts)
3. **Shift Creation**:
   - Use drag-and-drop to assign staff to shifts
   - Generate AI-powered shifts based on preferences
   - Confirm shifts when finalized
4. **Store Settings**: Configure operating hours and minimum staffing

### For Staff Members

1. **Staff Selection**: Choose your profile from the dropdown
2. **Shift Viewing**: See your assigned shifts in calendar format
3. **Request Submission**: Submit preferences for:
   - Days off
   - Preferred shifts (morning/evening)
   - Flexible scheduling

## AI Integration

The system integrates with Google's Gemini AI to automatically generate optimized shift schedules based on:
- Staff availability and preferences
- Minimum staffing requirements
- Store operating hours
- Historical patterns

## Data Management

- **Local Storage**: All data is stored locally in the browser
- **Export/Import**: Backup and restore data as JSON files
- **Data Validation**: Comprehensive validation for all inputs

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.

## Roadmap

### Phase 2 Features (Planned)
- Advanced reporting and analytics
- Multi-location support
- Staff scheduling preferences
- Email notifications
- Mobile app companion
- Integration with payroll systems

### Phase 3 Features (Future)
- Real-time collaboration
- Advanced AI optimization
- Custom shift patterns
- Compliance tracking
- API for third-party integrations

## Acknowledgments

- Built with React 18 and TypeScript
- UI components with Tailwind CSS
- Icons by Lucide React
- AI powered by Google Gemini