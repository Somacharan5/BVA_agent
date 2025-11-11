# BVA (Business Value Analysis) Agent

## Overview

The BVA Agent is a McKinsey-style consultant specialized in creating Business Value Analysis reports for retail and CPG companies considering AI transformation. It follows the 4-D Methodology (Deconstruct, Diagnose, Develop, Deliver) to provide comprehensive, data-driven analysis.

## Features

### Core Capabilities
- **Company Research**: Deep analysis of company basics, market position, and strategic context
- **Market Analysis**: External signals, consumer behavior, and industry trends
- **Competitor Analysis**: AI initiatives from competitors with reported outcomes and investments
- **Executive Communication**: Professional, concise executive emails with actionable insights

### 4-D Methodology
1. **Deconstruct**: Understand context and goals
2. **Diagnose**: Analyze current situation with data
3. **Develop**: Plan AI solutions and impact estimates  
4. **Deliver**: Executive-ready communication

## Tools Used

### 1. Company Research Tool (`companyResearchTool`)
- Researches company fundamentals (industry, size, financials)
- Identifies challenges and opportunities
- Provides strategic context

### 2. Market Analysis Tool (`marketAnalysisTool`)
- Analyzes market trends and consumer behavior
- Identifies external signals affecting the industry
- Examines economic and technology factors

### 3. Competitor Analysis Tool (`competitorAnalysisTool`)
- Researches competitor AI initiatives and projects
- Reports outcomes and investment levels
- Identifies success factors and trends

### 4. Document Generator Tool (`documentGeneratorTool`)
- Creates downloadable markdown files for all three deliverables
- Generates professional documents with headers and formatting
- Provides direct download links for easy sharing with stakeholders

## Frontend UI Design

### UI Layout (ChatGPT-style Interface)

The BVA Agent will have a modern, ChatGPT-like interface with the following structure:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Home > BVA Agent              [Badge: BVA Consultant] 🎯    │
├─────────────┬───────────────────────────────────────────────────────────┤
│             │                                                             │
│  SIDEBAR    │                  CHAT AREA                                 │
│  (w-64)     │                  (flex-1)                                  │
│             │                                                             │
│ ┌─────────┐ │  ┌───────────────────────────────────────────────────┐   │
│ │New Chat │ │  │                                                   │   │
│ └─────────┘ │  │  Empty State (when no chat selected):            │   │
│             │  │  ╔═══════════════════════════════════════╗        │   │
│ Chat List:  │  │  ║  Welcome to BVA Agent                 ║        │   │
│             │  │  ║  McKinsey-style AI Consultant         ║        │   │
│ • WinCo     │  │  ║                                       ║        │   │
│   Analysis  │  │  ║  [New Chat Button]                    ║        │   │
│             │  │  ╚═══════════════════════════════════════╝        │   │
│ • Walmart   │  │                                                   │   │
│   Analysis  │  └───────────────────────────────────────────────────┘   │
│             │                                                             │
│ • Target    │  ┌───────────────────────────────────────────────────┐   │
│   Study     │  │  Chat Messages (when chat active):                │   │
│             │  │                                                   │   │
│ [Delete]    │  │  ┌──────────────────────────────────┐            │   │
│             │  │  │ 👤 You:                           │            │   │
│             │  │  │ "Analyze WinCo Foods"            │            │   │
│             │  │  └──────────────────────────────────┘            │   │
│             │  │                                                   │   │
│             │  │  ┌──────────────────────────────────┐            │   │
│             │  │  │ 🤖 BVA Agent:                     │            │   │
│             │  │  │ "I'll conduct a comprehensive..."│            │   │
│             │  │  │                                   │            │   │
│             │  │  │ [📄 Executive Email]              │            │   │
│             │  │  │ [📊 Slide Deck]                   │            │   │
│             │  │  │ [📑 Supporting Analysis]          │            │   │
│             │  │  │                                   │            │   │
│             │  │  │ [Copy] [Preview] [Download]      │            │   │
│             │  │  └──────────────────────────────────┘            │   │
│             │  │                                                   │   │
│             │  └───────────────────────────────────────────────────┘   │
│             │                                                             │
│             │  ┌───────────────────────────────────────────────────┐   │
│             │  │  Chat Input:                                      │   │
│             │  │  ┌─────────────────────────────────────────────┐ │   │
│             │  │  │ Type your message...           [Send 📤]    │ │   │
│             │  │  └─────────────────────────────────────────────┘ │   │
│             │  └───────────────────────────────────────────────────┘   │
│             │                                                             │
└─────────────┴───────────────────────────────────────────────────────────┘
```

### UI Components to Reuse

The BVA Agent UI will reuse existing components from RGPT:

1. **ChatSessionList** (`@/components/rgpt/ChatSessionList`)
   - Displays chat history on left sidebar
   - "New Chat" button
   - Session selection and deletion

2. **ChatMessage** (`@/components/rgpt/ChatMessage`)
   - Displays user and assistant messages
   - User avatar (👤) and Bot avatar (🤖)
   - Will be extended to support document attachments

3. **ChatInput** (`@/components/rgpt/ChatInput`)
   - Message input with auto-resize
   - Send button
   - Enter to send, Shift+Enter for new line

### New Components Needed

1. **BVADocumentCard** (New)
   - Displays generated documents (Executive Email, Slide Deck, Supporting Analysis)
   - Actions: Preview, Download, Copy to Clipboard
   - Visual indicators for document type
   
2. **DocumentPreviewModal** (New)
   - Modal popup for PDF/Markdown preview
   - Full-screen view option
   - Print functionality

### Page Structure

```typescript
// src/pages/BVAAgent.tsx
import { ChatSessionList } from '@/components/rgpt/ChatSessionList';
import { ChatMessage } from '@/components/rgpt/ChatMessage';
import { ChatInput } from '@/components/rgpt/ChatInput';
import { BVADocumentCard } from '@/components/bva/BVADocumentCard';
import { useBvaMessages } from '@/hooks/useBvaMessages';
import { useBvaSessions } from '@/hooks/useBvaSessions';
```

### Features

1. **Chat Sessions Management**
   - Create new BVA analysis session
   - View previous analyses
   - Delete old sessions
   - Auto-save conversation history

2. **Document Generation**
   - Generate Executive Email (300 words)
   - Generate Slide Deck (10 slides)
   - Generate Supporting Analysis & Citations
   - Visual cards for each document type

3. **Document Preview**
   - Click to preview in modal
   - Markdown rendering
   - Syntax highlighting for code blocks
   - Copy to clipboard functionality

4. **Company Context**
   - Automatically detect company name from conversation
   - Store in session metadata
   - Display in chat header

### Implementation Checklist

#### Phase 1: Core UI Structure
- [ ] Create `src/pages/BVAAgent.tsx` page
- [ ] Implement ChatGPT-style layout (sidebar + chat area)
- [ ] Integrate `ChatSessionList` component for chat history
- [ ] Add breadcrumb navigation with "BVA Consultant" badge
- [ ] Implement empty state welcome screen

#### Phase 2: Chat Functionality
- [ ] Create `useBvaSessions` hook (similar to `useRgptSessions`)
- [ ] Create `useBvaMessages` hook (similar to `useRgptMessages`)
- [ ] Integrate `ChatMessage` component for displaying messages
- [ ] Integrate `ChatInput` component for message input
- [ ] Connect to Mastra BVA agent backend

#### Phase 3: Document Generation UI
- [ ] Create `BVADocumentCard` component
  - [ ] Executive Email card with icon 📄
  - [ ] Slide Deck card with icon 📊
  - [ ] Supporting Analysis card with icon 📑
  - [ ] Copy, Preview, Download buttons
- [ ] Parse agent response to detect generated documents
- [ ] Display document cards inline with chat messages

#### Phase 4: Document Preview
- [ ] Create `DocumentPreviewModal` component
  - [ ] Markdown rendering (react-markdown)
  - [ ] Syntax highlighting for code blocks
  - [ ] Full-screen mode toggle
  - [ ] Close/Download actions
- [ ] Handle different document formats (MD, PDF)
- [ ] Implement modal open/close state management

#### Phase 5: Backend Integration
- [ ] Create API endpoint: `POST /api/bva/chat`
- [ ] Create API endpoint: `POST /api/bva/sessions`
- [ ] Create API endpoint: `GET /api/bva/sessions/:id/messages`
- [ ] Integrate with Mastra BVA agent
- [ ] Handle document generation and storage
- [ ] Implement session persistence (database/Supabase)

#### Phase 6: Polish & Features
- [ ] Add loading states for agent responses
- [ ] Implement error handling and retry
- [ ] Add toast notifications for success/error
- [ ] Auto-scroll to latest message
- [ ] Session title auto-generation (from company name)
- [ ] Responsive design for mobile/tablet

### File Structure

```
retailabs-erp/src/
├── pages/
│   └── BVAAgent.tsx              # Main BVA Agent page
├── components/
│   ├── bva/
│   │   ├── BVADocumentCard.tsx   # Document display card
│   │   └── DocumentPreviewModal.tsx # Preview modal
│   └── rgpt/                     # Reused components
│       ├── ChatSessionList.tsx
│       ├── ChatMessage.tsx
│       └── ChatInput.tsx
├── hooks/
│   ├── useBvaSessions.ts         # BVA session management
│   └── useBvaMessages.ts         # BVA message management
└── api/
    └── bvaApi.ts                 # BVA API client functions
```

## Usage

### Basic Usage

```typescript
import { mastra } from "./mastra";
import { RuntimeContext } from "@mastra/core/runtime-context";

const agent = mastra.getAgent("bvaAgent");
const runtimeContext = new RuntimeContext();

// Set the company name in runtime context
runtimeContext.set("companyName", "Walmart");

const response = await agent.generate(
  "I need a Business Value Analysis for AI transformation.",
  {
    runtimeContext,
    memory: {
      resource: "user_id",
      thread: { id: "bva_session" }
    }
  }
);

console.log(response.text);
```

### Testing

#### Option 1: Complete Demo with Document Generation
```bash
npm run bva-demo
```
This will:
- Start a document server on port 4112
- Run the complete BVA analysis for WinCo Foods
- Generate downloadable documents
- Provide download links in the response
- Keep the server running for document access

#### Option 2: Basic Testing
```bash
npm run test-bva
```

#### Option 3: Quick Test
```bash
npm run quick-test
``` 

#### Option 4: Document Server Only
```bash
npm run docs-server
```

## Agent Behavior

### Company Name Validation
- **With Company Name**: Proceeds with full 4-D analysis
- **Without Company Name**: Asks user to specify the company first

### Output Format
The agent produces three comprehensive deliverables:

1. **Executive Email (300 words)**:
   - Compelling subject line
   - Executive greeting
   - Data-driven insights with citations
   - Specific impact estimates (revenue, margin improvements)
   - Clear call-to-action

2. **Slide Deck Content (10 slides)**:
   - Title slide
   - Summary value proposition with quantified impacts
   - Challenges & AI solutions table
   - External market signals
   - Competitor AI initiatives analysis
   - Top 5 AI transformations for the company
   - 10 short-term opportunities
   - Retailabs value proposition
   - Immediate next steps
   - Call to action

3. **Supporting Analysis & Citations**:
   - Detailed backup for all claims
   - Calculations and expanded analysis
   - Complete source citations

### Downloadable Documents
After generating the analysis, the agent automatically creates three downloadable markdown files:
- **Executive Email**: Professional email ready to send to stakeholders
- **Slide Deck**: All 10 slides formatted for easy conversion to PowerPoint
- **Supporting Analysis**: Detailed research backup with citations

Documents are served via a local HTTP server and can be downloaded directly from the provided links.

### Example Output Structure

```
Subject: Unlock 15-25% Revenue Growth Through AI-Native Retail Transformation

Dear Executive Team,

[Striking company-specific insight with citation]

Retailabs, as an AI-native retail operating system, is uniquely positioned to accelerate [Company]'s digital transformation...

Key AI opportunities identified:
• [Specific initiative]: [Expected impact] 【source†analysis】
• [Specific initiative]: [Expected impact] 【source†analysis】
• [Specific initiative]: [Expected impact] 【source†analysis】

[Call to action with specific next step]
```

## Configuration

### Environment Variables
Ensure you have the required API keys in your `.env` file:
```bash
# OpenAI API Key (current default model)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini API (alternative model - currently has compatibility issues)
# GOOGLE_API_KEY=your_gemini_api_key
```

### Memory Storage
The agent uses LibSQL for memory storage:
- File storage: `file:../mastra.db`
- Conversation persistence across sessions
- Context retention for follow-up questions

## Customization

### Adding New Industries
To add support for new industries, update the mock data in:
- `src/mastra/tools/company-research-tool.ts`
- `src/mastra/tools/market-analysis-tool.ts`  
- `src/mastra/tools/competitor-analysis-tool.ts`

### Integrating Real APIs
Replace mock data with actual API integrations:
- **Company Data**: Crunchbase, PitchBook, SEC filings
- **Market Data**: IBISWorld, Euromonitor, Bloomberg
- **News/Trends**: NewsAPI, Google News, Reuters
- **Financial Data**: Alpha Vantage, Yahoo Finance

### Modifying Output Format
Update the agent instructions in `src/mastra/agents/bva-agent.ts` to change:
- Email length and structure
- Analysis depth and focus areas
- Citation format and requirements

## Best Practices

1. **Always provide company name** either through runtime context or user prompt
2. **Use specific industries** that have mock data for better results
3. **Review citations** to ensure data quality and source attribution
4. **Test with various companies** to validate analysis quality
5. **Monitor token usage** as the agent makes multiple tool calls

## Limitations

1. **Mock Data**: Currently uses simulated data instead of real APIs
2. **Limited Industries**: Best results with retail and technology sectors
3. **Citation Format**: Uses simulated sources and citations
4. **Executive Email Only**: Does not generate slide decks or detailed analysis (as specified in requirements)

## Future Enhancements

1. Integration with real business intelligence APIs
2. Support for additional industries and company types
3. Dynamic report length and format options
4. Real-time data feeds for market analysis
5. Advanced financial modeling and ROI calculations
