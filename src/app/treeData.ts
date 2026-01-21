export type ChildNode = {
  name: string;
  image?: string;
  partner?: ChildNode;
  children?: ChildNode[];
};

function Partner(
    name: string,
    image?: string
) {
    return { name, image };
}

function Child(
  name: string,
  image?: string,
  partner?: ChildNode,
  ...children: ChildNode[]
): ChildNode {
  return { name, image, partner, children };
}

export const treeData = Child(
    "Erhardt König", "", Partner("Dorothea ..."), 
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