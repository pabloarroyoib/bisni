import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {homePageType} from './homePageType'
import {aboutSlide} from './objects/aboutSlide'
import {heroCard} from './objects/heroCard'
import {linkItem} from './objects/linkItem'
import {riskGroup, riskSection} from './objects/riskSection'
import {riskTerm} from './objects/riskTerm'
import {socialItem} from './objects/socialItem'
import {stage} from './objects/stage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    linkItem,
    heroCard,
    stage,
    aboutSlide,
    riskTerm,
    riskSection,
    riskGroup,
    socialItem,
    homePageType,
  ],
}
