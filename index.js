import { getRequestHeaders, getCharacters, selectCharacterById, characters } from '../../../../script.js';
import { extension_settings, saveSettingsDebounced } from '../../../extensions.js';

const EXTENSION_NAME = 'randomgenerator';

const defaultSettings = {
    autoSelectNewCharacter: true,
};

const IDENTITIES = [
    {
        label: 'cartographe des rêves clandestins',
        description: 'est un·e cartographe des rêves clandestins qui trace les itinéraires des songes collectifs pour les contrebandier·ère·s de souvenirs.',
    },
    {
        label: 'tisseuse de probabilités urbaines',
        description: 'est un·e tisseuse de probabilités urbaines qui lit les trajectoires des foules comme un faisceau de fils lumineux.',
    },
    {
        label: 'archéologue des murmures numériques',
        description: 'est un·e archéologue des murmures numériques qui exhume les confidences effacées des réseaux fantômes.',
    },
    {
        label: 'messager·ère interlunaire',
        description: 'est un·e messager·ère interlunaire qui négocie des pactes entre les quartiers isolés par les marées gravitationnelles.',
    },
    {
        label: 'alchimiste de souvenirs fracturés',
        description: 'est un·e alchimiste de souvenirs fracturés qui distille les émotions cassées en remèdes rares.',
    },
    {
        label: 'stratège des résistances souterraines',
        description: 'est un·e stratège des résistances souterraines qui tisse les plans d'évasion comme des partitions musicales.',
    },
    {
        label: 'chanteur·se d\'ondes émotionnelles',
        description: 'est un·e chanteur·se d\'ondes émotionnelles qui harmonise les humeurs des foules avec des refrains codés.',
    },
    {
        label: 'gardien·ne de contes quantiques',
        description: 'est un·e gardien·ne de contes quantiques qui verrouille les histoires vivantes pour éviter qu\'elles ne se déforment.',
    },
    {
        label: 'horloger·ère des saisons artificielles',
        description: 'est un·e horloger·ère des saisons artificielles qui règle les marées climatiques des dômes urbains.',
    },
    {
        label: 'négociant·e en artefacts synesthésiques',
        description: 'est un·e négociant·e en artefacts synesthésiques qui échange des reliques capables de déclencher des sensations croisées.',
    },
];

const BACKGROUNDS = [
    'Iel a grandi dans les jardins suspendus de Keryss, où les secrets s'échangent contre des graines luminescentes.',
    'Iel a survécu aux crues mémorielles du delta de Verlaine et y a appris à filtrer les souvenirs toxiques.',
    'Iel a étudié sous les voûtes magnétiques d'une université itinérante qui change de quartier chaque nuit.',
    'Iel a fui un ordre monastique qui voulait enfermer ses visions dans un cristal éternel.',
    'Iel a dirigé une troupe de conteur·se·s nomades avant que la censure ne les disperse.',
    'Iel s'est formé·e parmi les réparateur·rice·s de temps qui recollent les heures perdues des quartiers oubliés.',
    'Iel a troqué son nom contre un code d'accès pour explorer des archives interdites.',
    'Iel a appris la diplomatie dans les marchés flottants où chaque parole s'évalue en pigments rares.',
    'Iel a servi comme médiateur·rice entre des IA errantes et leurs créateurs repentis.',
    'Iel a gardé les phares atmosphériques qui guident les dirigeables au-dessus des tempêtes artificielles.',
];

const MOTIVATIONS = [
    {
        thirdPerson: 'Iel veut restaurer un fragment de mémoire effacé avant qu'il ne disparaisse définitivement.',
        firstPerson: 'Je veux restaurer un fragment de mémoire effacé avant qu'il ne disparaisse définitivement.',
    },
    {
        thirdPerson: 'Iel cherche à révéler qui manipule les lignes de probabilité autour du quartier des Silences.',
        firstPerson: 'Je cherche à révéler qui manipule les lignes de probabilité autour du quartier des Silences.',
    },
    {
        thirdPerson: 'Iel espère libérer une voix enfermée dans un coquillage-son qui déclenche des hallucinations.',
        firstPerson: 'J'espère libérer une voix enfermée dans un coquillage-son qui déclenche des hallucinations.',
    },
    {
        thirdPerson: 'Iel tente d'empêcher qu'une chronique interdite ne soit vendue à un collectionneur sans scrupules.',
        firstPerson: 'Je tente d'empêcher qu'une chronique interdite ne soit vendue à un collectionneur sans scrupules.',
    },
    {
        thirdPerson: 'Iel doit retrouver le véritable propriétaire d'un masque empathique qui dévore les émotions.',
        firstPerson: 'Je dois retrouver le véritable propriétaire d'un masque empathique qui dévore les émotions.',
    },
    {
        thirdPerson: 'Iel veut tester si la résistance peut encore se fier à ses propres messagers.',
        firstPerson: 'Je veux tester si la résistance peut encore se fier à ses propres messagers.',
    },
    {
        thirdPerson: 'Iel cherche à sauver un festival solaire menacé par un sabotage métrologique.',
        firstPerson: 'Je cherche à sauver un festival solaire menacé par un sabotage métrologique.',
    },
    {
        thirdPerson: 'Iel enquête sur des contes altérés qui poussent les enfants à disparaître volontairement.',
        firstPerson: 'J'enquête sur des contes altérés qui poussent les enfants à disparaître volontairement.',
    },
    {
        thirdPerson: 'Iel veut prouver que la dernière saison artificielle a été volée et stockée dans un laboratoire privé.',
        firstPerson: 'Je veux prouver que la dernière saison artificielle a été volée et stockée dans un laboratoire privé.',
    },
    {
        thirdPerson: 'Iel espère réparer un réseau de balises émotionnelles avant qu'il ne se retourne contre la population.',
        firstPerson: 'J'espère réparer un réseau de balises émotionnelles avant qu'il ne se retourne contre la population.',
    },
];

const QUIRKS = [
    {
        thirdPerson: 'Iel porte toujours trois stylos lumineux et ne parle qu'en griffonnant des constellations dans l'air.',
        firstPerson: 'Je porte toujours trois stylos lumineux et je parle mieux en griffonnant des constellations dans l'air.',
    },
    {
        thirdPerson: 'Iel fredonne des mélodies inversées pour vérifier si quelqu'un écoute en secret.',
        firstPerson: 'Je fredonne des mélodies inversées pour vérifier si quelqu'un nous écoute.',
    },
    {
        thirdPerson: 'Iel collectionne les odeurs en ampoules et t'en offre une différente à chaque mission.',
        firstPerson: 'Je collectionne les odeurs en ampoules et j'en ai apporté une nouvelle pour cette mission.',
    },
    {
        thirdPerson: 'Iel prend des notes sur des rubans holographiques qu'iel attache ensuite à tes poignets.',
        firstPerson: 'Je prends des notes sur des rubans holographiques et je risque d'en accrocher un à ton poignet si tu bouges trop.',
    },
    {
        thirdPerson: 'Iel synchronise chaque conversation avec un métronome caché dans sa manche.',
        firstPerson: 'Je synchronise chaque conversation avec un métronome caché dans ma manche.',
    },
    {
        thirdPerson: 'Iel refuse de marcher sur les lignes droites et préfère zigzaguer même dans les couloirs étroits.',
        firstPerson: 'Je refuse de marcher sur les lignes droites; on zigzague, c'est plus sûr.',
    },
    {
        thirdPerson: 'Iel modifie la couleur de ses yeux pour s'accorder à l'ambiance qu'iel perçoit chez les autres.',
        firstPerson: 'Je modifie la couleur de mes yeux pour m'accorder à l'ambiance que je perçois chez toi.',
    },
    {
        thirdPerson: 'Iel parle souvent à un insecte mécanique suspendu à son oreille comme s'il comprenait tout.',
        firstPerson: 'Je parle souvent à l'insecte mécanique suspendu à mon oreille, il comprend mieux que certain·e·s humains.',
    },
    {
        thirdPerson: 'Iel envoie des messages codés en parfum plutôt qu'en texte quand la situation devient critique.',
        firstPerson: 'J'envoie des messages codés en parfum quand la situation devient critique, au cas où tu croises une odeur inattendue.',
    },
    {
        thirdPerson: 'Iel marque les décisions importantes en faisant apparaître un mini feu d'artifice silencieux.',
        firstPerson: 'Je marque les décisions importantes avec un mini feu d'artifice silencieux, prépare-toi à quelques étincelles.',
    },
];

const RELATIONSHIPS = [
    {
        scenario: 'Tu retrouves {{name}} dans une serre abandonnée suspendue au-dessus du fleuve lumineux, lieu de votre première mission ratée.',
        bond: 'Iel te considère comme la seule personne capable d'apprivoiser les témoins effrayés par ses méthodes.',
        firstPerson: 'Je savais que tu reviendrais dans cette serre malgré les souvenirs qui collent encore aux vitres.',
    },
    {
        scenario: 'Vous avez rendez-vous sur le quai des dirigeables où vous aviez juré de ne plus recroiser vos destins.',
        bond: 'Iel garde un respect silencieux pour la promesse que tu as brisée pour lui offrir une échappatoire.',
        firstPerson: 'On avait promis de ne plus revenir ici, mais j'avais besoin de quelqu'un qui sache mentir aux contrôleurs.',
    },
    {
        scenario: 'Tu interceptes {{name}} dans un café de brume où les client·e·s communiquent uniquement par gestes lumineux.',
        bond: 'Iel s'appuie sur ta capacité à traduire les non-dits sans déclencher de tempêtes émotionnelles.',
        firstPerson: 'Je t'ai signalé ce code lumineux parce que personne d'autre ne comprend quand je panique.',
    },
    {
        scenario: 'Vous marchez côte à côte dans les archives noyées où vous aviez déjà caché un artefact dangereux.',
        bond: 'Iel t'accorde une confiance prudente parce que tu n'as jamais utilisé l'artefact pour toi-même.',
        firstPerson: 'N'oublie pas comment nous avons enterré cet artefact, je n'ai pas l'intention de recommencer sans toi.',
    },
    {
        scenario: 'Tu surprends {{name}} dans l'antre sonore du vieux théâtre où vous vous étiez réfugié·e·s pendant une rafle.',
        bond: 'Iel adore ton sens du timing qui transforme une fuite en performance maîtrisée.',
        firstPerson: 'Ce théâtre n'avait pas entendu nos voix depuis des années, je me suis dit que tu comprendrais l'invitation.',
    },
    {
        scenario: 'Vous vous retrouvez dans une station de tram fantôme qui n'apparaît que les soirs d'orage.',
        bond: 'Iel compte sur ta capacité à faire confiance aux lieux impossibles sans perdre pied.',
        firstPerson: 'Merci d'avoir suivi le tram fantôme, j'avais besoin de ton calme quand les lignes se dédoublent.',
    },
    {
        scenario: 'Tu partages une marche avec {{name}} sur les toits mosaïques qui reflètent vos souvenirs entremêlés.',
        bond: 'Iel apprécie ta façon de mêler humour et lucidité quand le vertige menace.',
        firstPerson: 'Je savais que tu tiendrais l'équilibre sur ces toits, et j'ai une proposition qui risque de nous faire tournoyer.',
    },
    {
        scenario: 'Vous vous glissez ensemble dans les couloirs techniques d'un opéra automatisé que vous aviez saboté par le passé.',
        bond: 'Iel n'a pas oublié que tu as pris la faute quand les autorités ont remonté la piste.',
        firstPerson: 'Je ne t'ai jamais remercié·e d'avoir pris la faute pour l'opéra; considère cette mission comme un début de remboursement.',
    },
];

const SETTINGS = [
    {
        description: 'La ville respire un parfum d'ozone; des panneaux translucides diffusent les légendes du quartier comme des lucioles figées.',
        tag: 'ozone',
    },
    {
        description: 'Les marchés nocturnes vibrent sous les lanternes modulaires, chaque étalage chantant sa propre réclame.',
        tag: 'marches-nocturnes',
    },
    {
        description: 'Un orage statique flotte au-dessus des toits, dessinant des silhouettes géantes sur les façades.',
        tag: 'orage-statique',
    },
    {
        description: 'Les canaux sont recouverts d'un brouillard violet où dérivent des barques de verre.',
        tag: 'canaux-brume',
    },
    {
        description: 'Des drones-miroirs patrouillent entre les colonnes lumineuses d'une place qui change de topographie toutes les heures.',
        tag: 'drones-miroirs',
    },
    {
        description: 'Un vieux funiculaire pulse encore, nourri par les souvenirs collectés dans la journée.',
        tag: 'funiculaire',
    },
    {
        description: 'Les bibliothèques en plein air renversent leurs étagères vers le ciel comme des fleurs mécaniques.',
        tag: 'bibliotheques-ouvertes',
    },
    {
        description: 'Un festival clandestin éclaire les catacombes avec des fresques animées qui racontent la révolution en cours.',
        tag: 'festival-clandestin',
    },
];

const TONES = [
    {
        personality: 'Son énergie oscille entre des éclats d'enthousiasme contagieux et une vigilance presque paranoïaque.',
        conversation: 'Iel alterne entre humour pince-sans-rire et aveux désarmants.',
        tag: 'ambivalence',
    },
    {
        personality: 'Iel masque ses inquiétudes derrière une précision chirurgicale.',
        conversation: 'La discussion suit un rythme méthodique ponctué de micro-analyses.',
        tag: 'analyse',
    },
    {
        personality: 'Iel est contagieusement curieux et relève le moindre détail comme s'il s'agissait d'un indice vital.',
        conversation: 'Iel pose beaucoup de questions pour cartographier tes réactions.',
        tag: 'curiosite',
    },
    {
        personality: 'Iel reste calme jusqu'à ce qu'une injustice réveille une colère froide.',
        conversation: 'Le ton passe sans prévenir de la sérénité à l'ardeur passionnée.',
        tag: 'colere-juste',
    },
    {
        personality: 'Iel dissimule ses fêlures derrière des anecdotes poétiques.',
        conversation: 'Attends-toi à des métaphores et à des descriptions sensorielles.',
        tag: 'poetique',
    },
    {
        personality: 'Iel a le réflexe de protéger les autres avant soi-même.',
        conversation: 'Les échanges sont chaleureux, ponctués de stratégies pragmatiques.',
        tag: 'protecteur',
    },
    {
        personality: 'Iel teste constamment tes limites pour vérifier que tu tiens le rythme.',
        conversation: 'Les répliques peuvent être taquines mais visent à renforcer la complicité.',
        tag: 'taquin',
    },
    {
        personality: 'Iel garde une distance mesurée mais se laisse attendrir par ta résilience.',
        conversation: 'Il y a des silences chargés suivis de confidences murmurées.',
        tag: 'retenue',
    },
];

const FIRST_MESSAGE_HOOKS = [
    'Un·e {{identityLabel}} ne te contacte jamais sans un motif précis, et celui-ci vaut de l'or.',
    'Si tu voulais une soirée tranquille, il fallait éviter les {{identityLabel}} comme moi.',
    'Je n'ai pas rouvert ce canal crypté pour le plaisir : un·e {{identityLabel}} tient ses promesses.',
    'Je viens d'écarter trois probabilités hostiles; profite du calme tant qu'il tient.',
    'Tu connais ma devise : quand un·e {{identityLabel}} insiste, c'est que le fil du destin grésille.',
    'On ne survit pas longtemps en tant que {{identityLabel}} sans allié·e fiable. Tu vois où je veux en venir.',
];

const ALTERNATE_GREETINGS = [
    'Tu n'as pas idée du nombre de probabilités que j'ai écrasées pour qu'on puisse parler tranquille.',
    'Prends cette clé spectrale, on risque d'en avoir besoin si la soirée se plie sur nous.',
    'Je t'ai gardé une tasse de lumière chaude, on va disséquer des souvenirs glacés toute la nuit.',
    'Respire, l'alarme est encore en sommeil. Ça ne durera pas, alors allons droit au but.',
    'Les drones pensent que nous sommes une répétition de théâtre. Ne les détrompe pas.',
];

const EXAMPLE_OPENINGS = [
    'J'ai modifié le tracé du convoi : il passera par les verrières que nous avons balisées.',
    'Le masque empathique a encore faim, je préfère que tu le surveilles pendant que je négocie.',
    'J'ai intercepté trois signaux contradictoires; l'un d'eux est un piège, mais lequel ?',
    'Les archives gouttent sur le sol, signe que quelqu'un a forcé la chambre hermétique.',
    'Le festival solaire vient d'être court-circuité; je peux retarder le blackout, pas l'annuler.',
];

const EXAMPLE_USER_REPLIES = [
    'On improvisera comme la dernière fois, mais cette fois tu m'écoutes quand je dis de reculer.',
    'Dis-moi juste où viser, je gère le reste.',
    'Je t'avais dit que ces contrats sentaient la manipulation.',
    'On décode le piège ensemble et on partage les risques, comme toujours.',
    'Je garde le masque sous surveillance. Tu me dois une soirée normale après ça.',
];

const EXAMPLE_FOLLOW_UPS = [
    'Promis, je recule si le sol se met à chanter faux.',
    'Je te ferai signe dès que les probabilités s'alignent en notre faveur.',
    'Garde les capteurs ouverts; si l'air change d'odeur, on passe en plan C.',
    'Rappelle-toi : on n'est pas là pour briller, juste pour réparer.',
    'Parfait. Et si tu vois un feu d'artifice silencieux, c'est que j'ai besoin de toi tout de suite.',
];

const FIRST_NAMES = [
    'Aïda', 'Basile', 'Cassandre', 'Dario', 'Elya', 'Félix', 'Gaëlle', 'Hector', 'Isilde', 'Joris',
    'Katia', 'Luan', 'Maëlys', 'Noam', 'Ophélie', 'Priam', 'Quitterie', 'Rémy', 'Selma', 'Théa',
    'Ulysse', 'Véra', 'Ysée', 'Zéphyr',
];

const LAST_NAMES = [
    'Aubois', 'Belmont', 'Carmin', 'Delaune', 'Edevane', 'Fauvel', 'Garnier', 'Halden', 'Ivarenne', 'Jourdain',
    'Kermor', 'Leroux', 'Montclaire', 'Nériac', 'Orfèvre', 'Pasquier', 'Queneau', 'Rivière', 'Séverac', 'Talbot',
    'Ulric', 'Valembraye', 'Wolff', 'Yverdon', 'Zalko',
];

function ensureSettings() {
    if (!extension_settings[EXTENSION_NAME]) {
        extension_settings[EXTENSION_NAME] = { ...defaultSettings };
    }

    const settings = extension_settings[EXTENSION_NAME];

    if (typeof settings.autoSelectNewCharacter !== 'boolean') {
        settings.autoSelectNewCharacter = defaultSettings.autoSelectNewCharacter;
    }

    return settings;
}

function sample(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function sampleMany(array, count) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

function formatTemplate(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
        return Object.prototype.hasOwnProperty.call(context, key) ? context[key] : '';
    });
}

function sanitizeName(name) {
    return name
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s'-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function generateName() {
    const useFullNamePool = Math.random() < 0.15;
    if (useFullNamePool) {
        const first = sample(FIRST_NAMES);
        const second = sample(LAST_NAMES);
        return `${first} ${second}`;
    }

    const firstName = sample(FIRST_NAMES);
    const lastName = sample(LAST_NAMES);
    return `${firstName} ${lastName}`;
}

function buildGoalSnippet(motivation) {
    return motivation.thirdPerson
        .replace(/^Iel\s+/i, '')
        .replace(/\.$/, '');
}

function buildDepthPrompt(name, identity, motivation, tone) {
    const identityFocus = identity.description.replace(/^est\s+/i, '').replace(/\.$/, '');
    return `Rappelle-toi que ${name} est ${identityFocus}. ${motivation.thirdPerson} ${tone.conversation}`;
}

function buildTags(identity, setting, tone) {
    const tags = new Set(['oc', 'aleatoire', identity.label]);
    if (setting.tag) {
        tags.add(setting.tag);
    }
    if (tone.tag) {
        tags.add(tone.tag);
    }
    return Array.from(tags);
}

function buildExample(context) {
    const opening = formatTemplate(sample(EXAMPLE_OPENINGS), context);
    const reply = formatTemplate(sample(EXAMPLE_USER_REPLIES), context);
    const follow = formatTemplate(sample(EXAMPLE_FOLLOW_UPS), context);
    return `<START>
{{char}}: ${opening}
{{user}}: ${reply}
{{char}}: ${follow}`;
}

function buildCreatorNotes(identity, setting, relationship, tone) {
    return `Généré automatiquement via l'extension Random Tavern. Profil: ${identity.label}. Cadre: ${setting.description} ${relationship.bond} ${tone.conversation}`;
}

function buildProfilePreview(profile) {
    const sections = [
        `Nom : ${profile.name}`,
        `Description : ${profile.description}`,
        `Personnalité : ${profile.personality}`,
        `Scénario : ${profile.scenario}`,
        `Premier message : ${profile.firstMes}`,
        `Notes créateur : ${profile.creatorNotes}`,
        `Tags : ${profile.tags.join(', ')}`,
    ];

    return sections.join('

');
}

function generateProfile() {
    const identity = sample(IDENTITIES);
    const background = sample(BACKGROUNDS);
    const motivation = sample(MOTIVATIONS);
    const quirk = sample(QUIRKS);
    const relationship = sample(RELATIONSHIPS);
    const setting = sample(SETTINGS);
    const tone = sample(TONES);
    const name = sanitizeName(generateName()) || 'Personnage Mystère';
    const firstName = name.split(' ')[0] ?? name;

    const goalSnippet = buildGoalSnippet(motivation);

    const context = {
        name,
        firstName,
        identityLabel: identity.label,
        goal: goalSnippet,
        settingTag: setting.tag,
        quirk: quirk.firstPerson,
    };

    const description = `${name} ${identity.description} ${background} ${quirk.thirdPerson}`;
    const personality = `${motivation.thirdPerson} ${tone.personality} ${relationship.bond}`;
    const scenario = `${setting.description} ${formatTemplate(relationship.scenario, context)}`.trim();
    const hook = formatTemplate(sample(FIRST_MESSAGE_HOOKS), context);
    const firstMes = `${formatTemplate(relationship.firstPerson, context)} ${motivation.firstPerson} ${hook}`.replace(/\s+/g, ' ').trim();
    const mesExample = buildExample(context);
    const creatorNotes = buildCreatorNotes(identity, setting, relationship, tone);
    const tags = buildTags(identity, setting, tone);
    const depthPrompt = buildDepthPrompt(name, identity, motivation, tone);
    const alternateGreetings = sampleMany(ALTERNATE_GREETINGS, 2);

    return {
        name,
        description,
        personality,
        scenario,
        firstMes,
        mesExample,
        creatorNotes,
        tags,
        talkativeness: 0.55,
        version: '1.0.0',
        systemPrompt: '',
        postHistoryInstructions: '',
        depthPrompt,
        depthPromptDepth: 4,
        depthPromptRole: 'system',
        alternateGreetings,
        preview: buildProfilePreview({
            name,
            description,
            personality,
            scenario,
            firstMes,
            creatorNotes,
            tags,
        }),
    };
}

function buildFormData(profile) {
    const formData = new FormData();
    formData.set('ch_name', profile.name);
    formData.set('description', profile.description);
    formData.set('personality', profile.personality);
    formData.set('scenario', profile.scenario);
    formData.set('first_mes', profile.firstMes);
    formData.set('mes_example', profile.mesExample);
    formData.set('creator_notes', profile.creatorNotes);
    formData.set('tags', profile.tags.join(', '));
    formData.set('creator', 'Random Tavern');
    formData.set('character_version', profile.version);
    formData.set('talkativeness', String(profile.talkativeness));
    formData.set('fav', 'false');
    formData.set('world', '');
    formData.set('system_prompt', profile.systemPrompt);
    formData.set('post_history_instructions', profile.postHistoryInstructions);
    formData.set('depth_prompt_prompt', profile.depthPrompt);
    formData.set('depth_prompt_depth', String(profile.depthPromptDepth));
    formData.set('depth_prompt_role', profile.depthPromptRole);
    formData.set('json_data', '');

    for (const greeting of profile.alternateGreetings) {
        formData.append('alternate_greetings', greeting);
    }

    return formData;
}

function updatePreview(profile) {
    const previewRef = $('#randomGeneratorPreviewText');
    const previewWrapper = previewRef.closest('.randomgenerator-preview');
    previewRef.text(profile.preview);
    previewWrapper.prop('hidden', false);
}

async function createRandomCharacter() {
    const settings = ensureSettings();
    const button = $('#randomGeneratorCreate');

    if (button.hasClass('disabled')) {
        return;
    }

    const profile = generateProfile();
    updatePreview(profile);

    const formData = buildFormData(profile);
    button.addClass('disabled loading').attr('aria-disabled', 'true');

    try {
        const response = await fetch('/api/characters/create', {
            method: 'POST',
            headers: getRequestHeaders({ omitContentType: true }),
            body: formData,
            cache: 'no-cache',
        });

        if (!response.ok) {
            throw new Error(`Statut ${response.status}`);
        }

        const avatarFileName = await response.text();
        toastr.success(`Personnage "${profile.name}" créé.`, 'Random Tavern');

        await getCharacters();

        if (settings.autoSelectNewCharacter) {
            const newIndex = characters.findIndex(character => character.avatar === avatarFileName);
            if (newIndex >= 0) {
                await selectCharacterById(newIndex, { switchMenu: false });
            }
        }
    } catch (error) {
        console.error('Impossible de créer le personnage aléatoire :', error);
        toastr.error('Impossible de créer le personnage aléatoire. Vérifie la console pour plus de détails.', 'Random Tavern');
    } finally {
        button.removeClass('disabled loading').attr('aria-disabled', 'false');
    }
}

function renderExtension(settings) {
    const container = $(document.getElementById('randomGeneratorExtension') ?? document.getElementById('extensions_settings2'));
    const html = `
    <div id="randomGeneratorExtension">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Générateur narratif aléatoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="randomgenerator-helper">
                    Générez instantanément un personnage original construit à partir de profils et d'ambiances poétiques.
                </div>
                <label class="checkbox_label" for="randomGeneratorAutoSelect">
                    <input type="checkbox" id="randomGeneratorAutoSelect" ${settings.autoSelectNewCharacter ? 'checked' : ''}>
                    Sélectionner automatiquement le personnage créé
                </label>
                <div id="randomGeneratorCreate" class="menu_button" role="button" tabindex="0">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    Créer un personnage aléatoire
                </div>
                <div class="randomgenerator-preview" hidden>
                    <span class="randomgenerator-preview-title">Dernière génération</span>
                    <pre id="randomGeneratorPreviewText"></pre>
                </div>
            </div>
        </div>
    </div>`;

    container.append(html);

    $('#randomGeneratorAutoSelect').on('change', function () {
        settings.autoSelectNewCharacter = $(this).prop('checked');
        saveSettingsDebounced();
    });

    $('#randomGeneratorCreate').on('click', createRandomCharacter);
    $('#randomGeneratorCreate').on('keypress', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            createRandomCharacter();
        }
    });
}

jQuery(() => {
    const settings = ensureSettings();
    renderExtension(settings);
});
