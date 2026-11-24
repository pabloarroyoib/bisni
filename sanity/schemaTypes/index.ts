import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {homePageType} from './homePageType'
import {legalPageType} from './legalPageType'
import {sectorType} from './sectorType'
import {siteSettingsType} from './siteSettingsType'
import {aboutSlide} from './objects/aboutSlide'
import {heroCard} from './objects/heroCard'
import {legalBlockContentType} from './objects/legalBlockContent'
import {missionContentType} from './objects/missionContent'
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
    legalBlockContentType,
    missionContentType,
    homePageType,
    siteSettingsType,
    legalPageType,
    sectorType,
  ],
}
