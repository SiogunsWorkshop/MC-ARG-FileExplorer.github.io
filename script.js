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
let unlockedFolders = new Set();  // tracks unlocked protected folders (by path)

/* ── DOM refs ───────────────────────────────── */
const treeEl = document.getElementById('tree');
const contentArea = document.getElementById('content-area');
const contentHdr = document.getElementById('content-header');
const addressBar = document.getElementById('address-bar');
const statusMsg = document.getElementById('status-msg');
const btnBack = document.getElementById('btn-back');
const btnUp = document.getElementById('btn-up');
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');
const passwordSubmit = document.getElementById('password-submit');
const passwordCancel = document.getElementById('password-cancel');

/* ── Boot ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    btnBack.addEventListener('click', navigateBack);
    btnUp.addEventListener('click', navigateUp);
    passwordSubmit.addEventListener('click', handlePasswordSubmit);
    passwordCancel.addEventListener('click', hidePasswordModal);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePasswordSubmit();
    });
    loadManifest();
});

async function loadManifest() {
    try {
        const res = await fetch('manifest.json?v=' + Date.now());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        rootNode = await res.json();
        // Load previously unlocked folders from cookies
        loadUnlockedFromCookie();
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

async function navigateTo(node) {
    // Check if folder is password protected
    if (node.type === 'folder' && node.password && !isNodeUnlocked(node)) {
        await promptForPassword(node);
        // If still not unlocked, don't navigate
        if (!isNodeUnlocked(node)) return;
    }

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
        let text = await res.text();

        // Apply cipher if specified
        if (node.cipher) {
            text = applyCipher(text, node.cipher);
        }

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
    if (node.type === 'folder') {
        // Show lock icon only if password-protected AND not unlocked
        if (node.password && !isNodeUnlocked(node)) {
            return '🔒';
        }
        return '📁';
    }
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

/* ── Password Protection ────────────────────── */

/**
 * Get a unique key for a node based on its path
 */
function getNodeKey(node) {
    const path = buildPathTo(node, node);
    return path ? path.map(n => n.name).join('/') : node.name;
}

/**
 * Set a cookie
 */
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

/**
 * Get a cookie value
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
}

/**
 * Save unlocked folders to cookie
 */
function saveUnlockedToCookie() {
    const keys = Array.from(unlockedFolders);
    setCookie('unlockedFolders', keys.join('|'), 365);
}

/**
 * Load unlocked folders from cookie
 */
function loadUnlockedFromCookie() {
    const saved = getCookie('unlockedFolders');
    if (saved) {
        const keys = saved.split('|');
        unlockedFolders = new Set(keys);
    }
}

/**
 * Check if a password-protected node has been unlocked
 */
function isNodeUnlocked(node) {
    if (!node.password) return true;
    const key = getNodeKey(node);
    return unlockedFolders.has(key);
}

/**
 * Mark a node as unlocked
 */
function unlockNode(node) {
    const key = getNodeKey(node);
    unlockedFolders.add(key);
    saveUnlockedToCookie();
}

/**
 * Prompt user for password
 */
async function promptForPassword(node) {
    return new Promise((resolve) => {
        passwordInput.value = '';
        passwordError.textContent = '';
        passwordError.classList.add('hidden');
        document.getElementById('modal-title').textContent = `Password required for "${node.name}"`;

        // Store the node and resolve callback for the submit handler
        passwordModal.dataset.targetNode = JSON.stringify({ name: node.name, password: node.password });
        passwordModal.dataset.resolveCallback = true;
        window._passwordResolve = resolve;

        showPasswordModal();
    });
}

/**
 * Handle password submission
 */
function handlePasswordSubmit() {
    const nodeData = JSON.parse(passwordModal.dataset.targetNode || '{}');
    const inputPassword = passwordInput.value;

    if (inputPassword === nodeData.password) {
        // Password correct - find the actual node and unlock it
        const targetNode = findNodeByName(rootNode, nodeData.name);
        if (targetNode) {
            unlockNode(targetNode);
            updateTreeIcon(targetNode);  // Update the icon in the tree
        }
        hidePasswordModal();
        if (window._passwordResolve) {
            window._passwordResolve();
            delete window._passwordResolve;
        }
    } else {
        // Password incorrect
        passwordError.textContent = 'Incorrect password. Try again.';
        passwordError.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

/**
 * Find a node by name in the tree (for re-locating after unlock)
 */
function findNodeByName(node, name, visitedNames = []) {
    if (node.name === name && !visitedNames.includes(name)) {
        return node;
    }
    if (node.children) {
        for (const child of node.children) {
            const result = findNodeByName(child, name, [...visitedNames, node.name]);
            if (result) return result;
        }
    }
    return null;
}

/**
 * Show password modal
 */
function showPasswordModal() {
    passwordModal.classList.remove('hidden');
    passwordInput.focus();
}

/**
 * Hide password modal
 */
function hidePasswordModal() {
    passwordModal.classList.add('hidden');
    delete passwordModal.dataset.targetNode;
    delete passwordModal.dataset.resolveCallback;
}

/**
 * Update tree icon for a specific node (used when unlocking)
 */
function updateTreeIcon(node) {
    for (const row of treeEl.querySelectorAll('.tree-row')) {
        if (row._manifestNode === node) {
            const icon = row.querySelector('.tree-icon');
            if (icon) {
                icon.textContent = nodeIcon(node);
            }
            break;
        }
    }
}

/* ── Cipher Decoding ────────────────────────── */

/**
 * Apply cipher to text
 * Format: "cipher.param" where cipher is the type and param depends on cipher
 * Examples: "caesar.3", "caesar.5"
 */
function applyCipher(text, cipherSpec) {
    if (!cipherSpec || typeof cipherSpec !== 'string') return text;

    const [type, param] = cipherSpec.split('.');

    if (type === 'caesar') {
        const shift = parseInt(param) || 0;
        return caesarDecipher(text, shift);
    }

    return text;
}

/**
 * Caesar cipher decoder
 * Shifts letters backward by the given amount to decode text encrypted with forward shift
 */
function caesarDecipher(text, shift) {
    return text.split('').map(char => {
        // Handle uppercase letters
        if (char >= 'A' && char <= 'Z') {
            const code = char.charCodeAt(0) - 'A'.charCodeAt(0);
            const shifted = (code - shift + 26) % 26;
            return String.fromCharCode(shifted + 'A'.charCodeAt(0));
        }
        // Handle lowercase letters
        if (char >= 'a' && char <= 'z') {
            const code = char.charCodeAt(0) - 'a'.charCodeAt(0);
            const shifted = (code - shift + 26) % 26;
            return String.fromCharCode(shifted + 'a'.charCodeAt(0));
        }
        // Return non-letter characters unchanged
        return char;
    }).join('');
}
