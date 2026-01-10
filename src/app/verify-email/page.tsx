export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-gray-600">We’ve sent a verification link to your email address.</p>

        <button disabled className="text-sm text-gray-400 cursor-not-allowed">
          Resend email
        </button>

        {/* TODO: implement resend email */}
      </div>
    </div>
  )
}
