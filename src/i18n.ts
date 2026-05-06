export const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '简体中文' },
] as const;

export type LanguageCode = (typeof languageOptions)[number]['code'];

const en = {
  'language.label': 'Language',
  'app.tagline': 'Organize reviewer comments. Track manuscript revisions. Export response letters.',
  'app.workspaceTitle': 'Revision command center',
  'app.description':
    'ReviewReply helps authors turn reviewer comments into trackable revision tasks and a structured response letter. Your data stays in this browser unless you export it.',
  'app.storageWarning': 'Data is saved locally in your browser. Export JSON regularly to back up or move your project.',
  'app.firstRunStorageWarning':
    'Your data is stored locally in this browser. Export JSON regularly if this revision project is important.',
  'app.footerScope':
    'ReviewReply does not generate scientific arguments or automatically write responses. It helps authors organize reviewer comments, track revision status, and export a structured draft.',

  'firstRun.heading': 'Start a revision workspace',
  'firstRun.startSample': 'Start with sample data',
  'firstRun.startEmpty': 'Start empty',

  'project.title': 'Project title',
  'project.manuscriptTitle': 'Manuscript title',
  'project.untitled': 'Untitled Revision Project',
  'common.optional': 'Optional',
  'common.addCard': 'Add card',
  'tabs.edit': 'Edit',
  'tabs.preview': 'Preview',
  'tabs.backup': 'Backup',

  'dashboard.completion': 'Completion',
  'dashboard.totalCards': 'Total cards',
  'dashboard.unresolvedRevisions': 'Unresolved revisions',
  'dashboard.unfinishedResponses': 'Unfinished responses',
  'dashboard.majorOrCritical': 'Major or critical',
  'dashboard.declined': 'Declined',
  'dashboard.warnings': 'Warnings',
  'dashboard.noWarnings': 'No warnings for the current project.',

  'filters.heading': 'Find response units',
  'filters.tip':
    'Tip: Create one card for each issue that needs a separate response. If a reviewer paragraph contains multiple issues, split it into multiple cards.',
  'filters.clear': 'Clear filters',
  'filters.search': 'Search',
  'filters.searchPlaceholder': 'Title, comment, response...',
  'filters.reviewer': 'Reviewer',
  'filters.category': 'Category',
  'filters.severity': 'Severity',
  'filters.revision': 'Revision',
  'filters.response': 'Response',
  'filters.allReviewers': 'All reviewers',
  'filters.allCategories': 'All categories',
  'filters.allSeverities': 'All severities',
  'filters.allRevisionStates': 'All revision states',
  'filters.allResponseStates': 'All response states',

  'cards.showing': 'Showing {visible} of {total} cards in export order.',
  'cards.noMatches': 'No cards match the current filters.',
  'cards.queueHeading': 'Review queue',
  'cards.queueHelp': 'Cards are sorted automatically by Reviewer number and Comment number.',
  'cards.selectPrompt': 'Select a comment card from the review queue to edit it.',
  'cards.warningCount': '{count} warnings',
  'cards.noWarningsShort': 'No warnings',
  'cards.editorHeading': 'Selected response unit',
  'cards.checklistHeading': 'Completion checklist',
  'cards.readyForExport': 'This card is ready for export.',
  'cards.sectionComment': 'Reviewer comment',
  'cards.sectionRevision': 'Manuscript revision',
  'cards.sectionResponse': 'Response letter',
  'cards.untitled': 'Untitled card',
  'cards.newComment': 'New reviewer comment',
  'cards.copySuffix': 'copy',
  'cards.duplicate': 'Duplicate card',
  'cards.delete': 'Delete card',
  'cards.needsAttention': 'Needs attention',
  'cards.deleteConfirm': 'Delete this reviewer comment card? This cannot be undone.',
  'cards.reviewerNumber': 'Reviewer number',
  'cards.commentNumber': 'Comment number',
  'cards.shortTitle': 'Short title',
  'cards.category': 'Category',
  'cards.severity': 'Severity',
  'cards.manuscriptStatus': 'Manuscript status',
  'cards.responseStatus': 'Response status',
  'cards.manuscriptLocation': 'Manuscript location',
  'cards.manuscriptLocationPlaceholder': 'Section 4.2, Table 2, Page 6...',
  'cards.originalComment': 'Original reviewer comment',
  'cards.plannedRevision': 'Planned revision',
  'cards.actualRevision': 'Actual revision',
  'cards.responseDraft': 'Response draft',
  'cards.decisionRationale': 'Decision rationale',
  'cards.decisionRationalePlaceholder': 'Required when a suggestion is declined.',

  'bulk.heading': 'Bulk paste import',
  'bulk.description':
    'Paste multiple reviewer comments separated by blank lines or a line containing only three hyphens.',
  'bulk.reviewer': 'Reviewer for imported cards',
  'bulk.comments': 'Reviewer comments',
  'bulk.placeholder': 'The motivation is unclear.\n\n---\n\nThe baseline selection appears insufficient.',
  'bulk.cardsDetected': '{count} cards detected',
  'bulk.importCards': 'Import cards',

  'preview.heading': 'Response letter preview',
  'preview.description': 'The exported response letter is always generated in English for journal submission.',
  'preview.copyMarkdown': 'Copy Markdown',
  'preview.download': 'Download',
  'preview.copySuccess': 'Markdown copied to clipboard.',
  'preview.copyFailure': 'Clipboard permission was unavailable. Select the preview text and copy it manually.',

  'backup.heading': 'Backup and restore',
  'backup.description': 'JSON backup is required because this static app stores all project data in localStorage.',
  'backup.exportJson': 'Export JSON',
  'backup.importJson': 'Import JSON',
  'backup.resetData': 'Reset data',
  'backup.resetToStart': 'Reset',
  'backup.importSuccess': 'Project imported successfully.',
  'backup.resetConfirm':
    'This will delete all locally stored ReviewReply data in this browser. Export JSON first if you want a backup.',

  'error.notProject': 'The selected file is not a ReviewReply project object.',
  'error.unsupportedSchema': 'Unsupported ReviewReply schema version.',
  'error.projectTitles': 'The project title fields are missing or invalid.',
  'error.timestamps': 'The project timestamp fields are missing or invalid.',
  'error.comments': 'The project comments field is missing or invalid.',
  'error.commentInvalid': 'One or more comment cards are not compatible with ReviewReply v1.',
  'error.invalidJson': 'The selected file is not valid JSON.',

  'category.motivation': 'Motivation',
  'category.method': 'Method',
  'category.experiment': 'Experiment',
  'category.baseline': 'Baseline',
  'category.ablation': 'Ablation',
  'category.writing': 'Writing',
  'category.related_work': 'Related work',
  'category.limitation': 'Limitation',
  'category.formatting': 'Formatting',
  'category.other': 'Other',

  'severity.minor': 'Minor',
  'severity.moderate': 'Moderate',
  'severity.major': 'Major',
  'severity.critical': 'Critical',

  'revision.not_started': 'Not started',
  'revision.planned': 'Planned',
  'revision.revised': 'Revised',
  'revision.response_only': 'Response only',
  'revision.declined': 'Declined',

  'response.not_started': 'Not started',
  'response.drafted': 'Drafted',
  'response.needs_polish': 'Needs polish',
  'response.final': 'Final',

  'warning.majorCriticalNotRevised': 'Major or critical comment not revised',
  'warning.revisedMissingLocation': 'Revised card missing manuscript location',
  'warning.revisedMissingActual': 'Revised card missing actual revision',
  'warning.declinedMissingRationale': 'Declined card missing decision rationale',
  'warning.finalMissingDraft': 'Final response missing response draft',
  'warning.responseNotStarted': 'Response not started',
} as const;

export type TranslationKey = keyof typeof en;

type TranslationMap = Partial<Record<TranslationKey, string>>;

const zhCN: TranslationMap = {
  'language.label': '语言',
  'app.tagline': '整理审稿意见。追踪稿件修改。导出英文回复信。',
  'app.workspaceTitle': '返修工作台',
  'app.description':
    'ReviewReply 帮助作者把审稿意见转成可追踪的修改任务和结构化回复信。除非你主动导出，数据只保存在当前浏览器中。',
  'app.storageWarning': '数据保存在当前浏览器本地。请定期导出 JSON，用于备份或迁移项目。',
  'app.firstRunStorageWarning': '你的数据只保存在当前浏览器中。如果这个返修项目很重要，请定期导出 JSON。',
  'app.footerScope':
    'ReviewReply 不会生成科学论证，也不会自动撰写回复。它帮助作者组织审稿意见、追踪修改状态，并导出结构化英文草稿。',

  'firstRun.heading': '开始一个返修工作区',
  'firstRun.startSample': '使用示例数据开始',
  'firstRun.startEmpty': '从空项目开始',

  'project.title': '项目标题',
  'project.manuscriptTitle': '稿件标题',
  'project.untitled': '未命名返修项目',
  'common.optional': '可选',
  'common.addCard': '添加卡片',
  'tabs.edit': '编辑',
  'tabs.preview': '预览',
  'tabs.backup': '备份',

  'dashboard.completion': '完成度',
  'dashboard.totalCards': '卡片总数',
  'dashboard.unresolvedRevisions': '未完成稿件修改',
  'dashboard.unfinishedResponses': '未完成回复',
  'dashboard.majorOrCritical': '重要或关键意见',
  'dashboard.declined': '已拒绝建议',
  'dashboard.warnings': '提醒',
  'dashboard.noWarnings': '当前项目没有提醒。',

  'filters.heading': '查找回复单元',
  'filters.tip': '提示：每张卡片对应一个需要单独回复的问题。如果一段审稿意见包含多个问题，请拆成多张卡片。',
  'filters.clear': '清除筛选',
  'filters.search': '搜索',
  'filters.searchPlaceholder': '标题、意见、回复...',
  'filters.reviewer': '审稿人',
  'filters.category': '类别',
  'filters.severity': '严重程度',
  'filters.revision': '稿件修改',
  'filters.response': '回复状态',
  'filters.allReviewers': '全部审稿人',
  'filters.allCategories': '全部类别',
  'filters.allSeverities': '全部严重程度',
  'filters.allRevisionStates': '全部修改状态',
  'filters.allResponseStates': '全部回复状态',

  'cards.showing': '当前显示 {visible} / {total} 张卡片，顺序即导出顺序。',
  'cards.noMatches': '没有卡片匹配当前筛选条件。',
  'cards.queueHeading': '审稿意见队列',
  'cards.queueHelp': '卡片会按审稿人编号和意见编号自动排序。',
  'cards.selectPrompt': '请从审稿意见队列中选择一张卡片进行编辑。',
  'cards.warningCount': '{count} 条提醒',
  'cards.noWarningsShort': '无提醒',
  'cards.editorHeading': '当前回复单元',
  'cards.checklistHeading': '完成检查',
  'cards.readyForExport': '这张卡片已准备好导出。',
  'cards.sectionComment': '审稿意见',
  'cards.sectionRevision': '稿件修改',
  'cards.sectionResponse': '回复信',
  'cards.untitled': '未命名卡片',
  'cards.newComment': '新的审稿意见',
  'cards.copySuffix': '副本',
  'cards.duplicate': '复制卡片',
  'cards.delete': '删除卡片',
  'cards.needsAttention': '需要处理',
  'cards.deleteConfirm': '确定删除这张审稿意见卡片吗？此操作无法撤销。',
  'cards.reviewerNumber': '审稿人编号',
  'cards.commentNumber': '意见编号',
  'cards.shortTitle': '简短标题',
  'cards.category': '类别',
  'cards.severity': '严重程度',
  'cards.manuscriptStatus': '稿件状态',
  'cards.responseStatus': '回复状态',
  'cards.manuscriptLocation': '稿件修改位置',
  'cards.manuscriptLocationPlaceholder': '第 4.2 节、表 2、第 6 页...',
  'cards.originalComment': '原始审稿意见',
  'cards.plannedRevision': '计划修改',
  'cards.actualRevision': '实际修改',
  'cards.responseDraft': '英文回复草稿',
  'cards.decisionRationale': '决策理由',
  'cards.decisionRationalePlaceholder': '当拒绝采纳建议时必填。',

  'bulk.heading': '批量粘贴导入',
  'bulk.description': '粘贴多条审稿意见，可用空行或仅包含三个连字符的行分隔。',
  'bulk.reviewer': '导入卡片所属审稿人',
  'bulk.comments': '审稿意见',
  'bulk.placeholder': 'The motivation is unclear.\n\n---\n\nThe baseline selection appears insufficient.',
  'bulk.cardsDetected': '检测到 {count} 张卡片',
  'bulk.importCards': '导入卡片',

  'preview.heading': '回复信预览',
  'preview.description': '导出的回复信固定为英文，便于期刊或会议投稿。',
  'preview.copyMarkdown': '复制 Markdown',
  'preview.download': '下载',
  'preview.copySuccess': 'Markdown 已复制到剪贴板。',
  'preview.copyFailure': '无法获得剪贴板权限。请选中预览文本后手动复制。',

  'backup.heading': '备份与恢复',
  'backup.description': '由于这是纯静态应用，所有项目数据都保存在 localStorage 中，因此需要 JSON 备份。',
  'backup.exportJson': '导出 JSON',
  'backup.importJson': '导入 JSON',
  'backup.resetData': '重置数据',
  'backup.resetToStart': '重置',
  'backup.importSuccess': '项目导入成功。',
  'backup.resetConfirm': '这会删除当前浏览器中保存的所有 ReviewReply 数据。如果需要备份，请先导出 JSON。',

  'error.notProject': '所选文件不是 ReviewReply 项目对象。',
  'error.unsupportedSchema': '不支持的 ReviewReply 数据结构版本。',
  'error.projectTitles': '项目标题字段缺失或无效。',
  'error.timestamps': '项目时间戳字段缺失或无效。',
  'error.comments': '项目评论字段缺失或无效。',
  'error.commentInvalid': '一个或多个意见卡片与 ReviewReply v1 不兼容。',
  'error.invalidJson': '所选文件不是有效的 JSON。',

  'category.motivation': '研究动机',
  'category.method': '方法',
  'category.experiment': '实验',
  'category.baseline': '基线',
  'category.ablation': '消融实验',
  'category.writing': '写作',
  'category.related_work': '相关工作',
  'category.limitation': '局限性',
  'category.formatting': '格式',
  'category.other': '其他',

  'severity.minor': '轻微',
  'severity.moderate': '中等',
  'severity.major': '重要',
  'severity.critical': '关键',

  'revision.not_started': '未开始',
  'revision.planned': '已计划',
  'revision.revised': '已修改',
  'revision.response_only': '仅需回复',
  'revision.declined': '已拒绝',

  'response.not_started': '未开始',
  'response.drafted': '已起草',
  'response.needs_polish': '需润色',
  'response.final': '已定稿',

  'warning.majorCriticalNotRevised': '重要或关键意见尚未修改',
  'warning.revisedMissingLocation': '已修改卡片缺少稿件位置',
  'warning.revisedMissingActual': '已修改卡片缺少实际修改内容',
  'warning.declinedMissingRationale': '已拒绝卡片缺少决策理由',
  'warning.finalMissingDraft': '已定稿回复缺少回复草稿',
  'warning.responseNotStarted': '回复尚未开始',
};

const translations: Record<LanguageCode, TranslationMap> = {
  en,
  'zh-CN': zhCN,
};

export function isLanguageCode(value: string): value is LanguageCode {
  return languageOptions.some((option) => option.code === value);
}

export function detectInitialLanguage(): LanguageCode {
  return 'en';
}

export function createTranslator(language: LanguageCode) {
  return (key: TranslationKey): string => translations[language][key] ?? en[key];
}

export function formatText(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.split(`{${key}}`).join(String(value)),
    template,
  );
}

const warningKeys: Record<string, TranslationKey> = {
  'Major or critical comment not revised': 'warning.majorCriticalNotRevised',
  'Revised card missing manuscript location': 'warning.revisedMissingLocation',
  'Revised card missing actual revision': 'warning.revisedMissingActual',
  'Declined card missing decision rationale': 'warning.declinedMissingRationale',
  'Final response missing response draft': 'warning.finalMissingDraft',
  'Response not started': 'warning.responseNotStarted',
};

export function getWarningKey(label: string): TranslationKey {
  return warningKeys[label] ?? 'warning.responseNotStarted';
}
