import {
    characters,
    eventSource,
    event_types,
    getCharacters,
    getRequestHeaders,
    selectCharacterById,
} from '../../../../script.js';
import { executeSlashCommandsWithOptions } from '../../../../scripts/slash-commands.js';
import { extension_settings, saveSettingsDebounced } from '../../../extensions.js';

const EXTENSION_NAME = 'randomgenerator';
const STORAGE_VERSION = 2;

function createSignature() {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
    } catch {
        // ignore
    }

    const random = Math.floor(Math.random() * 1_000_000);
    return `rg-${Date.now().toString(16)}-${random.toString(16)}`;
}

function createDefaultSettings() {
    return {
        version: STORAGE_VERSION,
        characterSignature: createSignature(),
        persistentAvatar: null,
        autoSelectAfterCreate: true,
        autoConnectModel: true,
        savedCard: {
            name: 'Compagnon adaptable',
            title: 'architecte de solutions personnalisées',
            needs: 'Clarifier tes objectifs et générer des cartes prêtes à jouer adaptées à ton univers.',
            approach: 'Structure les informations, pose des questions ciblées puis assemble une fiche complète.',
            resources: 'Transforme tes exigences en description, personnalité, scénario et exemples de dialogue.',
            tone: 'Chaleureux, pédagogue et tourné vers la co-construction.',
            greeting: 'Salut ! Dis-moi ce que tu veux que ta carte raconte et je te prépare une proposition complète.',
            sampleUser: "J'ai besoin d'un personnage qui dirige une petite équipe marketing agile.",
            sampleAssistant: 'Très bien ! Commençons par identifier les rituels clés de ton équipe et leur culture.',
            tags: 'assistant,adaptatif,extension',
            notes: 'Carte maintenue par l’extension Personnage adaptable. Ajuste les champs pour refléter ton contexte.',
            systemPrompt: 'Tu es un assistant adaptable : tu reformules les besoins, valides la compréhension puis proposes une carte claire et actionnable.',
            api: 'openai',
            model: '',
        },
    };
}

function ensureSettings() {
    const defaults = createDefaultSettings();
    const existing = extension_settings[EXTENSION_NAME] ?? {};

    const settings = {
        ...defaults,
        ...existing,
        savedCard: {
            ...defaults.savedCard,
            ...(existing.savedCard ?? {}),
        },
    };

    if (!settings.characterSignature) {
        settings.characterSignature = createSignature();
    }

    if (existing.autoSelectNewCharacter !== undefined && settings.autoSelectAfterCreate === defaults.autoSelectAfterCreate) {
        settings.autoSelectAfterCreate = Boolean(existing.autoSelectNewCharacter);
    }

    settings.version = STORAGE_VERSION;
    extension_settings[EXTENSION_NAME] = settings;
    return settings;
}

function getStableFileName(settings) {
    const base = String(settings.characterSignature || '').toLowerCase();
    const sanitized = base.replace(/[^a-z0-9_-]/gi, '-');
    return sanitized ? `adaptive-${sanitized}` : `adaptive-${Date.now()}`;
}

function toCleanText(value) {
    return String(value ?? '').trim();
}

function formatTags(value) {
    return toCleanText(value)
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
}

function composeDescription(card) {
    const fragments = [];

    if (card.title) {
        fragments.push(`${card.name} est ${card.title}.`);
    }

    if (card.needs) {
        fragments.push(`Sa mission : ${card.needs}`);
    }

    if (card.resources) {
        fragments.push(`Ressources clés : ${card.resources}`);
    }

    return fragments.join(' ');
}

function composePersonality(card) {
    const fragments = [];

    if (card.approach) {
        fragments.push(card.approach);
    }

    if (card.tone) {
        fragments.push(`Tonalité : ${card.tone}`);
    }

    return fragments.join(' ');
}

function composeScenario(card) {
    const fragments = [];

    if (card.needs) {
        fragments.push(`Point de départ : ${card.needs}`);
    }

    if (card.resources) {
        fragments.push(`Livrables attendus : ${card.resources}`);
    }

    if (card.approach) {
        fragments.push(`Méthodologie : ${card.approach}`);
    }

    return fragments.join(' ');
}

function composeMesExample(card) {
    const userLine = toCleanText(card.sampleUser) || 'Peux-tu préciser comment tu peux m’aider ?';
    const assistantLine = toCleanText(card.sampleAssistant) || 'Commençons par clarifier ton objectif principal.';

    return `{{user}}: ${userLine}\n{{char}}: ${assistantLine}`;
}

function composeCreatorNotes(card, settings) {
    const lines = ['Carte maintenue par l’extension Personnage adaptable.'];

    if (card.needs) {
        lines.push(`Besoins explicités : ${card.needs}`);
    }

    if (card.approach) {
        lines.push(`Approche privilégiée : ${card.approach}`);
    }

    if (card.resources) {
        lines.push(`Livrables : ${card.resources}`);
    }

    if (card.tone) {
        lines.push(`Ton : ${card.tone}`);
    }

    if (card.notes) {
        lines.push(card.notes);
    }

    lines.push(`Signature : ${settings.characterSignature}`);
    return lines.join('\n');
}

function buildPreview(card) {
    const rows = [
        `Nom : ${card.name}`,
        card.title ? `Titre : ${card.title}` : null,
        card.needs ? `Mission : ${card.needs}` : null,
        card.approach ? `Approche : ${card.approach}` : null,
        card.resources ? `Ressources : ${card.resources}` : null,
        card.tone ? `Ton : ${card.tone}` : null,
        card.api || card.model ? `Connexion : ${(card.api || '—')}${card.model ? ` · ${card.model}` : ''}` : null,
    ].filter(Boolean);

    return rows.join('\n');
}

function deepCloneExtensions(extensions) {
    if (!extensions) {
        return {};
    }

    try {
        return JSON.parse(JSON.stringify(extensions));
    } catch {
        return { ...extensions };
    }
}

function buildExtensionsPayload(card, settings, existingCharacter) {
    const baseExtensions = deepCloneExtensions(existingCharacter?.data?.extensions);

    baseExtensions.randomgenerator = {
        signature: settings.characterSignature,
        managed: true,
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        preferences: {
            api: toCleanText(card.api),
            model: toCleanText(card.model),
            autoConnect: Boolean(settings.autoConnectModel),
        },
        profile: {
            title: toCleanText(card.title),
            needs: toCleanText(card.needs),
            approach: toCleanText(card.approach),
            resources: toCleanText(card.resources),
            tone: toCleanText(card.tone),
        },
    };

    return JSON.stringify(baseExtensions);
}

function buildFormData(card, settings, existingCharacter) {
    const description = composeDescription(card);
    const personality = composePersonality(card);
    const scenario = composeScenario(card);
    const mesExample = composeMesExample(card);
    const creatorNotes = composeCreatorNotes(card, settings);
    const tags = formatTags(card.tags);
    const extensionsJson = buildExtensionsPayload(card, settings, existingCharacter);

    const formData = new FormData();
    formData.set('ch_name', card.name);
    formData.set('description', description);
    formData.set('personality', personality);
    formData.set('scenario', scenario);
    formData.set('first_mes', card.greeting);
    formData.set('mes_example', mesExample);
    formData.set('creator_notes', creatorNotes);
    formData.set('tags', tags.join(', '));
    formData.set('creator', 'Extension Personnage adaptable');
    formData.set('character_version', '2.0');
    formData.set('talkativeness', '0.5');
    formData.set('fav', existingCharacter?.data?.extensions?.fav ? 'true' : 'false');
    formData.set('world', '');
    formData.set('system_prompt', card.systemPrompt);
    formData.set('post_history_instructions', '');
    formData.set('depth_prompt_prompt', '');
    formData.set('depth_prompt_depth', '4');
    formData.set('depth_prompt_role', 'system');
    formData.set('extensions', extensionsJson);
    formData.set('json_data', '');

    if (existingCharacter) {
        formData.set('avatar_url', existingCharacter.avatar);
        formData.set('chat', existingCharacter.chat ?? `${card.name} - ${new Date().toISOString()}`);
        formData.set('create_date', existingCharacter.create_date ?? new Date().toISOString());
    } else {
        formData.set('file_name', getStableFileName(settings));
    }

    formData.append('alternate_greetings', card.greeting);
    return formData;
}

function findManagedCharacter(settings) {
    if (!Array.isArray(characters)) {
        return null;
    }

    const signature = settings.characterSignature;
    let match = characters.find(character => character?.data?.extensions?.randomgenerator?.signature === signature);

    if (!match && settings.persistentAvatar) {
        match = characters.find(character => character.avatar === settings.persistentAvatar);
    }

    if (match && settings.persistentAvatar !== match.avatar) {
        settings.persistentAvatar = match.avatar;
        saveSettingsDebounced();
    }

    return match ?? null;
}

function updatePreview(settings) {
    const previewWrapper = $('#adaptiveCharacterExtension .adaptive-preview');
    const previewText = $('#adaptivePreviewText');

    const content = buildPreview(settings.savedCard);
    previewText.text(content);
    previewWrapper.prop('hidden', !content.trim());
}

function updateStatus(settings) {
    const statusRef = $('#adaptiveStatus');
    const selectButton = $('#adaptiveSelectButton');
    const character = findManagedCharacter(settings);

    if (character) {
        const prefs = character?.data?.extensions?.randomgenerator?.preferences ?? {};
        const api = prefs.api || settings.savedCard.api || '—';
        const model = prefs.model || settings.savedCard.model || '';
        const modelInfo = model ? ` · Modèle : ${model}` : '';
        statusRef.text(`Carte gérée : ${character.name} (${character.avatar}) · API : ${api}${modelInfo}`);
        selectButton.removeClass('disabled').attr('aria-disabled', 'false');
    } else {
        statusRef.text('Aucun personnage géré n’a encore été créé. Renseigne les champs puis enregistre la carte.');
        selectButton.addClass('disabled').attr('aria-disabled', 'true');
    }
}

function handleFieldChange(settings, field, event) {
    settings.savedCard[field] = $(event.currentTarget).val();
    saveSettingsDebounced();
    updatePreview(settings);
}

function registerFields(settings) {
    const mapping = {
        name: '#adaptiveName',
        title: '#adaptiveTitle',
        needs: '#adaptiveNeeds',
        approach: '#adaptiveApproach',
        resources: '#adaptiveResources',
        tone: '#adaptiveTone',
        greeting: '#adaptiveGreeting',
        sampleUser: '#adaptiveSampleUser',
        sampleAssistant: '#adaptiveSampleAssistant',
        tags: '#adaptiveTags',
        notes: '#adaptiveNotes',
        systemPrompt: '#adaptiveSystemPrompt',
        api: '#adaptiveApi',
        model: '#adaptiveModel',
    };

    for (const [field, selector] of Object.entries(mapping)) {
        const element = $(selector);
        element.val(settings.savedCard[field] ?? '');
        element.on('input', event => handleFieldChange(settings, field, event));
    }

    $('#adaptiveAutoSelect').prop('checked', Boolean(settings.autoSelectAfterCreate)).on('change', function () {
        settings.autoSelectAfterCreate = $(this).prop('checked');
        saveSettingsDebounced();
    });

    $('#adaptiveAutoConnect').prop('checked', Boolean(settings.autoConnectModel)).on('change', function () {
        settings.autoConnectModel = $(this).prop('checked');
        saveSettingsDebounced();
    });
}

function setButtonState(button, enabled) {
    if (enabled) {
        button.removeClass('disabled loading').attr('aria-disabled', 'false');
    } else {
        button.addClass('disabled loading').attr('aria-disabled', 'true');
    }
}

async function connectPreferredModel(settings, { quiet = false } = {}) {
    if (!settings.autoConnectModel) {
        return false;
    }

    const commands = [];
    const api = toCleanText(settings.savedCard.api);
    const model = toCleanText(settings.savedCard.model);

    if (api) {
        commands.push({ command: `/api --quiet ${api}`, label: `API ${api}` });
    }

    if (model) {
        commands.push({ command: `/model --quiet ${model}`, label: `modèle ${model}` });
    }

    if (!commands.length) {
        return false;
    }

    let success = false;

    for (const { command, label } of commands) {
        try {
            await executeSlashCommandsWithOptions(command, {
                handleParserErrors: true,
                handleExecutionErrors: true,
                source: 'adaptive-character-extension',
            });
            success = true;
        } catch (error) {
            console.warn('Impossible de configurer', label, error);
            toastr.warning(`Connexion impossible vers ${label}.`, 'Personnage adaptable');
        }
    }

    if (success && !quiet) {
        toastr.success('Connexion au modèle appliquée.', 'Personnage adaptable');
    }

    return success;
}

async function persistCharacter(settings) {
    const button = $('#adaptiveSaveButton');

    if (button.hasClass('disabled')) {
        return;
    }

    const card = settings.savedCard;
    const existingCharacter = findManagedCharacter(settings);
    const formData = buildFormData(card, settings, existingCharacter);

    setButtonState(button, false);

    const endpoint = existingCharacter ? '/api/characters/edit' : '/api/characters/create';
    const headers = getRequestHeaders({ omitContentType: true });

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: formData,
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`Statut ${response.status}`);
        }

        let avatar = existingCharacter?.avatar ?? null;

        if (!existingCharacter) {
            avatar = await response.text();
        }

        toastr.success(existingCharacter ? 'Carte mise à jour.' : 'Carte créée.', 'Personnage adaptable');

        await getCharacters();
        const refreshedCharacter = findManagedCharacter(settings) ?? (avatar ? characters.find(item => item.avatar === avatar) : null);

        if (refreshedCharacter) {
            settings.persistentAvatar = refreshedCharacter.avatar;
            saveSettingsDebounced();
            updateStatus(settings);

            if (settings.autoSelectAfterCreate) {
                const index = characters.indexOf(refreshedCharacter);
                if (index >= 0) {
                    await selectCharacterById(index, { switchMenu: false });
                }
            }

            if (settings.autoConnectModel) {
                await connectPreferredModel(settings, { quiet: true });
            }
        } else {
            updateStatus(settings);
        }
    } catch (error) {
        console.error('Impossible de sauvegarder le personnage adaptable :', error);
        toastr.error('Impossible de sauvegarder le personnage adaptable.', 'Personnage adaptable');
    } finally {
        setButtonState(button, true);
    }
}

async function selectManagedCharacter(settings) {
    const button = $('#adaptiveSelectButton');
    if (button.hasClass('disabled')) {
        return;
    }

    const character = findManagedCharacter(settings);

    if (!character) {
        toastr.info('Aucun personnage géré à sélectionner pour le moment.', 'Personnage adaptable');
        updateStatus(settings);
        return;
    }

    const index = characters.indexOf(character);

    if (index < 0) {
        toastr.warning('Impossible de retrouver le personnage dans la liste.', 'Personnage adaptable');
        return;
    }

    await selectCharacterById(index, { switchMenu: false });

    if (settings.autoConnectModel) {
        await connectPreferredModel(settings, { quiet: false });
    }
}

async function extractAvatarFromBody(body) {
    if (!body) {
        return null;
    }

    if (body instanceof FormData) {
        return body.get('avatar_url') || body.get('avatar');
    }

    if (body instanceof URLSearchParams) {
        return body.get('avatar_url') || body.get('avatar');
    }

    if (typeof body === 'string') {
        return parseAvatarFromJson(body);
    }

    if (body instanceof Blob) {
        const text = await body.text();
        return parseAvatarFromJson(text);
    }

    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
        const text = new TextDecoder().decode(body instanceof ArrayBuffer ? body : body.buffer);
        return parseAvatarFromJson(text);
    }

    return null;
}

function parseAvatarFromJson(value) {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'string') {
            return parsed;
        }

        if (Array.isArray(parsed)) {
            return parsed[0];
        }

        if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.avatar_url)) {
                return parsed.avatar_url[0];
            }

            if (parsed.avatar_url) {
                return parsed.avatar_url;
            }

            if (Array.isArray(parsed.avatar)) {
                return parsed.avatar[0];
            }

            if (parsed.avatar) {
                return parsed.avatar;
            }
        }
    } catch {
        // ignore JSON parsing errors
    }

    if (typeof value === 'string' && value.endsWith('.png')) {
        return value;
    }

    return null;
}

let deletionGuardInstalled = false;

function installDeletionGuard(settings) {
    if (deletionGuardInstalled) {
        return;
    }

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url;

        if (url?.includes('/api/characters/delete')) {
            try {
                const avatar = await extractAvatarFromBody(init?.body);
                const avatars = Array.isArray(avatar) ? avatar : [avatar];
                const shouldBlock = avatars.some(item => item && settings.persistentAvatar && item === settings.persistentAvatar);

                if (shouldBlock) {
                    toastr.warning('Ce personnage est verrouillé par l’extension et ne peut pas être supprimé.', 'Personnage adaptable');
                    return new Response(JSON.stringify({ error: 'locked_by_extension' }), {
                        status: 423,
                        statusText: 'Locked',
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            } catch (error) {
                console.warn('Erreur lors de la vérification de suppression :', error);
            }
        }

        return originalFetch(input, init);
    };

    deletionGuardInstalled = true;
}

function registerEventListeners(settings) {
    if (!eventSource?.on || !event_types) {
        return;
    }

    eventSource.on(event_types.CHARACTER_RENAMED, (oldAvatar, newAvatar) => {
        if (oldAvatar === settings.persistentAvatar) {
            settings.persistentAvatar = newAvatar;
            saveSettingsDebounced();
            updateStatus(settings);
        }
    });

    eventSource.on(event_types.CHARACTER_DELETED, ({ character }) => {
        if (character?.avatar === settings.persistentAvatar) {
            settings.persistentAvatar = null;
            saveSettingsDebounced();
            updateStatus(settings);
        }
    });

    eventSource.on(event_types.CHARACTER_EDITED, () => {
        updateStatus(settings);
    });
}

function renderExtension(settings) {
    const existingRoot = document.getElementById('adaptiveCharacterExtension');
    if (existingRoot) {
        existingRoot.remove();
    }

    const host = document.getElementById('extensions_settings2');
    if (!host) {
        return;
    }

    const html = `
    <div id="adaptiveCharacterExtension">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Personnage adaptable</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="adaptive-helper">
                    Configure un personnage unique aligné sur tes besoins, verrouillé contre la suppression et capable de se connecter automatiquement à ton modèle favori.
                </div>
                <div class="adaptive-field-grid">
                    <label class="adaptive-field">
                        <span>Nom du personnage</span>
                        <input type="text" id="adaptiveName" autocomplete="off" />
                    </label>
                    <label class="adaptive-field">
                        <span>Titre / rôle</span>
                        <input type="text" id="adaptiveTitle" autocomplete="off" />
                    </label>
                </div>
                <label class="adaptive-field">
                    <span>Besoins à couvrir</span>
                    <textarea id="adaptiveNeeds" rows="3"></textarea>
                </label>
                <label class="adaptive-field">
                    <span>Approche & méthode</span>
                    <textarea id="adaptiveApproach" rows="3"></textarea>
                </label>
                <label class="adaptive-field">
                    <span>Livrables / ressources</span>
                    <textarea id="adaptiveResources" rows="3"></textarea>
                </label>
                <label class="adaptive-field">
                    <span>Ton & points d’attention</span>
                    <textarea id="adaptiveTone" rows="2"></textarea>
                </label>
                <label class="adaptive-field">
                    <span>Salutation initiale</span>
                    <textarea id="adaptiveGreeting" rows="2"></textarea>
                </label>
                <div class="adaptive-field-grid">
                    <label class="adaptive-field">
                        <span>Exemple (côté utilisateur)</span>
                        <textarea id="adaptiveSampleUser" rows="2"></textarea>
                    </label>
                    <label class="adaptive-field">
                        <span>Exemple (côté personnage)</span>
                        <textarea id="adaptiveSampleAssistant" rows="2"></textarea>
                    </label>
                </div>
                <label class="adaptive-field">
                    <span>Notes / rappels créateur</span>
                    <textarea id="adaptiveNotes" rows="2"></textarea>
                </label>
                <label class="adaptive-field">
                    <span>System prompt (optionnel)</span>
                    <textarea id="adaptiveSystemPrompt" rows="3"></textarea>
                </label>
                <div class="adaptive-field-grid adaptive-model-grid">
                    <label class="adaptive-field">
                        <span>API à utiliser</span>
                        <input type="text" id="adaptiveApi" placeholder="openai, kobold, textgenerationwebui…" autocomplete="off" />
                    </label>
                    <label class="adaptive-field">
                        <span>Modèle / preset préféré</span>
                        <input type="text" id="adaptiveModel" placeholder="gpt-4o-mini, llama3, etc." autocomplete="off" />
                    </label>
                    <label class="adaptive-field">
                        <span>Tags</span>
                        <input type="text" id="adaptiveTags" autocomplete="off" />
                    </label>
                </div>
                <div class="adaptive-checkboxes">
                    <label class="checkbox_label" for="adaptiveAutoSelect">
                        <input type="checkbox" id="adaptiveAutoSelect" />
                        Sélectionner automatiquement après sauvegarde
                    </label>
                    <label class="checkbox_label" for="adaptiveAutoConnect">
                        <input type="checkbox" id="adaptiveAutoConnect" />
                        Connecter automatiquement l’API / le modèle
                    </label>
                </div>
                <div class="adaptive-actions">
                    <div id="adaptiveSaveButton" class="menu_button adaptive-primary" role="button" tabindex="0">
                        <i class="fa-solid fa-floppy-disk"></i>
                        Sauvegarder la carte adaptée
                    </div>
                    <div id="adaptiveSelectButton" class="menu_button adaptive-secondary" role="button" tabindex="0">
                        <i class="fa-solid fa-user-check"></i>
                        Sélectionner dans la liste
                    </div>
                </div>
                <div id="adaptiveStatus" class="adaptive-status"></div>
                <div class="adaptive-preview" hidden>
                    <span class="adaptive-preview-title">Aperçu synthétique</span>
                    <pre id="adaptivePreviewText"></pre>
                </div>
            </div>
        </div>
    </div>`;

    $(host).append(html);

    registerFields(settings);

    $('#adaptiveSaveButton').on('click', () => persistCharacter(settings));
    $('#adaptiveSaveButton').on('keypress', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            persistCharacter(settings);
        }
    });

    $('#adaptiveSelectButton').on('click', () => selectManagedCharacter(settings));
    $('#adaptiveSelectButton').on('keypress', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectManagedCharacter(settings);
        }
    });

    updatePreview(settings);
    updateStatus(settings);
}

jQuery(async () => {
    const settings = ensureSettings();
    installDeletionGuard(settings);
    registerEventListeners(settings);
    renderExtension(settings);
});
