/**
 * PEAKING Asset-Library — Client-Side API + Mentions-Parser
 *
 * Phase 1.5 (V1): Worker-backed (KV-storage), local-cache via localStorage.
 * Phase 2: Auto-sync with Worker on every load (replaced by Firestore in Phase B).
 *
 * Public API:
 *   AssetLibrary.list(brandId?) → Promise<Asset[]>
 *   AssetLibrary.get(id) → Promise<Asset|null>
 *   AssetLibrary.upload({ dataUrl?, sourceUrl?, brandId, tags?, prompt?, model? }) → Promise<Asset>
 *   AssetLibrary.mirrorFromReplicate(url, opts) → Promise<Asset> (convenience)
 *   AssetLibrary.delete(id) → Promise<boolean>
 *   AssetLibrary.parseMentions(promptText) → Array<{id, position, length}>
 *   AssetLibrary.resolveMentions(promptText) → { resolved: string, referenceIds: string[] }
 *   AssetLibrary.publicUrl(id) → string
 *
 * Asset-Schema (v1):
 *   { id, createdAt, brandId, tags[], prompt, model, sourceUrl, mime, sizeBytes, publicUrl }
 */

(function (global) {
  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = 'peaking:asset_library:v1';
  const WORKER_URL = 'https://peaking-ai-api.peaking.workers.dev';
  const FRONTEND_KEY = 'pk_peaking_2026_sebi_solo_x7k2m9';

  // Local cache (Worker is source-of-truth, this is performance-only)
  let cache = loadCache();

  function loadCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { schemaVersion: SCHEMA_VERSION, assets: {} };
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== SCHEMA_VERSION) {
        return { schemaVersion: SCHEMA_VERSION, assets: {} };
      }
      return parsed;
    } catch (e) {
      return { schemaVersion: SCHEMA_VERSION, assets: {} };
    }
  }

  function saveCache() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn('[AssetLibrary] cache save failed', e);
    }
  }

  function headers() {
    return {
      'Content-Type': 'application/json',
      'X-Peaking-Key': FRONTEND_KEY,
    };
  }

  function api(path, opts = {}) {
    return fetch(`${WORKER_URL}${path}`, {
      ...opts,
      headers: { ...headers(), ...(opts.headers || {}) },
    });
  }

  const AssetLibrary = {
    publicUrl(id) {
      return `${WORKER_URL}/assets/${id}`;
    },

    async list(brandId) {
      const qs = brandId ? `?brandId=${encodeURIComponent(brandId)}` : '';
      const res = await api(`/assets/list${qs}`, { method: 'GET' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `List failed: HTTP ${res.status}`);
      }
      // Update cache
      for (const a of data.assets) {
        cache.assets[a.id] = a;
      }
      saveCache();
      return data.assets;
    },

    async get(id) {
      // Check cache first
      if (cache.assets[id]) return cache.assets[id];
      // Cache-miss: refresh list (worker doesn't have single-get for metadata yet)
      await this.list();
      return cache.assets[id] || null;
    },

    async upload({ dataUrl, sourceUrl, brandId = 'custom', tags = [], prompt, model } = {}) {
      if (!dataUrl && !sourceUrl) {
        throw new Error('Provide dataUrl or sourceUrl');
      }
      const body = JSON.stringify({ dataUrl, sourceUrl, brandId, tags, prompt, model });
      const res = await api('/assets/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Upload failed: HTTP ${res.status}`);
      }
      const asset = { ...data.asset, publicUrl: data.publicUrl };
      cache.assets[asset.id] = asset;
      saveCache();
      return asset;
    },

    async mirrorFromReplicate(url, { brandId, tags, prompt, model } = {}) {
      // Convenience-wrapper: mirror temporary Replicate-URL to permanent KV storage
      return this.upload({ sourceUrl: url, brandId, tags, prompt, model });
    },

    async delete(id) {
      const res = await api(`/assets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Delete failed: HTTP ${res.status}`);
      }
      delete cache.assets[id];
      saveCache();
      return true;
    },

    /**
     * Parse @-mentions in a prompt string.
     * @<asset-id> matches IDs of format <base36ts>_<12hex>
     * Returns array of { id, position, length } in order of appearance.
     */
    parseMentions(promptText) {
      if (typeof promptText !== 'string') return [];
      const re = /@([a-z0-9]{6,}_[a-f0-9]{12})/g;
      const mentions = [];
      let m;
      while ((m = re.exec(promptText)) !== null) {
        mentions.push({
          id: m[1],
          position: m.index,
          length: m[0].length,
          raw: m[0],
        });
      }
      return mentions;
    },

    /**
     * Resolve @-mentions to public URLs + return cleaned prompt.
     * Replaces @<id> with [reference image: <url>] in resolved prompt.
     * Returns referenceIds[] for downstream use (img2img / reference-mode).
     */
    resolveMentions(promptText) {
      const mentions = this.parseMentions(promptText);
      if (mentions.length === 0) {
        return { resolved: promptText, referenceIds: [] };
      }
      let resolved = promptText;
      const referenceIds = [];
      // Replace from right-to-left to preserve indices
      for (let i = mentions.length - 1; i >= 0; i--) {
        const m = mentions[i];
        const url = this.publicUrl(m.id);
        const replacement = `[reference image: ${url}]`;
        resolved = resolved.slice(0, m.position) + replacement + resolved.slice(m.position + m.length);
        referenceIds.unshift(m.id);
      }
      return { resolved, referenceIds };
    },

    // Cache-only helpers (no network)
    getCachedAll() {
      return Object.values(cache.assets);
    },

    getCachedByBrand(brandId) {
      return Object.values(cache.assets).filter(a => a.brandId === brandId);
    },

    clearCache() {
      cache = { schemaVersion: SCHEMA_VERSION, assets: {} };
      saveCache();
    },
  };

  global.AssetLibrary = AssetLibrary;
})(window);
