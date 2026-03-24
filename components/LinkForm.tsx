'use client';

import { useState } from 'react';

export function LinkForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus('Saving...');
    setError(null);

    const payload = Object.fromEntries(formData.entries());

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
          Add product, category, or pa_brand destinations now. Nested sub-categories stay ID-based, so Flutter can route safely even if website slugs change later.
        </p>
      </div>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          await handleSubmit(formData);
        }}
        className="grid-form"
      >
        <label>
          <span>Code</span>
          <input name="code" placeholder="ugreen-card-readers" required />
        </label>

        <label>
          <span>Target type</span>
          <select name="target_type" defaultValue="product">
            <option value="product">Product</option>
            <option value="category">Category / sub-category</option>
            <option value="brand">Brand (pa_brand)</option>
          </select>
        </label>

        <label>
          <span>Target ID</span>
          <input name="target_id" placeholder="207498 or term ID" required />
        </label>

        <label>
          <span>Target slug (optional)</span>
          <input name="target_slug" placeholder="ugreen or card-readers" />
        </label>

        <label className="full-span">
          <span>Canonical URL</span>
          <input name="canonical_url" type="url" placeholder="https://www.gadstyle.com/brand/ugreen/1234" required />
        </label>

        <label className="full-span">
          <span>App path (optional, for Flutter deep links)</span>
          <input name="app_path" placeholder="/b/1234 or /c/1234" />
        </label>

        <label className="checkbox-row full-span">
          <input name="is_active" type="checkbox" defaultChecked />
          <span>Link is active</span>
        </label>

        <div className="full-span form-actions">
          <button type="submit" className="primary-button">Create shortlink</button>
        </div>
      </form>

      {status ? <p className="success-text">{status}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
