import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { db, schema, eq } from '@/db/index';
import { DEV_BYPASS_ENABLED, MOCK_USER } from '@/lib/auth/dev-bypass';

const anthropic = new Anthropic();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  pageContext?: {
    path: string;
    orderData?: {
      status: string;
      totalPrice: number;
      amountPaid: number;
      balanceDue: number;
      scheduledDate: string | null;
      propertyAddress: string;
    };
  };
}

const SYSTEM_PROMPT = `You are the Results Roofing AI assistant, helping customers with their roofing projects. You are friendly, helpful, and knowledgeable about the roofing process.

## Your Role
- Answer customer questions about their quotes, payments, scheduling, and the roofing process
- Be concise and direct - customers want quick answers
- If you genuinely cannot help with something (like changing their appointment), offer to connect them with a human

## Key Business Information

### Payment Terms
- A deposit (typically 10% or $500 minimum) is required to confirm the installation date
- The remaining balance is due upon completion of the project
- We accept all major credit cards and offer financing through Wisetack
- Financing options: 12-month or 24-month plans available

### Scheduling
- Installation typically takes 1-2 days depending on roof size
- Crew arrives at the start of the selected time window (8 AM for morning, 12 PM for afternoon)
- Weather may affect scheduling - we'll notify customers of any changes

### Packages
- Essential: 25-year limited warranty, synthetic felt underlayment, standard cleanup
- Preferred (Most Popular): 30-year full warranty, enhanced features, better materials
- Signature: Lifetime transferable warranty, premium ice & water shield, full ridge vent system

### Contact
- Business hours: Mon-Fri 8am-6pm CST
- Emergency line available for active projects
- Response time: Usually within 2 minutes during business hours

## Guidelines
1. If the customer has order data in context, use it to give specific answers
2. Answer questions directly - don't deflect to "check your dashboard" if you can answer
3. For complex issues or complaints, offer to connect with a human team member
4. Never make promises about specific dates/times unless confirmed in the data
5. Be warm but professional - this is a significant home investment for customers
`;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, pageContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Get user email for fetching their data
    let userEmail: string | null = null;

    if (DEV_BYPASS_ENABLED) {
      userEmail = MOCK_USER.primaryEmailAddress.emailAddress;
    } else {
      const { userId } = await auth();
      if (userId) {
        // In production, we'd look up the user's email from Clerk
        // For now, we'll use what's passed in context or skip
      }
    }

    // Build context about the user's current situation
    let contextSection = '';

    if (pageContext) {
      contextSection += `\n## Current Context\n`;
      contextSection += `- Customer is on page: ${pageContext.path}\n`;

      if (pageContext.orderData) {
        const od = pageContext.orderData;
        contextSection += `\n### Customer's Order Details\n`;
        contextSection += `- Property: ${od.propertyAddress}\n`;
        contextSection += `- Status: ${od.status}\n`;
        contextSection += `- Total Project Cost: $${od.totalPrice.toLocaleString()}\n`;
        contextSection += `- Amount Paid: $${od.amountPaid.toLocaleString()}\n`;
        contextSection += `- Balance Due: $${od.balanceDue.toLocaleString()}\n`;
        contextSection += `- Scheduled Date: ${od.scheduledDate || 'To be scheduled'}\n`;
        contextSection += `- Payment Due: Upon completion of the project\n`;
      }
    }

    const fullSystemPrompt = SYSTEM_PROMPT + contextSection;

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: fullSystemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    const assistantMessage = textContent?.text || "I'm sorry, I couldn't process that. Would you like to speak with a team member?";

    return NextResponse.json({
      message: assistantMessage,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error('Support chat error:', error);

    // Fallback response if AI fails
    return NextResponse.json({
      message: "I'm having trouble connecting right now. Would you like me to have a team member reach out to you?",
      error: true,
    });
  }
}
