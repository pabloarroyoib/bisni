import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      // El id es fijo: la home vive en el documento `homePage` que registra
      // `document.singletons`, así que este ítem no puede crear duplicados.
      S.listItem().title('Home').singleton('homePage'),
      S.divider(),
      S.documentTypeListItem('post').title('Artículos'),
      S.documentTypeListItem('category').title('Categorías'),
      S.documentTypeListItem('author').title('Autores'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category', 'author'].includes(item.getId()!),
      ),
    ])
