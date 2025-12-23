# Story 4.2: Implement Google Sheets OAuth Integration

**Story ID:** 4.2
**Story Key:** 4-2-implement-google-sheets-oauth-integration
**Epic:** Epic 4 - Projection Data Management
**Status:** done

---

## Story

As a **user**,
I want to connect my Google account to import player projections from Google Sheets,
So that I can use my custom projection data.

---

## Acceptance Criteria

**Given** I am on the projection import page for a league
**When** I click "Import from Google Sheets"
**Then** I am redirected to Google OAuth consent screen
**And** I grant permission to access Google Sheets
**And** I am redirected back to the application with authorization
**And** the OAuth token is securely stored (server-side via Supabase Edge Function per NFR-S6)
**And** I can select a Google Sheet from my drive
**And** the integration follows standard Google authentication flow (NFR-I7)

---

## Developer Context

### Story Foundation from Epic

From **Epic 4: Projection Data Management** (docs/epics-stories.md lines 458-474):

This story implements the OAuth 2.0 flow for connecting to Google Sheets, enabling users to import custom projection data. It's the second story in Epic 4 and provides the authentication foundation for Story 4.3 (actual import functionality).

**Core Responsibilities:**

- **OAuth Flow:** Implement Google OAuth 2.0 consent and callback
- **Token Storage:** Securely store refresh tokens server-side
- **Sheet Selection:** Allow users to browse and select sheets from their drive
- **Security:** API keys and tokens never exposed client-side (NFR-S6)
- **Standards Compliance:** Follow OAuth 2.0 standard patterns (NFR-I7)

**Relationship to Epic 4:**

This is Story 2 of 8 in Epic 4. It depends on Story 4.1 (database table) and enables Story 4.3 (import from Google Sheets).

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

**API Integration Patterns:**
- OAuth tokens stored server-side via Supabase Edge Functions
- API keys never exposed to client-side JavaScript
- Use Supabase Edge Functions as API proxy

**Security Requirements (NFR-S6):**
- All API keys stored as environment variables
- Token refresh handled server-side
- No sensitive data in client bundles

### Technical Requirements

#### Google Cloud Console Setup

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Configure authorized redirect URIs:
   - Development: `http://localhost:5173/auth/google/callback`
   - Production: `https://your-domain.com/auth/google/callback`
3. Enable Google Sheets API and Google Drive API
4. Configure OAuth consent screen with required scopes:
   - `https://www.googleapis.com/auth/spreadsheets.readonly`
   - `https://www.googleapis.com/auth/drive.readonly`

#### Supabase Edge Function: google-oauth

**File: supabase/functions/google-oauth/index.ts**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI')!;

serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action === 'authorize') {
    // Generate OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
      access_type: 'offline',
      prompt: 'consent',
    })}`;
    return new Response(JSON.stringify({ authUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'callback') {
    const code = url.searchParams.get('code');
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code!,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenResponse.json();
    // Store tokens securely in database
    // Return success response
  }

  // ... list sheets, get sheet data actions
});
```

#### Database: google_oauth_tokens Table

```sql
CREATE TABLE google_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE google_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON google_oauth_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### React Component: GoogleSheetsConnect

```typescript
// src/features/projections/components/GoogleSheetsConnect.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/lib/supabase';

export function GoogleSheetsConnect({ onConnected }: { onConnected: () => void }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const supabase = useSupabase();

  const handleConnect = async () => {
    setIsConnecting(true);
    const { data } = await supabase.functions.invoke('google-oauth', {
      body: { action: 'authorize' },
    });
    window.location.href = data.authUrl;
  };

  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Google Sheets'}
    </Button>
  );
}
```

#### Sheet Selection Component

```typescript
// src/features/projections/components/SheetSelector.tsx

import { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Sheet {
  id: string;
  name: string;
}

export function SheetSelector({ onSelect }: { onSelect: (sheetId: string) => void }) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available sheets from Edge Function
    async function loadSheets() {
      const { data } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'list-sheets' },
      });
      setSheets(data.sheets);
      setLoading(false);
    }
    loadSheets();
  }, []);

  return (
    <Select onValueChange={onSelect} disabled={loading}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? 'Loading sheets...' : 'Select a sheet'} />
      </SelectTrigger>
      <SelectContent>
        {sheets.map((sheet) => (
          <SelectItem key={sheet.id} value={sheet.id}>
            {sheet.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Google Cloud Console Setup**
  - [x] Create new project or use existing
  - [x] Enable Google Sheets API
  - [x] Enable Google Drive API
  - [x] Create OAuth 2.0 credentials
  - [x] Configure OAuth consent screen
  - [x] Add authorized redirect URIs (dev and prod)
  - [x] Note client ID and client secret

- [x] **Task 2: Create google_oauth_tokens Table**
  - [x] Create migration file `supabase/migrations/005_google_oauth_tokens.sql`
  - [x] Define table schema with user_id, access_token, refresh_token, expires_at
  - [x] Add RLS policies for user-only access
  - [x] Deploy migration

- [x] **Task 3: Create Google OAuth Edge Function**
  - [x] Create `supabase/functions/google-oauth/index.ts`
  - [x] Implement `authorize` action - generate OAuth URL
  - [x] Implement `callback` action - exchange code for tokens
  - [x] Implement `refresh` action - refresh expired tokens
  - [x] Implement `list-sheets` action - get user's sheets
  - [x] Store tokens in google_oauth_tokens table
  - [x] Deploy Edge Function

- [x] **Task 4: Configure Environment Variables**
  - [x] Add GOOGLE_CLIENT_ID to Supabase secrets
  - [x] Add GOOGLE_CLIENT_SECRET to Supabase secrets
  - [x] Add GOOGLE_REDIRECT_URI to Supabase secrets
  - [x] Update .env.example with placeholder values

- [x] **Task 5: Create React Components**
  - [x] Create GoogleSheetsConnect component
  - [x] Create OAuth callback handler route
  - [x] Create SheetSelector component
  - [x] Create useGoogleSheetsAuth hook
  - [x] Style components with dark theme

- [x] **Task 6: Implement OAuth Callback Route**
  - [x] Add `/auth/google/callback` route in router.tsx
  - [x] Create callback page component
  - [x] Handle success redirect to projection import page
  - [x] Handle error display

- [x] **Task 7: Add Tests**
  - [x] Test OAuth flow initiation
  - [x] Test callback handling
  - [x] Test token storage
  - [x] Test sheet listing
  - [x] Test error scenarios

---

## Dev Notes

### OAuth Flow Sequence

1. User clicks "Connect Google Sheets"
2. Frontend calls Edge Function with `action=authorize`
3. Edge Function returns Google OAuth URL
4. User redirected to Google consent screen
5. User grants permissions
6. Google redirects to callback URL with auth code
7. Callback page calls Edge Function with `action=callback` and code
8. Edge Function exchanges code for tokens
9. Tokens stored in google_oauth_tokens table
10. User redirected to projection import page
11. SheetSelector fetches available sheets via Edge Function

### Security Considerations

- **Client Secret Never Exposed:** Only stored in Supabase Edge Function env
- **Token Storage:** Encrypted at rest in Supabase database
- **RLS Protection:** Users can only access their own tokens
- **Scope Minimization:** Only request readonly access to sheets and drive
- **Token Refresh:** Automatic refresh before expiration

### Error Handling

- **OAuth Denied:** Show user-friendly message, allow retry
- **Token Expired:** Automatic refresh, retry request
- **API Rate Limit:** Exponential backoff, show status
- **Network Error:** Show retry button

### References

- **Epic:** docs/epics-stories.md (lines 458-474)
- **Previous Story:** 4.1 (player_projections table)
- **Next Story:** 4.3 (import from Google Sheets)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google OAuth 2.0 for Web Server Apps](https://developers.google.com/identity/protocols/oauth2/web-server)

---

## Summary

Implement Google OAuth integration for importing custom projection data from Google Sheets. This story establishes the authentication foundation enabling users to securely connect their Google accounts and select sheets for import.

**Dependencies:** Story 4.1 (database table)

**Next Step:** Story 4.3 - Import Projections from Google Sheets
