import { useEffect, useMemo, useState } from 'react';
import {
  BulkImport,
  CommentCard,
  CommentList,
  Dashboard,
  Filters,
  Header,
  ImportExportPanel,
  LanguageSwitcher,
  ResponsePreview,
} from './components';
import {
  collectWarnings,
  createEmptyComment,
  createEmptyProject,
  emptyFilters,
  filterComments,
  formatCommentLabel,
  FiltersState,
  getCommentNumber,
  getDashboardMetrics,
  normalizeOrder,
  ReviewComment,
  ReviewReplyProject,
  sortComments,
  generateMarkdown,
  isFirstRunComplete,
  loadLanguage,
  loadProject,
  markFirstRunComplete,
  resetStoredProject,
  sampleProject,
  saveLanguage,
  saveProject,
  downloadTextFile,
} from './core';
import { createTranslator, formatText, LanguageCode } from './i18n';
import { Plus } from 'lucide-react';

type WorkspacePanel = 'edit' | 'preview' | 'backup';

export default function App() {
  const [project, setProject] = useState<ReviewReplyProject>(() => loadProject());
  const [firstRun, setFirstRun] = useState(() => !isFirstRunComplete());
  const [language, setLanguage] = useState<LanguageCode>(() => loadLanguage());
  const [filters, setFilters] = useState<FiltersState>(emptyFilters);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<WorkspacePanel>('edit');
  const [copyStatus, setCopyStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const t = useMemo(() => createTranslator(language), [language]);

  useEffect(() => {
    if (!firstRun) {
      saveProject(project);
    }
  }, [firstRun, project]);

  useEffect(() => {
    saveLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const orderedComments = useMemo(() => sortComments(project.comments), [project.comments]);
  const visibleComments = useMemo(() => filterComments(project.comments, filters), [project.comments, filters]);
  const metrics = useMemo(() => getDashboardMetrics(project.comments), [project.comments]);
  const warnings = useMemo(() => collectWarnings(project.comments), [project.comments]);
  const markdown = useMemo(() => generateMarkdown(project), [project]);
  const selectedComment = useMemo(
    () => orderedComments.find((comment) => comment.id === selectedCommentId) ?? orderedComments[0] ?? null,
    [orderedComments, selectedCommentId],
  );

  useEffect(() => {
    if (!selectedCommentId && orderedComments.length > 0) {
      setSelectedCommentId(orderedComments[0].id);
      return;
    }

    if (selectedCommentId && !orderedComments.some((comment) => comment.id === selectedCommentId)) {
      setSelectedCommentId(orderedComments[0]?.id ?? null);
    }
  }, [orderedComments, selectedCommentId]);

  function commitProject(nextProject: ReviewReplyProject): void {
    setProject({ ...nextProject, updatedAt: new Date().toISOString() });
  }

  function startWithProject(nextProject: ReviewReplyProject): void {
    markFirstRunComplete();
    setFirstRun(false);
    commitProject(nextProject);
  }

  function createLocalizedEmptyProject(): ReviewReplyProject {
    return { ...createEmptyProject(), title: t('project.untitled') };
  }

  function updateProject(patch: Partial<Pick<ReviewReplyProject, 'title' | 'manuscriptTitle'>>): void {
    commitProject({ ...project, ...patch });
  }

  function addComment(): void {
    const nextCommentNumber = getNextCommentNumber(project.comments, 'Reviewer 1');
    const nextComment = {
      ...createEmptyComment(project.comments.length),
      commentLabel: formatCommentLabel(nextCommentNumber),
      shortTitle: t('cards.newComment'),
    };
    commitProject({ ...project, comments: [...project.comments, nextComment] });
    setSelectedCommentId(nextComment.id);
  }

  function updateComment(id: string, patch: Partial<ReviewComment>): void {
    const now = new Date().toISOString();
    commitProject({
      ...project,
      comments: project.comments.map((comment) =>
        comment.id === id ? { ...comment, ...patch, updatedAt: now } : comment,
      ),
    });
  }

  function deleteComment(id: string): void {
    const ok = window.confirm(t('cards.deleteConfirm'));
    if (!ok) {
      return;
    }

    const ordered = sortComments(project.comments);
    const deletedIndex = ordered.findIndex((comment) => comment.id === id);
    const remaining = normalizeOrder(project.comments.filter((comment) => comment.id !== id));
    commitProject({ ...project, comments: remaining });
    setSelectedCommentId(remaining[Math.max(0, deletedIndex - 1)]?.id ?? remaining[0]?.id ?? null);
  }

  function duplicateComment(id: string): void {
    const source = project.comments.find((comment) => comment.id === id);
    if (!source) {
      return;
    }

    const now = new Date().toISOString();
    const duplicate: ReviewComment = {
      ...source,
      id: `${source.id}_copy_${Date.now()}`,
      orderIndex: source.orderIndex + 0.5,
      commentLabel: formatCommentLabel(getNextCommentNumber(project.comments, source.reviewer)),
      shortTitle: `${source.shortTitle} ${t('cards.copySuffix')}`,
      createdAt: now,
      updatedAt: now,
    };

    commitProject({ ...project, comments: normalizeOrder([...project.comments, duplicate]) });
    setSelectedCommentId(duplicate.id);
  }

  function importCards(cards: ReviewComment[]): void {
    commitProject({ ...project, comments: normalizeOrder([...project.comments, ...cards]) });
    setSelectedCommentId(cards[0]?.id ?? selectedCommentId);
    setActivePanel('edit');
  }

  function selectComment(id: string): void {
    setSelectedCommentId(id);
    setActivePanel('edit');
  }

  async function copyMarkdown(): Promise<void> {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus(t('preview.copySuccess'));
    } catch {
      setCopyStatus(t('preview.copyFailure'));
    }
  }

  function downloadMarkdown(): void {
    downloadTextFile('response-letter.md', markdown, 'text/markdown;charset=utf-8');
  }

  function importProject(nextProject: ReviewReplyProject): void {
    markFirstRunComplete();
    setFirstRun(false);
    commitProject({ ...nextProject, comments: normalizeOrder(nextProject.comments) });
  }

  function resetData(): void {
    const ok = window.confirm(t('backup.resetConfirm'));
    if (!ok) {
      return;
    }

    resetStoredProject();
    setProject(createLocalizedEmptyProject());
    setFilters(emptyFilters);
    setSelectedCommentId(null);
    setActivePanel('edit');
    setFirstRun(true);
    setImportStatus('');
  }

  if (firstRun) {
    return (
      <main className="min-h-screen bg-[#f5f5f7]">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-12">
          <div className="rounded-md border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm font-semibold uppercase tracking-normal text-blue-600">ReviewReply</p>
              <LanguageSwitcher language={language} t={t} onChange={setLanguage} />
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">{t('firstRun.heading')}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">{t('app.tagline')}</p>
            <p className="mt-5 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t('app.firstRunStorageWarning')}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="button button-primary min-h-16" type="button" onClick={() => startWithProject(sampleProject)}>
                {t('firstRun.startSample')}
              </button>
              <button className="button min-h-16" type="button" onClick={() => startWithProject(createLocalizedEmptyProject())}>
                {t('firstRun.startEmpty')}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header
        project={project}
        language={language}
        t={t}
        onProjectChange={updateProject}
        onLanguageChange={setLanguage}
        onReset={resetData}
      />
      <Dashboard metrics={metrics} warnings={warnings} t={t} />
      <Filters comments={project.comments} filters={filters} t={t} onChange={setFilters} />

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(20rem,0.72fr)_minmax(0,1.28fr)] lg:px-8">
        <section className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{t('cards.queueHeading')}</h2>
              <p className="text-sm text-slate-600">
                {formatText(t('cards.showing'), { visible: visibleComments.length, total: orderedComments.length })}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t('cards.queueHelp')}</p>
            </div>
            <button className="button button-primary shrink-0" type="button" onClick={addComment}>
              <Plus size={16} aria-hidden="true" />
              {t('common.addCard')}
            </button>
          </div>
          <CommentList
            comments={visibleComments}
            orderedComments={orderedComments}
            selectedId={selectedComment?.id ?? null}
            t={t}
            onSelect={selectComment}
            onDelete={deleteComment}
            onDuplicate={duplicateComment}
          />
          <BulkImport comments={project.comments} t={t} onImport={importCards} />
        </section>

        <aside className="space-y-4">
          <div className="flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <PanelButton active={activePanel === 'edit'} label={t('tabs.edit')} onClick={() => setActivePanel('edit')} />
            <PanelButton active={activePanel === 'preview'} label={t('tabs.preview')} onClick={() => setActivePanel('preview')} />
            <PanelButton active={activePanel === 'backup'} label={t('tabs.backup')} onClick={() => setActivePanel('backup')} />
          </div>

          {activePanel === 'edit' && (
            <section>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-slate-950">{t('cards.editorHeading')}</h2>
              </div>
              {selectedComment ? (
                <CommentCard
                  comment={selectedComment}
                  t={t}
                  onUpdate={updateComment}
                />
              ) : (
                <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                  {t('cards.selectPrompt')}
                </div>
              )}
            </section>
          )}

          {activePanel === 'preview' && (
            <ResponsePreview
              markdown={markdown}
              copyStatus={copyStatus}
              t={t}
              onCopy={copyMarkdown}
              onDownload={downloadMarkdown}
            />
          )}

          {activePanel === 'backup' && (
            <ImportExportPanel
              project={project}
              importStatus={importStatus}
              t={t}
              onImportProject={importProject}
              onImportStatus={setImportStatus}
            />
          )}
        </aside>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-slate-600 sm:px-6 lg:px-8">
          {t('app.footerScope')}
        </div>
      </footer>
    </div>
  );
}

function getNextCommentNumber(comments: ReviewComment[], reviewer: string): number {
  const reviewerComments = comments.filter((comment) => comment.reviewer === reviewer);
  if (reviewerComments.length === 0) {
    return 1;
  }

  return Math.max(...reviewerComments.map(getCommentNumber)) + 1;
}

function PanelButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`min-h-9 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
      }`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
