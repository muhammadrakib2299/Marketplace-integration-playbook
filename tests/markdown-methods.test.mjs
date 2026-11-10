import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMethodCode } from '../scripts/markdown-methods.mjs'

test('inline code that starts with an HTTP method renders a method badge and the path', () => {
  assert.equal(
    renderMethodCode('GET /orders/2026-01-01/orders'),
    '<span class="mip-endpoint"><span class="mip-method mip-method--get">GET</span> <code>/orders/2026-01-01/orders</code></span>',
  )
})

test('a bare HTTP method renders only the badge', () => {
  assert.equal(renderMethodCode('DELETE'), '<span class="mip-method mip-method--delete">DELETE</span>')
})

test('other inline code is left to the default renderer', () => {
  assert.equal(renderMethodCode('searchOrders'), null)
  assert.equal(renderMethodCode('GETTER /x'), null)
  assert.equal(renderMethodCode('get /orders'), null)
})

test('endpoint paths are HTML-escaped', () => {
  assert.equal(
    renderMethodCode('GET /items?a=1&b=<x>'),
    '<span class="mip-endpoint"><span class="mip-method mip-method--get">GET</span> <code>/items?a=1&amp;b=&lt;x&gt;</code></span>',
  )
})
