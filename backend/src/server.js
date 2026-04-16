require('dotenv').config();

const express = require('express');
const multer = require('multer');
const {
  uploadDocument,
  createDocumentCollection,
  createSigningSession,
  getSigningSession,
  downloadDocument,
} = require('./signicat');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS — allow the React frontend
app.use((req, res, next) => {
  const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// ---------------------------------------------------------------------------
// POST /api/signing/create
// Accepts multipart/form-data with a "document" PDF file.
// Runs the 3-step Signicat Sign API v2 flow and returns the signing URL.
// ---------------------------------------------------------------------------
app.post('/api/signing/create', upload.single('document'), async (req, res) => {
  try {
    const { title, signerName, signerEmail } = req.body;

    if (!title || !signerName || !signerEmail) {
      return res.status(400).json({ error: 'title, signerName, and signerEmail are required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'A PDF file upload is required' });
    }

    // Step 1 — upload PDF as binary
    const { documentId } = await uploadDocument(req.file.buffer);

    // Step 2 — create document collection
    const { id: documentCollectionId } = await createDocumentCollection(documentId);

    // Step 3 — create signing session
    const session = await createSigningSession({
      title,
      signerEmail,
      documentCollectionId,
      documentId,
      externalReference: `ref-${Date.now()}`,
    });

    res.status(201).json({
      sessionId: session.id,
      signatureUrl: session.signatureUrl,
      documentId,
      documentCollectionId,
      status: session.lifecycle?.state,
    });
  } catch (err) {
    console.error('Error creating signing order:', err.message);
    res.status(err.status || 500).json({ error: err.message, details: err.body || null });
  }
});

// ---------------------------------------------------------------------------
// GET /api/signing/sessions/:sessionId
// Returns the current status of a signing session.
// After signing, output.packages[0].resultDocumentId has the signed PAdES PDF.
// ---------------------------------------------------------------------------
app.get('/api/signing/sessions/:sessionId', async (req, res) => {
  try {
    const session = await getSigningSession(req.params.sessionId);
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err.message);
    res.status(err.status || 500).json({ error: err.message, details: err.body || null });
  }
});

// ---------------------------------------------------------------------------
// GET /api/signing/documents/:documentId/download
// Downloads a document by ID — works for both original and signed PAdES PDF.
// ---------------------------------------------------------------------------
app.get('/api/signing/documents/:documentId/download', async (req, res) => {
  try {
    const pdfBuffer = await downloadDocument(req.params.documentId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="signed-document.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error downloading document:', err.message);
    res.status(err.status || 500).json({ error: err.message, details: err.body || null });
  }
});

// ---------------------------------------------------------------------------
// POST /api/signing/webhook
// Receives Signicat event notifications (configure in Dashboard > Settings > Events).
// ---------------------------------------------------------------------------
app.post('/api/signing/webhook', (req, res) => {
  const event = req.body;
  console.log('[Webhook] Event received:', JSON.stringify(event, null, 2));

  if (event.eventName === 'package.completed') {
    console.log(`[Webhook] Package ready — sessionId: ${event.eventData?.id}`);
  }

  res.sendStatus(200);
});

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Signicat backend running on http://localhost:${PORT}`);
});
