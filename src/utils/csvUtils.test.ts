import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseCsv, usersFromCsv } from './csvUtils.ts';

describe('parseCsv', () => {
    it('reads plain cells', () => {
        assert.deepEqual(parseCsv('a,b\n1,2\n'), [['a', 'b'], ['1', '2']]);
    });
    it('handles quotes, commas inside them and doubled quotes', () => {
        assert.deepEqual(parseCsv('a,b\n"x, y","say ""hi"""\n'), [['a', 'b'], ['x, y', 'say "hi"']]);
    });
    it('handles line breaks inside quotes', () => {
        assert.deepEqual(parseCsv('a,b\n"line1\nline2",2\n'), [['a', 'b'], ['line1\nline2', '2']]);
    });
    it('handles CRLF and a byte order mark', () => {
        assert.deepEqual(parseCsv('﻿a,b\r\n1,2\r\n'), [['a', 'b'], ['1', '2']]);
    });
    it('detects a semicolon separator', () => {
        assert.deepEqual(parseCsv('a;b\n1;2'), [['a', 'b'], ['1', '2']]);
    });
    it('drops empty lines but keeps empty cells', () => {
        assert.deepEqual(parseCsv('a,b,c\n\n1,,3\n,,\n'), [['a', 'b', 'c'], ['1', '', '3']]);
    });
});

describe('usersFromCsv', () => {
    it('maps the columns by header in any order and letter case', () => {
        const result = usersFromCsv('Role,Email,Full Name,Username\nADMINISTRASI,b@example.com,Budi,budi.s\n');
        assert.deepEqual(result.rows, [{ username: 'budi.s', fullName: 'Budi', email: 'b@example.com', role: 'ADMINISTRASI' }]);
    });
    it('accepts "name" for the full name', () => {
        assert.equal(usersFromCsv('username,name,email,role\nx,Xavier,x@e.com,R').rows?.[0].fullName, 'Xavier');
    });
    it('reports a missing column', () => {
        assert.match(usersFromCsv('username,email,role\nx,x@e.com,R').error ?? '', /fullName/);
    });
    it('needs at least one user', () => {
        assert.ok(usersFromCsv('username,fullName,email,role\n').error);
    });
    it('trims the cells', () => {
        assert.equal(usersFromCsv('username,fullName,email,role\n  x  , Y ,e@e.com, R \n').rows?.[0].role, 'R');
    });
});
