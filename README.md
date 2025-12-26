# UnifiedTeamOS

A unified collaboration platform combining chat, tasks, documents, video/voice calls, whiteboard, and email integration.

## Core Features

### Unified Inbox
- Centralized view of messages, notifications, and emails
- Filter by source (chat, email, tasks)
- Mark as read/unread, pin important items

### Real-time Chat
- Direct and group messaging
- File sharing
- Message reactions and threads

### Task Management
- Create, assign, and track tasks
- Set due dates and priorities
- Task comments and updates

### Document Collaboration
- Real-time collaborative editing
- Version history
- Comments and suggestions

### Video/Voice Calls
- One-on-one and group calls
- Screen sharing
- Meeting recording

### Whiteboard
- Real-time collaborative whiteboard
- Drawing tools and shapes
- Export options

### Email Integration
- Unified email management
- Send/receive from multiple accounts
- Email templates

## Technical Stack

### Frontend
- React.js
- Redux for state management
- WebSocket for real-time updates
- Tailwind CSS

### Backend
- Python with FastAPI
- SQLAlchemy ORM
- PostgreSQL database
- JWT Authentication

## Project Status

### Implementation Status
- [x] User Authentication
- [x] Real-time Chat
- [x] Task Management
- [x] Document Collaboration (Basic)
- [ ] Video/Voice Calls (In Progress)
- [ ] Whiteboard (Planned)
- [ ] Email Integration (In Progress)

### Current Version
- **v0.1.0** - Initial Release

### Known Issues
- Mobile responsiveness needs improvement
- Video call feature in development
- Email sync in progress

## Project Structure
UnifiedTeamOS/ ├── backend/ # Backend API server │ ├── routers/ # API endpoints │ ├── models/ # Database models │ └── services/ # Business logic ├── frontend/ # React frontend │ ├── src/ │ │ ├── features/ # Feature modules │ │ └── services/ # API service layer └──

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 13+

### Backend Setup
1. Create and activate virtual environment
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables
4. Run migrations: `alembic upgrade head`
5. Start server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Start dev server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.