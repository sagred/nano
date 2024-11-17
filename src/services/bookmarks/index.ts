export interface Bookmark {
  id: string;
  title: string;
  url: string;
  dateAdded?: number;
}

export class BookmarkService {
  async getBookmarks(): Promise<Bookmark[]> {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const bookmarks: Bookmark[] = [];
        
        const processNode = (node: chrome.bookmarks.BookmarkTreeNode) => {
          if (node.url) {
            bookmarks.push({
              id: node.id,
              title: node.title,
              url: node.url,
              dateAdded: node.dateAdded
            });
          }
          if (node.children) {
            node.children.forEach(processNode);
          }
        };
        
        bookmarkTreeNodes.forEach(processNode);
        resolve(bookmarks);
      });
    });
  }
}

export const bookmarkService = new BookmarkService(); 