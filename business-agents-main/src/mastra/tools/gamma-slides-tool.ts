import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Helper function to extract company name from title or content
function extractCompanyName(title: string, content: string): string {
  // Try from title first
  const titleMatch = title.match(/(.+?)\s+(?:Analysis|AI|BVA)/i);
  if (titleMatch) return titleMatch[1].trim();
  
  // Try from content
  const contentMatch = content.match(/(?:for|analyzing|analysis of)\s+([A-Z][A-Za-z\s&]+?)(?:\s|,|\.|\n)/);
  if (contentMatch) return contentMatch[1].trim();
  
  return 'the Company';
}

// Helper to parse BVA content sections
function parseBvaContent(content: string) {
  const sections: Record<string, string> = {};
  
  // Extract main sections
  const emailMatch = content.match(/## SECTION 1[:\s]*Executive Email[\s\S]*?\n([\s\S]*?)(?=\n##|$)/i);
  if (emailMatch) sections.email = emailMatch[1].trim();
  
  const slidesMatch = content.match(/## SECTION 2[:\s]*Slide Deck[\s\S]*?\n([\s\S]*?)(?=\n## SECTION 3|$)/i);
  if (slidesMatch) sections.slides = slidesMatch[1].trim();
  
  const analysisMatch = content.match(/## SECTION 3[:\s]*Supporting Analysis[\s\S]*?\n([\s\S]*?)$/i);
  if (analysisMatch) sections.analysis = analysisMatch[1].trim();
  
  return sections;
}

// Fill BVA template with actual content
function fillBvaTemplate(template: string, bvaContent: string, title: string): string {
  const companyName = extractCompanyName(title, bvaContent);
  const sections = parseBvaContent(bvaContent);
  const slideContent = sections.slides || bvaContent;
  
  // Extract specific data from slides section
  let filled = template;
  
  // Replace company name globally
  filled = filled.replace(/\{\{CompanyName\}\}/g, companyName);
  
  // Extract and fill other placeholders from the BVA content
  // For now, use the full slide content as-is and let Gamma's AI parse it
  // This preserves all the detailed analysis from the BVA agent
  
  return filled;
}

export const gammaSlidesTool = createTool({
  id: 'gamma-slides-generator',
  description: 'Generate a slide presentation using Gamma API based on the BVA analysis content with a premade template',
  inputSchema: z.object({
    title: z.string().describe('Title of the presentation'),
    content: z.string().describe('The slide content formatted for Gamma API - should include all slide information from the BVA analysis'),
    theme: z.string().optional().describe('Theme for the presentation (optional)'),
    format: z.enum(['presentation', 'document']).default('presentation').describe('Format type for Gamma generation'),
    templateId: z.string().optional().describe('Template ID or remix URL to use as base (e.g., dy5yxj8yp3pf51t)')
  }),
  execute: async ({ context }) => {
    const { title, content, theme = 'modern', format, templateId } = context;
    
    const API_KEY = process.env.GAMMA_API_KEY;
    // Official Gamma API endpoints based on documentation
    const CREATE_ENDPOINT = 'https://public-api.gamma.app/v0.2/generations';
    const GET_ENDPOINT = 'https://public-api.gamma.app/v0.2/generations';
    
    // Default template ID (from https://gamma.app/remix/dy5yxj8yp3pf51t)
    const DEFAULT_TEMPLATE_ID = 'dy5yxj8yp3pf51t';
    const useTemplateId = templateId || DEFAULT_TEMPLATE_ID;
    
    // Visual-first template for first five slides (placeholders + layout guidance)
    const BVA_TEMPLATE = `GLOBAL VISUAL GUIDANCE
- Theme: Use the selected Gamma theme for all colors, fonts, and styles.
- Ample white space; side margins ~64px; rounded radius 16px; subtle shadows.
- Images: Only use explicitly provided URLs. Otherwise, use no images.
- Fill ALL copy from the provided company analysis variables; if a field is empty, keep the visual but leave text blank.

SLIDE 1 — COVER (full background image with text on left)
- Background: Use this COMPLETE background image spanning the entire slide:
  use this image url -> https://i.ibb.co/Q7htcJKV/Whats-App-Image-2025-10-07-at-8-15-49-PM.jpg, donot use any other image url
- Layout: Text content on LEFT side of slide with transparent background so that we can see the image behind it.
- Left side text (60% width), vertically centered:
  • Logo placeholder (120x32) top-left.
  • Title H1: "Unlocking the Value of AI for {{CompanyName}}".
  • Subtitle H4: "Business Value Analysis".
- Footer-right: small wordmark placeholder.

SLIDE 2 — THE AI VALUE PROPOSITION (impact banner + center spine timeline)
- Title H2 left: "The AI Value Proposition".
- Impact banner (rounded, full width minus 64px margins):
  • Height ~150–170px; use theme accent background; radius 16px; inner padding 20–24px; subtle shadow allowed.
  • Text block inside banner:
    – Line 1 (bold): "{{RevenueLiftRange}} revenue; +{{EBITDAImpact}} bps EBITDA"
    – Line 2 (normal): short value summary; include an italic parenthetical if present (e.g., "(AI planning can cut inventory 20–30%; forecasting errors −20–50%).").
    – Line 3 (small): "Sources: {{SourcesList}}".
- Section H3 left with generous top spacing: "Five Key Transformations".
- Center spine timeline exactly through the middle:
  • A thin vertical line spanning the list height.
  • Five circular number badges placed on the spine at equal vertical spacing.
    – Alternate badge colors using theme accent colors
  • For each badge, draw a short horizontal connector (16–24px) to the text block.
  • Alternate left/right text blocks aligned to the spine:
    1) LEFT — Title (bold): {{Transformation1Title}}; Subtext (muted): {{Transformation1Desc}}
    2) RIGHT — Title (bold): {{Transformation2Title}}; Subtext (muted): {{Transformation2Desc}}
    3) LEFT — Title (bold): {{Transformation3Title}}; Subtext (muted): {{Transformation3Desc}}
    4) RIGHT — Title (bold): {{Transformation4Title}}; Subtext (muted): {{Transformation4Desc}}
    5) LEFT — Title (bold): {{Transformation5Title}}; Subtext (muted): {{Transformation5Desc}}
  • Keep ample whitespace; align baselines; ensure the spine remains centered regardless of text length.

SLIDE 3 — QUICK WINS (rounded tile grid, pixel‑aligned)
- Title H2 left: "Quick Wins: Immediate Impact Opportunities".
- Grid: two rows of equal‑height rounded tiles within a subtle shadow container.
  • Row 1: exactly 3 tiles
  • Row 2: exactly 2 tiles, horizontally centered under row 1
  • Tile gap: 24–28px; outer margins ~64px
- Tile styling (all tiles):
  • Corner radius 20px; soft shadow (y=8, blur=24, opacity~14%)
  • Internal padding 28–32px; auto height so all tiles in a row align to tallest
  • Index badge ("01".."05") at top‑left, small size, use theme accent on light overlay
  • Title (1–2 lines max) and supporting body (≤3 lines)
- Tile colors: alternate theme accent colors with appropriate contrast text
- Content mapping per tile:
  • 01 — {{QuickWin1Title}} / {{QuickWin1Desc}}
  • 02 — {{QuickWin2Title}} / {{QuickWin2Desc}}
  • 03 — {{QuickWin3Title}} / {{QuickWin3Desc}}
  • 04 — {{QuickWin4Title}} / {{QuickWin4Desc}}
  • 05 — {{QuickWin5Title}} / {{QuickWin5Desc}}

SLIDE 4 — CHALLENGES & AI SOLUTIONS (rounded zebra table, pixel‑aligned)
- Title H2 left: "Challenges & AI Solutions".
- Container: a single rounded card (radius 16px) with subtle shadow (y=6, blur=18, opacity~12%), full width minus 64px margins.
- Table inside the card:
  • Two columns only, no vertical gridlines:
    – Left header: "Challenge/Opportunity" (column width ~44%)
    – Right header: "AI Solution & Impact"
  • Header style: bold text in theme primary color; header row height ~64px; light bottom separator.
  • Body rows: 4–5 rows; zebra striping starting at first body row using theme subtle background.
  • Cell padding: 20–24px vertical, 28–32px horizontal.
  • Left column cell text: challenge in bold theme primary; keep one line if possible.
  • Right column cell text: sentence case, normal weight; allow inline italics for sources at end.
  • No borders around table cells except soft row separators; keep overall roundness of outer card.
  Rows to render:
   • {{Challenge1}} | {{SolutionImpact1}}
   • {{Challenge2}} | {{SolutionImpact2}}
   • {{Challenge3}} | {{SolutionImpact3}}
   • {{Challenge4}} | {{SolutionImpact4}}
   • {{Challenge5}} | {{SolutionImpact5}} (optional)

SLIDE 5 — "DID YOU KNOW?" EXTERNAL SIGNALS (four equal stat columns, centered)
- IMPORTANT: DO NOT ADD ANY IMAGES TO THIS SLIDE. TEXT AND NUMBERS ONLY.
- Title H2 centered: "Did You Know? External Signals".
- Group the four stat columns as a single centered row within the slide; equal column widths, equal gutters; no borders.
  For each column (1..4), render ALL three parts (metric, label, body) — do not omit:
   • Metric (largest, theme primary): "{{SignalNValue}}" (allow prefixes like +/− and units like %). If a value is missing, render "—" to preserve balance.
   • Label (bold): {{SignalNLabel}}
   • Body (muted, 2–3 lines) with italic source at the end: {{SignalNBody}}
- Typography/spacing:
  • Align metrics to a common baseline; labels and bodies centered under their metric.
  • Consistent top/bottom padding; side margins ~64px; generous vertical whitespace above/below the row.
  • Ensure each of the four columns renders its own metric (never reuse one metric across columns).
- CRITICAL: This slide must contain ONLY text, numbers, and basic shapes. Do not fetch, generate, or insert any images, photos, illustrations, or graphics.

SLIDE 6 — TOP 5 COMPETITOR / PEER AI INITIATIVES (rounded cards grid)
- IMPORTANT: DO NOT ADD ANY IMAGES TO THIS SLIDE. TEXT-ONLY CARDS.
- Title H2: "Top 5 Competitor / Peer AI Initiatives".
- Layout: rounded cards with alternating theme accent borders, soft shadow.
- Grid: 3 cards on first row, 2 cards on second row (centered), equal height; generous gap (24–32px).
- Card content (for each of 5):
  • Title (bold company/initiative): {{CompetitorN}}
  • Body (1–2 lines): {{ExampleN}}
  • Optional source/citation in italics at end if present.
- Keep padding roomy; ensure consistent card width and height.
- CRITICAL: Cards must contain ONLY text content. Do not fetch, generate, or insert any images, photos, icons, illustrations, or graphics inside or around the cards.

SLIDE 7 — AI FRAMEWORK LEADER (text-only vertical list with step icons)
- Title H2: "Top 5 AI Transformations for {{CompanyName}}" (or "AI Framework Leader" if no company).
- No images. Use simple circular step icons only.
- Layout: Single column, left-aligned; each item is a row with a leading step icon and text block to the right.
  • Row structure (for each of 5 items):
    – Left: round badge (24–28px) with minimal glyph or number (1..5) in theme accent
    – Right: text block containing:
        Title (bold): {{CoreTransformNTitle}}
        Subtext (muted): {{CoreTransformNDesc}}
- Spacing: 24–32px vertical gap between rows; align badge centers with title baselines; keep margins ~64px.
- Items to render in order:
  1) {{CoreTransform1Title}} — {{CoreTransform1Desc}}
  2) {{CoreTransform2Title}} — {{CoreTransform2Desc}}
  3) {{CoreTransform3Title}} — {{CoreTransform3Desc}}
  4) {{CoreTransform4Title}} — {{CoreTransform4Desc}}
  5) {{CoreTransform5Title}} — {{CoreTransform5Desc}}

SLIDE 8 — TOP 10 SHORT-TERM AI OPPORTUNITIES (ring graphic + two columns)
- Title H2 centered: "Top 10 Short-Term AI Opportunities (with Quantified Impact)".
- Centerpiece visual: circular ring graphic (no external images)
  • Hollow circle, stroke 8–12px, using alternating theme accent colors
  • 12 evenly-spaced small round icon placeholders around ring; use simple glyph placeholders only
  • Ring width ~38–42% of slide; centered vertically/horizontally in middle column
  • CRITICAL: Only show the circular ring with icons embedded in it. Do not add any separate icon list, legend, or labels below the ring graphic.
- Two text columns flanking the ring:
  Left column header H3: "High-Impact Quick Wins"
    • {{Opportunity1}} — {{Opportunity1Impact}}
    • {{Opportunity2}} — {{Opportunity2Impact}}
    • {{Opportunity3}} — {{Opportunity3Impact}}
    • {{Opportunity4}} — {{Opportunity4Impact}}
    • {{Opportunity5}} — {{Opportunity5Impact}}
  Right column header H3: "Digital & Operational Enhancements"
    • {{Opportunity6}} — {{Opportunity6Impact}}
    • {{Opportunity7}} — {{Opportunity7Impact}}
    • {{Opportunity8}} — {{Opportunity8Impact}}
    • {{Opportunity9}} — {{Opportunity9Impact}}
    • {{Opportunity10}} — {{Opportunity10Impact}}
- Styling & spacing
  • Keep margins ~64px; gap from ring edge to each text column 56–72px
  • Bold the quantified impact only; use theme text colors with emphasis on metrics
  • Subtle shadow allowed on ring (blur ~12, opacity ~12%); no images fetched
  • If any placeholder missing, keep the slot blank but preserve layout
  • Dont use any images in this slide, just use whats there in the theme.

SLIDE 9 — WHY PARTNER WITH RETAILABS (text-left 60%, image-right 40%)
- Layout: LEFT 60% text (bullets), RIGHT 40% image.
- Left (60%):
  • Title H2: “Why Retailabs”.
  • Four bullets with compact supporting lines:
    – Deep retail expertise — {{Why1}}
    – AI-native platform — {{Why2}}
    – Modular, low-disruption integration — {{Why3}}
    – Human-in-control philosophy — {{Why4}}
- Right (40%):
  • Place this image scaled to fill the right column height and it should cover the entire right container no space or padding:
    use this image url -> https://i.ibb.co/0RMQZss1/Whats-App-Image-2025-10-07-at-10-14-58-AM.jpg, donot use any other image url
- Small wordmark bottom-right.

SLIDE 10 — IMMEDIATE NEXT STEPS (image-left 40%, timeline-right 60%, NO title)
- Layout: LEFT 40% full-bleed image container | RIGHT 60% content area. NO slide title.
- Left (40% container, edge-to-edge):
  • Full-height image covering entire left area with NO padding, NO margins, NO rounded corners (flush to edges):
    use this image url -> https://i.ibb.co/JR3X8Yq3/Whats-App-Image-2025-10-07-at-10-15-19-AM.jpg, donot use any other image url
- Right (60% content area):
  • Title H2 at top: "Immediate Next Steps"
  • Vertical timeline with three numbered circular badges (1, 2, 3) connected by a thin vertical line:
    – Badge 1 (purple): "Pick 2 categories × 2–3 retailers"
      Body text below: "share 6–12 months POS + ONIX."
    – Badge 2 (blue): "Mirror current Power BI model"
      Body text below: "publish Forecast / Actions / Reasons datasets."
    – Badge 3 (purple): "Run 30-day shadow → 60-day controlled decisions → 90-day read-out"
      Body text below: "Retail experience → intelligent action."
  • Bottom closing text (H3, larger): "Let's start a 90-day pilot and prove it in your Power BI"
- Styling notes:
  • Badges alternate colors (odd purple, even blue) using theme accent
  • Timeline line is thin, muted color
  • Keep generous whitespace; left-align all text in right column
  • NO rounding on the image container; image bleeds to left edge of slide

VARIABLES TO FILL FROM ANALYSIS
- {{CompanyName}}, {{CompanyDescription}}, {{Region}}, {{IndustryFocus}}
- {{RevenueLiftRange}}, {{EBITDAImpact}}, {{SourcesList}}
- {{Transformation1Title}}..{{Transformation5Title}}, {{Transformation1Desc}}..{{Transformation5Desc}}
- {{QuickWin1Title}}..{{QuickWin5Title}}, {{QuickWin1Desc}}..{{QuickWin5Desc}}
- {{Challenge1}}..{{Challenge5}}, {{SolutionImpact1}}..{{SolutionImpact5}}
- {{Signal1Value}}..{{Signal4Value}}, {{Signal1Label}}..{{Signal4Label}}, {{Signal1Body}}..{{Signal4Body}}`;
    
    // Parse and map BVA content to template placeholders
    const filledTemplate = fillBvaTemplate(BVA_TEMPLATE, content, title);
    
    if (!API_KEY) {
      return {
        success: false,
        error: 'GAMMA_API_KEY environment variable is not set',
        message: 'Failed to generate presentation slides: API key not configured'
      };
    }
    
    try {
      // Step 1: Create generation using official Gamma API v0.2
      // Note: Gamma API v0.2 does not support baseDocumentId parameter
      // We'll use themeName instead for styling
      const createPayload = {
        inputText: filledTemplate,
        format: format,
        themeName: "Retailabs Theme", // Professional business theme
        numCards: 10,
        cardSplit: "auto",
        textOptions: {
          amount: "brief",
          tone: "professional, business",
          audience: "business executives, leadership team",
          language: "en"
        },
        imageOptions: {
          // Allow Gamma to fetch the explicit image URL we specify in Slide 1
          source: "webAllImages"
        },
        cardOptions: {
          dimensions: "fluid"
        },
        sharingOptions: {
          workspaceAccess: "view",
          externalAccess: "view"
        }
      };

      console.log(`Step 1: Creating generation at ${CREATE_ENDPOINT} using BVA Template`);
      console.log(`Note: Using structured BVA template with company: ${extractCompanyName(title, content)}`);
      console.log(`Template preserves branding and structure while incorporating BVA analysis`);
      console.log(`Payload:`, JSON.stringify(createPayload, null, 2));
      
      const createResponse = await fetch(CREATE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'Accept': 'application/json'
        },
        body: JSON.stringify(createPayload)
      });

      const createResponseText = await createResponse.text();
      console.log(`Create response status: ${createResponse.status}`);
      console.log(`Create response body: ${createResponseText}`);

      if (!createResponse.ok) {
        throw new Error(`Gamma API create error (${createResponse.status}): ${createResponseText}`);
      }

      let createResult;
      try {
        createResult = JSON.parse(createResponseText);
      } catch {
        throw new Error(`Invalid JSON response from create: ${createResponseText}`);
      }
      
      const generationId = createResult.generationId;
      if (!generationId) {
        throw new Error(`No generationId in response: ${JSON.stringify(createResult)}`);
      }

      console.log(`Step 2: Generation created with ID: ${generationId}`);
      
      // Step 2: Poll for completion
      let attempts = 0;
      const pollDelayMs = Number(process.env.GAMMA_POLL_DELAY_MS || 2000); // default 2s
      const maxAttempts = Number(process.env.GAMMA_POLL_MAX_ATTEMPTS || 90); // default ~3 minutes
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollDelayMs));
        attempts++;
        
        console.log(`Step 3: Checking status (attempt ${attempts}/${maxAttempts})`);
        
        const statusResponse = await fetch(`${GET_ENDPOINT}/${generationId}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': API_KEY,
            'Accept': 'application/json'
          }
        });

        const statusResponseText = await statusResponse.text();
        console.log(`Status response: ${statusResponseText}`);

        if (!statusResponse.ok) {
          throw new Error(`Status check error (${statusResponse.status}): ${statusResponseText}`);
        }

        let statusResult;
        try {
          statusResult = JSON.parse(statusResponseText);
        } catch {
          throw new Error(`Invalid JSON from status check: ${statusResponseText}`);
        }

        if (statusResult.status === 'completed') {
          const gammaUrl = statusResult.gammaUrl;
          if (gammaUrl) {
            return {
              success: true,
              presentationUrl: gammaUrl,
              message: `Successfully created BVA presentation using structured template: ${title}`,
              generationId: generationId,
              theme: "Retailabs Theme",
              imageSource: "webAllImages",
              gammaResponse: statusResult
            };
          } else {
            throw new Error(`Generation completed but no gammaUrl: ${JSON.stringify(statusResult)}`);
          }
        } else if (statusResult.status === 'failed') {
          throw new Error(`Generation failed: ${JSON.stringify(statusResult)}`);
        } else {
          console.log(`Status: ${statusResult.status}, continuing to poll...`);
        }
      }
      
      throw new Error(`Generation timed out after ${maxAttempts} attempts (~${Math.round((maxAttempts * pollDelayMs) / 1000)} seconds)`);
      
      
    } catch (error) {
      console.error('Error generating Gamma slides:', error);
      
      // Provide fallback solution with manual creation instructions
      const manualGammaUrl = `https://gamma.app/`;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to generate presentation slides via API',
        fallbackSolution: {
          manualCreationUrl: 'https://gamma.app',
          quickStart: manualGammaUrl,
          instructions: [
            '1. Visit https://gamma.app',
            '2. Click "Create" or "New Presentation"',
            '3. Choose "Use AI" and paste the BVA template content',
            `4. Company: "${extractCompanyName(title, content)}"`,
            '5. Use "BVA Template Backup V2" theme if available',
            '6. Ensure background images are preserved',
            '7. Generate and share the presentation'
          ],
          templateContent: filledTemplate
        }
      };
    }
  },
});
