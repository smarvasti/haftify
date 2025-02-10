import { Catalog } from '@/types/questions';

export const catalog2013: Catalog = {
  id: 'catalog-2013',
  year: 2013,
  title: 'Haftpflicht Underwriter Prüfung 2013',
  modules: [
    {
      id: 'module-1-2013',
      title: 'Modul I - Produkthaftung und Rückruf',
      categories: [
        {
          id: 'cat-1-1-2013',
          title: 'Grundlagen der Produkthaftung',
          questions: [
            {
              id: '1.1-2013',
              text: 'Welche Voraussetzungen müssen für einen Anspruch nach dem Produkthaftungsgesetz vorliegen?',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Ein fehlerhaftes Produkt im Sinne des § 3 ProdHaftG',
                  isCorrect: true
                },
                {
                  text: 'Ein Schaden an Leben, Körper, Gesundheit oder Eigentum',
                  isCorrect: true
                },
                {
                  text: 'Ein Verschulden des Herstellers',
                  isCorrect: false,
                  explanation: 'Das Produkthaftungsgesetz ist verschuldensunabhängig. Es kommt nicht darauf an, ob den Hersteller ein Verschulden trifft. Die Haftung tritt bereits bei Vorliegen eines Produktfehlers ein.'
                },
                {
                  text: 'Ein kausaler Zusammenhang zwischen Produktfehler und Schaden',
                  isCorrect: true
                }
              ]
            },
            {
              id: '1.2-2013',
              text: 'Was versteht man unter einem Konstruktionsfehler?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Ein Fehler, der bereits in der Planung des Produkts angelegt ist',
                  isCorrect: true
                },
                {
                  text: 'Ein Fehler, der nur einzelne Produkte einer Serie betrifft',
                  isCorrect: false,
                  explanation: 'Dies beschreibt einen Fabrikationsfehler, nicht einen Konstruktionsfehler. Konstruktionsfehler betreffen die gesamte Produktserie, da sie bereits in der Planung entstehen.'
                }
              ]
            }
          ]
        },
        {
          id: 'cat-1-2-2013',
          title: 'Rückrufaktionen',
          questions: [
            {
              id: '1.3-2013',
              text: 'Welche Kosten können im Rahmen einer Rückrufaktion entstehen?',
              points: 3,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Kosten für die Information der Öffentlichkeit',
                  isCorrect: true
                },
                {
                  text: 'Transportkosten für zurückgerufene Produkte',
                  isCorrect: true
                },
                {
                  text: 'Kosten für die Überprüfung der Produkte',
                  isCorrect: true
                },
                {
                  text: 'Entgangener Gewinn aus zukünftigen Verkäufen',
                  isCorrect: false,
                  explanation: 'Der entgangene Gewinn ist kein erstattungsfähiger Schaden im Rahmen einer Rückrufaktion. Es werden nur die direkten Kosten der Rückrufmaßnahme ersetzt.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module-2-2013',
      title: 'Modul II - Umwelthaftung',
      categories: [
        {
          id: 'cat-2-1-2013',
          title: 'Umwelthaftungsgesetz',
          questions: [
            {
              id: '2.1-2013',
              text: 'Welche Anlagen fallen unter das Umwelthaftungsgesetz?',
              points: 2,
              isMultipleChoice: true,
              answers: [
                {
                  text: 'Anlagen nach Anhang 1 des UmweltHG',
                  isCorrect: true
                },
                {
                  text: 'Alle industriellen Anlagen',
                  isCorrect: false,
                  explanation: 'Das UmweltHG gilt nicht pauschal für alle industriellen Anlagen, sondern nur für die im Anhang 1 des Gesetzes ausdrücklich aufgeführten Anlagentypen. Dies sind hauptsächlich besonders umweltgefährdende Anlagen.'
                },
                {
                  text: 'Nur kerntechnische Anlagen',
                  isCorrect: false,
                  explanation: 'Kerntechnische Anlagen fallen unter das Atomgesetz. Das UmweltHG umfasst viele weitere Anlagentypen gemäß Anhang 1.'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}; 