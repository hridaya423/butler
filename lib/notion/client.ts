/* eslint-disable @typescript-eslint/no-explicit-any */
const NOTION_BASE_URL = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

type NotionRequestOptions = {
  method: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
};

const resolveNotionApiKey = (apiKey?: string) => {
  const resolvedKey = apiKey || process.env.NOTION_API_KEY;

  if (!resolvedKey) {
    throw new Error('NOTION_API_KEY is not set');
  }

  return resolvedKey;
};

async function notionRequest<T>(apiKey: string, path: string, options: NotionRequestOptions): Promise<T> {
  const response = await fetch(`${NOTION_BASE_URL}${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as any)?.message || (data as any)?.error || response.statusText || 'Unknown Notion error';
    const error: any = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data as T;
}

export interface NotionTask {
  id: string;
  title: string;
  status: 'Not started' | 'In progress' | 'Completed';
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High';
  description?: string;
  tags?: string[];
}

export async function getNotionTasks(databaseId: string, apiKey?: string): Promise<NotionTask[]> {
  const key = resolveNotionApiKey(apiKey);

  const response = await notionRequest<Record<string, any>>(key, `/databases/${databaseId}/query`, {
    method: 'POST',
    body: {
      page_size: 100,
    },
  });

  const results = Array.isArray(response?.results) ? response.results : [];
  const tasks: NotionTask[] = [];

  for (const page of results) {
    if (!page || typeof page !== 'object' || !('properties' in page)) continue;

    const properties: Record<string, any> = (page as any).properties ?? {};

    const [, titleProperty] =
      Object.entries<any>(properties).find(([, prop]) => prop?.type === 'title') ?? [];

    let title = 'Untitled';
    if (titleProperty?.type === 'title' && Array.isArray(titleProperty.title) && titleProperty.title.length > 0) {
      title =
        titleProperty.title
          .map((segment: any) => segment?.plain_text || '')
          .join('')
          .trim() || title;
    }

    const [, statusProperty] =
      Object.entries<any>(properties).find(([, prop]) => prop?.type === 'status') ?? [];

    let status: 'Not started' | 'In progress' | 'Completed' = 'Not started';
    if (statusProperty?.type === 'status') {
      const statusName = statusProperty.status?.name || 'Not started';
      if (statusName === 'In progress') status = 'In progress';
      if (statusName === 'Completed') status = 'Completed';
    }

    const [, dateProperty] =
      Object.entries<any>(properties).find(([, prop]) => prop?.type === 'date') ?? [];
    const dueDate = dateProperty?.date?.start || undefined;

    const [, priorityProperty] =
      Object.entries<any>(properties).find(([, prop]) => prop?.type === 'select') ?? [];
    let priority: 'Low' | 'Medium' | 'High' | undefined;
    if (priorityProperty?.type === 'select' && priorityProperty.select?.name) {
      const name = priorityProperty.select.name;
      if (['Low', 'Medium', 'High'].includes(name)) {
        priority = name as 'Low' | 'Medium' | 'High';
      }
    }

    const [, tagsProperty] =
      Object.entries<any>(properties).find(([, prop]) => prop?.type === 'multi_select') ?? [];
    const tags =
      tagsProperty?.type === 'multi_select'
        ? tagsProperty.multi_select.map((tag: any) => tag?.name).filter(Boolean)
        : [];

    const [, descriptionProperty] =
      Object.entries<any>(properties).find(([, prop]) => prop?.type === 'rich_text') ?? [];
    const description =
      descriptionProperty?.type === 'rich_text'
        ? descriptionProperty.rich_text.map((t: any) => t?.plain_text || '').join('').trim() || undefined
        : undefined;

    tasks.push({
      id: (page as any).id,
      title,
      status,
      dueDate,
      priority,
      description,
      tags,
    });
  }

  return tasks;
}

export async function updateNotionTask(
  pageId: string,
  updates: {
    status?: 'Not started' | 'In progress' | 'Completed';
    dueDate?: string;
    priority?: 'Low' | 'Medium' | 'High';
  },
  apiKey?: string,
) {
  const key = resolveNotionApiKey(apiKey);

  const properties: Record<string, any> = {};

  if (updates.status) {
    properties.Status = {
      status: {
        name: updates.status,
      },
    };
  }

  if (updates.dueDate) {
    properties['Due Date'] = {
      date: {
        start: updates.dueDate,
      },
    };
  }

  if (updates.priority) {
    properties.Priority = {
      select: {
        name: updates.priority,
      },
    };
  }

  if (Object.keys(properties).length === 0) {
    return;
  }

  await notionRequest(key, `/pages/${pageId}`, {
    method: 'PATCH',
    body: {
      properties,
    },
  });
}
