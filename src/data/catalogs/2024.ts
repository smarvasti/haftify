import { Catalog } from '@/types/questions';

export const catalog2024: Catalog = {
  id: 'catalog-2024',
  year: 2024,
  title: 'Master Katalog 2024',
  modules: [
    {
      id: 'module-1-2024',
      title: 'Modul I - Cyber Risiken und digitale Haftung',
      categories: [
        {
          id: 'cat-1-1-2024',
          title: 'Grundlagen der Cyber-Haftung',
          questions: [
            {
              id: '1.1-2024',
              text: 'Ein Unternehmen erleidet einen Ransomware-Angriff, bei dem Kundendaten verschlüsselt und gestohlen werden. Welche Haftungsrisiken bestehen hier primär?',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Haftung nach DSGVO für den Verlust von personenbezogenen Daten',
                  isCorrect: true
                },
                {
                  text: 'Vertragliche Haftung gegenüber Kunden für Datenverlust',
                  isCorrect: true
                },
                {
                  text: 'Haftung für Lösegeldzahlungen gegenüber den Angreifern',
                  isCorrect: false,
                  explanation: 'Lösegeldzahlungen sind keine Haftungsansprüche, sondern Erpressungsversuche.'
                },
                {
                  text: 'Haftung für Betriebsunterbrechung bei Geschäftspartnern',
                  isCorrect: true
                }
              ]
            },
            {
              id: '1.2-2024',
              text: 'Welche Maßnahmen sind nach der aktuellen Rechtsprechung für ein angemessenes IT-Sicherheitsniveau in Unternehmen mindestens erforderlich?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Regelmäßige Backups und Patch-Management',
                  isCorrect: true
                },
                {
                  text: 'Zwei-Faktor-Authentifizierung für kritische Systeme',
                  isCorrect: true
                },
                {
                  text: 'Jährliche Penetrationstests durch externe Dienstleister',
                  isCorrect: false,
                  explanation: 'Penetrationstests sind empfehlenswert, aber nicht zwingend vorgeschrieben.'
                },
                {
                  text: 'Dokumentierte Incident-Response-Pläne',
                  isCorrect: true
                }
              ]
            }
          ]
        },
        {
          id: 'cat-1-2-2024',
          title: 'Digitale Produkthaftung',
          questions: [
            {
              id: '1.3-2024',
              text: 'Ein Softwarefehler in einer KI-gesteuerten Produktionsanlage führt zu Qualitätsmängeln. Wie ist die Haftungssituation zu bewerten?',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Der Softwarehersteller haftet für Fehler in der KI-Logik',
                  isCorrect: true
                },
                {
                  text: 'Der Anlagenbetreiber haftet für mangelnde Überwachung',
                  isCorrect: true
                },
                {
                  text: 'Die KI selbst ist als eigenständige Rechtsperson haftbar',
                  isCorrect: false,
                  explanation: 'KI-Systeme sind keine eigenständigen Rechtssubjekte und können nicht selbst haften.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module-2-2024',
      title: 'Modul II - ESG und Nachhaltigkeitshaftung',
      categories: [
        {
          id: 'cat-2-1-2024',
          title: 'Umwelt- und Klimahaftung',
          questions: [
            {
              id: '2.1-2024',
              text: 'Ein Unternehmen wird wegen falscher CO2-Bilanzierung verklagt. Welche Haftungsrisiken bestehen nach aktueller Rechtslage?',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Haftung nach dem Lieferkettensorgfaltspflichtengesetz',
                  isCorrect: true
                },
                {
                  text: 'Prospekthaftung bei börsennotierten Unternehmen',
                  isCorrect: true
                },
                {
                  text: 'Strafrechtliche Haftung der Geschäftsführung',
                  isCorrect: true
                },
                {
                  text: 'Automatische Haftung für Klimaschäden',
                  isCorrect: false,
                  explanation: 'Eine pauschale Haftung für Klimaschäden existiert nicht.'
                }
              ]
            },
            {
              id: '2.2-2024',
              text: 'Welche Sorgfaltspflichten bestehen nach dem LkSG für Unternehmen in Bezug auf ihre Lieferkette?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Risikoanalyse der gesamten Lieferkette',
                  isCorrect: true
                },
                {
                  text: 'Präventionsmaßnahmen bei identifizierten Risiken',
                  isCorrect: true
                },
                {
                  text: 'Vollständige Kontrolle aller Zulieferer',
                  isCorrect: false,
                  explanation: 'Das Gesetz verlangt keine vollständige Kontrolle, sondern risikobasierte Maßnahmen.'
                },
                {
                  text: 'Dokumentation und Berichterstattung',
                  isCorrect: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module-3-2024',
      title: 'Modul III - Neue Technologien und Haftungsrisiken',
      categories: [
        {
          id: 'cat-3-1-2024',
          title: 'Autonome Systeme',
          questions: [
            {
              id: '3.1-2024',
              text: 'Ein autonomes Fahrzeug verursacht einen Unfall. Wie verteilt sich die Haftung nach aktueller Rechtslage?',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Gefährdungshaftung des Halters nach StVG',
                  isCorrect: true
                },
                {
                  text: 'Produkthaftung des Herstellers für Systemfehler',
                  isCorrect: true
                },
                {
                  text: 'Haftung des "Fahrers" für Überwachungsfehler',
                  isCorrect: false,
                  explanation: 'Bei vollautonomen Systemen besteht keine Überwachungspflicht des Insassen.'
                }
              ]
            },
            {
              id: '3.2-2024',
              text: 'Welche Besonderheiten gelten bei der Versicherung von autonomen Drohnen im gewerblichen Einsatz?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Pflicht zur Haftpflichtversicherung nach LuftVG',
                  isCorrect: true
                },
                {
                  text: 'Erfordernis einer speziellen Cyber-Deckung',
                  isCorrect: true
                },
                {
                  text: 'Automatische Deckung durch Betriebshaftpflicht',
                  isCorrect: false,
                  explanation: 'Drohnenrisiken sind meist nicht automatisch in der Betriebshaftpflicht eingeschlossen.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module-4-2024',
      title: 'Modul IV - Internationale Haftungsszenarien',
      categories: [
        {
          id: 'cat-4-1-2024',
          title: 'Grenzüberschreitende Haftung',
          questions: [
            {
              id: '4.1-2024',
              text: 'Ein deutsches Unternehmen wird in den USA wegen Produktmängeln verklagt. Was ist zu beachten?',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Risiko von Strafschadensersatz (punitive damages)',
                  isCorrect: true
                },
                {
                  text: 'Höhere Beweislast für den Beklagten',
                  isCorrect: true
                },
                {
                  text: 'Automatische Anwendung deutschen Rechts',
                  isCorrect: false,
                  explanation: 'US-Gerichte wenden in der Regel US-Recht an.'
                },
                {
                  text: 'Notwendigkeit lokaler Rechtsvertretung',
                  isCorrect: true
                }
              ]
            },
            {
              id: '4.2-2024',
              text: 'Welche Besonderheiten gelten bei der Versicherung von Exportrisiken nach China?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Erfordernis lokaler Versicherungspolicen',
                  isCorrect: true
                },
                {
                  text: 'Spezielle Compliance-Anforderungen',
                  isCorrect: true
                },
                {
                  text: 'Verzicht auf Rückgriffsmöglichkeiten',
                  isCorrect: false,
                  explanation: 'Rückgriffsmöglichkeiten bleiben bestehen, müssen aber speziell vereinbart werden.'
                }
              ]
            }
          ]
        },
        {
          id: 'cat-4-2-2024',
          title: 'Regulatorische Compliance',
          questions: [
            {
              id: '4.3-2024',
              text: 'Welche neuen EU-Regularien müssen Unternehmen bei der Haftpflichtversicherung besonders beachten?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Corporate Sustainability Reporting Directive (CSRD)',
                  isCorrect: true
                },
                {
                  text: 'EU-Taxonomie-Verordnung',
                  isCorrect: true
                },
                {
                  text: 'Automatische Versicherungspflicht für alle Risiken',
                  isCorrect: false,
                  explanation: 'Es gibt keine generelle Versicherungspflicht für alle Risiken.'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}; 