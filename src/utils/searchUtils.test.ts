import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MAX_PAGES_EMPTY, MAX_PAGES_QUERY, searchPages } from './searchUtils.ts';

const menus = [
    { id: 'DASHBOARD', name: 'Dashboard', url: '/dashboard' },
    { id: 'SYSTEM', name: 'Sistem', url: '#' },
    { id: 'USER', name: 'User', url: '/system/user', parentId: 'SYSTEM' },
    { id: 'ROLE', name: 'Role', url: '/system/role', parentId: 'SYSTEM' },
    { id: 'ROLE_MENU', name: 'Role Menu', url: '/system/role-menu', parentId: 'SYSTEM' },
];

describe('searchPages', () => {
    it('lists pages, never groups, when there is no query', () => {
        const pages = searchPages(menus, '');
        assert.deepEqual(pages.map((p) => p.link), ['/dashboard', '/system/user', '/system/role', '/system/role-menu']);
    });

    it('shows the group of a page as its subtitle', () => {
        const page = searchPages(menus, 'user')[0];
        assert.equal(page.title, 'User');
        assert.equal(page.subtitle, 'Sistem');
        assert.equal(searchPages(menus, 'dashboard')[0].subtitle, undefined);
    });

    it('matches any case and needs every word', () => {
        assert.deepEqual(searchPages(menus, 'ROLE').map((p) => p.link), ['/system/role', '/system/role-menu']);
        assert.deepEqual(searchPages(menus, 'role menu').map((p) => p.link), ['/system/role-menu']);
        assert.deepEqual(searchPages(menus, 'menu role').map((p) => p.link), ['/system/role-menu']);
        assert.deepEqual(searchPages(menus, 'role nothing'), []);
    });

    it('finds a page through the name of its group', () => {
        assert.equal(searchPages(menus, 'sistem').length, 3);
        assert.deepEqual(searchPages(menus, 'sistem user').map((p) => p.link), ['/system/user']);
    });

    it('limits the number of results', () => {
        const many = Array.from({ length: 30 }, (_, i) => ({ id: `M${i}`, name: `Page ${i}`, url: `/p/${i}` }));
        assert.equal(searchPages(many, '').length, MAX_PAGES_EMPTY);
        assert.equal(searchPages(many, 'page').length, MAX_PAGES_QUERY);
    });

    it('copes with menus that have no name or url', () => {
        assert.deepEqual(searchPages([{ id: 'X' }, { id: 'Y', url: '/y' }], ''), [{ title: '', subtitle: undefined, link: '/y' }]);
        assert.deepEqual(searchPages([], 'x'), []);
    });
});
