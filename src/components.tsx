import { ChangeEvent, ReactNode, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Import,
  Languages,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  categoryOptions,
  CommentWarning,
  createCommentFromText,
  DashboardMetrics,
  emptyFilters,
  FiltersState,
  formatCommentLabel,
  formatReviewerLabel,
  getCommentNumber,
  getCommentWarnings,
  getReviewerNumber,
  getReviewers,
  parseProjectJson,
  createProjectJson,
  downloadTextFile,
  responseStatusOptions,
  ReviewComment,
  ReviewReplyProject,
  revisionStatusOptions,
  severityOptions,
  splitBulkComments,
} from './core';
import { formatText, getWarningKey, LanguageCode, languageOptions, TranslationKey } from './i18n';
interface LanguageSwitcherProps {
  language: LanguageCode;
  t: (key: TranslationKey) => string;
  onChange: (language: LanguageCode) => void;
}

export function LanguageSwitcher({ language, t, onChange }: LanguageSwitcherProps) {
  return (
    <label className="flex min-w-48 items-center gap-2">
      <Languages className="text-slate-500" size={16} aria-hidden="true" />
      <span className="sr-only">{t('language.label')}</span>
      <select
        className="input min-h-9 py-1"
        value={language}
        aria-label={t('language.label')}
        onChange={(event) => onChange(event.target.value as LanguageCode)}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface HeaderProps {
  project: ReviewReplyProject;
  language: LanguageCode;
  t: (key: TranslationKey) => string;
  onProjectChange: (patch: Partial<Pick<ReviewReplyProject, 'title' | 'manuscriptTitle'>>) => void;
  onLanguageChange: (language: LanguageCode) => void;
  onReset: () => void;
}

export function Header({ project, language, t, onProjectChange, onLanguageChange, onReset }: HeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600">ReviewReply</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">{t('app.workspaceTitle')}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('app.tagline')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <LanguageSwitcher language={language} t={t} onChange={onLanguageChange} />
            <button className="button" type="button" onClick={onReset}>
              <RotateCcw size={16} aria-hidden="true" />
              {t('backup.resetToStart')}
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="field-label">{t('project.title')}</span>
            <input
              className="input"
              value={project.title}
              onChange={(event) => onProjectChange({ title: event.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="field-label">{t('project.manuscriptTitle')}</span>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                className="input pl-9"
                placeholder={t('common.optional')}
                value={project.manuscriptTitle}
                onChange={(event) => onProjectChange({ manuscriptTitle: event.target.value })}
              />
            </div>
          </label>
        </div>
      </div>
    </header>
  );
}

interface DashboardProps {
  metrics: DashboardMetrics;
  warnings: CommentWarning[];
  t: (key: TranslationKey) => string;
}

const metricLabels: Array<[keyof DashboardMetrics, TranslationKey]> = [
  ['totalCards', 'dashboard.totalCards'],
  ['unresolvedRevisions', 'dashboard.unresolvedRevisions'],
  ['unfinishedResponses', 'dashboard.unfinishedResponses'],
  ['majorOrCritical', 'dashboard.majorOrCritical'],
  ['declined', 'dashboard.declined'],
];

export function Dashboard({ metrics, warnings, t }: DashboardProps) {
  return (
    <section className="border-b border-slate-200/80 bg-[#f5f5f7]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm sm:grid-cols-3 lg:grid-cols-7">
          <div className="grid min-h-28 grid-rows-[2rem_1fr] border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
            <span className="field-label min-h-8 leading-4">{t('dashboard.completion')}</span>
            <p className="flex items-center text-4xl font-semibold leading-none text-slate-950">{metrics.completionPercentage}%</p>
          </div>
          {metricLabels.map(([key, labelKey]) => (
            <div key={key} className="grid min-h-28 grid-rows-[2rem_1fr] border-b border-slate-100 p-4 sm:border-b-0 sm:border-r lg:last:border-r-0">
              <span className="field-label min-h-8 leading-4">{t(labelKey)}</span>
              <p className="flex items-center text-3xl font-semibold leading-none text-slate-950">{metrics[key]}</p>
            </div>
          ))}
          <div className="grid min-h-28 grid-rows-[2rem_1fr] p-4">
            <span className="field-label min-h-8 leading-4">{t('dashboard.warnings')}</span>
            <p className="flex items-center gap-2 text-3xl font-semibold leading-none text-slate-950">
              <span>{metrics.warningCount}</span>
              {warnings.length > 0 && (
                <AlertTriangle
                  className="text-amber-500"
                  size={20}
                  aria-label={t(getWarningKey(warnings[0].label))}
                >
                  <title>{t(getWarningKey(warnings[0].label))}</title>
                </AlertTriangle>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FiltersProps {
  comments: ReviewComment[];
  filters: FiltersState;
  t: (key: TranslationKey) => string;
  onChange: (filters: FiltersState) => void;
}

export function Filters({ comments, filters, t, onChange }: FiltersProps) {
  const reviewers = getReviewers(comments);

  return (
    <section className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[1.25fr_repeat(5,minmax(0,1fr))_auto]">
          <label className="md:col-span-2 xl:col-span-1">
            <span className="sr-only">{t('filters.search')}</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                className="input pl-9"
                value={filters.search}
                onChange={(event) => onChange({ ...filters, search: event.target.value })}
                placeholder={t('filters.searchPlaceholder')}
              />
            </div>
          </label>

          <SelectField
            label={t('filters.reviewer')}
            value={filters.reviewer}
            onChange={(value) => onChange({ ...filters, reviewer: value })}
            options={[[ 'all', t('filters.allReviewers') ], ...reviewers.map((reviewer) => [reviewer, reviewer] as [string, string])]}
          />
          <SelectField
            label={t('filters.category')}
            value={filters.category}
            onChange={(value) => onChange({ ...filters, category: value as FiltersState['category'] })}
            options={[[ 'all', t('filters.allCategories') ], ...categoryOptions.map((value) => [value, t(`category.${value}` as TranslationKey)] as [string, string])]}
          />
          <SelectField
            label={t('filters.severity')}
            value={filters.severity}
            onChange={(value) => onChange({ ...filters, severity: value as FiltersState['severity'] })}
            options={[[ 'all', t('filters.allSeverities') ], ...severityOptions.map((value) => [value, t(`severity.${value}` as TranslationKey)] as [string, string])]}
          />
          <SelectField
            label={t('filters.revision')}
            value={filters.revisionStatus}
            onChange={(value) => onChange({ ...filters, revisionStatus: value as FiltersState['revisionStatus'] })}
            options={[
              ['all', t('filters.allRevisionStates')],
              ...revisionStatusOptions.map((value) => [value, t(`revision.${value}` as TranslationKey)] as [string, string]),
            ]}
          />
          <SelectField
            label={t('filters.response')}
            value={filters.responseStatus}
            onChange={(value) => onChange({ ...filters, responseStatus: value as FiltersState['responseStatus'] })}
            options={[
              ['all', t('filters.allResponseStates')],
              ...responseStatusOptions.map((value) => [value, t(`response.${value}` as TranslationKey)] as [string, string]),
            ]}
          />
          <button className="button self-stretch whitespace-nowrap" type="button" onClick={() => onChange(emptyFilters)}>
            <RotateCcw size={16} aria-hidden="true" />
            {t('filters.clear')}
          </button>
        </div>
      </div>
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CommentListProps {
  comments: ReviewComment[];
  orderedComments: ReviewComment[];
  selectedId: string | null;
  t: (key: TranslationKey) => string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function CommentList({
  comments,
  orderedComments,
  selectedId,
  t,
  onSelect,
  onDelete,
  onDuplicate,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-600">
        {t('cards.noMatches')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => {
        const orderedIndex = orderedComments.findIndex((item) => item.id === comment.id);
        const isSelected = comment.id === selectedId;
        const warnings = getCommentWarnings(comment);

        return (
          <article
            key={comment.id}
            className={`rounded-md border bg-white p-3 transition ${
              isSelected ? 'border-blue-500 shadow-sm ring-2 ring-blue-100' : 'border-transparent shadow-sm hover:border-slate-200'
            }`}
          >
            <button className="block w-full text-left" type="button" onClick={() => onSelect(comment.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-normal text-blue-600">
                    {comment.reviewer} {'\u00b7'} {comment.commentLabel}
                  </p>
                  <h3 className="mt-1 break-words text-sm font-semibold text-slate-950">
                    {comment.shortTitle || t('cards.untitled')}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                  #{orderedIndex + 1}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{comment.originalComment}</p>
            </button>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatusChip label={t(`revision.${comment.revisionStatus}` as TranslationKey)} tone={revisionStatusOptions.indexOf(comment.revisionStatus)} />
              <StatusChip label={t(`response.${comment.responseStatus}` as TranslationKey)} tone={responseStatusOptions.indexOf(comment.responseStatus)} />
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  warnings.length > 0 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {warnings.length > 0 && <AlertCircle size={12} aria-hidden="true" />}
                {warnings.length > 0
                  ? formatText(t('cards.warningCount'), { count: warnings.length })
                  : t('cards.noWarningsShort')}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              <IconButton label={t('cards.duplicate')} onClick={() => onDuplicate(comment.id)}>
                <Copy size={14} aria-hidden="true" />
              </IconButton>
              <IconButton label={t('cards.delete')} danger onClick={() => onDelete(comment.id)}>
                <Trash2 size={14} aria-hidden="true" />
              </IconButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StatusChip({ label, tone }: { label: string; tone: number }) {
  const tones = [
    'bg-slate-50 text-slate-600',
    'bg-sky-50 text-sky-700',
    'bg-emerald-50 text-emerald-700',
    'bg-indigo-50 text-indigo-700',
    'bg-rose-50 text-rose-700',
  ];

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tones[tone] ?? tones[0]}`}>{label}</span>;
}

function IconButton({
  label,
  disabled,
  danger,
  children,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`button h-8 w-8 px-0 ${danger ? 'hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700' : ''}`}
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface CommentCardProps {
  comment: ReviewComment;
  t: (key: TranslationKey) => string;
  onUpdate: (id: string, patch: Partial<ReviewComment>) => void;
}

export function CommentCard({
  comment,
  t,
  onUpdate,
}: CommentCardProps) {
  const warnings = getCommentWarnings(comment);

  function update<K extends keyof ReviewComment>(key: K, value: ReviewComment[K]): void {
    onUpdate(comment.id, { [key]: value } as Partial<ReviewComment>);
  }

  return (
    <article className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-blue-600">
            {comment.reviewer} {'\u00b7'} {comment.commentLabel}
          </p>
          <h3 className="mt-1 break-words text-lg font-semibold text-slate-950">{comment.shortTitle || t('cards.untitled')}</h3>
        </div>
      </div>

      <div className="p-4">
        <section className="rounded-md bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            {warnings.length > 0 ? (
              <AlertCircle className="text-amber-500" size={16} aria-hidden="true" />
            ) : (
              <CheckCircle2 className="text-emerald-600" size={16} aria-hidden="true" />
            )}
            <h4 className="text-sm font-semibold text-slate-950">{t('cards.checklistHeading')}</h4>
          </div>
          {warnings.length > 0 ? (
            <ul className="space-y-1 text-sm text-slate-700">
              {warnings.map((warning) => (
                <li key={warning} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{t(getWarningKey(warning))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">{t('cards.readyForExport')}</p>
          )}
        </section>

        <EditorSection title={t('cards.sectionComment')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput
              label={t('cards.reviewerNumber')}
              value={getReviewerNumber(comment)}
              onChange={(value) => update('reviewer', formatReviewerLabel(value))}
            />
            <NumberInput
              label={t('cards.commentNumber')}
              value={getCommentNumber(comment)}
              onChange={(value) => update('commentLabel', formatCommentLabel(value))}
            />
            <TextInput label={t('cards.shortTitle')} value={comment.shortTitle} onChange={(value) => update('shortTitle', value)} />
            <SelectInput
              label={t('cards.category')}
              value={comment.category}
              options={categoryOptions.map((value) => [value, t(`category.${value}` as TranslationKey)])}
              onChange={(value) => update('category', value as ReviewComment['category'])}
            />
            <SelectInput
              label={t('cards.severity')}
              value={comment.severity}
              options={severityOptions.map((value) => [value, t(`severity.${value}` as TranslationKey)])}
              onChange={(value) => update('severity', value as ReviewComment['severity'])}
            />
          </div>
          <TextareaInput
            label={t('cards.originalComment')}
            value={comment.originalComment}
            onChange={(value) => update('originalComment', value)}
            rows={4}
          />
        </EditorSection>

        <EditorSection title={t('cards.sectionRevision')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectInput
              label={t('cards.manuscriptStatus')}
              value={comment.revisionStatus}
              options={revisionStatusOptions.map((value) => [value, t(`revision.${value}` as TranslationKey)])}
              onChange={(value) => update('revisionStatus', value as ReviewComment['revisionStatus'])}
            />
            <TextInput
              label={t('cards.manuscriptLocation')}
              value={comment.manuscriptLocation}
              onChange={(value) => update('manuscriptLocation', value)}
              placeholder={t('cards.manuscriptLocationPlaceholder')}
            />
          </div>
          <TextareaInput
            label={t('cards.plannedRevision')}
            value={comment.plannedRevision}
            onChange={(value) => update('plannedRevision', value)}
          />
          <TextareaInput
            label={t('cards.actualRevision')}
            value={comment.actualRevision}
            onChange={(value) => update('actualRevision', value)}
          />
        </EditorSection>

        <EditorSection title={t('cards.sectionResponse')}>
          <SelectInput
            label={t('cards.responseStatus')}
            value={comment.responseStatus}
            options={responseStatusOptions.map((value) => [value, t(`response.${value}` as TranslationKey)])}
            onChange={(value) => update('responseStatus', value as ReviewComment['responseStatus'])}
          />
          <TextareaInput
            label={t('cards.responseDraft')}
            value={comment.responseDraft}
            onChange={(value) => update('responseDraft', value)}
            rows={4}
          />
          <TextareaInput
            label={t('cards.decisionRationale')}
            value={comment.decisionRationale}
            onChange={(value) => update('decisionRationale', value)}
            placeholder={t('cards.decisionRationalePlaceholder')}
          />
        </EditorSection>
      </div>
    </article>
  );
}

function EditorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-slate-100 pt-5">
      <h4 className="mb-3 text-sm font-semibold text-slate-950">{title}</h4>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="field-label">{label}</span>
      <input className="input" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="field-label">{label}</span>
      <input
        className="input"
        min={1}
        type="number"
        value={Number.isFinite(value) ? value : 1}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="field-label">{label}</span>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaInput({
  label,
  value,
  placeholder,
  rows = 3,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="field-label">{label}</span>
      <textarea
        className="input"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

interface BulkImportProps {
  comments: ReviewComment[];
  t: (key: TranslationKey) => string;
  onImport: (comments: ReviewComment[]) => void;
}

export function BulkImport({ comments, t, onImport }: BulkImportProps) {
  const reviewers = useMemo(() => {
    const existing = getReviewers(comments);
    return existing.length > 0 ? existing : ['Reviewer 1'];
  }, [comments]);
  const [reviewer, setReviewer] = useState(reviewers[0] ?? 'Reviewer 1');
  const [text, setText] = useState('');
  const blocks = splitBulkComments(text);

  function handleImport(): void {
    if (blocks.length === 0) {
      return;
    }

    const existingForReviewer = comments.filter((comment) => comment.reviewer === reviewer).length;
    const nextOrder = comments.length;
    const imported = blocks.map((block, index) =>
      createCommentFromText(block, reviewer, nextOrder + index, existingForReviewer + index + 1),
    );
    onImport(imported);
    setText('');
  }

  return (
    <details className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
        {t('bulk.heading')}
        <span className="ml-2 font-normal text-slate-500">{t('bulk.description')}</span>
      </summary>

      <div className="mt-4 grid gap-3">
        <label className="space-y-1">
          <span className="field-label">{t('bulk.reviewer')}</span>
          <input className="input" list="bulk-reviewers" value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
          <datalist id="bulk-reviewers">
            {reviewers.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="space-y-1">
          <span className="field-label">{t('bulk.comments')}</span>
          <textarea
            className="input min-h-36"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('bulk.placeholder')}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-600">{formatText(t('bulk.cardsDetected'), { count: blocks.length })}</span>
        <button className="button button-primary" type="button" disabled={blocks.length === 0} onClick={handleImport}>
          <Import size={16} aria-hidden="true" />
          {t('bulk.importCards')}
        </button>
      </div>
    </details>
  );
}

interface ImportExportPanelProps {
  project: ReviewReplyProject;
  importStatus: string;
  t: (key: TranslationKey) => string;
  onImportProject: (project: ReviewReplyProject) => void;
  onImportStatus: (message: string) => void;
}

export function ImportExportPanel({
  project,
  importStatus,
  t,
  onImportProject,
  onImportStatus,
}: ImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleExportJson(): void {
    downloadTextFile('reviewreply-project.json', createProjectJson(project), 'application/json;charset=utf-8');
  }

  async function handleImportJson(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const raw = await file.text();
    const result = parseProjectJson(raw);
    if (!result.ok) {
      onImportStatus(t(result.error));
      event.target.value = '';
      return;
    }

    onImportProject(result.project);
    onImportStatus(t('backup.importSuccess'));
    event.target.value = '';
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{t('backup.heading')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('backup.description')}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="button" type="button" onClick={handleExportJson}>
          <Download size={16} aria-hidden="true" />
          {t('backup.exportJson')}
        </button>
        <button className="button" type="button" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} aria-hidden="true" />
          {t('backup.importJson')}
        </button>
      </div>

      <input ref={fileInputRef} className="hidden" type="file" accept="application/json,.json" onChange={handleImportJson} />
      {importStatus && <p className="mt-3 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{importStatus}</p>}
    </section>
  );
}

interface ResponsePreviewProps {
  markdown: string;
  copyStatus: string;
  t: (key: TranslationKey) => string;
  onCopy: () => void;
  onDownload: () => void;
}

export function ResponsePreview({ markdown, copyStatus, t, onCopy, onDownload }: ResponsePreviewProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{t('preview.heading')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t('preview.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="button" type="button" onClick={onCopy}>
            <Copy size={16} aria-hidden="true" />
            {t('preview.copyMarkdown')}
          </button>
          <button className="button" type="button" onClick={onDownload}>
            <Download size={16} aria-hidden="true" />
            {t('preview.download')}
          </button>
        </div>
      </div>
      {copyStatus && <p className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-blue-700">{copyStatus}</p>}
      <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap bg-slate-50/70 p-4 font-mono text-sm leading-6 text-slate-800">
        {markdown}
      </pre>
    </section>
  );
}

