export type AssignmentStatus = 'pending' | 'completed' | 'archived';
export type AssignmentPriority = 'low' | 'medium' | 'high';

export interface Assignment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  due_date: string | null;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  external_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}
