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
    "Erhardt König", "", Partner("Dorothea Huhn"), 
    Child(
        "Andreas König", "", Partner("Manuela Stracke"), 
        Child("Leon König", "", Partner("Bonginkosi Magamba")), 
        Child("Lino König")
    ), 
    Child(
        "Daniela König", "", Partner("Bernd Buchmann"), 
        Child("Antonia Buchman"), 
        Child("Erik Buchmann")
    )
)