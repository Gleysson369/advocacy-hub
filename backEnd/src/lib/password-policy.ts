export function validateStrongPassword(password: string): string | null {
  if (!password || password.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres."
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter pelo menos 1 letra maiuscula."
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve conter pelo menos 1 letra minuscula."
  }

  if (!/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos 1 numero."
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "A senha deve conter pelo menos 1 caractere especial (ex.: +, !, @, #)."
  }

  return null
}
