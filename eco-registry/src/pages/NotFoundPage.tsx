import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 12, gap: 1.5, textAlign: 'center' }}>
      <Typography variant="h1" sx={{ fontSize: 64, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h3">Страница не найдена</Typography>
      <Typography color="text.secondary">Возможно, ссылка устарела или карточка была удалена.</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 1 }}>
        На главную
      </Button>
    </Stack>
  )
}
