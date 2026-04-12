import Anthropic from '@anthropic-ai/sdk';
import type { ReflectionContext } from '@/types';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export function buildReflectionPrompt(context: ReflectionContext): string {
    return `
You are a personal discipline coach for ${context.userName}.
Today's data:
- Discipline score: ${context.todayScore}/10
- Tasks completed: ${context.tasksCompleted}/${context.tasksTotal}
- Self control score: ${context.selfControlScore}/3
- Finance: Cash ₹${context.financeLog.cashInHand}, Earned ₹${context.financeLog.earning}, Spent ₹${context.financeLog.expenditure}
- Current streak: ${context.currentStreak} days
- Last 7 days scores: ${context.last7DaysScores.join(', ')}
- User's own reflection: "${context.userReflection}"

Write a 2–3 sentence response that:
1. Acknowledges today's performance honestly (not overly positive if score is low)
2. Identifies one specific pattern from the last 7 days
3. Gives one concrete, actionable improvement for tomorrow

Be direct, brief, and coach-like. No fluff. No emojis.
`;
}

export async function generateReflection(
    context: ReflectionContext
): Promise<string> {
    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 256,
        messages: [
            {
                role: 'user',
                content: buildReflectionPrompt(context),
            },
        ],
    });

    const block = message.content[0];
    if (block.type === 'text') return block.text;
    return '';
}
