import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parsePolicy } from './policyText.ts';

describe('parsePolicy', () => {
    it('reads a title, headings, paragraphs and lists', () => {
        const blocks = parsePolicy('# Privacy\n\nFirst line\nsecond line\n\n## Data\n\n- name\n- email\n\nClosing words');
        assert.deepEqual(blocks, [
            { kind: 'title', text: 'Privacy' },
            { kind: 'paragraph', text: 'First line second line' },
            { kind: 'heading', text: 'Data' },
            { kind: 'list', items: ['name', 'email'] },
            { kind: 'paragraph', text: 'Closing words' },
        ]);
    });
    it('ends a list when a paragraph follows without a blank line', () => {
        assert.deepEqual(parsePolicy('- a\n- b\nplain'), [{ kind: 'list', items: ['a', 'b'] }, { kind: 'paragraph', text: 'plain' }]);
    });
    it('accepts Windows line ends and extra blank lines', () => {
        assert.deepEqual(parsePolicy('## A\r\n\r\n\r\ntext\r\n'), [{ kind: 'heading', text: 'A' }, { kind: 'paragraph', text: 'text' }]);
    });
    it('keeps markup-looking text as plain text', () => {
        assert.deepEqual(parsePolicy('<script>alert(1)</script>'), [{ kind: 'paragraph', text: '<script>alert(1)</script>' }]);
    });
    it('returns nothing for an empty text', () => {
        assert.deepEqual(parsePolicy('  \n \n'), []);
    });
});
