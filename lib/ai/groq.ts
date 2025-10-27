import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type AssignmentInput = {
  title: string;
  subject?: string;
  due_date?: string;
  priority: string;
  description?: string;
};

type NormalizedAssignment = {
  title: string;
  subject: string | null;
  dueDate: Date | null;
  dueDateIso: string | null;
  priority: "low" | "medium" | "high";
  description: string;
};
  
export interface AssignmentInsights {
  summary: string;
  immediateActions: Array<{
    title: string;
    dueDate: string | null;
    subject: string | null;
    priority: "low" | "medium" | "high";
    reason: string;
  }>;
  suggestedSchedule: Array<{
    day: string;
    focus: string;
    notes?: string;
  }>;
  conflicts: string[];
  studyTips: Array<{
    subject: string;
    tips: string[];
  }>;
  timeEstimates: Array<{
    title: string;
    minutes: number;
    note?: string;
  }>;
}

const SUBJECT_TIPS: Record<string, string[]> = {
  mathematics: [
    "Break problems into smaller steps and show each working line.",
    "Review example questions before attempting homework.",
    "Use quick practice sheets or Sparx tasks to reinforce weaker skills.",
  ],
  english: [
    "Outline key arguments before writing longer responses.",
    "Collect quotes or evidence in a quick reference list.",
    "Read work aloud to catch grammar or clarity issues.",
  ],
  science: [
    "Summarise each topic in a short mind map before revising.",
    "Highlight formulas or definitions that appear in the assignment.",
    "Use practice questions to test your understanding after revising notes.",
  ],
  french: [
    "Revise vocabulary in short bursts and group related words together.",
    "Practice pronunciation using online audio resources or school recordings.",
    "Write a few sample sentences using the new grammar you need.",
  ],
  geography: [
    "Review case studies and keep key statistics at the top of your notes.",
    "Draw quick diagrams or sketch maps to explain concepts.",
    "Check past lessons for teacher hints on what to emphasise.",
  ],
};

const FALLBACK_TIPS = [
  "Skim lesson notes before you start so everything feels familiar.",
  "Work in focused 25-minute blocks with a short break between them.",
  "Note any questions for your teacher so they can help early.",
];

const MINUTES_BY_PRIORITY: Record<"low" | "medium" | "high", number> = {
  low: 35,
  medium: 55,
  high: 85,
};

const formatDate = (date: Date | null) => {
  if (!date) return "No due date";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const daysBetween = (from: Date, to: Date) =>
  Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

const normaliseAssignments = (assignments: AssignmentInput[]): NormalizedAssignment[] => {
  return assignments.map((assignment) => {
    const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
    const dueDateValid = dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null;
    const priority = (assignment.priority || "medium").toLowerCase() as
      | "low"
      | "medium"
      | "high";

    return {
      title: assignment.title,
      subject: assignment.subject?.trim() || null,
      dueDate: dueDateValid,
      dueDateIso: dueDateValid ? dueDateValid.toISOString() : null,
      priority: ["low", "medium", "high"].includes(priority) ? priority : "medium",
      description: assignment.description?.trim() || "",
    };
  });
};

const buildFallbackInsights = (assignments: AssignmentInput[]): AssignmentInsights => {
  const normalised = normaliseAssignments(assignments);
  const now = new Date();

  const immediate = normalised
    .filter((assignment) => {
      if (assignment.priority === "high") return true;
      if (!assignment.dueDate) return false;
      return daysBetween(now, assignment.dueDate) <= 3;
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return MINUTES_BY_PRIORITY[b.priority] - MINUTES_BY_PRIORITY[a.priority];
      }
      const aTime = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })
    .slice(0, 4)
    .map((assignment) => {
      const reason =
        assignment.dueDate
          ? `Due in ${Math.max(0, daysBetween(now, assignment.dueDate))} day(s)`
          : "Marked as high priority";

      return {
        title: assignment.title,
        dueDate: assignment.dueDateIso,
        subject: assignment.subject,
        priority: assignment.priority,
        reason,
      };
    });

  const schedule: AssignmentInsights["suggestedSchedule"] = [];
  const sortedByDue = [...normalised].sort((a, b) => {
    const aTime = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    const bTime = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });

  sortedByDue.slice(0, 5).forEach((assignment, index) => {
    const label =
      index === 0
        ? "Today"
        : assignment.dueDate
          ? formatDate(assignment.dueDate)
          : "When you have a spare slot";

    const notes = assignment.subject
      ? `Focus on the key points for ${assignment.subject}.`
      : undefined;

    schedule.push({
      day: label,
      focus: assignment.title,
      notes,
    });
  });

  if (schedule.length === 0) {
    schedule.push(
      {
        day: "Today",
        focus: "Use this free time to review past material or get ahead.",
      },
      {
        day: "Tomorrow",
        focus: "Plan your next study session or revise notes.",
      },
    );
  }

  const conflicts = Object.values(
    normalised.reduce<Record<string, NormalizedAssignment[]>>((acc, assignment) => {
      if (!assignment.dueDateIso) return acc;
      const key = assignment.dueDateIso.slice(0, 10);
      acc[key] = acc[key] ?? [];
      acc[key].push(assignment);
      return acc;
    }, {}),
  )
    .filter((items) => items.length > 1)
    .map((items) => {
      const date = items[0].dueDate ? formatDate(items[0].dueDate) : "Same deadline";
      return `${date}: ${items.map((item) => item.title).join(", ")}`;
    });

  const tipsMap = new Map<string, Set<string>>();
  normalised.forEach((assignment) => {
    const subjectKey = assignment.subject?.toLowerCase();
    const subjectTips =
      (subjectKey && SUBJECT_TIPS[subjectKey as keyof typeof SUBJECT_TIPS]) ??
      SUBJECT_TIPS["english"] ??
      null;

    const tipList = Array.isArray(subjectTips) ? subjectTips : FALLBACK_TIPS;
    const bucketKey = assignment.subject ?? "General";

    if (!tipsMap.has(bucketKey)) {
      tipsMap.set(bucketKey, new Set<string>());
    }

    tipList.forEach((tip) => tipsMap.get(bucketKey)!.add(tip));
  });

  if (tipsMap.size === 0) {
    tipsMap.set("General", new Set(FALLBACK_TIPS));
  }

  const studyTips = Array.from(tipsMap.entries()).map(([subject, tips]) => ({
    subject,
    tips: Array.from(tips).slice(0, 3),
  }));

  const timeEstimates = normalised.slice(0, 6).map((assignment) => {
    let minutes = MINUTES_BY_PRIORITY[assignment.priority];

    if (/essay|booklet|project/i.test(assignment.title + assignment.description)) {
      minutes += 20;
    } else if (/revision|quiz|worksheet/i.test(assignment.title + assignment.description)) {
      minutes -= 10;
    }

    minutes = Math.max(25, Math.min(120, Math.round(minutes / 5) * 5));

    return {
      title: assignment.title,
      minutes,
      note:
        assignment.dueDate && daysBetween(now, assignment.dueDate) <= 1
          ? "Plan time tonight so you can submit without last-minute stress."
          : undefined,
    };
  });

  const total = normalised.length;
  const dueSoon = immediate.length;
  const summary =
    total === 0
      ? "No pending work right now—use the free space to review or explore something new."
      : `You have ${total} assignment${total === 1 ? "" : "s"} waiting. Focus first on ${
          dueSoon > 0 ? immediate[0].title : sortedByDue[0]?.title ?? "your next priority task"
        } and spread the rest across the week.`;

  return {
    summary,
    immediateActions: immediate,
    suggestedSchedule: schedule,
    conflicts,
    studyTips,
    timeEstimates,
  };
};

const sanitizeJsonString = (raw: string) =>
  raw
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

const mergeInsights = (
  parsed: Partial<AssignmentInsights>,
  fallback: AssignmentInsights,
): AssignmentInsights => {
  const clean = <T,>(value: T | undefined, fallbackValue: T): T =>
    value !== undefined && value !== null ? value : fallbackValue;

  const immediate =
    Array.isArray(parsed.immediateActions) && parsed.immediateActions.length > 0
      ? parsed.immediateActions.map((item) => {
          const title =
            typeof item.title === "string" && item.title.trim().length > 0
              ? item.title.trim()
              : "Priority task";

          return {
            title,
            dueDate:
              typeof item.dueDate === "string" && item.dueDate.length > 0
                ? item.dueDate
                : null,
            subject: typeof item.subject === "string" ? item.subject : null,
            priority:
              item.priority === "high" || item.priority === "medium" || item.priority === "low"
                ? item.priority
                : "medium",
            reason:
              typeof item.reason === "string" && item.reason.trim().length > 0
                ? item.reason.trim()
                : "Important to tackle this early.",
          };
        })
      : fallback.immediateActions;

  const schedule =
    Array.isArray(parsed.suggestedSchedule) && parsed.suggestedSchedule.length > 0
      ? parsed.suggestedSchedule
          .map((entry) => ({
            day: typeof entry.day === "string" ? entry.day : undefined,
            focus: typeof entry.focus === "string" ? entry.focus : undefined,
            notes: typeof entry.notes === "string" ? entry.notes : undefined,
          }))
          .filter((entry) => entry.day && entry.focus)
          .map((entry) => ({
            day: entry.day!,
            focus: entry.focus!,
            notes: entry.notes,
          }))
      : fallback.suggestedSchedule;

  const conflicts =
    Array.isArray(parsed.conflicts) && parsed.conflicts.length > 0
      ? parsed.conflicts.filter((item): item is string => typeof item === "string" && item.length > 0)
      : fallback.conflicts;

  const studyTips =
    Array.isArray(parsed.studyTips) && parsed.studyTips.length > 0
      ? parsed.studyTips
          .map((entry) => ({
            subject: typeof entry.subject === "string" ? entry.subject : undefined,
            tips: Array.isArray(entry.tips)
              ? entry.tips.filter((tip): tip is string => typeof tip === "string" && tip.length > 0)
              : [],
          }))
          .filter((entry) => entry.subject && entry.tips.length > 0)
          .map((entry) => ({
            subject: entry.subject!,
            tips: entry.tips.slice(0, 3),
          }))
      : fallback.studyTips;

  const timeEstimates =
    Array.isArray(parsed.timeEstimates) && parsed.timeEstimates.length > 0
      ? parsed.timeEstimates
          .map((entry) => ({
            title: typeof entry.title === "string" ? entry.title : undefined,
            minutes:
              typeof entry.minutes === "number" && Number.isFinite(entry.minutes)
                ? Math.round(entry.minutes)
                : undefined,
            note: typeof entry.note === "string" ? entry.note : undefined,
          }))
          .filter((entry) => entry.title && entry.minutes)
          .map((entry) => ({
            title: entry.title!,
            minutes: Math.max(20, Math.min(180, entry.minutes!)),
            note: entry.note,
          }))
      : fallback.timeEstimates;

  return {
    summary: clean(parsed.summary && parsed.summary.trim(), fallback.summary),
    immediateActions: immediate,
    suggestedSchedule: schedule,
    conflicts,
    studyTips,
    timeEstimates,
  };
};

export async function generateAssignmentInsights(
  assignments: AssignmentInput[],
): Promise<AssignmentInsights> {
  const fallback = buildFallbackInsights(assignments);

  if (!process.env.GROQ_API_KEY || assignments.length === 0) {
    return fallback;
  }

  const prompt = `You are an academic planning assistant. Return a single JSON object with this exact shape:
{
  "summary": string,
  "immediateActions": [{ "title": string, "dueDate": string | null, "subject": string | null, "priority": "low" | "medium" | "high", "reason": string }],
  "suggestedSchedule": [{ "day": string, "focus": string, "notes": string | null }],
  "conflicts": string[],
  "studyTips": [{ "subject": string, "tips": string[] }],
  "timeEstimates": [{ "title": string, "minutes": number, "note": string | null }]
}

Guidelines:
- Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) if a due date is provided, otherwise null.
- Keep array lengths to a maximum of 4 items by prioritising the most relevant information.
- The summary should be energetic and encouraging in one sentence.
- Immediate actions should highlight why each task matters ("reason").
- suggestedSchedule should balance tasks across different days (use "Today", "Tomorrow", or the due date).
- Conflicts should call out overlapping deadlines clearly.
- Study tips should group advice by subject; use "General" if unsure.
- Minutes must be positive integers representing realistic focused work blocks.

Assignments:
${assignments
  .map((assignment, index) => {
    const due = assignment.due_date ? new Date(assignment.due_date).toISOString() : "null";
    return `${index + 1}. Title: ${assignment.title}
   Subject: ${assignment.subject ?? "Unknown"}
   Due: ${due}
   Priority: ${assignment.priority}
   Notes: ${assignment.description ?? "None"}`;
  })
  .join("\n")}

Respond with JSON only.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You help students plan their workload with clear, actionable guidance.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 900,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return fallback;
    }

    const sanitised = sanitizeJsonString(content);
    const parsed = JSON.parse(sanitised) as Partial<AssignmentInsights>;
    return mergeInsights(parsed, fallback);
  } catch (error) {
    console.error("Groq AI error:", error);
    return fallback;
  }
}

export async function generatePriorityInsight(assignment: {
  title: string;
  subject?: string;
  due_date?: string;
  description?: string;
}): Promise<string> {
  const prompt = `Analyze this assignment and suggest appropriate priority level (low/medium/high):

Title: ${assignment.title}
Subject: ${assignment.subject || 'Unknown'}
Due: ${assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
Description: ${assignment.description || 'No description'}

Provide a one-sentence recommendation with reasoning.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI that helps students prioritize their work."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq AI error:", error);
    return "";
  }
}
