// 所有类型定义

// Note 类型
export interface Note {
  images?: string[];
  text: string;
  tip?: string;
  x: number;
  y: number;
  time: number;
  data?: {
    day: string;
    note: string;
    tip?: string;
  };
}

// Article 类型
export interface Article {
  id: string;
  target: any;
  title: string;
  titleEdit: number;
  topicIds: string[];
  banner: string;
  originUrl: string;
  public: number;
  uniqueId: string;
}

// UserInfo 类型
export interface UserInfo {
  account: string;
  psw: string;
  password: string;
}

// Topic 类型
export interface Topic {
  id: string;
  name: string;
}

// CurrentNote 类型
export interface CurrentNote {
  open: boolean;
  data: {
    id: string;
    spaceTitle: string;
    day: string;
    note: string;
    summary: string;
    tip?: string;
  };
  qrcode: string;
}

// Card 类型
export interface Card {
  name: string;
  image: string;
  styleType: string;
  status: string;
  prog: string;
}

// Book 类型
export interface Book {
  book: {
    title: string;
    author: string;
  };
  noteCount: number;
  bookId: string;
}

// ArticleItem 类型
export interface ArticleItem {
  originUrl: string;
  title: string;
  extra: string;
}

// NotesProps 类型
export interface NotesProps {
  feynType?: 'close' | 'feynote' | 'weread' | 'linkrs';
  onTransPanel?: (type?: string) => void;
}

// FooterButtonsProps 类型
export interface FooterButtonsProps {
  article: Article;
  notes: Note[];
  isLoggedIn: boolean;
  showMoreTools?: boolean;
  onDownloadArticle: () => void;
  onShare: () => void;
  onRequireLogin: () => void;
  onClose?: () => void;
}

// SharingPanelProps 类型
export interface SharingPanelProps {
  visible: boolean;
  topics: Topic[];
  article: Article;
  notes: Note[];
  feynType: 'close' | 'feynote' | 'weread' | 'linkrs';
  onArticleChange: (article: Article) => void;
  onPublish: (articleData: any) => void;
  onClose: () => void;
}

// ContentAreaProps 类型
export interface ContentAreaProps {
  title: string;
  notes: Note[];
  isEditingTitle: boolean;
  onTitleChange: (title: string) => void;
  onEditTitle: () => void;
  onCreateCard: (note: Note) => void;
  onScrollToNote: (note: Note) => void;
}

// LoginFormProps 类型
export interface LoginFormProps {
  visible: boolean;
  onLogin: (account: string, password: string) => void;
  onCancel: () => void;
}

// UserHeaderProps 类型
export interface UserHeaderProps {
  userName: string;
  banner: string;
  isLoggedIn: boolean;
  articleUniqueId: string;
  onBannerChange: () => void;
  onLogout: () => void;
}
