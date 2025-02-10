import { Catalog } from '@/types/questions';

export const catalog2012: Catalog = {
  id: 'catalog-2012',
  year: 2012,
  title: 'Haftpflicht Underwriter Prüfung 2012',
  modules: [
    {
      id: 'module-1',
      title: 'Modul I - Haftung des Warenproduzenten',
      categories: [
        {
          id: 'cat-1-1',
          title: 'Grundlagen der Haftung',
          questions: [
            {
              id: '1.1',
              text: 'Kontext: In einem Fall wird untersucht, welche schuldrechtlichen Anspruchsgrundlagen gegen einen Hersteller oder Verkäufer bestehen können. Der Käufer einer Heizung erleidet einen Schaden und möchte Schadenersatz geltend machen.\n\nWelche schuldrechtlichen Anspruchsgrundlagen kommen (realistisch) in Betrachtung? Bitte nennen Sie nur die Paragrafen mit einer kurzen Begründung!',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: '§ 280 Abs. 1 BGB in Verbindung mit § 241 Abs. 2 BGB',
                  isCorrect: true
                },
                {
                  text: '§ 437 Nr. 3 BGB in Verbindung mit § 280 Abs. 1 BGB',
                  isCorrect: true
                },
                {
                  text: '§ 823 Abs. 1 BGB',
                  isCorrect: false,
                  explanation: 'Dies ist eine deliktische Anspruchsgrundlage, während hier nur schuldrechtliche Ansprüche gefragt sind.'
                },
                {
                  text: '§ 437 Nr. 3 BGB in Verbindung mit §§ 280 Abs. 1 und III, 281 Abs. 1 BGB',
                  isCorrect: true
                },
                {
                  text: '§ 1004 BGB',
                  isCorrect: false,
                  explanation: '§ 1004 BGB betrifft die Beseitigung und Unterlassung von Störungen im Sachenrecht, nicht schuldrechtliche Ansprüche.'
                }
              ]
            },
            {
              id: '1.2',
              text: 'Kontext: In dem Heizungsfall geht es darum, ob der Käufer nach Eintritt des Schadens noch Ansprüche geltend machen kann oder ob die Ansprüche bereits verjährt sind.\n\nUnterstellt, die Voraussetzungen der genannten schuldrechtlichen Anspruchsgrundlagen liegen vor. Bitte prüfen Sie, ob die schuldrechtlichen Ansprüche nicht möglicherweise verjährt sind.',
              points: 4,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Regelverjährung über §§ 195 ff. BGB beträgt drei Jahre',
                  isCorrect: true
                },
                {
                  text: 'Verjährung nach § 438 Abs. 1 Nr. 3 BGB für Mängelansprüche beträgt fünf Jahre',
                  isCorrect: false,
                  explanation: 'Die Verjährung für Mängelansprüche beträgt in der Regel zwei Jahre, es sei denn, es handelt sich um Bauwerke.'
                },
                {
                  text: 'Verjährung beginnt mit dem Abschluss des Vertrags',
                  isCorrect: false,
                  explanation: 'Die Verjährung beginnt erst mit der Kenntnis des Schadens, nicht mit Vertragsabschluss.'
                },
                {
                  text: 'Ein Weiterfresserschaden könnte eine andere Verjährungsfrist zur Folge haben',
                  isCorrect: true
                },
                {
                  text: 'Die Verjährung kann durch Verhandlungen mit dem Schuldner gehemmt werden',
                  isCorrect: true
                }
              ]
            },
            {
              id: '1.3',
              text: 'Kontext: Grundsätzlich verjähren Ansprüche nach einer bestimmten Zeit. Doch was passiert genau, wenn die Verjährung eintritt?\n\nWas bewirkt eine eingetretene Verjährung?',
              points: 0.5,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Der Anspruch erlischt automatisch',
                  isCorrect: false,
                  explanation: 'Die Verjährung führt nicht zum Erlöschen des Anspruchs, sondern macht ihn nur nicht mehr durchsetzbar.'
                },
                {
                  text: 'Der Schuldner kann sich auf Verjährung berufen und muss dann nicht leisten',
                  isCorrect: true
                },
                {
                  text: 'Eine Verjährung hat keine rechtlichen Konsequenzen',
                  isCorrect: false,
                  explanation: 'Verjährung bedeutet, dass der Schuldner sich darauf berufen kann, um nicht mehr leisten zu müssen.'
                },
                {
                  text: 'Die Verjährung kann durch eine Klage nachträglich aufgehoben werden',
                  isCorrect: false,
                  explanation: 'Eine Klage hemmt die Verjährung, aber hebt sie nicht nachträglich auf.'
                },
                {
                  text: 'Verjährung ist eine Einrede, die geltend gemacht werden muss',
                  isCorrect: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Modul II - Haftung und Versicherung im Baugewerbe',
      categories: [
        {
          id: 'cat-2-1',
          title: 'Haftung im Baugewerbe',
          questions: [
            {
              id: '2.1',
              text: 'Kontext: Ein Bauherr klagt wegen eines Baugrundfehlers. Der Architekt und der Ingenieur verteidigen sich, indem sie sagen, dass sie nicht für den Baugrund verantwortlich sind.\n\nAls B Schadenersatz fordert, verteidigen sich A und I damit, dass sie für die Baugrundverhältnisse nicht verantwortlich sind. Wie ist diese Argumentation zu bewerten?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Der Bauherr ist für den Baugrund verantwortlich, aber der Architekt muss die Baugrundprüfung empfehlen',
                  isCorrect: true
                },
                {
                  text: 'Der Architekt haftet nie für den Baugrund',
                  isCorrect: false,
                  explanation: 'Architekten müssen die Baugrundprüfung empfehlen, sonst kann eine Haftung entstehen.'
                },
                {
                  text: 'Das Ingenieurbüro haftet für fehlerhafte Bodenuntersuchungen',
                  isCorrect: true
                },
                {
                  text: 'Eine falsche Baugrundprüfung ist irrelevant für die Haftung',
                  isCorrect: false,
                  explanation: 'Eine fehlerhafte Baugrundprüfung kann dazu führen, dass falsche Planungen entstehen, was zu Schäden führen kann.'
                },
                {
                  text: 'Der Bauherr trägt immer die alleinige Verantwortung',
                  isCorrect: false,
                  explanation: 'Der Bauherr ist primär verantwortlich, aber Planer und Ingenieure haben Prüfpflichten.'
                }
              ]
            },
            {
              id: '5.1',
              text: 'Kontext: Eine Kunststiftung hat Baumängel festgestellt. Sie prüft, gegen wen sie aus welcher Norm Ansprüche erheben kann.\n\nDie Kunststiftung überlegt, gegen wen sie aus welcher Norm Ansprüche erheben könnte.',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Der Architekt haftet für fehlerhafte Bauüberwachung',
                  isCorrect: true
                },
                {
                  text: 'Firma D haftet für das Glasdach',
                  isCorrect: true
                },
                {
                  text: 'Klimatechniker R haftet für die Klimaanlage',
                  isCorrect: true
                },
                {
                  text: 'Der Bauherr haftet für alle Mängel',
                  isCorrect: false,
                  explanation: 'Der Bauherr haftet in der Regel nicht für Baumängel, außer bei bestimmten Vertragspflichten.'
                },
                {
                  text: 'Ein Sachverständiger kann grundsätzlich nicht haftbar gemacht werden',
                  isCorrect: false,
                  explanation: 'Sachverständige können haften, wenn sie fehlerhafte Gutachten ausstellen.'
                }
              ]
            },
            {
              id: '6',
              text: 'Kontext: In einer Haftungskonstellation besteht eine Gesamtschuldnerschaft. Dabei geht es um den Ausgleichsanspruch zwischen mehreren Schuldnern.\n\nWann verjährt der Ausgleichsanspruch nach § 426 BGB?',
              points: 1,
              isMultipleChoice: false,
              answers: [
                {
                  text: 'Nach 6 Monaten',
                  isCorrect: false,
                  explanation: 'Die gesetzliche Verjährungsfrist beträgt 3 Jahre.'
                },
                {
                  text: 'Nach 1 Jahr',
                  isCorrect: false,
                  explanation: 'Die Verjährung beträgt nicht nur 1 Jahr, sondern 3 Jahre.'
                },
                {
                  text: 'Nach 3 Jahren',
                  isCorrect: true
                },
                {
                  text: 'Nach 10 Jahren',
                  isCorrect: false,
                  explanation: 'Die Regelverjährung beträgt 3 Jahre, außer es gibt Sonderregelungen.'
                },
                {
                  text: 'Verjährung tritt gar nicht ein',
                  isCorrect: false,
                  explanation: 'Jeder Anspruch unterliegt der Verjährung.'
                }
              ]
            },
            {
              id: '8.1',
              text: 'Kontext: Eine Baustelle muss gegen Gefahren abgesichert sein. Wer ist für die Verkehrssicherungspflicht verantwortlich?\n\nWas versteht man unter Verkehrssicherungspflichten?',
              points: 1,
              isMultipleChoice: false,
              answers: [
                {
                  text: 'Eine Pflicht zur Absicherung öffentlicher Straßen',
                  isCorrect: false,
                  explanation: 'Verkehrssicherungspflichten betreffen nicht nur öffentliche Straßen, sondern alle Gefahrenquellen.'
                },
                {
                  text: 'Wer eine Gefahrenquelle schafft, muss Dritte vor Schaden bewahren',
                  isCorrect: true
                },
                {
                  text: 'Nur Bauunternehmer sind für die Verkehrssicherung verantwortlich',
                  isCorrect: false,
                  explanation: 'Auch Architekten und Planer können verkehrssicherungspflichtig sein.'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}; 