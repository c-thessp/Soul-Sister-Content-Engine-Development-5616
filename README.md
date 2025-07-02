# Soul Sister Accelerator - Content Engine v1

A comprehensive content processing platform that transforms transcripts into multiple content formats with automated approval workflows and Notion integration.

## Features

### Phase 1 - Core Content Processing
- **Transcript Upload & Processing**: Clean file upload interface with real-time processing status
- **Multi-Function Content Generation**: Generate book chapters, Facebook content, Substack newsletters, and Instagram content
- **Content Review Interface**: Tabbed interface for reviewing all generated content types
- **Approval Workflow**: Simple approve/discard system with bulk operations
- **Notion Integration**: Automatic push of approved book chapters to Notion database
- **Processing History**: Dashboard showing all processed transcripts with search and filtering

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **Backend**: Supabase with Edge Functions
- **Integration**: Notion API for book chapter publishing
- **Icons**: React Icons (Feather Icons)

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_NOTION_API_KEY`: Your Notion integration API key
- `VITE_NOTION_DATABASE_ID`: Your Notion database ID for book chapters

### 2. Supabase Setup
Ensure your Supabase project has these Edge Functions:
- `extract-insights`
- `generate-book-chapter`
- `generate-facebook-content`
- `generate-substack-content`
- `generate-instagram-content`

### 3. Notion Setup
1. Create a Notion integration at https://www.notion.so/my-integrations
2. Create a database for book chapters with these properties:
   - Name (Title)
   - Status (Select: Draft, In Review, Published)
   - Source Transcript (Rich Text)
   - Date Generated (Date)
3. Share the database with your integration
4. Copy the database ID from the URL

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```

## Database Schema

### Transcripts Table
```sql
- id (uuid, primary key)
- filename (text)
- content (text)
- status (text)
- metadata (jsonb)
- created_at (timestamp)
```

### Insights Table
```sql
- id (uuid, primary key)
- transcript_id (uuid, foreign key)
- content (text)
- created_at (timestamp)
```

### Content Table
```sql
- id (uuid, primary key)
- transcript_id (uuid, foreign key)
- type (text) -- 'book-chapter', 'facebook', 'substack', 'instagram'
- title (text)
- content (text)
- approved (boolean)
- approved_at (timestamp)
- created_at (timestamp)
```

## Usage Workflow

1. **Upload Transcript**: Drag and drop .txt or .md files
2. **Automatic Processing**: Insights are extracted immediately
3. **Generate Content**: Click buttons to generate different content types
4. **Review Content**: Use tabbed interface to review all generated content
5. **Approve Content**: Toggle approval for each piece of content
6. **Notion Integration**: Approved book chapters automatically sync to Notion
7. **History Management**: View and manage all processed transcripts

## Content Types Generated

### Book Chapter
- Structured chapter content
- Automatic Notion integration when approved
- Formatted for book publication

### Facebook Content
- Engaging posts for timeline
- Group discussion strategies
- Optimized for Facebook algorithm

### Substack Content
- Newsletter-formatted content
- Email-optimized structure
- Subscriber engagement focus

### Instagram Content
- Post captions
- Story content ideas
- Reel concepts and scripts

## Future Phases

- **Phase 2**: Graphics generation and visual content creation
- **Phase 3**: Automated scheduling and publishing
- **Phase 4**: Analytics and performance tracking
- **Phase 5**: AI-powered content optimization

## Development

### Code Structure
```
src/
├── components/
│   ├── Layout/          # Header and layout components
│   ├── Upload/          # File upload functionality
│   ├── Dashboard/       # Content generation dashboard
│   ├── Review/          # Content review interface
│   └── History/         # Processing history
├── hooks/               # Custom React hooks
├── config/              # Configuration files
└── common/              # Shared components
```

### Key Features
- Responsive design for mobile content review
- Real-time status updates
- Error handling and retry mechanisms
- Clean, intuitive UI focused on content workflow
- Proper state management and data persistence

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.