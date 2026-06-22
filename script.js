/**
 * File Explorer – script.js
 *
 * Loads manifest.json, renders an expandable folder tree (left panel), and
 * shows folder contents / file text in the right panel.
 *
 * manifest.json schema:
 * {
 *   "name": "<display name for root>",
 *   "type": "folder",
 *   "children": [
 *     { "name": "file.txt", "type": "file", "path": "file-explorer-content/file.txt" },
 *     { "name": "subdir",   "type": "folder", "children": [ … ] }
 *   ]
 * }
 */

'use strict';

/* ── State ─────────────────────────────────── */
let rootNode = null;         // root manifest node
let selectedNode = null;         // currently highlighted node
let history = [];           // navigation history (array of nodes)
let historyIndex = -1;           // current position in history

/* ── DOM refs ───────────────────────────────── */
const treeEl = document.getElementById('tree');
const contentArea = document.getElementById('content-area');
const contentHdr = document.getElementById('content-header');
const addressBar = document.getElementById('address-bar');
const statusMsg = document.getElementById('status-msg');
const btnBack = document.getElementById('btn-back');
const btnUp = document.getElementById('btn-up');

/* ── Boot ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    btnBack.addEventListener('click', navigateBack);
    btnUp.addEventListener('click', navigateUp);
    loadManifest();
});

async function loadManifest() {
    try {
        const res = await fetch('manifest.json?v=' + Date.now());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        rootNode = await res.json();
        buildTree(rootNode);
        navigateTo(rootNode);
        setStatus(`${countFiles(rootNode)} object(s) loaded.`);
    } catch (err) {
        setStatus(`Error: could not load manifest.json – ${err.message}`);
        contentArea.innerHTML = '<div class="empty-state">⚠ manifest.json could not be loaded.</div>';
    }
}

/* ── Tree construction ──────────────────────── */

/**
 * Builds the entire left-panel tree from the root manifest node.
 */
function buildTree(root) {
    treeEl.innerHTML = '';
    const rootRow = createTreeNode(root, 0, [root.name]);
    treeEl.appendChild(rootRow);
    // Auto-expand root
    const rootChildren = rootRow.querySelector('.tree-children');
    if (rootChildren) rootChildren.classList.add('open');
    updateToggleIcon(rootRow.querySelector('.tree-row'));
}

/**
 * Recursively creates a tree node element for a manifest entry.
 */
function createTreeNode(node, depth, pathSoFar) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-node';

    const row = document.createElement('div');
    row.className = 'tree-row';
    row.setAttribute('role', 'treeitem');
    row.setAttribute('aria-level', depth + 1);
    row.dataset.nodeId = pathSoFar.join('/');

    // Indent
    if (depth > 0) {
        const indent = document.createElement('span');
        indent.style.display = 'inline-block';
        indent.style.width = (depth * 16) + 'px';
        indent.style.flexShrink = '0';
        row.appendChild(indent);
    }

    // Toggle arrow (folders only)
    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle';
    toggle.textContent = node.type === 'folder' ? '▶' : ' ';
    row.appendChild(toggle);

    // Icon
    const icon = document.createElement('span');
    icon.className = 'tree-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = nodeIcon(node);
    row.appendChild(icon);

    // Label
    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = node.name;
    row.appendChild(label);

    wrapper.appendChild(row);

    // Children container (folders only)
    if (node.type === 'folder' && Array.isArray(node.children) && node.children.length > 0) {
        const childrenEl = document.createElement('div');
        childrenEl.className = 'tree-children';
        childrenEl.setAttribute('role', 'group');

        for (const child of node.children) {
            if (child.type === 'folder') {
                const childPath = [...pathSoFar, child.name];
                childrenEl.appendChild(createTreeNode(child, depth + 1, childPath));
            }
        }
        wrapper.appendChild(childrenEl);

        // Toggle expand/collapse on click
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            childrenEl.classList.toggle('open');
            updateToggleIcon(row);
        });
    }

    // Navigate on row click
    row.addEventListener('click', () => {
        navigateTo(node);
    });

    // Store node reference for later selection marking
    row._manifestNode = node;

    return wrapper;
}

function updateToggleIcon(row) {
    const childrenEl = row.parentElement.querySelector('.tree-children');
    const toggle = row.querySelector('.tree-toggle');
    if (!toggle || !childrenEl) return;
    toggle.textContent = childrenEl.classList.contains('open') ? '▼' : '▶';
}

/* ── Navigation ─────────────────────────────── */

function navigateTo(node) {
    // Push to history
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(node);
    historyIndex = history.length - 1;

    renderNode(node);
    updateNav();
}

function navigateBack() {
    if (historyIndex > 0) {
        historyIndex--;
        renderNode(history[historyIndex]);
        updateNav();
    }
}

function navigateUp() {
    if (!selectedNode) return;
    const parent = findParent(rootNode, selectedNode);
    if (parent) navigateTo(parent);
}

function updateNav() {
    btnBack.disabled = historyIndex <= 0;
    const parent = selectedNode ? findParent(rootNode, selectedNode) : null;
    btnUp.disabled = !parent;
}

/* ── Rendering ──────────────────────────────── */

function renderNode(node) {
    selectedNode = node;
    markSelectedInTree(node);
    updateAddressBar(node);

    if (node.type === 'folder') {
        renderFolder(node);
    } else {
        renderFile(node);
    }
}

/**
 * Shows the folder's children as a list in the right panel.
 */
function renderFolder(node) {
    contentHdr.style.display = 'flex';
    const children = node.children || [];
    if (children.length === 0) {
        contentArea.innerHTML = '<div class="empty-state">This folder is empty.</div>';
        setStatus('0 object(s)');
        return;
    }

    contentArea.innerHTML = '';
    // Sort: folders first, then files
    const sorted = [...children].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    for (const child of sorted) {
        const item = document.createElement('div');
        item.className = 'content-item';
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '0');

        const ico = document.createElement('span');
        ico.className = 'item-icon';
        ico.setAttribute('aria-hidden', 'true');
        ico.textContent = nodeIcon(child);

        const name = document.createElement('span');
        name.className = 'item-name';
        name.textContent = child.name;

        const type = document.createElement('span');
        type.className = 'item-type';
        type.textContent = child.type === 'folder' ? 'File Folder' : fileType(child.name);

        const size = document.createElement('span');
        size.className = 'item-size';
        size.textContent = child.type === 'folder' ? '' : (child.size || '');

        item.appendChild(ico);
        item.appendChild(name);
        item.appendChild(type);
        item.appendChild(size);

        item.addEventListener('click', () => {
            document.querySelectorAll('.content-item.selected')
                .forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
        });

        item.addEventListener('dblclick', () => navigateTo(child));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') navigateTo(child);
        });

        contentArea.appendChild(item);
    }

    const fileCount = children.filter(c => c.type === 'file').length;
    const folderCount = children.filter(c => c.type === 'folder').length;
    const parts = [];
    if (folderCount) parts.push(`${folderCount} folder(s)`);
    if (fileCount) parts.push(`${fileCount} file(s)`);
    setStatus(parts.join(', ') || '0 object(s)');
}

/**
 * Fetches and renders file content in the right panel.
 */
async function renderFile(node) {
    contentHdr.style.display = 'none';
    contentArea.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.id = 'file-viewer-wrap';

    const title = document.createElement('div');
    title.id = 'file-viewer-title';
    title.textContent = node.name;

    const body = document.createElement('div');
    body.id = 'file-viewer-body';

    wrap.appendChild(title);
    wrap.appendChild(body);
    contentArea.appendChild(wrap);

    const ext = extension(node.name);

    if (isImageExt(ext)) {
        body.classList.add('image-view');
        const img = document.createElement('img');
        img.src = node.path || '';
        img.alt = node.name;
        body.appendChild(img);
        setStatus(node.name);
        return;
    }

    if (!node.path) {
        body.textContent = '(no path defined for this file)';
        return;
    }

    setStatus(`Loading ${node.name}…`);
    try {
        const res = await fetch(node.path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        body.textContent = text;
        setStatus(node.name);
    } catch (err) {
        body.innerHTML = `<span style="color:#ff8080">Could not load file: ${escapeHtml(err.message)}</span>\n\n`
            + `<a class="download-link" href="${escapeHtml(node.path)}" target="_blank" rel="noopener">Open / Download ↗</a>`;
        setStatus(`Error loading ${node.name}`);
    }
}

/* ── Tree selection highlight ───────────────── */

function markSelectedInTree(targetNode) {
    document.querySelectorAll('.tree-row.selected')
        .forEach(el => el.classList.remove('selected'));

    for (const row of treeEl.querySelectorAll('.tree-row')) {
        if (row._manifestNode === targetNode) {
            row.classList.add('selected');
            row.scrollIntoView({ block: 'nearest' });

            // Auto-expand parent chain if this is a folder in the tree
            expandAncestors(row);
            break;
        }
    }
}

function expandAncestors(row) {
    let el = row.parentElement;
    while (el && el !== treeEl) {
        if (el.classList.contains('tree-children')) {
            el.classList.add('open');
            const parentRow = el.previousElementSibling;
            if (parentRow && parentRow.classList.contains('tree-row')) {
                updateToggleIcon(parentRow);
            }
        }
        el = el.parentElement;
    }
}

/* ── Address bar ────────────────────────────── */

function updateAddressBar(node) {
    const path = buildPathTo(rootNode, node);
    const parts = path ? path.map(n => n.name) : [node.name];
    addressBar.textContent = parts.join(' \\ ');
    addressBar.setAttribute('aria-label', `Current path: ${parts.join(' / ')}`);
}

/* ── Helpers ────────────────────────────────── */

function findParent(current, target) {
    if (!current.children) return null;
    for (const child of current.children) {
        if (child === target) return current;
        const found = findParent(child, target);
        if (found) return found;
    }
    return null;
}

function buildPathTo(current, target, acc = []) {
    if (current === target) return [...acc, current];
    if (!current.children) return null;
    for (const child of current.children) {
        const result = buildPathTo(child, target, [...acc, current]);
        if (result) return result;
    }
    return null;
}

function countFiles(node) {
    if (node.type === 'file') return 1;
    return (node.children || []).reduce((sum, c) => sum + countFiles(c), 0);
}

function nodeIcon(node) {
    if (node.type === 'folder') return '📁';
    const ext = extension(node.name);
    if (isImageExt(ext)) return '🖼️';
    if (ext === 'txt') return '📄';
    if (ext === 'md') return '📝';
    if (ext === 'json') return '📋';
    if (ext === 'html' || ext === 'htm') return '🌐';
    if (ext === 'pdf') return '📕';
    if (ext === 'zip' || ext === 'tar' || ext === 'gz') return '🗜️';
    return '📄';
}

function fileType(name) {
    const ext = extension(name);
    const map = {
        txt: 'Text Document', md: 'Markdown File', json: 'JSON File',
        html: 'HTML File', htm: 'HTML File', pdf: 'PDF Document',
        png: 'PNG Image', jpg: 'JPEG Image', jpeg: 'JPEG Image',
        gif: 'GIF Image', svg: 'SVG Image', webp: 'WebP Image',
        zip: 'ZIP Archive', tar: 'TAR Archive', gz: 'GZ Archive',
    };
    return map[ext] || (ext ? `${ext.toUpperCase()} File` : 'File');
}

function extension(name) {
    const parts = (name || '').split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function isImageExt(ext) {
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function setStatus(msg) {
    statusMsg.textContent = msg;
}
