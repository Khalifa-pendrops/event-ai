'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      fetchEvent(p.id);
    });
  }, [params]);

  const fetchEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        alert('Event updated!');
      }
    } catch (e) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8">Event not found</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-[#f5f0e6]">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm text-[#C5A26F] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="mt-6 font-heading text-4xl tracking-tight">Edit Event</h1>

        <div className="mt-8 card space-y-6">
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select 
              value={event.status} 
              onChange={e => setEvent({ ...event, status: e.target.value })} 
              className="w-full"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Headline</label>
            <input 
              value={event.aiContent?.headline || ''} 
              onChange={e => setEvent({ 
                ...event, 
                aiContent: { ...(event.aiContent || {}), headline: e.target.value } 
              })} 
              className="w-full" 
            />
          </div>

          {/* Add more fields as needed */}

          <button onClick={handleSave} disabled={saving} className="btn w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <p className="mt-6 text-xs text-[#f5f0e6]/50 text-center">
          Full editor coming in next increment. Current is basic fields.
        </p>
      </div>
    </div>
  );
}
