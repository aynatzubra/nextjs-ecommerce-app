type VerificationEmailProps = {
  verifyUrl: string
}

export const VerificationEmail = ({ verifyUrl }: VerificationEmailProps) => {
  return (
    <div>
      <h1>Verify your email</h1>
      <p>Thanks for signing up. Click the link below to verify your email address.</p>
      <p>
        <a href={verifyUrl}>Verify email</a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p>{verifyUrl}</p>
    </div>
  )
}