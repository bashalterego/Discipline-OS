import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendEmail(
    to: string,
    subject: string,
    html: string
): Promise<{ success: boolean; error?: string }> {
    // In development, Resend test mode only allows sending to the
    // account owner's email. Redirect all emails to RESEND_TEST_TO_EMAIL.
    const isDev = process.env.NODE_ENV !== 'production';
    const recipient = isDev
        ? (process.env.RESEND_TEST_TO_EMAIL || to)
        : to;

    const devNote = isDev && recipient !== to
        ? ` [DEV: redirected from ${to}]`
        : '';

    try {
        const { error } = await resend.emails.send({
            from: `DisciplineOS <${FROM_EMAIL}>`,
            to: recipient,
            subject: subject + devNote,
            html,
        });

        if (error) {
            console.error(`[email] Failed to send to ${recipient}:`, error);
            return { success: false, error: error.message };
        }

        console.log(`[email] Sent to ${recipient}${devNote}`);
        return { success: true };
    } catch (err: any) {
        console.error(`[email] Exception sending to ${recipient}:`, err);
        return { success: false, error: err.message };
    }
}
