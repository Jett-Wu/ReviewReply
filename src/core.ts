import { detectInitialLanguage, isLanguageCode, type LanguageCode, type TranslationKey } from './i18n';

export type CommentCategory =
  | 'motivation'
  | 'method'
  | 'experiment'
  | 'baseline'
  | 'ablation'
  | 'writing'
  | 'related_work'
  | 'limitation'
  | 'formatting'
  | 'other';

export type Severity = 'minor' | 'moderate' | 'major' | 'critical';

export type RevisionStatus =
  | 'not_started'
  | 'planned'
  | 'revised'
  | 'response_only'
  | 'declined';

export type ResponseStatus = 'not_started' | 'drafted' | 'needs_polish' | 'final';

export interface ReviewComment {
  id: string;
  orderIndex: number;
  reviewer: string;
  commentLabel: string;
  shortTitle: string;
  originalComment: string;
  category: CommentCategory;
  severity: Severity;
  revisionStatus: RevisionStatus;
  responseStatus: ResponseStatus;
  manuscriptLocation: string;
  plannedRevision: string;
  actualRevision: string;
  responseDraft: string;
  decisionRationale: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReplyProject {
  schemaVersion: 1;
  title: string;
  manuscriptTitle: string;
  createdAt: string;
  updatedAt: string;
  comments: ReviewComment[];
}

export interface FiltersState {
  reviewer: string;
  category: CommentCategory | 'all';
  severity: Severity | 'all';
  revisionStatus: RevisionStatus | 'all';
  responseStatus: ResponseStatus | 'all';
  search: string;
}

export interface DashboardMetrics {
  totalCards: number;
  unresolvedRevisions: number;
  unfinishedResponses: number;
  majorOrCritical: number;
  declined: number;
  completionPercentage: number;
  warningCount: number;
}

export interface CommentWarning {
  commentId: string;
  label: string;
}

export const categoryOptions: CommentCategory[] = [
  'motivation',
  'method',
  'experiment',
  'baseline',
  'ablation',
  'writing',
  'related_work',
  'limitation',
  'formatting',
  'other',
];

export const severityOptions: Severity[] = ['minor', 'moderate', 'major', 'critical'];

export const revisionStatusOptions: RevisionStatus[] = [
  'not_started',
  'planned',
  'revised',
  'response_only',
  'declined',
];

export const responseStatusOptions: ResponseStatus[] = [
  'not_started',
  'drafted',
  'needs_polish',
  'final',
];

export const emptyFilters: FiltersState = {
  reviewer: 'all',
  category: 'all',
  severity: 'all',
  revisionStatus: 'all',
  responseStatus: 'all',
  search: '',
};

export function createId(): string {
  return `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getReviewerNumber(comment: Pick<ReviewComment, 'reviewer'>): number {
  return parseLabelNumber(comment.reviewer);
}

export function getCommentNumber(comment: Pick<ReviewComment, 'commentLabel'>): number {
  return parseLabelNumber(comment.commentLabel);
}

export function formatReviewerLabel(value: number): string {
  return `Reviewer ${Math.max(1, Math.floor(value) || 1)}`;
}

export function formatCommentLabel(value: number): string {
  return `Comment ${Math.max(1, Math.floor(value) || 1)}`;
}

function parseLabelNumber(label: string): number {
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

export function createEmptyProject(): ReviewReplyProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    title: 'Untitled Revision Project',
    manuscriptTitle: '',
    createdAt: now,
    updatedAt: now,
    comments: [],
  };
}

export function createEmptyComment(orderIndex: number): ReviewComment {
  const now = new Date().toISOString();
  return {
    id: createId(),
    orderIndex,
    reviewer: 'Reviewer 1',
    commentLabel: `Comment ${orderIndex + 1}`,
    shortTitle: 'New reviewer comment',
    originalComment: '',
    category: 'other',
    severity: 'moderate',
    revisionStatus: 'not_started',
    responseStatus: 'not_started',
    manuscriptLocation: '',
    plannedRevision: '',
    actualRevision: '',
    responseDraft: '',
    decisionRationale: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function sortComments(comments: ReviewComment[]): ReviewComment[] {
  return [...comments].sort((a, b) => {
    const reviewerDelta = getReviewerNumber(a) - getReviewerNumber(b);
    if (reviewerDelta !== 0) {
      return reviewerDelta;
    }

    const commentDelta = getCommentNumber(a) - getCommentNumber(b);
    if (commentDelta !== 0) {
      return commentDelta;
    }

    return a.orderIndex - b.orderIndex;
  });
}

export function normalizeOrder(comments: ReviewComment[]): ReviewComment[] {
  return sortComments(comments).map((comment, index) => ({ ...comment, orderIndex: index }));
}

export function getReviewers(comments: ReviewComment[]): string[] {
  return Array.from(new Set(sortComments(comments).map((comment) => comment.reviewer))).filter(Boolean);
}

export function isCommentComplete(comment: ReviewComment): boolean {
  if (comment.responseStatus !== 'final') {
    return false;
  }

  if (comment.revisionStatus === 'revised') {
    return Boolean(comment.actualRevision.trim() && comment.manuscriptLocation.trim());
  }

  if (comment.revisionStatus === 'response_only') {
    return Boolean(comment.responseDraft.trim());
  }

  if (comment.revisionStatus === 'declined') {
    return Boolean(comment.decisionRationale.trim() && comment.responseDraft.trim());
  }

  return false;
}

export function getCommentWarnings(comment: ReviewComment): string[] {
  const warnings: string[] = [];

  if ((comment.severity === 'major' || comment.severity === 'critical') && comment.revisionStatus !== 'revised') {
    warnings.push('Major or critical comment not revised');
  }

  if (comment.revisionStatus === 'revised' && !comment.manuscriptLocation.trim()) {
    warnings.push('Revised card missing manuscript location');
  }

  if (comment.revisionStatus === 'revised' && !comment.actualRevision.trim()) {
    warnings.push('Revised card missing actual revision');
  }

  if (comment.revisionStatus === 'declined' && !comment.decisionRationale.trim()) {
    warnings.push('Declined card missing decision rationale');
  }

  if (comment.responseStatus === 'final' && !comment.responseDraft.trim()) {
    warnings.push('Final response missing response draft');
  }

  if (comment.responseStatus === 'not_started') {
    warnings.push('Response not started');
  }

  return warnings;
}

export function collectWarnings(comments: ReviewComment[]): CommentWarning[] {
  return sortComments(comments).flatMap((comment) =>
    getCommentWarnings(comment).map((label) => ({ commentId: comment.id, label })),
  );
}

export function getDashboardMetrics(comments: ReviewComment[]): DashboardMetrics {
  const totalCards = comments.length;
  const completeCards = comments.filter(isCommentComplete).length;
  const warningCount = collectWarnings(comments).length;

  return {
    totalCards,
    unresolvedRevisions: comments.filter((comment) =>
      ['not_started', 'planned'].includes(comment.revisionStatus),
    ).length,
    unfinishedResponses: comments.filter((comment) => comment.responseStatus !== 'final').length,
    majorOrCritical: comments.filter((comment) => ['major', 'critical'].includes(comment.severity)).length,
    declined: comments.filter((comment) => comment.revisionStatus === 'declined').length,
    completionPercentage: totalCards === 0 ? 0 : Math.round((completeCards / totalCards) * 100),
    warningCount,
  };
}

export function filterComments(comments: ReviewComment[], filters: FiltersState): ReviewComment[] {
  const query = filters.search.trim().toLowerCase();

  return sortComments(comments).filter((comment) => {
    const fields = [
      comment.shortTitle,
      comment.originalComment,
      comment.plannedRevision,
      comment.actualRevision,
      comment.responseDraft,
      comment.manuscriptLocation,
    ];

    return (
      (filters.reviewer === 'all' || comment.reviewer === filters.reviewer) &&
      (filters.category === 'all' || comment.category === filters.category) &&
      (filters.severity === 'all' || comment.severity === filters.severity) &&
      (filters.revisionStatus === 'all' || comment.revisionStatus === filters.revisionStatus) &&
      (filters.responseStatus === 'all' || comment.responseStatus === filters.responseStatus) &&
      (!query || fields.some((field) => field.toLowerCase().includes(query)))
    );
  });
}

export function createCommentFromText(text: string, reviewer: string, orderIndex: number, labelIndex: number): ReviewComment {
  const now = new Date().toISOString();
  const words = text.trim().replace(/\s+/g, ' ').split(' ').slice(0, 12);

  return {
    id: createId(),
    orderIndex,
    reviewer,
    commentLabel: `Comment ${labelIndex}`,
    shortTitle: words.join(' ') || 'Imported comment',
    originalComment: text.trim(),
    category: 'other',
    severity: 'moderate',
    revisionStatus: 'not_started',
    responseStatus: 'not_started',
    manuscriptLocation: '',
    plannedRevision: '',
    actualRevision: '',
    responseDraft: '',
    decisionRationale: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function splitBulkComments(input: string): string[] {
  return input
    .replace(/\r\n/g, '\n')
    .split(/\n\s*---\s*\n|\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);
}

export const sampleProject: ReviewReplyProject = {
  schemaVersion: 1,
  title: 'Sample Major Revision',
  manuscriptTitle: 'A Sample Manuscript on Reliable Research Workflows',
  createdAt: '2026-05-06T00:00:00.000Z',
  updatedAt: '2026-05-06T00:00:00.000Z',
  comments: [
    {
      id: 'sample-r1-motivation',
      orderIndex: 0,
      reviewer: 'Reviewer 1',
      commentLabel: 'Comment 1',
      shortTitle: 'Motivation is unclear',
      originalComment:
        'The motivation of the proposed method is not sufficiently clear. Please explain why the problem matters and why existing approaches are inadequate.',
      category: 'motivation',
      severity: 'major',
      revisionStatus: 'revised',
      responseStatus: 'final',
      manuscriptLocation: 'Section 1, Paragraphs 2-3',
      plannedRevision: 'Clarify the research gap and the practical motivation in the introduction.',
      actualRevision:
        'We rewrote the introduction to state the practical problem, identify limitations in prior work, and connect those limitations to our contribution.',
      responseDraft:
        'Thank you for pointing this out. We revised the introduction to make the motivation explicit and to clarify why the problem is important.',
      decisionRationale: '',
      createdAt: '2026-05-06T00:00:00.000Z',
      updatedAt: '2026-05-06T00:00:00.000Z',
    },
    {
      id: 'sample-r1-implementation',
      orderIndex: 1,
      reviewer: 'Reviewer 1',
      commentLabel: 'Comment 2',
      shortTitle: 'Implementation details are missing',
      originalComment:
        'The implementation section lacks enough detail to reproduce the experiments, especially the optimizer settings and hardware environment.',
      category: 'method',
      severity: 'moderate',
      revisionStatus: 'planned',
      responseStatus: 'drafted',
      manuscriptLocation: '',
      plannedRevision: 'Add optimizer settings, random seeds, software versions, and hardware details.',
      actualRevision: '',
      responseDraft:
        'We agree that the implementation details should be more complete. We will add the missing settings to improve reproducibility.',
      decisionRationale: '',
      createdAt: '2026-05-06T00:00:00.000Z',
      updatedAt: '2026-05-06T00:00:00.000Z',
    },
    {
      id: 'sample-r2-baselines',
      orderIndex: 2,
      reviewer: 'Reviewer 2',
      commentLabel: 'Comment 1',
      shortTitle: 'Baseline selection insufficient',
      originalComment:
        'The experimental comparison should include stronger and more recent baselines. The current baseline set does not fully support the claims.',
      category: 'baseline',
      severity: 'critical',
      revisionStatus: 'revised',
      responseStatus: 'needs_polish',
      manuscriptLocation: 'Section 4.2 and Table 2',
      plannedRevision: 'Add two recent baselines and describe why they are relevant.',
      actualRevision:
        'We added Baseline A and Baseline B to Table 2 and expanded the experimental setup to describe the comparison protocol.',
      responseDraft:
        'Thank you for this important suggestion. We added two recent baselines and updated the discussion of the comparison protocol.',
      decisionRationale: '',
      createdAt: '2026-05-06T00:00:00.000Z',
      updatedAt: '2026-05-06T00:00:00.000Z',
    },
    {
      id: 'sample-r2-ablation',
      orderIndex: 3,
      reviewer: 'Reviewer 2',
      commentLabel: 'Comment 2',
      shortTitle: 'Ablation interpretation unclear',
      originalComment:
        'The ablation study is useful, but the interpretation is unclear. Please explain what each component contributes.',
      category: 'ablation',
      severity: 'major',
      revisionStatus: 'not_started',
      responseStatus: 'not_started',
      manuscriptLocation: '',
      plannedRevision: '',
      actualRevision: '',
      responseDraft: '',
      decisionRationale: '',
      createdAt: '2026-05-06T00:00:00.000Z',
      updatedAt: '2026-05-06T00:00:00.000Z',
    },
    {
      id: 'sample-r3-response-only',
      orderIndex: 4,
      reviewer: 'Reviewer 3',
      commentLabel: 'Comment 1',
      shortTitle: 'Clarify terminology in response',
      originalComment:
        'The term "workflow reliability" could be interpreted in multiple ways. Please clarify your intended meaning.',
      category: 'writing',
      severity: 'minor',
      revisionStatus: 'response_only',
      responseStatus: 'final',
      manuscriptLocation: 'No manuscript change',
      plannedRevision: 'Explain terminology in the response letter.',
      actualRevision: '',
      responseDraft:
        'Thank you for raising this point. In this manuscript, we use "workflow reliability" to refer to the consistency of revision tracking and response preparation across reviewer comments.',
      decisionRationale: '',
      createdAt: '2026-05-06T00:00:00.000Z',
      updatedAt: '2026-05-06T00:00:00.000Z',
    },
    {
      id: 'sample-r3-declined',
      orderIndex: 5,
      reviewer: 'Reviewer 3',
      commentLabel: 'Comment 2',
      shortTitle: 'Request for out-of-scope experiment',
      originalComment:
        'Please add a large-scale user study to validate the proposed workflow with hundreds of researchers.',
      category: 'experiment',
      severity: 'moderate',
      revisionStatus: 'declined',
      responseStatus: 'drafted',
      manuscriptLocation: 'No manuscript change',
      plannedRevision: '',
      actualRevision: '',
      responseDraft:
        'We appreciate the suggestion. A large-scale user study would be valuable, but it is outside the scope of the current revision.',
      decisionRationale:
        'The requested study would require a separate recruitment process and protocol. We instead added a limitation paragraph discussing this direction.',
      createdAt: '2026-05-06T00:00:00.000Z',
      updatedAt: '2026-05-06T00:00:00.000Z',
    },
  ],
};

function quoteComment(text: string): string {
  const content = text.trim() || '[TODO: original comment missing]';
  return content
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function revisionBlock(comment: ReviewComment): string {
  if (comment.revisionStatus === 'declined') {
    return `**Rationale:**\n${comment.decisionRationale.trim() || '[TODO: decision rationale missing]'}`;
  }

  if (comment.revisionStatus === 'response_only') {
    return '**Revision:**\nNo manuscript change.';
  }

  if (comment.revisionStatus === 'revised') {
    const location = comment.manuscriptLocation.trim() || '[TODO: manuscript location missing]';
    const actual = comment.actualRevision.trim() || '[TODO: actual revision missing]';
    return `**Revision:**\n${location}. ${actual}`;
  }

  return `**Revision:**\n${comment.plannedRevision.trim() || '[TODO: revision plan not written]'}`;
}

function renderCard(comment: ReviewComment): string {
  const heading = `${comment.commentLabel}${comment.shortTitle.trim() ? `: ${comment.shortTitle.trim()}` : ''}`;
  const response = comment.responseDraft.trim() || '[TODO: response not written]';

  // Keep incomplete cards in the export so authors do not accidentally omit reviewer issues.
  return [
    `### ${heading}`,
    '',
    quoteComment(comment.originalComment),
    '',
    '**Response:**',
    response,
    '',
    revisionBlock(comment),
  ].join('\n');
}

export function generateMarkdown(project: ReviewReplyProject): string {
  const ordered = sortComments(project.comments);
  const reviewerOrder = Array.from(new Set(ordered.map((comment) => comment.reviewer)));
  const sections = reviewerOrder.map((reviewer) => {
    const cards = ordered.filter((comment) => comment.reviewer === reviewer);
    return [`## ${reviewer}`, '', cards.map(renderCard).join('\n\n')].join('\n');
  });

  return [
    '# Response to Reviewers',
    '',
    'Dear Editor and Reviewers,',
    '',
    'We sincerely thank the editor and reviewers for their constructive comments. Below we provide a point-by-point response.',
    '',
    ...sections,
    '',
  ].join('\n');
}

const categorySet = new Set<CommentCategory>(categoryOptions);
const severitySet = new Set<Severity>(severityOptions);
const revisionStatusSet = new Set<RevisionStatus>(revisionStatusOptions);
const responseStatusSet = new Set<ResponseStatus>(responseStatusOptions);

export interface ImportResult {
  ok: true;
  project: ReviewReplyProject;
}

export interface ImportErrorResult {
  ok: false;
  error: TranslationKey;
}

export type ParsedImport = ImportResult | ImportErrorResult;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function validateComment(value: unknown): ReviewComment | null {
  if (!isRecord(value)) {
    return null;
  }

  const comment = value as Record<keyof ReviewComment, unknown>;
  const id = comment.id;
  const reviewer = comment.reviewer;
  const commentLabel = comment.commentLabel;
  const shortTitle = comment.shortTitle;
  const originalComment = comment.originalComment;
  const manuscriptLocation = comment.manuscriptLocation;
  const plannedRevision = comment.plannedRevision;
  const actualRevision = comment.actualRevision;
  const responseDraft = comment.responseDraft;
  const decisionRationale = comment.decisionRationale;
  const createdAt = comment.createdAt;
  const updatedAt = comment.updatedAt;

  const requiredStrings: Array<keyof ReviewComment> = [
    'id',
    'reviewer',
    'commentLabel',
    'shortTitle',
    'originalComment',
    'manuscriptLocation',
    'plannedRevision',
    'actualRevision',
    'responseDraft',
    'decisionRationale',
    'createdAt',
    'updatedAt',
  ];

  const hasStrings = requiredStrings.every((key) => isString(comment[key]));
  const category = comment.category as CommentCategory;
  const severity = comment.severity as Severity;
  const revisionStatus = comment.revisionStatus as RevisionStatus;
  const responseStatus = comment.responseStatus as ResponseStatus;

  if (
    !hasStrings ||
    typeof comment.orderIndex !== 'number' ||
    !categorySet.has(category) ||
    !severitySet.has(severity) ||
    !revisionStatusSet.has(revisionStatus) ||
    !responseStatusSet.has(responseStatus)
  ) {
    return null;
  }

  return {
    id: id as string,
    orderIndex: comment.orderIndex,
    reviewer: reviewer as string,
    commentLabel: commentLabel as string,
    shortTitle: shortTitle as string,
    originalComment: originalComment as string,
    category,
    severity,
    revisionStatus,
    responseStatus,
    manuscriptLocation: manuscriptLocation as string,
    plannedRevision: plannedRevision as string,
    actualRevision: actualRevision as string,
    responseDraft: responseDraft as string,
    decisionRationale: decisionRationale as string,
    createdAt: createdAt as string,
    updatedAt: updatedAt as string,
  };
}

export function validateProjectPayload(value: unknown): ParsedImport {
  if (!isRecord(value)) {
    return { ok: false, error: 'error.notProject' };
  }

  if (value.schemaVersion !== 1) {
    return { ok: false, error: 'error.unsupportedSchema' };
  }

  if (!isString(value.title) || !isString(value.manuscriptTitle)) {
    return { ok: false, error: 'error.projectTitles' };
  }

  if (!isString(value.createdAt) || !isString(value.updatedAt)) {
    return { ok: false, error: 'error.timestamps' };
  }

  if (!Array.isArray(value.comments)) {
    return { ok: false, error: 'error.comments' };
  }

  const comments = value.comments.map(validateComment);
  if (comments.some((comment) => comment === null)) {
    return { ok: false, error: 'error.commentInvalid' };
  }

  return {
    ok: true,
    project: {
      schemaVersion: 1,
      title: value.title,
      manuscriptTitle: value.manuscriptTitle,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
      comments: comments as ReviewComment[],
    },
  };
}

export function parseProjectJson(rawJson: string): ParsedImport {
  try {
    return validateProjectPayload(JSON.parse(rawJson));
  } catch {
    return { ok: false, error: 'error.invalidJson' };
  }
}

export function createProjectJson(project: ReviewReplyProject): string {
  return JSON.stringify(project, null, 2);
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const STORAGE_KEY = 'reviewreply_project_v1';
export const FIRST_RUN_KEY = 'reviewreply_first_run_completed_v1';
export const LANGUAGE_KEY = 'reviewreply_language_v2';

export function loadProject(): ReviewReplyProject {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return createEmptyProject();
  }

  try {
    const parsed = JSON.parse(stored);
    const result = validateProjectPayload(parsed);
    return result.ok ? result.project : createEmptyProject();
  } catch {
    return createEmptyProject();
  }
}

export function saveProject(project: ReviewReplyProject): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function resetStoredProject(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FIRST_RUN_KEY);
}

export function isFirstRunComplete(): boolean {
  return localStorage.getItem(FIRST_RUN_KEY) === 'true';
}

export function markFirstRunComplete(): void {
  localStorage.setItem(FIRST_RUN_KEY, 'true');
}

export function loadLanguage(): LanguageCode {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored && isLanguageCode(stored) ? stored : detectInitialLanguage();
}

export function saveLanguage(language: LanguageCode): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}

