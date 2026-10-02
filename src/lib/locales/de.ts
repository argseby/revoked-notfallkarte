import type { Message, MessageKey } from './en';

export const de: Record<MessageKey, Message> = {
  'app.title': 'Notfallkarte provided by Revoked',
  'brand.name': 'Notfallkarte',
  'brand.by': 'provided by',
  'shell.theme': 'Design wechseln',
  'shell.language': 'English',
  'shell.about': 'So funktioniert’s',
  'shell.nav': 'Bereiche',

  'common.cancel': 'Abbrechen',
  'common.close': 'Schließen',
  'common.done': 'Fertig',
  'common.loading': 'Lädt',
  'common.copied': 'Kopiert',
  'common.copyBlocked': 'Das Kopieren ist in diesem Browser blockiert. Markiere den Text und kopiere ihn manuell.',

  'landing.eyebrow': 'Für dein Portemonnaie',
  'landing.title': 'Eine Notfallkarte mit immer aktuellen Daten.',
  'landing.lead':
    'Deine Notfalldaten werden in deinem Revoked-Tresor gespeichert. Auf der Karte ist ein QR-Code gedruckt. Ein Helfer scannt den Code und sieht deine aktuellen Daten.',
  'landing.point1': 'Änderungen in Revoked gelten sofort für jede gedruckte Karte',
  'landing.point2': 'Bei Verlust der Karte kannst du den Link widerrufen',
  'landing.point3': 'Helfer benötigen nur eine Handykamera, keine App und kein Konto',
  'landing.how': 'So funktioniert’s',
  'landing.step1.title': 'Daten in Revoked speichern',
  'landing.step1.body':
    'Notfallkontakt, Allergien, Medikamente und Arzt werden in deinem Revoked-Tresor gespeichert. Revoked fragt fehlende Angaben beim Erstellen der Karte ab.',
  'landing.step2.title': 'Inhalte auswählen',
  'landing.step2.body':
    'Du wählst aus, welche Informationen ein Helfer sehen kann. Revoked zeigt dir den Inhalt des Links an. Der Link wird erst erstellt, wenn du bestätigst.',
  'landing.step3.title': 'Karte drucken',
  'landing.step3.body':
    'Der Link wird als QR-Code auf eine Karte im Scheckkartenformat gedruckt. Du kannst die Karte herunterladen und ausdrucken.',
  'landing.step4.title': 'Ändern oder widerrufen',
  'landing.step4.body':
    'Du kannst deine Daten jederzeit in Revoked ändern. Die gedruckte Karte zeigt dann die neuen Daten. Wenn du den Link widerrufst, funktioniert die Karte nicht mehr.',
  'landing.trust1.title': 'Notfallkarte hat keinen Zugriff auf deinen Tresor',
  'landing.trust1.body':
    'Notfallkarte hat kein eigenes Konto. Es teilt Revoked mit, welche Einträge die Karte enthalten soll. Den fertigen Link erhält es nur, um daraus den QR-Code zu erstellen.',
  'landing.trust2.title': 'Jede Person mit der Karte kann die Daten lesen',
  'landing.trust2.body':
    'Du wählst deshalb aus, welche Informationen die Karte zeigt. Revoked zeigt dir an, wenn der Link geöffnet wurde.',
  'landing.trust3.title': 'Auf der Karte stehen nur dein Name und ein QR-Code',
  'landing.trust3.body': 'Deine Daten sind nicht auf der Karte gedruckt. Du kannst die Daten hinter dem Code jederzeit ändern oder den Link widerrufen.',
  'landing.start': 'Karte erstellen',
  'landing.footer': 'Notfallkarte basiert auf Revoked, einer selbst hostbaren Plattform für widerrufbares Teilen.',
  'landing.demoName': 'Max Mustermann',

  'about.eyebrow': 'Bereitgestellt von',
  'about.lead': 'Persönliche Daten teilen und die Kontrolle behalten.',
  'about.body':
    'Revoked ist eine Plattform zum Teilen und Einsammeln persönlicher Informationen. Du teilst einen Link zu deinen Daten, statt Kopien zu verschicken. Der Link zeigt immer den aktuellen Stand. Du kannst ihn jederzeit pausieren oder widerrufen. Notfallkarte ist ein Tool auf Basis von Revoked. Es hat kein eigenes Konto und keinen Zugriff auf deinen Tresor.',
  'about.more': 'Mehr auf revoked.link',
  'about.live.title': 'Links statt Kopien',
  'about.live.body':
    'Ein Link lädt deine Daten erst beim Öffnen. Wenn du einen Eintrag änderst, zeigt jeder Link den neuen Stand. Wenn du einen Link widerrufst, kann ihn niemand mehr öffnen.',
  'about.verified.title': 'Überprüfbare Absender',
  'about.verified.body':
    'Identitäten sind an die Domain des Servers gebunden. Ein Empfänger kann in der Revoked-App prüfen, ob ein Link von dir stammt.',
  'about.host.title': 'Gehostet oder auf dem eigenen Server',
  'about.host.body': 'Du kannst den gehosteten Dienst nutzen oder Revoked unter deiner eigenen Domain betreiben.',
  'about.more.title': 'Auch für andere Daten',
  'about.more.body':
    'Du kannst den Tresor für alle Daten nutzen, die du regelmäßig teilst. Mit Anfragen kannst du außerdem Informationen von anderen Personen einsammeln.',

  'tab.new': 'Neue Karte',
  'tab.new.short': 'Neu',
  'tab.list': 'Meine Karten',
  'tab.list.short': 'Karten',
  'tab.settings': 'Einstellungen',
  'new.title': 'Neue Notfallkarte',
  'tool.note': 'Revoked zeigt dir den Inhalt des Links an, bevor er erstellt wird. Fehlende Angaben kannst du dort eintragen. Sie werden in deinem Tresor gespeichert.',
  'tool.name': 'Name auf der Karte',
  'tool.namePlaceholder': 'Max Mustermann',
  'tool.nameHint': 'Der Name wird auf die Karte gedruckt und als Name des Links verwendet.',
  'tool.groups': 'Inhalt der Karte',
  'tool.always': 'Dein vollständiger Name ist immer enthalten.',
  'tool.public':
    'Eine Person mit Zugriff auf die Karte erhält Zugriff auf diese Informationen. Du kannst in Revoked einzelne Einträge deaktivieren.',
  'tool.continue': 'Weiter in Revoked',
  'tool.remove': 'Aus dieser Liste entfernen',

  'group.contact': 'Notfallkontakt',
  'group.medical': 'Medizinische Angaben',
  'group.doctor': 'Arzt',
  'group.donor': 'Organspende',
  'group.insurance': 'Krankenversicherung',

  'field.full_name': 'Vollständiger Name',
  'field.contact_name': 'Name',
  'field.contact_phone': 'Telefonnummer',
  'field.contact_relation': 'Beziehung',
  'field.blood_type': 'Blutgruppe',
  'field.allergies': 'Allergien',
  'field.medications': 'Aktuelle Medikamente',
  'field.doctor_name': 'Name',
  'field.doctor_phone': 'Telefonnummer',
  'field.organ_donor': 'Organspender (ja/nein)',
  'field.insurance_provider': 'Versicherer',
  'field.insurance_number': 'Versichertennummer',

  'list.title': 'Meine Karten',
  'list.card': 'Karte',
  'list.open': 'Neuer Link',
  'list.openHint': 'In Revoked einen neuen Link für diese Karte erstellen',
  'list.empty': 'Du hast noch keine Karten. Erstelle eine Karte, um einen Link in Revoked anzulegen.',
  'list.connectHint': 'Wenn du Notfallkarte mit Revoked verbindest, wird der Link einer Karte automatisch übertragen:',
  'list.groups': (p) => `Enthält: ${p.names}`,

  'remove.title': (p) => `Karte für ${p.name} entfernen?`,
  'remove.plain': 'Die Karte wird aus dieser Liste entfernt. In Revoked ändert sich nichts.',
  'remove.staysLive':
    'Die Karte wird aus dieser Liste entfernt. Der Link bleibt aktiv und eine gedruckte Karte funktioniert weiterhin. Du kannst den Link in Revoked widerrufen.',
  'remove.revokes':
    'Der Link wird widerrufen und die Karte aus dieser Liste entfernt. Eine gedruckte Karte funktioniert danach nicht mehr.',
  'remove.action': 'Entfernen',
  'remove.revokeAction': 'Widerrufen und entfernen',
  'remove.revokeFailed': 'Der Link konnte nicht widerrufen werden. Versuche es erneut oder widerrufe ihn in Revoked.',

  'reason.revoke': 'Notfallkarte widerruft den Link, wenn du die Karte aus deiner Liste entfernst.',
  'reason.links': 'Notfallkarte benötigt den Link, um den QR-Code für deine Karte zu erstellen.',
  'perm.revoke.on': 'Darf einen Link widerrufen, wenn du die zugehörige Karte entfernst',
  'perm.revoke.off': 'Darf keine Links widerrufen',
  'perm.links.on': 'Darf die vorgeschlagenen Links erhalten, um den QR-Code zu erstellen',
  'perm.links.off': 'Darf keine Links erhalten. Du fügst die Links selbst ein.',
  'perm.change': 'Du kannst das in Revoked unter Einstellungen → Workspace → Verbundene Tools ändern.',

  'propose.title': 'Weiter in Revoked',
  'propose.body': (p) =>
    `Revoked wird jetzt mit der Notfallkarte für ${p.name} geöffnet. Prüfe die Angaben und erstelle den Link. Danach kehrst du für die Karte hierher zurück.`,
  'propose.open': 'Revoked öffnen',
  'propose.qrHint': 'Wenn du Revoked auf dem Handy nutzt, scanne diesen Code.',
  'propose.noApp': 'Wenn sich nichts öffnet, installiere die Revoked-App und melde dich an.',
  'propose.code': 'Revoked zeigt diesen Code:',
  'propose.codeHint':
    'Fahre dort nur fort, wenn derselbe Code angezeigt wird. Diese Seite macht dann von selbst weiter. Du kannst einfach hierher zurückkehren.',
  'propose.copy': 'Link kopieren',
  'propose.copied': 'Link kopiert. Öffne ihn auf einem Gerät, auf dem Revoked installiert ist.',
  'share.qr': (p) => `QR-Code für ${p.url}`,

  'card.title': (p) => `Notfallkarte · ${p.name}`,
  'card.preview': (p) => `Notfallkarte für ${p.name} mit einem QR-Code für ${p.url}`,
  'card.ready':
    'Der QR-Code öffnet deinen Link. Drucke die Karte in 100 % Größe, schneide sie aus und bewahre sie im Portemonnaie, in der Handyhülle oder im Handschuhfach auf.',
  'card.test': 'Scanne die Karte einmal selbst, um sie zu testen.',
  'card.pasted': 'Dieser QR-Code enthält einen Link, den du eingefügt hast. Prüfe, ob es der richtige Link ist.',
  'card.png': 'Bild (PNG)',
  'card.pdf': 'Druckbogen (PDF)',
  'card.copy': 'Link kopieren',
  'card.copied': 'Link kopiert',
  'card.failed': 'Die Datei konnte in diesem Browser nicht erstellt werden.',
  'card.caption': 'Drucke in 100 % Größe (ohne Skalierung) und schneide die Karte am Rand aus.',
  'card.missing.notConnected':
    'Diese Karte hat noch keinen Link. Erstelle den Link in Revoked. Wenn du dabei Notfallkarte verbindest, wird der Link automatisch übertragen. Du kannst auch einen vorhandenen Link einfügen.',
  'card.missing.noLink': 'Für diese Karte wurde noch kein Link erstellt. Erstelle den Link in Revoked.',
  'card.missing.ended':
    'Der Link dieser Karte ist pausiert, widerrufen oder abgelaufen. Eine gedruckte Karte funktioniert nicht mehr. Erstelle in Revoked einen neuen Link und drucke die Karte erneut.',
  'card.missing.noPermission':
    'Revoked hat den Link erstellt, aber Notfallkarte darf keine Links erhalten. Erlaube das in Revoked unter Verbundene Tools oder kopiere den Link dort und füge ihn hier ein.',
  'card.missing.notHandedOver':
    'Revoked hat den Link erstellt, aber nicht übertragen. Links mit einem verborgenen Wert werden nicht übertragen. Kopiere den Link in Revoked und füge ihn hier ein.',
  'card.create': 'Link in Revoked erstellen',
  'card.paste': 'Link aus Revoked',
  'card.pasteHint': 'Der Link wird nur für den QR-Code verwendet und beim Schließen des Tabs gelöscht.',
  'card.pasteAction': 'Diesen Link verwenden',
  'card.pasteInvalid': 'Dieser Link ist ungültig. Er muss mit https:// beginnen.',

  'link.active': 'Aktiv',
  'link.paused': 'Pausiert',
  'link.revoked': 'Widerrufen',
  'link.expired': 'Abgelaufen',
  'link.opened': (p) => `${p.n}× geöffnet`,
  'link.notOpened': 'noch nicht geöffnet',
  'link.none': 'Noch kein Link erstellt',

  'connect.title': 'Mit Revoked verbinden',
  'connect.body':
    'Revoked wird jetzt geöffnet und zeigt dir die Berechtigungen der Verbindung. Danach kehrst du hierher zurück. Links werden dann automatisch übertragen.',
  'connect.pitch':
    'Wenn du Notfallkarte mit Revoked verbindest, wird der Link einer Karte automatisch übertragen. Du siehst außerdem, wie oft eine Karte gescannt wurde. Notfallkarte hat auch dann keinen Zugriff auf deinen Tresor.',
  'connect.connected': (p) => `Mit Revoked auf ${p.host} verbunden.`,
  'connect.disconnect': 'Trennen',
  'connect.failed': 'Die Verbindung ist fehlgeschlagen. Versuche es erneut.',

  'settings.connection': 'Verbindung zu Revoked',
  'settings.connectedHint':
    'Notfallkarte sieht den Status deiner Links und erhält die Links, die du überträgst. Es hat keinen Zugriff auf deinen Tresor. Du kannst die Verbindung auch in Revoked trennen.',
  'settings.server': 'Dein Revoked-Server (optional)',
  'settings.serverHint':
    'Mit der Adresse merkt diese Seite von selbst, wenn du in Revoked geantwortet hast, auch in einem anderen Browser oder auf dem Handy. Sie wird ausgefüllt, sobald du verbunden bist.',
  'settings.serverInvalid': 'Das ist keine gültige Adresse. Sie muss mit https:// beginnen.',
  'settings.display': 'Anzeige',
  'settings.language': 'Sprache',
  'settings.theme': 'Design',
  'settings.light': 'Hell',
  'settings.dark': 'Dunkel',
};
