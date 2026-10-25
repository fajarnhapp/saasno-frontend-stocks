export interface SearchPage {
    title: string;
    subtitle?: string;
    link: string;
}

interface MenuLike {
    id?: string;
    name?: string;
    url?: string;
    parentId?: string;
}

export const MAX_PAGES_EMPTY = 12;
export const MAX_PAGES_QUERY = 8;

// The pages a user can open, from the menus they were given (a menu with url "#" is only a group, not a page). Every word of the query
// has to appear in the page's name or in the name of its group; with no query the first pages are listed.
export function searchPages(menus: MenuLike[], query: string): SearchPage[] {
    const words: string[] = query.toLowerCase().split(/\s+/).filter(Boolean);
    const byId: Map<string | undefined, MenuLike> = new Map(menus.map((menu: MenuLike) => [menu.id, menu]));
    return menus
        .filter((menu: MenuLike) => menu.url && menu.url !== '#')
        .map((menu: MenuLike): SearchPage => ({
            title: menu.name ?? '',
            subtitle: menu.parentId ? byId.get(menu.parentId)?.name : undefined,
            link: menu.url ?? '',
        }))
        .filter((page: SearchPage) => {
            const text: string = `${page.title} ${page.subtitle ?? ''}`.toLowerCase();
            return words.every((word: string) => text.includes(word));
        })
        .slice(0, words.length > 0 ? MAX_PAGES_QUERY : MAX_PAGES_EMPTY);
}
