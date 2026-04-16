const APP_URL = 'https://discipline-os-woad.vercel.app';

function emailShell(userId: string, content: string): string {
    const unsubscribeUrl = `${APP_URL}/api/notifications/unsubscribe?token=${userId}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DisciplineOS</title>
</head>
<body style="margin:0;padding:0;background:#0E0E10;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0E10;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.12em;color:#C8B89A;">DISCIPLINE_OS</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid #2A2A2E;padding-bottom:32px;"></td>
          </tr>

          <!-- Body -->
          ${content}

          <!-- Divider -->
          <tr>
            <td style="border-top:1px solid #2A2A2E;padding-top:24px;padding-bottom:8px;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="color:#444448;font-size:12px;font-family:Arial,sans-serif;line-height:1.6;">
              You're receiving this because you use DisciplineOS.<br/>
              <a href="${unsubscribeUrl}" style="color:#444448;text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
    return `<tr><td style="padding-bottom:16px;">
      <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#FFFFFF;line-height:1.3;">${text}</h1>
    </td></tr>`;
}

function body(text: string): string {
    return `<tr><td style="padding-bottom:24px;">
      <p style="margin:0;color:#C8C6BF;font-family:Georgia,serif;font-size:16px;line-height:1.8;">${text}</p>
    </td></tr>`;
}

function cta(label: string, url: string): string {
    return `<tr><td style="padding-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#C8B89A;color:#0E0E10;font-family:Arial,sans-serif;font-weight:bold;font-size:14px;letter-spacing:0.08em;padding:14px 32px;border-radius:6px;text-decoration:none;">${label}</a>
    </td></tr>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Template 1 — Evening Reminder (9:00 PM IST)
// ────────────────────────────────────────────────────────────────────────────
export function eveningReminderTemplate(params: {
    userId: string;
    fullName: string;
    currentStreak: number;
}): string {
    const { userId, fullName, currentStreak } = params;
    const streakText = currentStreak > 0
        ? `Your current streak is <strong style="color:#C8B89A;">${currentStreak} day${currentStreak === 1 ? '' : 's'}</strong>.`
        : `This is a fresh start.`;

    const content = `
      ${heading("Don't end the day without closing it.")}
      ${body(`Hey ${fullName}, you haven't closed today's log yet. ${streakText} Don't let it end tonight. It takes less than 2 minutes.`)}
      ${cta("LOG MY DAY NOW", `${APP_URL}/dashboard`)}
    `;

    return emailShell(userId, content);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 2 — Urgent Reminder (10:30 PM IST)
// ────────────────────────────────────────────────────────────────────────────
export function urgentReminderTemplate(params: {
    userId: string;
    fullName: string;
    currentStreak: number;
}): string {
    const { userId, fullName, currentStreak } = params;

    const content = `
      ${heading("90 minutes left.")}
      ${body(`Hey ${fullName}, your <strong style="color:#C8B89A;">${currentStreak} day streak</strong> is at risk. You have until midnight IST to close today's log. Don't lose what you've built.`)}
      ${cta("SAVE MY STREAK", `${APP_URL}/dashboard`)}
    `;

    return emailShell(userId, content);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 3 — Day 2 Nudge (8:00 AM IST)
// ────────────────────────────────────────────────────────────────────────────
export function day2NudgeTemplate(params: {
    userId: string;
    fullName: string;
}): string {
    const { userId, fullName } = params;

    const content = `
      ${heading("Most people quit on Day 2.")}
      ${body(`Hey ${fullName}, you built your system yesterday. Today is where it gets real. Day 2 is the hardest &mdash; most people don't make it back. You're not most people. Your system is waiting.`)}
      ${cta("START DAY 2", `${APP_URL}/dashboard`)}
    `;

    return emailShell(userId, content);
}

// ────────────────────────────────────────────────────────────────────────────
// Template 4 — Weekly Summary (8:00 AM IST Monday)
// ────────────────────────────────────────────────────────────────────────────
export function weeklySummaryTemplate(params: {
    userId: string;
    fullName: string;
    avgScore: number;
    daysLogged: number;
    totalTasks: number;
    currentStreak: number;
    bestDay: string;
}): string {
    const { userId, fullName, avgScore, daysLogged, totalTasks, currentStreak, bestDay } = params;

    let motivationLine: string;
    if (avgScore >= 8.0) {
        motivationLine = "Exceptional week. This is what elite looks like. Keep this standard.";
    } else if (avgScore >= 6.0) {
        motivationLine = "Solid week. You showed up. One more push this week.";
    } else if (avgScore >= 4.0) {
        motivationLine = "Inconsistent week. You know what went wrong. Fix it today.";
    } else {
        motivationLine = "Rough week. Stop analyzing. Just show up tomorrow.";
    }

    const bestDayFormatted = bestDay
        ? new Date(bestDay).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
        : '–';

    const content = `
      ${heading("Last week, summarized.")}
      <tr><td style="padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2A2A2E;border-radius:8px;overflow:hidden;">
          <tr style="background:#1A1A1C;">
            <td style="padding:12px 16px;color:#C8B89A;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.1em;font-weight:bold;">METRIC</td>
            <td style="padding:12px 16px;color:#C8B89A;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.1em;font-weight:bold;text-align:right;">VALUE</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#C8C6BF;font-family:Georgia,serif;font-size:15px;border-top:1px solid #2A2A2E;">Avg Score</td>
            <td style="padding:12px 16px;color:#FFFFFF;font-family:Georgia,serif;font-size:15px;font-weight:bold;text-align:right;border-top:1px solid #2A2A2E;">${avgScore.toFixed(1)} / 10</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#C8C6BF;font-family:Georgia,serif;font-size:15px;border-top:1px solid #2A2A2E;">Days Logged</td>
            <td style="padding:12px 16px;color:#FFFFFF;font-family:Georgia,serif;font-size:15px;font-weight:bold;text-align:right;border-top:1px solid #2A2A2E;">${daysLogged} / 7</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#C8C6BF;font-family:Georgia,serif;font-size:15px;border-top:1px solid #2A2A2E;">Tasks Completed</td>
            <td style="padding:12px 16px;color:#FFFFFF;font-family:Georgia,serif;font-size:15px;font-weight:bold;text-align:right;border-top:1px solid #2A2A2E;">${totalTasks}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#C8C6BF;font-family:Georgia,serif;font-size:15px;border-top:1px solid #2A2A2E;">Current Streak</td>
            <td style="padding:12px 16px;color:#FFFFFF;font-family:Georgia,serif;font-size:15px;font-weight:bold;text-align:right;border-top:1px solid #2A2A2E;">${currentStreak} days</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#C8C6BF;font-family:Georgia,serif;font-size:15px;border-top:1px solid #2A2A2E;">Best Day</td>
            <td style="padding:12px 16px;color:#C8B89A;font-family:Georgia,serif;font-size:15px;font-weight:bold;text-align:right;border-top:1px solid #2A2A2E;">${bestDayFormatted}</td>
          </tr>
        </table>
      </td></tr>
      ${body(`Hey ${fullName}, ${motivationLine}`)}
      ${cta("START THIS WEEK", `${APP_URL}/dashboard`)}
    `;

    return emailShell(userId, content);
}
