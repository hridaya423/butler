/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const providerToken = session?.provider_token;

    if (!providerToken) {
      return NextResponse.json(
        { error: 'No Google token found. Please reconnect your Google account.' },
        { status: 400 }
      );
    }

    const profileResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      }
    );

    if (!profileResponse.ok) {
      console.error('Gmail profile fetch failed:', await profileResponse.text());
      return NextResponse.json(
        { error: 'Failed to fetch Gmail profile. Please reconnect Google.' },
        { status: 400 }
      );
    }

    const profile = await profileResponse.json();

    await supabase.from('gmail_profiles').upsert({
      user_id: user.id,
      email_address: profile.emailAddress,
      history_id: profile.historyId,
      last_synced_at: new Date().toISOString(),
    });

    const messagesResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=in:inbox OR in:sent',
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      }
    );

    if (!messagesResponse.ok) {
      console.error('Gmail messages fetch failed:', await messagesResponse.text());
      return NextResponse.json(
        { error: 'Failed to fetch Gmail messages' },
        { status: 500 }
      );
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];

    let processed = 0;
    let errors = 0;

    for (const msg of messages.slice(0, 50)) {
      try {
        const messageDetailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${providerToken}`,
            },
          }
        );

        if (!messageDetailResponse.ok) {
          errors++;
          continue;
        }

        const messageDetail = await messageDetailResponse.json();

        const headers = messageDetail.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        const subject = getHeader('Subject');
        const from = getHeader('From');
        const to = getHeader('To');
        const cc = getHeader('Cc');
        const date = getHeader('Date');

        const fromMatch = from.match(/<(.+?)>/) || from.match(/([^\s]+@[^\s]+)/);
        const fromEmail = fromMatch ? fromMatch[1] : from;
        const fromName = from.replace(/<.+?>/, '').trim() || fromEmail;

        const toEmails = to
          ? to
              .split(',')
              .map((e: string) => {
                const match = e.match(/<(.+?)>/) || e.match(/([^\s]+@[^\s]+)/);
                return match ? match[1] : e.trim();
              })
              .filter(Boolean)
          : [];

        const ccEmails = cc
          ? cc
              .split(',')
              .map((e: string) => {
                const match = e.match(/<(.+?)>/) || e.match(/([^\s]+@[^\s]+)/);
                return match ? match[1] : e.trim();
              })
              .filter(Boolean)
          : [];

        let bodyText = '';
        let bodyHtml = '';

        const extractBody = (payload: any) => {
          if (payload.mimeType === 'text/plain' && payload.body?.data) {
            bodyText = Buffer.from(payload.body.data, 'base64').toString('utf-8');
          } else if (payload.mimeType === 'text/html' && payload.body?.data) {
            bodyHtml = Buffer.from(payload.body.data, 'base64').toString('utf-8');
          } else if (payload.parts) {
            payload.parts.forEach((part: any) => extractBody(part));
          }
        };

        if (messageDetail.payload) {
          extractBody(messageDetail.payload);
        }

        const labels = messageDetail.labelIds || [];
        const isRead = !labels.includes('UNREAD');
        const isStarred = labels.includes('STARRED');
        const isImportant = labels.includes('IMPORTANT');

        const hasAttachments = messageDetail.payload?.parts?.some(
          (part: any) => part.filename && part.body?.attachmentId
        );

        const sentAt = date ? new Date(date).toISOString() : new Date().toISOString();

        const { data: insertedMessage, error: insertError } = await supabase
          .from('gmail_messages')
          .upsert(
            {
              user_id: user.id,
              gmail_message_id: messageDetail.id,
              gmail_thread_id: messageDetail.threadId,
              subject: subject || '(No Subject)',
              snippet: messageDetail.snippet,
              from_name: fromName,
              from_email: fromEmail,
              to_emails: toEmails,
              cc_emails: ccEmails,
              body_text: bodyText.substring(0, 10000),
              body_html: bodyHtml.substring(0, 10000),
              labels,
              is_read: isRead,
              is_starred: isStarred,
              is_important: isImportant,
              has_attachments: hasAttachments || false,
              sent_at: sentAt,
              received_at: sentAt,
            },
            {
              onConflict: 'user_id,gmail_message_id',
            }
          )
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting message:', insertError);
          errors++;
          continue;
        }

        if (hasAttachments && insertedMessage) {
          const attachmentParts =
            messageDetail.payload?.parts?.filter(
              (part: any) => part.filename && part.body?.attachmentId
            ) || [];

          for (const part of attachmentParts) {
            await supabase.from('gmail_attachments').upsert(
              {
                message_id: insertedMessage.id,
                gmail_attachment_id: part.body.attachmentId,
                filename: part.filename,
                mime_type: part.mimeType || 'application/octet-stream',
                size_bytes: part.body.size || 0,
              },
              {
                onConflict: 'message_id,gmail_attachment_id',
              }
            );
          }
        }

        processed++;
      } catch (err) {
        console.error('Error processing message:', err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: messages.length,
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
