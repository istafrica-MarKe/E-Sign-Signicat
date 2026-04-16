// Node 22 native fetch — no external dependencies

const SIGN_BASE = 'https://api.signicat.com/sign';

// In-memory token cache
let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt) return tokenCache.token;

  const res = await fetch(process.env.SIGNICAT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'signicat-api',
      client_id: process.env.SIGNICAT_CLIENT_ID,
      client_secret: process.env.SIGNICAT_CLIENT_SECRET,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[Signicat] Token error:', data);
    throw Object.assign(new Error(`Token failed: ${data.error_description || data.error}`), { status: res.status, body: data });
  }

  tokenCache = { token: data.access_token, expiresAt: now + (data.expires_in - 60) * 1000 };
  return tokenCache.token;
}

// Step 1 — Upload PDF as binary stream
async function uploadDocument(pdfBuffer) {
  const token = await getAccessToken();

  const res = await fetch(`${SIGN_BASE}/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/pdf',
    },
    body: pdfBuffer,
  });

  const data = await parseResponse(res);
  return data;
}

// Step 2 — Create document collection
async function createDocumentCollection(documentId) {
  const token = await getAccessToken();

  const res = await fetch(`${SIGN_BASE}/document-collections`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      documents: [{ documentId }],
      packageTo: ['PADES_CONTAINER'],
    }),
  });

  const data = await parseResponse(res);
  return data;
}

// Step 3 — Create signing session
async function createSigningSession({ title, signerEmail, documentCollectionId, documentId, externalReference }) {
  const token = await getAccessToken();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const payload = [
    {
      title,
      externalReference: externalReference || `ref-${Date.now()}`,
      documents: [
        {
          action: 'SIGN',
          documentCollectionId,
          documentId,
        },
      ],
      signingSetup: [
        {
          signingFlow: 'AUTHENTICATION_BASED',
          identityProviders: [{ idpName: 'sbid' }],
        },
      ],
      packageTo: ['PADES_CONTAINER'],
      redirectSettings: {
        success: `${frontendUrl}/success`,
        cancel: `${frontendUrl}/cancel`,
        error: `${frontendUrl}/error`,
      },
      ...(signerEmail && { signer: { email: signerEmail } }),
    },
  ];

  const res = await fetch(`${SIGN_BASE}/signing-sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(res);
  const session = Array.isArray(data) ? data[0] : data;
  return session;
}

// Get signing session status
async function getSigningSession(sessionId) {
  const token = await getAccessToken();

  const res = await fetch(`${SIGN_BASE}/signing-sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return parseResponse(res);
}

async function downloadDocument(documentId) {
  const token = await getAccessToken();

  const res = await fetch(`${SIGN_BASE}/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[Signicat] Download error:', text);
    throw Object.assign(new Error(`Download failed: HTTP ${res.status}`), { status: res.status, body: text });
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper — parse response, always log on error
async function parseResponse(res) {
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    console.error(`[Signicat] HTTP ${res.status}:`, JSON.stringify(data, null, 2));
    throw Object.assign(new Error(`Signicat API error: HTTP ${res.status}`), { status: res.status, body: data });
  }

  return data;
}

module.exports = { getAccessToken, uploadDocument, createDocumentCollection, createSigningSession, getSigningSession, downloadDocument };
