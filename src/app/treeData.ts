export type PersonNode = {
  id: string;
  name: string;
  image?: string;
  partner?: PersonNode;
  children?: PersonNode[];
};

let idCounter = 0;
const uid = () => `n${++idCounter}`;

function Partner(name: string, image?: string): PersonNode {
    return { id: uid(), name, image };
}

function Child(
  name: string,
  image?: string,
  partner?: PersonNode,
  ...children: PersonNode[]
): PersonNode {
  return { id: uid(), name, image, partner, children };
}

export const treeData = Child(
  "Erich König", "", Partner("Erna ..."),
  Child(
    "Erhardt König", "", Partner("Dorothea Huhn"), 
    Child(
        "Andreas König", "", Partner("Manuela Stracke"), 
        Child("Leon König", "", Partner("Bonginkosi Mahamba")), 
        Child("Lino König")
    ), 
    Child(
        "Daniela König", "", Partner("Bernd Buchmann"), 
        Child("Antonia Buchman", "", Partner("Tobias Rödiger")), 
        Child("Erik Buchmann")
    )
  ), 
  Child(
    "Dorothea König", "", Partner("Günter Schnell"),
    Child("Carola Schnell", "", Partner("Eike Bickel"),
      Child("Alexander Bickel"), 
      Child("Michael Bickel"),
      Child("Oliver Bickel")
    ),
    Child("Jana Schnell", "", Partner("Dirk Schubert"),
      Child("Sebastian Schubert"),
      Child("Christoph Schubert"),
    )
  ), 
  Child(
    "Christine König", "", Partner("Matthias Jähnig"),
    Child("Kerstin Jähnig", "", Partner("Michael ..."), 
      Child("Johannes Tobaben"), 
      Child("Elise Tobaben"),
      Child("Friedrich Tobaben")
    ),
  ), 
  Child(
    "Michael König", "", Partner("Renate Stockhaus"),
    Child("Martin König", "", Partner("Ella ..."), 
      Child("Hannah König"),
      Child("Jakob König"),
      Child("... ...")
    ),
    Child("Stefan König"),
  )
)