'use client';

import { useMemo, useState } from 'react';

type TargetType = 'product' | 'category' | 'brand';

type ParsedCanonical = {
  targetType: TargetType;
  targetId: string;
  targetSlug: string;
  canonicalUrl: string;
  appPath: string;
  suggestedCode: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function parseCanonicalUrl(raw: string): ParsedCanonical | null {
  const value = raw.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');
  if (!['gadstyle.com', 'app.gadstyle.com'].includes(host)) return null;

  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  const productMatch = pathname.match(/^\/item\/(\d+)(?:\/([^/]+))?$/);
  if (productMatch) {
    const [, id, slug = ''] = productMatch;
    const cleanSlug = slugify(slug || '');
    return {
      targetType: 'product',
      targetId: id,
      targetSlug: cleanSlug,
      canonicalUrl: value,
      appPath: `/p/${id}`,
      suggestedCode: `p-${id}`,
    };
  }

  const brandMatch = pathname.match(/^\/brand\/([^/]+)\/(\d+)$/);
  if (brandMatch) {
    const [, slug, id] = brandMatch;
    const cleanSlug = slugify(slug || '');
    return {
      targetType: 'brand',
      targetId: id,
      targetSlug: cleanSlug,
      canonicalUrl: value,
      appPath: `/b/${id}`,
      suggestedCode: `b-${id}`,
    };
  }

  const categoryMatch = pathname.match(/^\/category\/(.+)\/(\d+)$/);
  if (categoryMatch) {
    const [, slugPath, id] = categoryMatch;
    const lastSlug = slugPath.split('/').filter(Boolean).pop() || '';
    const cleanSlug = slugify(lastSlug);
    return {
      targetType: 'category',
      targetId: id,
      targetSlug: cleanSlug,
      canonicalUrl: value,
      appPath: `/c/${id}`,
      suggestedCode: `c-${id}`,
    };
  }

  return null;
}

export function LinkForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canonicalInput, setCanonicalInput] = useState('');
  const [code, setCode] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('product');
  const [targetId, setTargetId] = useState('');
  const [targetSlug, setTargetSlug] = useState('');
  const [appPath, setAppPath] = useState('');
  const [autoFilledCode, setAutoFilledCode] = useState(true);

  const parsed = useMemo(() => parseCanonicalUrl(canonicalInput), [canonicalInput]);

  function applyParsedCanonical(value: string) {
    setCanonicalInput(value);
    const next = parseCanonicalUrl(value);
    if (!next) return;
    setTargetType(next.targetType);
    setTargetId(next.targetId);
    setTargetSlug(next.targetSlug);
    setAppPath(next.appPath);
    if (autoFilledCode || !code.trim()) {
      setCode(next.suggestedCode);
      setAutoFilledCode(true);
    }
  }

  async function handleSubmit() {
    setStatus('Saving...');
    setError(null);

    const payload = {
      code,
      target_type: targetType,
      target_id: targetId,
      target_slug: targetSlug,
      canonical_url: canonicalInput,
      app_path: appPath,
      is_active: true,
    };

    const response = await fetch('/api/admin/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Could not create shortlink.');
      setStatus(null);
      return;
    }

    setStatus(`Saved. Short URL: ${data.shortUrl}`);
  }

  return (
    <div className="card form-card">
      <div className="section-copy">
        <h2>Create shortlink</h2>
        <p className="muted-text">
          Paste a canonical Gadstyle URL and the form will auto-detect target type, numeric ID, display slug, app path, and a safe code suggestion. Routing stays strictly ID-based.
        </p>
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await handleSubmit();
        }}
        className="grid-form"
      >
        <label className="full-span">
          <span>Canonical URL</span>
          <input
            name="canonical_url"
            type="url"
            value={canonicalInput}
            onChange={(event) => applyParsedCanonical(event.target.value)}
            placeholder="https://www.gadstyle.com/brand/ugreen/1234"
            required
          />
        </label>

        <div className="full-span parser-hint-wrap">
          {parsed ? (
            <p className="success-text parser-hint">
              Auto-detected {parsed.targetType} #{parsed.targetId} → {parsed.appPath}
            </p>
          ) : canonicalInput.trim() ? (
            <p className="error-text parser-hint">
              Could not parse that URL. Use a canonical Gadstyle product, category, or brand URL ending in the numeric ID.
            </p>
          ) : (
            <p className="muted-text parser-hint">
              Supported patterns: /item/{'id'}/{'slug'}, /category/.../{'id'}, /brand/{'slug'}/{'id'}
            </p>
          )}
        </div>

        <label>
          <span>Code</span>
          <input
            name="code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setAutoFilledCode(false);
            }}
            placeholder="p-135509"
            required
          />
        </label>

        <label>
          <span>Target type</span>
          <select
            name="target_type"
            value={targetType}
            onChange={(event) => setTargetType(event.target.value as TargetType)}
          >
            <option value="product">Product</option>
            <option value="category">Category / sub-category</option>
            <option value="brand">Brand</option>
          </select>
        </label>

        <label>
          <span>Target ID</span>
          <input
            name="target_id"
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
            placeholder="207498 or term ID"
            required
          />
        </label>

        <label>
          <span>Display slug (optional)</span>
          <input
            name="target_slug"
            value={targetSlug}
            onChange={(event) => setTargetSlug(event.target.value)}
            placeholder="ugreen or card-readers"
          />
        </label>

        <label className="full-span">
          <span>App path</span>
          <input
            name="app_path"
            value={appPath}
            onChange={(event) => setAppPath(event.target.value)}
            placeholder="/b/1234 or /c/1234"
          />
        </label>

        <div className="full-span card preview-card">
          <div className="preview-grid">
            <div>
              <span className="preview-label">Short link</span>
              <strong>{code.trim() ? `/s/${code.trim()}` : '/s/p-135509'}</strong>
            </div>
            <div>
              <span className="preview-label">Direct link</span>
              <strong>{appPath.trim() || '/p/135509'}</strong>
            </div>
          </div>
        </div>

        <div className="full-span form-actions">
          <button type="submit" className="primary-button">Create shortlink</button>
        </div>
      </form>

      {status ? <p className="success-text">{status}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
