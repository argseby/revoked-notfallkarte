type Params = Record<string, string | number>;
export type Message = string | ((p: Params) => string);

export const en = {
  // Shell
  'app.title': 'Notfallkarte provided by Revoked',
  'brand.name': 'Notfallkarte',
  'brand.by': 'provided by',
  'shell.theme': 'Switch theme',
  'shell.language': 'Deutsch',
  'shell.about': 'How it works',
  'shell.nav': 'Sections',

  // Common
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.done': 'Done',
  'common.loading': 'Loading',
  'common.copied': 'Copied',
  'common.copyBlocked': 'Copying is blocked in this browser. Select the text and copy it manually.',

  // Landing
  'landing.eyebrow': 'For your wallet',
  'landing.title': 'An emergency card with data that is always up to date.',
  'landing.lead':
    'Your emergency data is stored in your Revoked vault. The card has a QR code printed on it. A helper scans the code and sees your current data.',
  'landing.point1': 'Changes in Revoked apply immediately to every printed card',
  'landing.point2': 'If you lose the card, you can revoke the link',
  'landing.point3': 'Helpers only need a phone camera, no app and no account',
  'landing.how': 'How it works',
  'landing.step1.title': 'Store your data in Revoked',
  'landing.step1.body':
    'Your emergency contact, allergies, medication and doctor are stored in your Revoked vault. Revoked asks for missing information when you create the card.',
  'landing.step2.title': 'Choose the contents',
  'landing.step2.body':
    'You choose which information a helper can see. Revoked shows you the contents of the link. The link is only created after you confirm.',
  'landing.step3.title': 'Print the card',
  'landing.step3.body':
    'The link is printed as a QR code on a card the size of a bank card. You can download and print the card.',
  'landing.step4.title': 'Update or revoke',
  'landing.step4.body':
    'You can change your data in Revoked at any time. The printed card then shows the new data. If you revoke the link, the card stops working.',
  'landing.trust1.title': 'Notfallkarte has no access to your vault',
  'landing.trust1.body':
    'Notfallkarte has no account of its own. It tells Revoked which records the card should contain. It receives the finished link only to create the QR code from it.',
  'landing.trust2.title': 'Anyone with the card can read the data',
  'landing.trust2.body':
    'You therefore choose which information the card shows. Revoked shows you when the link has been opened.',
  'landing.trust3.title': 'The card only shows your name and a QR code',
  'landing.trust3.body': 'Your data is not printed on the card. You can change the data behind the code or revoke the link at any time.',
  'landing.start': 'Make a card',
  'landing.footer': 'Notfallkarte is built on Revoked, a self-hostable platform for revocable sharing.',
  'landing.demoName': 'Alex Example',

  'about.eyebrow': 'Provided by',
  'about.lead': 'Share personal data and keep control of it.',
  'about.body':
    'Revoked is a platform for sharing and collecting personal information. You share a link to your data instead of sending copies. The link always shows the current version. You can pause or revoke it at any time. Notfallkarte is a tool built on Revoked. It has no account of its own and no access to your vault.',
  'about.more': 'Learn more at revoked.link',
  'about.live.title': 'Links instead of copies',
  'about.live.body':
    'A link loads your data only when it is opened. When you change a record, every link shows the new version. When you revoke a link, nobody can open it anymore.',
  'about.verified.title': 'Verifiable senders',
  'about.verified.body':
    'Identities are tied to the server’s domain. A recipient can check in the Revoked app whether a link comes from you.',
  'about.host.title': 'Hosted or on your own server',
  'about.host.body': 'You can use the hosted service or run Revoked under your own domain.',
  'about.more.title': 'For other data too',
  'about.more.body':
    'You can use the vault for any data you share regularly. With requests, you can also collect information from other people.',

  // The one screen
  'tab.new': 'New card',
  'tab.new.short': 'New',
  'tab.list': 'My cards',
  'tab.list.short': 'Cards',
  'tab.settings': 'Settings',
  'new.title': 'New emergency card',
  'tool.note': 'Revoked shows you the contents of the link before it is created. You can enter missing information there. It is saved in your vault.',
  'tool.name': 'Name on the card',
  'tool.namePlaceholder': 'Alex Example',
  'tool.nameHint': 'The name is printed on the card and used as the name of the link.',
  'tool.groups': 'Contents of the card',
  'tool.always': 'Your full name is always included.',
  'tool.public':
    'A person with access to the card gets access to this information. You can disable individual entries in Revoked.',
  'tool.continue': 'Continue in Revoked',
  'tool.remove': 'Remove from this list',

  'group.contact': 'Emergency contact',
  'group.medical': 'Medical details',
  'group.doctor': 'Doctor',
  'group.donor': 'Organ donation',
  'group.insurance': 'Health insurance',

  'field.full_name': 'Full name',
  'field.contact_name': 'Name',
  'field.contact_phone': 'Phone number',
  'field.contact_relation': 'Relationship',
  'field.blood_type': 'Blood type',
  'field.allergies': 'Allergies',
  'field.medications': 'Current medications',
  'field.doctor_name': 'Name',
  'field.doctor_phone': 'Phone number',
  'field.organ_donor': 'Organ donor (yes/no)',
  'field.insurance_provider': 'Insurer',
  'field.insurance_number': 'Insurance number',

  'list.title': 'My cards',
  'list.card': 'Card',
  'list.open': 'New link',
  'list.openHint': 'Create a new link for this card in Revoked',
  'list.empty': 'You have no cards yet. Create a card to set up a link in Revoked.',
  'list.connectHint': 'If you connect Notfallkarte with Revoked, a card’s link is transferred automatically:',
  'list.groups': (p) => `Contains: ${p.names}`,

  'remove.title': (p) => `Remove the card for ${p.name}?`,
  'remove.plain': 'The card is removed from this list. Nothing changes in Revoked.',
  'remove.staysLive':
    'The card is removed from this list. The link stays active and a printed card continues to work. You can revoke the link in Revoked.',
  'remove.revokes': 'The link is revoked and the card is removed from this list. A printed card will no longer work.',
  'remove.action': 'Remove',
  'remove.revokeAction': 'Revoke and remove',
  'remove.revokeFailed': 'The link could not be revoked. Try again or revoke it in Revoked.',

  'reason.revoke': 'Notfallkarte revokes the link when you remove the card from your list.',
  'reason.links': 'Notfallkarte needs the link to create the QR code for your card.',
  'perm.revoke.on': 'May revoke a link when you remove its card',
  'perm.revoke.off': 'May not revoke links',
  'perm.links.on': 'May receive the links it proposed, to create the QR code',
  'perm.links.off': 'May not receive links. You paste the links yourself.',
  'perm.change': 'You can change this in Revoked under Settings → Workspace → Connected tools.',

  'propose.title': 'Continue in Revoked',
  'propose.body': (p) =>
    `Revoked now opens with the emergency card for ${p.name}. Check the information and create the link. Afterwards you return here for the card.`,
  'propose.open': 'Open Revoked',
  'propose.qrHint': 'If you use Revoked on your phone, scan this code.',
  'propose.noApp': 'If nothing opens, install the Revoked app and sign in.',
  'propose.code': 'Revoked shows this code:',
  'propose.codeHint':
    'Continue there only if it shows the same code. This page then carries on by itself. You can simply come back to it.',
  'propose.copy': 'Copy link',
  'propose.copied': 'Link copied. Open it on a device where Revoked is installed.',
  'share.qr': (p) => `QR code for ${p.url}`,

  'card.title': (p) => `Emergency card · ${p.name}`,
  'card.preview': (p) => `Emergency card for ${p.name} with a QR code for ${p.url}`,
  'card.ready':
    'The QR code opens your link. Print the card at 100 % size, cut it out and keep it in your wallet, phone case or glovebox.',
  'card.test': 'Scan the card once yourself to test it.',
  'card.pasted': 'This QR code contains a link you pasted. Check that it is the correct link.',
  'card.png': 'Image (PNG)',
  'card.pdf': 'Print sheet (PDF)',
  'card.copy': 'Copy link',
  'card.copied': 'Link copied',
  'card.failed': 'The file could not be created in this browser.',
  'card.caption': 'Print at 100 % size (no scaling) and cut the card out along the edge.',
  'card.missing.notConnected':
    'This card has no link yet. Create the link in Revoked. If you connect Notfallkarte while doing so, the link is transferred automatically. You can also paste an existing link.',
  'card.missing.noLink': 'No link has been created for this card yet. Create the link in Revoked.',
  'card.missing.ended':
    'The link for this card is paused, revoked or expired. A printed card no longer works. Create a new link in Revoked and print the card again.',
  'card.missing.noPermission':
    'Revoked created the link, but Notfallkarte may not receive links. Allow this in Revoked under Connected tools, or copy the link there and paste it here.',
  'card.missing.notHandedOver':
    'Revoked created the link but did not transfer it. Links with a hidden value are not transferred. Copy the link in Revoked and paste it here.',
  'card.create': 'Create the link in Revoked',
  'card.paste': 'Link from Revoked',
  'card.pasteHint': 'The link is only used for the QR code and is deleted when you close the tab.',
  'card.pasteAction': 'Use this link',
  'card.pasteInvalid': 'This link is not valid. It must start with https://',

  'link.active': 'Active',
  'link.paused': 'Paused',
  'link.revoked': 'Revoked',
  'link.expired': 'Expired',
  'link.opened': (p) => `opened ${p.n}×`,
  'link.notOpened': 'not opened yet',
  'link.none': 'No link created yet',

  'connect.title': 'Connect with Revoked',
  'connect.body':
    'Revoked now opens and shows you the permissions of the connection. Afterwards you return here. Links are then transferred automatically.',
  'connect.pitch':
    'If you connect Notfallkarte with Revoked, a card’s link is transferred automatically. You also see how often a card was scanned. Notfallkarte still has no access to your vault.',
  'connect.connected': (p) => `Connected to Revoked on ${p.host}.`,
  'connect.disconnect': 'Disconnect',
  'connect.failed': 'The connection failed. Try again.',

  'settings.connection': 'Connection to Revoked',
  'settings.connectedHint':
    'Notfallkarte sees the status of your links and receives the links you transfer. It has no access to your vault. You can also end the connection in Revoked.',
  'settings.server': 'Your Revoked server (optional)',
  'settings.serverHint':
    'With the address, this page notices by itself when you have answered in Revoked, even in another browser or on your phone. It is filled in once you have connected.',
  'settings.serverInvalid': 'This is not a valid address. It must start with https://',
  'settings.display': 'Display',
  'settings.language': 'Language',
  'settings.theme': 'Theme',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
} satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;
