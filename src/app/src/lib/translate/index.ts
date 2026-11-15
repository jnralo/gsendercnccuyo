// Traduccion de la interfaz en tiempo de ejecucion.
//
// La interfaz original esta escrita en ingles dentro de cada componente. En vez de
// modificar cientos de archivos (y complicar las actualizaciones desde gSender), este
// modulo observa el DOM y reemplaza los textos que figuran en el diccionario (es.ts).
// Lo que no esta en el diccionario queda en ingles. Para traducir algo nuevo alcanza
// con agregar una linea a es.ts.

import store from 'app/store';

import { ES } from './es';

export type Language = 'es' | 'en';

const LANGUAGE_KEY = 'workspace.language';
const ATTRIBUTES = ['title', 'placeholder', 'aria-label'];
// Zonas que nunca se traducen: codigo G, consola, campos de texto.
const SKIP_SELECTOR =
    'textarea, input, code, pre, .xterm, .monaco-editor, [data-no-translate]';

let observer: MutationObserver | null = null;
const originalText = new Map<Text, string>();
const originalAttributes = new Map<Element, Record<string, string>>();

export function getLanguage(): Language {
    return store.get(LANGUAGE_KEY, 'es') === 'en' ? 'en' : 'es';
}

function lookup(value: string | null): string | null {
    if (!value) {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    const translated = ES[trimmed];
    if (!translated || translated === trimmed) {
        return null;
    }
    return value.replace(trimmed, translated);
}

function translateTextNode(node: Text) {
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP_SELECTOR)) {
        return;
    }
    const translated = lookup(node.nodeValue);
    if (translated !== null) {
        originalText.set(node, node.nodeValue as string);
        node.nodeValue = translated;
    }
}

function translateAttributes(element: Element) {
    if (element.closest('[data-no-translate]')) {
        return;
    }
    for (const attribute of ATTRIBUTES) {
        const value = element.getAttribute(attribute);
        const translated = lookup(value);
        if (translated !== null) {
            const saved = originalAttributes.get(element) || {};
            saved[attribute] = value as string;
            originalAttributes.set(element, saved);
            element.setAttribute(attribute, translated);
        }
    }
}

function translateTree(root: Node) {
    if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root as Text);
        return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) {
        return;
    }
    const element = root as Element;
    translateAttributes(element);
    for (const child of element.querySelectorAll('[title], [placeholder], [aria-label]')) {
        translateAttributes(child);
    }
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
        translateTextNode(current as Text);
        current = walker.nextNode();
    }
}

function pruneDetached() {
    if (originalText.size < 5000) {
        return;
    }
    for (const node of originalText.keys()) {
        if (!node.isConnected) {
            originalText.delete(node);
        }
    }
    for (const element of originalAttributes.keys()) {
        if (!element.isConnected) {
            originalAttributes.delete(element);
        }
    }
}

function start() {
    if (observer || typeof document === 'undefined') {
        return;
    }
    translateTree(document.body);
    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'characterData') {
                translateTextNode(mutation.target as Text);
            } else if (mutation.type === 'attributes') {
                translateAttributes(mutation.target as Element);
            } else {
                for (const node of mutation.addedNodes) {
                    translateTree(node);
                }
            }
        }
        pruneDetached();
    });
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRIBUTES,
    });
}

function stop() {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    for (const [node, value] of originalText) {
        if (node.isConnected) {
            node.nodeValue = value;
        }
    }
    for (const [element, attributes] of originalAttributes) {
        if (element.isConnected) {
            for (const [name, value] of Object.entries(attributes)) {
                element.setAttribute(name, value);
            }
        }
    }
    originalText.clear();
    originalAttributes.clear();
}

/** Aplica el idioma guardado. Se llama una vez al iniciar la aplicacion. */
export function initTranslation() {
    if (getLanguage() === 'es') {
        start();
    }
}

export function setLanguage(language: Language) {
    store.set(LANGUAGE_KEY, language);
    if (language === 'es') {
        start();
    } else {
        stop();
    }
}
