export default function ShopHomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to Bad Rabbit shop</h1>

      <div className="max-w-xl text-sm text-zinc-600">
        Main page. <br />
        Starting point for dev. <br />
        This will appear here later: promo block, product selections, and links to the catalog. <br />
      </div>

      <div className="inline-flex gap-2">
        <a
          href="/catalog"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800"
        >
          Start shopping
        </a>
        <a
          href="/cart"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          View your shopping card
        </a>
      </div>
    </section>
  )
}
