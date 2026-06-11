"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MusicPlayer } from "@/components/microsite/MusicPlayer";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
  Star,
} from "lucide-react";

const EVENT_TYPES = ["WEDDING", "TRADITIONAL_MARRIAGE", "BIRTHDAY"] as const;
const CULTURES = ["IGBO", "YORUBA", "HAUSA", "GHANAIAN", "OTHER"] as const;

interface Photo {
  id: string;
  file: File;
  preview: string;
  isHero: boolean;
  publicId?: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "" as (typeof EVENT_TYPES)[number] | "",
    personOneName: "",
    personTwoName: "",
    celebrantName: "",
    age: "",
    eventDate: "",
    eventTime: "",
    venueName: "",
    venueAddress: "",
    culture: "" as (typeof CULTURES)[number] | "",
    // Gifts + template (collected so they flow to DB via API)
    template: "LUXURY_GOLD" as string,
    bankName: "",
    accountNumber: "",
    accountName: "",
    paystackPublicKey: "",   // optional: host's Paystack public key for inline checkout
    showGifts: "false" as "true" | "false",
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [aiContent, setAiContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [music, setMusic] = useState<{
    category: string;
    url?: string;
    file?: File;
    isPlaying: boolean;
    volume: number;
  }>({ category: "", isPlaying: false, volume: 0.7 });
  const [isMusicUploading, setIsMusicUploading] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showAdvancedGifts, setShowAdvancedGifts] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 7));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: Photo[] = Array.from(files)
      .slice(0, 6 - photos.length)
      .map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        isHero: photos.length === 0,
      }));
    const updated = [...photos, ...newPhotos];
    if (updated.length > 0 && !updated.some((p) => p.isHero)) {
      updated[0].isHero = true;
    }
    setPhotos(updated);
  };

  const removePhoto = (id: string) => {
    const photoToRemove = photos.find((p) => p.id === id);
    if (photoToRemove) URL.revokeObjectURL(photoToRemove.preview);
    const filtered = photos.filter((p) => p.id !== id);
    if (filtered.length > 0 && !filtered.some((p) => p.isHero)) {
      filtered[0].isHero = true;
    }
    setPhotos(filtered);
  };

  const movePhoto = (id: string, direction: "up" | "down") => {
    const index = photos.findIndex((p) => p.id === id);
    if (index === -1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;

    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(newIndex, 0, moved);
    setPhotos(newPhotos);
  };

  const setHero = (id: string) => {
    setPhotos(photos.map((p) => ({ ...p, isHero: p.id === id })));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addPhotos(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addPhotos(e.target.files);
    e.target.value = "";
  };

  const uploadPhotos = async (): Promise<Photo[]> => {
    if (!photos.length) return photos;
    const formData = new FormData();
    photos.forEach((p) => formData.append("files", p.file));

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok || !Array.isArray(data.urls)) {
      console.error("Photo upload failed", data);
      alert("Photo upload failed. Keeping local previews for now.");
      return photos;
    }

    const { urls } = data;
    const updated = photos.map((p, i) => ({
      ...p,
      preview: urls[i]?.url || p.preview,
      publicId: urls[i]?.publicId || p.publicId,
    }));
    setPhotos(updated);
    return updated;
  };

  const uploadMusic = async (file: File) => {
    setIsMusicUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    // Real Cloudinary upload returns playable audio URLs.
    // We use that (or local fallback) so the preview player can actually play.
    let url = URL.createObjectURL(file);
    if (res.ok && Array.isArray(data.urls) && data.urls[0]?.url) {
      url = data.urls[0].url;
    } else if (!res.ok) {
      console.error("Music upload failed", data);
    }

    setMusic((prev) => ({
      ...prev,
      url,
      file,
      isPlaying: false,
      volume: prev.volume || 0.7,
    }));
    setIsMusicUploading(false);
  };

  const selectMusicCategory = (cat: string) => {
    // Categories provide a demo track for preview (real uploads go to Cloudinary)
    // the music player immediately (same track as audio "uploads" until real storage).
    setMusic({
      category: cat,
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      isPlaying: false,
      volume: 0.7,
    });
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    setAiContent(null);

    const messages = [
      "Crafting your story…",
      "Choosing your palette…",
      "Setting the mood…",
      "Designing your invitation…",
    ];
    // visual simulation only

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: photos.map((p) => p.preview),
        }),
      });
      const data = await res.json();
      setAiContent(data);
      setEditedContent(data);
    } catch (e) {
      // Client fallback mirrors the improved server AI (type-appropriate copy)
      const name = formData.celebrantName || formData.personOneName || "the celebrant"
      const agePart = formData.age ? ` ${formData.age}` : ""
      const weddingNames = formData.personOneName && formData.personTwoName 
        ? `${formData.personOneName} & ${formData.personTwoName}` 
        : "the couple"

      const mock = formData.type === "BIRTHDAY"
        ? {
            headline: `${name}'s${agePart} Birthday`,
            tagline: "Another year, another adventure",
            invitationBody: `Join us as we celebrate ${name}'s special day with laughter, cake, and good company.`,
            story: undefined,
            primaryColor: "#C5A26F",
            secondaryColor: "#0a0a0a",
            headingFont: "Cormorant Garamond",
            bodyFont: "Inter",
          }
        : {
            headline: weddingNames,
            tagline: formData.type === "TRADITIONAL_MARRIAGE" && formData.culture === "IGBO" 
              ? "Nna anyi na nne anyi" 
              : "With hearts full of joy",
            invitationBody: formData.type === "TRADITIONAL_MARRIAGE" && formData.culture
              ? `Join us in celebrating the sacred union according to ${formData.culture} tradition.`
              : "You are cordially invited to share in our celebration of love and new beginnings.",
            story: "Our paths crossed by fate, and love blossomed into this beautiful journey we now embark upon together.",
            primaryColor: "#C5A26F",
            secondaryColor: "#0a0a0a",
            headingFont: "Cormorant Garamond",
            bodyFont: "Inter",
          }

      setAiContent(mock)
      setEditedContent(mock)
    } finally {
      setIsGenerating(false);
    }
  };

  // Single source of truth for publishing (deduped from previous inline + handleSubmit)
  const publishEvent = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    setPublishError(null);

    // Client-side validation for required fields (the multi-step form can bypass HTML required)
    if (!formData.type || !formData.eventDate || !formData.eventTime || !formData.venueName || !formData.venueAddress) {
      setPublishError('Missing required fields (type, date, time, venue name and address are required)');
      setIsPublishing(false);
      return;
    }

    // Stronger name + culture validation (prevents incomplete events; names are nullable in DB but UX requires them)
    if (formData.type === 'BIRTHDAY') {
      if (!formData.celebrantName?.trim()) {
        setPublishError('Celebrant name is required for birthday events');
        setIsPublishing(false);
        return;
      }
    } else {
      if (!formData.personOneName?.trim()) {
        setPublishError('Person One name is required');
        setIsPublishing(false);
        return;
      }
    }
    if (formData.type === 'TRADITIONAL_MARRIAGE' && !formData.culture) {
      setPublishError('Culture is required for Traditional Marriage events');
      setIsPublishing(false);
      return;
    }

    // If photos are still local blobs (user didn't hit "Upload & Prepare" or it was partial), auto-upload now so the published invitation always has real hosted image URLs.
    let photosForPayload = photos;
    if (photos.length > 0 && photos.some((p) => p.preview?.startsWith('blob:'))) {
      const uploaded = await uploadPhotos();
      photosForPayload = uploaded;
      // If still has blobs after attempt, surface (upload failed or no cloudinary keys)
      if (photosForPayload.some((p) => p.preview?.startsWith('blob:'))) {
        setPublishError('Some photos failed to upload to storage. Use the "Upload & Prepare Photos" button on the Photo step, or remove the photos to publish without images.');
        setIsPublishing(false);
        return;
      }
    }

    const finalContent = editedContent || aiContent;

    // Include isHero + preview (and real publicId when available from Cloudinary) for gallery save.
    const payload = {
      ...formData,
      photos: photosForPayload.map((p) => ({
        preview: p.preview,
        publicId: p.publicId || "demo",
        isHero: p.isHero,
      })),
      aiContent: finalContent,
      music,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to publish");
      }

      const savedSlug = data.slug;
      // Success: navigate to the live microsite (real user now owns it via session)
      router.push(`/e/${savedSlug}`);
    } catch (e: any) {
      const msg = e?.message || "Publish failed. Please try again.";
      setPublishError(msg);
      console.error("Publish error:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await publishEvent();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-[#f5f0e6]">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm text-[#C5A26F] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl tracking-tight">Create new event</h1>
            <p className="mt-1 text-sm text-[#f5f0e6]/60 tracking-wider">STEP {step} OF 7</p>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1 w-6 rounded-full transition-all ${i + 1 <= step ? 'bg-[#C5A26F]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>

        <div className="mt-8 card">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-medium mb-4">Choose Event Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("type", type)}
                      className={`p-6 rounded-xl border text-left transition ${formData.type === type ? "border-[#C5A26F] bg-[#161616]" : "border-[#2a2a2a] hover:border-[#C5A26F]/50"}`}
                    >
                      <div className="font-medium">
                        {type.replace("_", " ")}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm mb-1">Template</label>
                  <select
                    value={formData.template}
                    onChange={(e) => updateField("template", e.target.value)}
                    className="w-full"
                  >
                    {[
                      "LUXURY_GOLD",
                      "ELEGANT_WHITE",
                      "AFRICAN_HERITAGE",
                      "FLORAL",
                      "MODERN_MINIMAL",
                      "BLACK_PREMIUM",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium">Basic Information</h2>

                {formData.type === "WEDDING" ||
                formData.type === "TRADITIONAL_MARRIAGE" ? (
                  <>
                    <div>
                      <label className="block text-sm mb-1">
                        Person One Name
                      </label>
                      <input
                        value={formData.personOneName}
                        onChange={(e) =>
                          updateField("personOneName", e.target.value)
                        }
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Person Two Name
                      </label>
                      <input
                        value={formData.personTwoName}
                        onChange={(e) =>
                          updateField("personTwoName", e.target.value)
                        }
                        className="w-full"
                        required
                      />
                    </div>
                    {formData.type === "TRADITIONAL_MARRIAGE" && (
                      <div>
                        <label className="block text-sm mb-1">Culture</label>
                        <select
                          value={formData.culture}
                          onChange={(e) =>
                            updateField("culture", e.target.value)
                          }
                          className="w-full"
                          required
                        >
                          <option value="">Select culture</option>
                          {CULTURES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm mb-1">
                        Celebrant Name
                      </label>
                      <input
                        value={formData.celebrantName}
                        onChange={(e) =>
                          updateField("celebrantName", e.target.value)
                        }
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Age (optional)
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => updateField("age", e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Event Date</label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => updateField("eventDate", e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Event Time</label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => updateField("eventTime", e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Venue Name</label>
                  <input
                    value={formData.venueName}
                    onChange={(e) => updateField("venueName", e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Venue Address</label>
                  <input
                    value={formData.venueAddress}
                    onChange={(e) =>
                      updateField("venueAddress", e.target.value)
                    }
                    className="w-full"
                    required
                  />
                </div>

                {/* Gifts section - now collected so it persists to Event + shows on microsite when enabled */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm font-medium mb-2">Gifts (optional)</div>
                  <p className="text-xs text-[#f5f0e6]/60 mb-3">
                    Let guests know they can send a monetary gift if they wish. Bank details are shown on the invitation.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={formData.bankName}
                      onChange={(e) => updateField("bankName", e.target.value)}
                      placeholder="Bank Name"
                      className="w-full"
                    />
                    <input
                      value={formData.accountNumber}
                      onChange={(e) => updateField("accountNumber", e.target.value)}
                      placeholder="Account Number"
                      className="w-full"
                    />
                    <input
                      value={formData.accountName}
                      onChange={(e) => updateField("accountName", e.target.value)}
                      placeholder="Account Name"
                      className="w-full"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedGifts(!showAdvancedGifts)}
                    className="text-xs text-[#C5A26F] hover:underline mt-2 mb-1"
                  >
                    {showAdvancedGifts ? '− Hide' : '+ Show'} advanced: Paystack direct checkout
                  </button>

                  {showAdvancedGifts && (
                    <div className="space-y-1">
                      <input
                        value={formData.paystackPublicKey}
                        onChange={(e) => updateField("paystackPublicKey", e.target.value)}
                        placeholder="pk_live_xxxxxxxxxxxxxxxx (optional)"
                        className="w-full"
                      />
                      <p className="text-[10px] text-[#f5f0e6]/50">
                        Paste your Paystack public key (pk_...) to enable guests to pay directly via card, bank transfer, USSD etc. using Paystack's checkout.
                      </p>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.showGifts === "true"}
                      onChange={(e) =>
                        updateField("showGifts", e.target.checked ? "true" : "false")
                      }
                    />
                    <label>Show gifts section on the invitation</label>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-medium mb-2">Photo Upload</h2>
                <p className="text-sm text-[#f5f0e6]/70 mb-4">
                  Up to 6 photos. Drag to reorder. First photo becomes the hero
                  image.
                </p>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition ${isDragging ? "border-[#C5A26F] bg-[#161616]" : "border-[#2a2a2a]"} mb-6`}
                >
                  <Upload className="mx-auto h-8 w-8 text-[#C5A26F] mb-2" />
                  <p className="text-sm">Drag photos here or</p>
                  <label className="btn mt-3 inline-flex cursor-pointer text-sm px-4 py-2">
                    Choose files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-[#f5f0e6]/50 mt-2">
                    {photos.length}/6 photos
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.preview}
                          alt="preview"
                          className="w-full h-32 object-cover rounded-lg border border-[#2a2a2a]"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => setHero(photo.id)}
                            className={`p-1 rounded ${photo.isHero ? "bg-[#C5A26F] text-black" : "bg-black/50 hover:bg-black/70"}`}
                            title="Set as hero"
                          >
                            <Star className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="p-1 rounded bg-black/50 hover:bg-red-500/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs bg-black/60 px-2 py-1 rounded">
                          <span>
                            {index + 1}
                            {photo.isHero && " (Hero)"}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => movePhoto(photo.id, "up")}
                              disabled={index === 0}
                              className="hover:text-[#C5A26F] disabled:opacity-30"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => movePhoto(photo.id, "down")}
                              disabled={index === photos.length - 1}
                              className="hover:text-[#C5A26F] disabled:opacity-30"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length > 0 && (
                  <button
                    type="button"
                    onClick={uploadPhotos}
                    className="btn mt-4 w-full"
                  >
                    Upload & Prepare Photos
                  </button>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl font-medium mb-4">AI Generation</h2>
                <p className="text-sm text-[#f5f0e6]/70 mb-6">
                  Click generate to have AI craft your headline, copy, story,
                  colors, and fonts. Culturally appropriate for traditional
                  events.
                </p>

                {!aiContent ? (
                  <button
                    type="button"
                    onClick={generateWithAI}
                    disabled={isGenerating}
                    className="btn w-full py-4 text-base disabled:opacity-50"
                  >
                    {isGenerating ? "Generating..." : "Generate My Invitation"}
                  </button>
                ) : (
                  <div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <strong>Headline:</strong> {aiContent.headline}
                      </div>
                      <div>
                        <strong>Tagline:</strong> {aiContent.tagline}
                      </div>
                      <div>
                        <strong>Invitation:</strong> {aiContent.invitationBody}
                      </div>
                      {aiContent.story && (
                        <div>
                          <strong>Story:</strong> {aiContent.story}
                        </div>
                      )}
                      <div className="flex gap-4">
                        <div>
                          Colors:{" "}
                          <span style={{ color: aiContent.primaryColor }}>
                            ■
                          </span>{" "}
                          {aiContent.primaryColor}{" "}
                          <span style={{ color: aiContent.secondaryColor }}>
                            ■
                          </span>{" "}
                          {aiContent.secondaryColor}
                        </div>
                        <div>
                          Fonts: {aiContent.headingFont} / {aiContent.bodyFont}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={generateWithAI}
                      className="btn-outline mt-4 w-full"
                    >
                      Regenerate
                    </button>
                  </div>
                )}

                {isGenerating && (
                  <div className="mt-6 text-center text-sm text-[#C5A26F]">
                    {
                      [
                        "Crafting your story…",
                        "Choosing your palette…",
                        "Setting the mood…",
                        "Designing your invitation…",
                      ][Math.floor(Date.now() / 800) % 4]
                    }
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl font-medium mb-4">Live Editor</h2>
                <p className="text-sm text-[#f5f0e6]/70 mb-4">
                  Edit the generated content live. Changes update the preview
                  instantly.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input
                      value={
                        editedContent?.headline || aiContent?.headline || ""
                      }
                      onChange={(e) =>
                        setEditedContent({
                          ...(editedContent || aiContent),
                          headline: e.target.value,
                        })
                      }
                      className="w-full text-xl font-heading"
                      placeholder="Headline"
                    />
                    <input
                      value={editedContent?.tagline || aiContent?.tagline || ""}
                      onChange={(e) =>
                        setEditedContent({
                          ...(editedContent || aiContent),
                          tagline: e.target.value,
                        })
                      }
                      className="w-full"
                      placeholder="Tagline"
                    />
                    <textarea
                      value={
                        editedContent?.invitationBody ||
                        aiContent?.invitationBody ||
                        ""
                      }
                      onChange={(e) =>
                        setEditedContent({
                          ...(editedContent || aiContent),
                          invitationBody: e.target.value,
                        })
                      }
                      className="w-full h-24"
                      placeholder="Invitation body"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="color"
                        value={
                          editedContent?.primaryColor ||
                          aiContent?.primaryColor ||
                          "#C5A26F"
                        }
                        onChange={(e) =>
                          setEditedContent({
                            ...(editedContent || aiContent),
                            primaryColor: e.target.value,
                          })
                        }
                      />
                      <input
                        type="color"
                        value={
                          editedContent?.secondaryColor ||
                          aiContent?.secondaryColor ||
                          "#0a0a0a"
                        }
                        onChange={(e) =>
                          setEditedContent({
                            ...(editedContent || aiContent),
                            secondaryColor: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="card bg-[#111] p-6 text-sm">
                    <h3 className="font-heading text-2xl mb-2">
                      {editedContent?.headline || aiContent?.headline}
                    </h3>
                    <p className="italic mb-4">
                      {editedContent?.tagline || aiContent?.tagline}
                    </p>
                    <p>
                      {editedContent?.invitationBody ||
                        aiContent?.invitationBody}
                    </p>
                    <div className="mt-4 text-xs opacity-70">
                      Preview updates live • Full microsite renderer in next
                      step
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditedContent(aiContent)}
                  className="btn-outline mt-4 w-full"
                >
                  Reset to AI
                </button>
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="text-2xl font-medium mb-4">Music</h2>
                <p className="text-sm text-[#f5f0e6]/70 mb-4">
                  Choose from library or upload MP3. Autoplay, mute, volume
                  control.
                </p>

                <div className="mb-4">
                  <div className="text-sm mb-2">Library Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Romantic",
                      "Gospel",
                      "Classical",
                      "Afrobeats",
                      "Highlife",
                      "Instrumental",
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => selectMusicCategory(cat)}
                        className={`px-4 py-2 rounded-full border text-sm ${music.category === cat ? "border-[#C5A26F] bg-[#161616]" : "border-[#2a2a2a] hover:border-[#C5A26F]/50"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2">Upload MP3</div>
                  <label className="btn inline-flex cursor-pointer text-sm px-4 py-2">
                    Choose MP3
                    <input
                      type="file"
                      accept="audio/mp3"
                      onChange={(e) =>
                        e.target.files && uploadMusic(e.target.files[0])
                      }
                      className="hidden"
                    />
                  </label>
                  {isMusicUploading && (
                    <span className="ml-2 text-sm">Uploading...</span>
                  )}
                  {music.url && (
                    <span className="ml-2 text-sm text-[#C5A26F]">
                      Ready: {music.file?.name || music.category}
                    </span>
                  )}
                </div>

                {music.url && (
                  <div className="mt-4">
                    {/* Reusing the production MusicPlayer component (with proper ref + play/pause/volume control)
                        so the uploaded (or stub) audio actually plays when you press the button. */}
                    <MusicPlayer
                      url={music.url}
                      category={music.category || music.file?.name}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 className="text-2xl font-medium mb-4">Publish</h2>
                <p className="text-sm text-[#f5f0e6]/70 mb-6">
                  Review and publish. Generate slug from names, share options,
                  QR.
                </p>

                <div className="space-y-2 text-sm mb-6">
                  <div>
                    <strong>Type:</strong> {formData.type}
                  </div>
                  <div>
                    <strong>Details:</strong>{" "}
                    {formData.personOneName || formData.celebrantName}{" "}
                    {formData.personTwoName
                      ? `& ${formData.personTwoName}`
                      : ""}
                  </div>
                  <div>
                    <strong>Date:</strong> {formData.eventDate}{" "}
                    {formData.eventTime}
                  </div>
                  <div>
                    <strong>Venue:</strong> {formData.venueName},{" "}
                    {formData.venueAddress}
                  </div>
                  <div>
                    <strong>Photos:</strong> {photos.length}
                  </div>
                  {aiContent && (
                    <div>
                      <strong>AI Headline:</strong> {aiContent.headline}
                    </div>
                  )}
                  {music.category && (
                    <div>
                      <strong>Music:</strong> {music.category}
                    </div>
                  )}
                  {formData.showGifts === "true" && (formData.bankName || formData.paystackPublicKey) && (
                    <div>
                      <strong>Gifts:</strong> enabled
                    </div>
                  )}
                  <div className="text-xs text-[#f5f0e6]/60">
                    Template: {formData.template.replace(/_/g, " ")}
                  </div>
                </div>

                {publishError && (
                  <p className="text-red-400 text-sm mb-3">{publishError}</p>
                )}

                <button
                  type="button"
                  onClick={publishEvent}
                  disabled={isPublishing || !session}
                  className="btn w-full py-4 text-base disabled:opacity-60"
                >
                  {isPublishing ? "Publishing..." : "Publish & Get Link / QR"}
                </button>
                {!session && (
                  <p className="text-xs text-[#f5f0e6]/60 mt-2 text-center">
                    Sign in required to publish. (You should be authenticated via dashboard.)
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-outline px-6 py-2"
                  disabled={isPublishing}
                >
                  Back
                </button>
              )}
              {step < 7 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn px-6 py-2 ml-auto"
                  disabled={step === 3 && photos.length === 0 || isPublishing}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn px-6 py-2 ml-auto"
                  disabled={isPublishing || !session}
                >
                  {isPublishing ? "Publishing..." : "Publish Event"}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#f5f0e6]/50">
          7-step creation flow with real AI, Cloudinary uploads, and Paystack.
        </p>
      </div>
    </div>
  );
}
