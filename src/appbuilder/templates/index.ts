import { WEB_TEMPLATES, type WebTemplateDef } from './webTemplates'
import { PHONE_TEMPLATES, type PhoneTemplateDef } from './phoneTemplates'
import type { AppTarget } from '../project/schema/types'

export function templatesFor(target: AppTarget): (WebTemplateDef | PhoneTemplateDef)[] {
  return target === 'web' ? WEB_TEMPLATES : PHONE_TEMPLATES
}

export { WEB_TEMPLATES, PHONE_TEMPLATES }
