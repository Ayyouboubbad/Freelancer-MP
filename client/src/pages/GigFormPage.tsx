import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigAPI } from '../api';
import {
  ArrowLeft, ArrowRight, Check, Plus, X, Trash2, Image, Save, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 0 | 1 | 2 | 3 | 4;
const STEP_LABELS = ['Overview', 'Pricing', 'Gallery', 'FAQ', 'Preview'];

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-apps', label: 'Mobile Apps' },
  { value: 'design', label: 'Design & Creative' },
  { value: 'writing', label: 'Writing & Translation' },
  { value: 'video', label: 'Video & Animation' },
  { value: 'music', label: 'Music & Audio' },
  { value: 'marketing', label: 'Digital Marketing' },
  { value: 'data', label: 'Data & Analytics' },
  { value: 'business', label: 'Business' },
  { value: 'ai', label: 'AI & Machine Learning' },
];

const emptyPackage = (name: string) => ({
  name, title: '', description: '', price: 0, deliveryDays: 1, revisions: 1, features: [''],
});

const GigFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [step, setStep] = useState<Step>(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Step 1: Overview
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Step 2: Pricing
  const [packages, setPackages] = useState([
    emptyPackage('basic'),
    emptyPackage('standard'),
    emptyPackage('premium'),
  ]);

  // Step 3: Gallery
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [video, setVideo] = useState('');

  // Step 4: FAQ
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);

  // Load existing gig for editing
  useEffect(() => {
    if (!isEdit || !id) return;
    gigAPI.getGig(id)
      .then(({ data }) => {
        const g = data.gig;
        setTitle(g.title);
        setDescription(g.description);
        setCategory(g.category);
        setSubcategory(g.subcategory || '');
        setTags(g.tags || []);
        setPackages(g.packages.length > 0 ? g.packages : packages);
        setExistingImages(g.images || []);
        setImagePreviews(g.images || []);
        setVideo(g.video || '');
        setFaqs(g.faqs?.length > 0 ? g.faqs : [{ question: '', answer: '' }]);
      })
      .catch(() => toast.error('Gig not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + existingImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImageFiles([...imageFiles, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (idx: number) => {
    if (idx < existingImages.length) {
      setExistingImages(existingImages.filter((_, i) => i !== idx));
      setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
    } else {
      const fileIdx = idx - existingImages.length;
      setImageFiles(imageFiles.filter((_, i) => i !== fileIdx));
      setImagePreviews(imagePreviews.filter((_, i) => i !== idx));
    }
  };

  const updatePackage = (idx: number, field: string, value: any) => {
    setPackages(packages.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const updateFeature = (pkgIdx: number, featIdx: number, value: string) => {
    const newPkgs = [...packages];
    newPkgs[pkgIdx].features[featIdx] = value;
    setPackages(newPkgs);
  };

  const addFeature = (pkgIdx: number) => {
    const newPkgs = [...packages];
    newPkgs[pkgIdx].features.push('');
    setPackages(newPkgs);
  };

  const removeFeature = (pkgIdx: number, featIdx: number) => {
    const newPkgs = [...packages];
    newPkgs[pkgIdx].features = newPkgs[pkgIdx].features.filter((_, i) => i !== featIdx);
    setPackages(newPkgs);
  };

  const validate = (): boolean => {
    if (!title.trim()) { toast.error('Title is required'); setStep(0); return false; }
    if (!description.trim()) { toast.error('Description is required'); setStep(0); return false; }
    if (!category) { toast.error('Category is required'); setStep(0); return false; }
    for (const pkg of packages) {
      if (!pkg.title.trim() || pkg.price <= 0) {
        toast.error(`All packages must have a title and price > 0`);
        setStep(1);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('tags', JSON.stringify(tags));
      formData.append('packages', JSON.stringify(packages.map(p => ({
        ...p, features: p.features.filter(f => f.trim()),
      }))));
      formData.append('faqs', JSON.stringify(faqs.filter(f => f.question.trim() && f.answer.trim())));
      formData.append('video', video);
      formData.append('existingImages', JSON.stringify(existingImages));

      imageFiles.forEach((f) => formData.append('images', f));

      if (isEdit && id) {
        await gigAPI.updateGig(id, formData);
        toast.success('Gig updated!');
      } else {
        await gigAPI.createGig(formData);
        toast.success('Gig created!');
      }
      navigate('/dashboard/freelancer');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save gig.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton h-8 w-48 rounded mb-6" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-icon">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="section-title text-2xl">{isEdit ? 'Edit Gig' : 'Create New Gig'}</h1>
      </div>

      {/* Step indicator */}
      <div className="step-indicator mb-8">
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={label}>
            <button onClick={() => setStep(i as Step)} className="flex flex-col items-center gap-1">
              <div className={`step-dot ${i < step ? 'completed' : i === step ? 'current' : 'upcoming'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-brand-400' : 'text-slate-500'}`}>{label}</span>
            </button>
            {i < STEP_LABELS.length - 1 && <div className={`step-line ${i < step ? 'completed' : 'upcoming'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 0: Overview ──────────────────────────────────────── */}
      {step === 0 && (
        <div className="glass-dark rounded-2xl p-6 space-y-5 animate-fade-in">
          <h2 className="text-lg font-display font-bold text-white">Gig Overview</h2>

          <div>
            <label className="label">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="input" maxLength={120} placeholder="I will..." />
            <p className="text-xs text-slate-500 mt-1">{title.length}/120</p>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[150px] resize-y" maxLength={2000}
              placeholder="Describe your service in detail..." />
            <p className="text-xs text-slate-500 mt-1">{description.length}/2000</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subcategory</label>
              <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                className="input" placeholder="e.g. Full-Stack, UI/UX..." />
            </div>
          </div>

          <div>
            <label className="label">Tags ({tags.length}/10)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((t) => (
                <span key={t} className="tag">
                  {t} <button onClick={() => setTags(tags.filter(x => x !== t))} className="tag-remove"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input flex-1" placeholder="Add tag..." />
              <button onClick={addTag} className="btn-secondary"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Pricing ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-lg font-display font-bold text-white">Pricing Packages</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {packages.map((pkg, i) => (
              <div key={pkg.name} className="glass-dark rounded-2xl p-5 space-y-4">
                <div className="text-center">
                  <span className={`badge ${i === 0 ? 'badge-gray' : i === 1 ? 'badge-brand' : 'badge-warning'} mb-2`}>
                    {pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="label">Title *</label>
                  <input value={pkg.title} onChange={(e) => updatePackage(i, 'title', e.target.value)}
                    className="input" placeholder="Package title" />
                </div>
                <div>
                  <label className="label">Description</label>
                  <input value={pkg.description} onChange={(e) => updatePackage(i, 'description', e.target.value)}
                    className="input" placeholder="Short description" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label">Price ($)</label>
                    <input type="number" min="5" value={pkg.price}
                      onChange={(e) => updatePackage(i, 'price', Number(e.target.value))}
                      className="input" />
                  </div>
                  <div>
                    <label className="label">Days</label>
                    <input type="number" min="1" value={pkg.deliveryDays}
                      onChange={(e) => updatePackage(i, 'deliveryDays', Number(e.target.value))}
                      className="input" />
                  </div>
                  <div>
                    <label className="label">Revisions</label>
                    <input type="number" min="0" value={pkg.revisions}
                      onChange={(e) => updatePackage(i, 'revisions', Number(e.target.value))}
                      className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Features</label>
                  <div className="space-y-2">
                    {pkg.features.map((f, fi) => (
                      <div key={fi} className="flex gap-1">
                        <input value={f} onChange={(e) => updateFeature(i, fi, e.target.value)}
                          className="input flex-1 !py-2 text-sm" placeholder="Feature..." />
                        {pkg.features.length > 1 && (
                          <button onClick={() => removeFeature(i, fi)} className="btn-ghost !p-2 text-red-400">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addFeature(i)}
                      className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add feature
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Gallery ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="glass-dark rounded-2xl p-6 space-y-5 animate-fade-in">
          <h2 className="text-lg font-display font-bold text-white">Gallery</h2>
          <p className="text-sm text-slate-400">Upload up to 5 images to showcase your work.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-white/10">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {imagePreviews.length < 5 && (
              <label className="aspect-video rounded-xl border-2 border-dashed border-surface-600 hover:border-brand-500 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                <Image className="w-8 h-8 text-slate-500" />
                <span className="text-xs text-slate-500">Upload Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageAdd} />
              </label>
            )}
          </div>

          <div>
            <label className="label">Video URL (optional)</label>
            <input value={video} onChange={(e) => setVideo(e.target.value)}
              className="input" placeholder="https://youtube.com/..." />
          </div>
        </div>
      )}

      {/* ── Step 3: FAQ ──────────────────────────────────────────── */}
      {step === 3 && (
        <div className="glass-dark rounded-2xl p-6 space-y-5 animate-fade-in">
          <h2 className="text-lg font-display font-bold text-white">Frequently Asked Questions</h2>

          {faqs.map((faq, i) => (
            <div key={i} className="glass p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">FAQ #{i + 1}</span>
                {faqs.length > 1 && (
                  <button onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
              <input value={faq.question}
                onChange={(e) => setFaqs(faqs.map((f, j) => j === i ? { ...f, question: e.target.value } : f))}
                className="input" placeholder="Question" />
              <textarea value={faq.answer}
                onChange={(e) => setFaqs(faqs.map((f, j) => j === i ? { ...f, answer: e.target.value } : f))}
                className="input min-h-[60px]" placeholder="Answer" />
            </div>
          ))}

          <button onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
            className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      )}

      {/* ── Step 4: Preview ──────────────────────────────────────── */}
      {step === 4 && (
        <div className="animate-fade-in space-y-6">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-400" /> Preview
          </h2>

          <div className="glass-dark rounded-2xl p-6">
            {imagePreviews.length > 0 && (
              <img src={imagePreviews[0]} alt="" className="w-full h-56 object-cover rounded-xl mb-4" />
            )}
            <h3 className="text-xl font-bold text-white mb-2">{title || 'Untitled Gig'}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap mb-4">{description}</p>

            <div className="grid sm:grid-cols-3 gap-3">
              {packages.map((pkg, i) => (
                <div key={i} className="glass p-4 rounded-xl">
                  <p className="text-xs font-semibold text-brand-400 uppercase mb-1">{pkg.name}</p>
                  <p className="text-sm font-bold text-white">{pkg.title}</p>
                  <p className="text-xl font-display font-bold text-brand-300 my-2">${pkg.price}</p>
                  <p className="text-xs text-slate-400">{pkg.deliveryDays}d · {pkg.revisions} rev</p>
                  <ul className="mt-2 space-y-1">
                    {pkg.features.filter(f => f.trim()).map((f, fi) => (
                      <li key={fi} className="text-xs text-slate-300 flex items-start gap-1">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button onClick={() => setStep(Math.max(0, step - 1) as Step)} disabled={step === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < 4 ? (
          <button onClick={() => setStep(Math.min(4, step + 1) as Step)}
            className="btn-primary flex items-center gap-2">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : isEdit ? 'Update Gig' : 'Publish Gig'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GigFormPage;
