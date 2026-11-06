import type { ReactNode } from 'react'
import type { FieldPath } from 'react-hook-form'
import type { CitizenDetails } from '../../entities/citizen/types'
import { AccountSection } from '../citizen/sections/AccountSection'
import { AddressSection, ContactsSection } from '../citizen/sections/AddressSection'
import { DocumentsSection } from '../citizen/sections/DocumentsSection'
import { EducationSection } from '../citizen/sections/EducationSection'
import { FamilySection } from '../citizen/sections/FamilySection'
import { PersonalSection } from '../citizen/sections/PersonalSection'
import { SocialSection } from '../citizen/sections/SocialSection'
import { ConsentSection } from './ConsentSection'

export interface WizardStep {
  title: string
  caption: string
  fields: FieldPath<CitizenDetails>[]
  content: ReactNode
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    title: 'Личные данные',
    caption: 'ФИО, рождение, учёт',
    fields: ['lastName', 'firstName', 'middleName', 'birthDate', 'gender', 'status', 'districtId', 'locality'],
    content: <PersonalSection />,
  },
  {
    title: 'Документы',
    caption: 'Паспорт, СНИЛС, ИНН',
    fields: ['passport', 'snils', 'inn', 'documents'],
    content: <DocumentsSection />,
  },
  {
    title: 'Адрес и связь',
    caption: 'Регистрация, телефоны',
    fields: ['registrationAddress', 'actualAddress', 'phones', 'email'],
    content: (
      <>
        <AddressSection />
        <ContactsSection />
      </>
    ),
  },
  {
    title: 'Семья и статус',
    caption: 'Родственники, льготы',
    fields: ['family', 'education', 'employment', 'workHistory', 'social'],
    content: (
      <>
        <FamilySection />
        <SocialSection />
        <EducationSection />
      </>
    ),
  },
  {
    title: 'Лицевой счёт',
    caption: 'Объект и расчёты',
    fields: ['account', 'property'],
    content: <AccountSection withHistory={false} />,
  },
  {
    title: 'Проверка',
    caption: 'Подтверждение данных',
    fields: ['consentPersonalData'],
    content: <ConsentSection />,
  },
]
