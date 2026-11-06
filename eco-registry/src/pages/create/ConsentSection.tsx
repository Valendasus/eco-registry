import { Alert, Stack } from '@mui/material'
import { FieldGrid, FieldModeContext, ToggleInput } from '../../components/form'
import { SectionCard } from '../../components/ui/SectionCard'
import { AddressSection } from '../citizen/sections/AddressSection'
import { DocumentsSection } from '../citizen/sections/DocumentsSection'
import { FamilySection } from '../citizen/sections/FamilySection'
import { PersonalSection } from '../citizen/sections/PersonalSection'

export function ConsentSection() {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Проверьте данные перед созданием карточки. Вернуться к любому шагу можно, нажав на его название.
      </Alert>

      <FieldModeContext.Provider value={{ editing: false }}>
        <PersonalSection />
        <DocumentsSection />
        <AddressSection />
        <FamilySection />
      </FieldModeContext.Provider>

      <SectionCard title="Подтверждение">
        <FieldGrid>
          <ToggleInput
            name="consentPersonalData"
            label="Гражданин дал согласие на обработку персональных данных"
            description="Без согласия карточка не может быть создана"
            variant="checkbox"
            span={12}
            rules={{ validate: (value) => value === true || 'Нужно согласие' }}
          />
        </FieldGrid>
      </SectionCard>
    </Stack>
  )
}
