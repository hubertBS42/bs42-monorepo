export function generatePassword(options: {
  useSymbols?: boolean
  useNumbers?: boolean
  useLowerCase?: boolean
  useUpperCase?: boolean
  passwordLength: number
}) {
  const {
    useSymbols = true,
    useNumbers = true,
    useLowerCase = true,
    useUpperCase = true,
    passwordLength,
  } = options

  let charset = ""
  let newPassword = ""

  if (useSymbols) charset += "!@#$%^&*()"
  if (useNumbers) charset += "0123456789"
  if (useLowerCase) charset += "abcdefghijklmnopqrstuvwxyz"
  if (useUpperCase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  for (let i = 0; i < passwordLength; i++) {
    newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return newPassword
}
